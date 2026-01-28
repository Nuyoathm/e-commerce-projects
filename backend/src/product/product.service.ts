import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Sku, SkuDocument } from '../sku/schemas/sku.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Category, CategoryDocument } from '../category/schemas/category.schema';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Sku.name) private skuModel: Model<SkuDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const { skus, ...productData } = createProductDto;
    const product = new this.productModel(productData);
    const savedProduct = await product.save();

    if (skus && skus.length > 0) {
      const skusWithProductId = skus.map(sku => ({
        ...sku,
        productId: savedProduct._id,
      }));
      await this.skuModel.insertMany(skusWithProductId);
    }

    return savedProduct;
  }

  async findAll(page: number = 1, limit: number = 10, categoryId?: string) {
    const query = categoryId ? { categoryId } : {};
    const skip = (page - 1) * limit;

    const items = await this.productModel
      .find(query)
      .populate('categoryId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    const total = await this.productModel.countDocuments(query).exec();

    // Attach SKUs to each product
    const productIds = items.map(p => p._id.toString());
    const skus = await this.skuModel.find({ productId: { $in: productIds } }).lean().exec();

    const itemsWithSkus = items.map(p => ({
      ...p,
      skus: skus.filter(s => s.productId === p._id.toString())
    }));

    return { items: itemsWithSkus, total, page, limit };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    const skus = await this.skuModel.find({ productId: id }).exec();
    return { ...product.toObject(), skus };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { skus, ...productData } = updateProductDto as any;
    const updated = await this.productModel.findByIdAndUpdate(id, productData, { new: true }).exec();
    if (!updated) throw new NotFoundException('Product not found');

    if (skus) {
      await this.skuModel.deleteMany({ productId: id }).exec();
      const skusWithProductId = skus.map(sku => ({
        ...sku,
        productId: id,
      }));
      await this.skuModel.insertMany(skusWithProductId);
    }

    return updated;
  }

  async remove(id: string) {
    await this.skuModel.deleteMany({ productId: id }).exec();
    return this.productModel.findByIdAndDelete(id).exec();
  }

  async updateSkus(productId: string, skus: any[]) {
    await this.skuModel.deleteMany({ productId }).exec();
    const skusWithProductId = skus.map(sku => ({
      ...sku,
      productId,
    }));
    return this.skuModel.insertMany(skusWithProductId);
  }

  async importProducts(buffer: Buffer) {
    console.log('[ImportService] Starting import processing');
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch (err) {
      console.error('[ImportService] Failed to load Excel file', err);
      throw new Error('Excel 文件解析失败，请确保是合法的 .xlsx 文件');
    }
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      console.error('[ImportService] No worksheet found');
      throw new Error('未找到工作表');
    }
    console.log(`[ImportService] Worksheet row count: ${worksheet.rowCount}`);
    const results = {
      successCount: 0,
      failCount: 0,
      errors: [] as { row: number, title: string, reason: string }[],
    };

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const title = row.getCell(1).text?.trim();
      const categoryName = row.getCell(2).text?.trim();
      const priceVal = row.getCell(3).value;
      const stockVal = row.getCell(4).value;
      const statusVal = row.getCell(5).text?.trim();

      const price = typeof priceVal === 'number' ? priceVal : parseFloat(row.getCell(3).text);
      const stock = typeof stockVal === 'number' ? stockVal : parseInt(row.getCell(4).text);

      if (!title) {
        results.failCount++;
        results.errors.push({ row: i, title: title || 'Unknown', reason: '商品标题不能为空' });
        continue;
      }

      if (!categoryName) {
        results.failCount++;
        results.errors.push({ row: i, title, reason: '分类名称不能为空' });
        continue;
      }

      const category = await this.categoryModel.findOne({ name: categoryName }).exec();
      if (!category) {
        results.failCount++;
        results.errors.push({ row: i, title, reason: `分类 "${categoryName}" 不存在` });
        continue;
      }

      if (isNaN(price) || price < 0) {
        results.failCount++;
        results.errors.push({ row: i, title, reason: '价格不合法' });
        continue;
      }

      if (isNaN(stock) || stock < 0) {
        results.failCount++;
        results.errors.push({ row: i, title, reason: '库存不合法' });
        continue;
      }

      try {
        const product = new this.productModel({
          title,
          categoryId: category._id,
          status: statusVal === '下架' ? 0 : 1,
          images: [],
          specs: [],
        });
        const savedProduct = await product.save();

        const sku = new this.skuModel({
          productId: savedProduct._id,
          specCombo: { '默认': '标准' },
          price,
          stock,
          skuCode: `IMPORT-${Date.now()}-${i}`,
        });
        await sku.save();

        results.successCount++;
      } catch (err: any) {
        results.failCount++;
        results.errors.push({ row: i, title, reason: err.message || '保存失败' });
      }
    }

    return results;
  }

  async exportProducts(res: any) {
    const products = await this.productModel.find().lean().exec();
    const productIds = products.map((p) => (p as any)._id.toString());
    const skus = await this.skuModel
      .find({ productId: { $in: productIds } })
      .lean()
      .exec();
    const categories = await this.categoryModel.find().lean().exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
      { header: '商品标题', key: 'title', width: 30 },
      { header: '分类名称', key: 'category', width: 20 },
      { header: '售价', key: 'price', width: 15 },
      { header: '库存', key: 'stock', width: 15 },
      { header: 'SKU编码', key: 'skuCode', width: 25 },
      { header: '状态', key: 'status', width: 12 },
    ];

    products.forEach((p: any) => {
      const category = categories.find((c) => (c as any)._id.toString() === p.categoryId?.toString());
      const pSkus = skus.filter((s) => (s as any).productId === p._id.toString());

      if (pSkus.length === 0) {
        worksheet.addRow({
          title: p.title,
          category: category?.name || '未分类',
          price: 0,
          stock: 0,
          skuCode: '-',
          status: p.status === 1 ? '上架' : '下架',
        });
      } else {
        pSkus.forEach((s: any) => {
          worksheet.addRow({
            title: p.title,
            category: category?.name || '未分类',
            price: s.price,
            stock: s.stock,
            skuCode: s.skuCode,
            status: p.status === 1 ? '上架' : '下架',
          });
        });
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=products_export_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}
