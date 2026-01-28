import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Category, CategoryDocument } from '../category/schemas/category.schema';
import { Sku, SkuDocument } from '../sku/schemas/sku.schema';

@Injectable()
export class StatsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(Sku.name) private skuModel: Model<SkuDocument>,
    ) { }

    async getOverview() {
        const [productCount, categoryCount, skuCount, lowStockSkus] = await Promise.all([
            this.productModel.countDocuments().exec(),
            this.categoryModel.countDocuments().exec(),
            this.skuModel.countDocuments().exec(),
            this.skuModel.find({ $expr: { $lte: ['$stock', '$warningStock'] } }).countDocuments().exec(),
        ]);

        return {
            productCount,
            categoryCount,
            skuCount,
            lowStockCount: lowStockSkus,
        };
    }
}
