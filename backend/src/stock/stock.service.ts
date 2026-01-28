import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockRecord, StockRecordDocument } from './schemas/stock.schema';
import { Sku, SkuDocument } from '../sku/schemas/sku.schema';
import { StockMovementDto } from './dto/stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(StockRecord.name) private stockModel: Model<StockRecordDocument>,
    @InjectModel(Sku.name) private skuModel: Model<SkuDocument>,
  ) { }

  async inStock(dto: StockMovementDto, operatorId: string) {
    const { skuId, qty, remark } = dto;
    const sku = await this.skuModel.findById(skuId);
    if (!sku) throw new NotFoundException('SKU not found');

    const record = new this.stockModel({
      skuId,
      qty,
      type: 'IN',
      operatorId,
      remark,
    });

    await record.save();

    sku.stock += qty;
    return sku.save();
  }

  async outStock(dto: StockMovementDto, operatorId: string) {
    const { skuId, qty, remark } = dto;
    const sku = await this.skuModel.findById(skuId);
    if (!sku) throw new NotFoundException('SKU not found');

    // Optionally check if stock is sufficient, but per requirements we just operate
    const record = new this.stockModel({
      skuId,
      qty,
      type: 'OUT',
      operatorId,
      remark,
    });

    await record.save();

    sku.stock -= qty;
    return sku.save();
  }

  async findRecords(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.stockModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.stockModel.countDocuments().exec(),
    ]);

    return { items, total, page, limit };
  }
}
