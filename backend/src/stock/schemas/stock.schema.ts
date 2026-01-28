import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StockRecordDocument = StockRecord & Document;

@Schema({ timestamps: true })
export class StockRecord {
  @Prop({ required: true })
  skuId: string;

  @Prop({ required: true, enum: ['IN', 'OUT', 'ADJUST'] })
  type: string;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: true })
  operatorId: string;

  @Prop()
  remark?: string;
}

export const StockRecordSchema = SchemaFactory.createForClass(StockRecord);
