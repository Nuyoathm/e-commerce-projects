import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkuDocument = Sku & Document;

@Schema({ timestamps: true })
export class Sku {
  @Prop({ required: true })
  productId: string;

  @Prop()
  skuCode?: string;

  @Prop({ type: Object, required: true })
  specCombo: Record<string, string>; // e.g. { "Color": "Red", "Size": "M" }

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ default: 10 })
  warningStock: number;
}

export const SkuSchema = SchemaFactory.createForClass(Sku);
