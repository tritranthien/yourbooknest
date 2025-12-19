import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true, maxlength: 255 })
  cate: string;

  @Prop({ maxlength: 255 })
  e_cate: string;

  @Prop({ maxlength: 255 })
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
