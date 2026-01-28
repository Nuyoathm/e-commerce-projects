import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sku, SkuDocument } from './schemas/sku.schema';

@Injectable()
export class SkuService {
  constructor(
    @InjectModel(Sku.name) private skuModel: Model<SkuDocument>,
  ) { }

  async findAll(page: number = 1, limit: number = 20, skuCode?: string) {
    const query = skuCode ? { skuCode: new RegExp(skuCode, 'i') } : {};
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.skuModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.skuModel.countDocuments(query).exec(),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const sku = await this.skuModel.findById(id).exec();
    if (!sku) throw new NotFoundException('SKU not found');
    return sku;
  }

  async update(id: string, updateSkuDto: any) {
    const updated = await this.skuModel.findByIdAndUpdate(id, updateSkuDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('SKU not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.skuModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('SKU not found');
    return deleted;
  }
}
