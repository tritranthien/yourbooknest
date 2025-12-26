import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({ required: true, maxlength: 255 })
  cate: string;

  @Prop({ maxlength: 255 })
  e_cate: string;

  @Prop({ maxlength: 255 })
  slug: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({ default: true })
  editable: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('novelCount', {
  ref: 'Novel',
  localField: '_id',
  foreignField: 'category',
  count: true,
});
