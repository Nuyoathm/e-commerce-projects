import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockRecord, StockRecordSchema } from './schemas/stock.schema';
import { Sku, SkuSchema } from '../sku/schemas/sku.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockRecord.name, schema: StockRecordSchema },
      { name: Sku.name, schema: SkuSchema },
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule { }
