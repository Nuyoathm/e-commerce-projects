import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  descRichText?: string;

  @Prop({ type: [Object], default: [] })
  specs: any[]; // e.g. [{ name: 'Color', values: ['Red', 'Blue'] }]

  @Prop({ default: 1 })
  status: number; // 0: Off-shelf, 1: On-shelf
}

export const ProductSchema = SchemaFactory.createForClass(Product);
