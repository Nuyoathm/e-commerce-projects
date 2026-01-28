import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: null })
  parentId?: string;

  @Prop({ default: ',' })
  path?: string; // Format: ,id1,id2,

  @Prop({ default: 0 })
  sort: number;

  @Prop({ default: 1 })
  status: number; // 0: Disabled, 1: Enabled
}

export const CategorySchema = SchemaFactory.createForClass(Category);
