import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  email?: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
