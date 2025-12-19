import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthorDocument = Author & Document;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Author {
  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop()
  birth: Date;

  @Prop({ default: 'Chưa có thông tin gì về tác giả này' })
  des: string;

  @Prop({ default: '/images/tt3.jpg' })
  image: string;

  @Prop()
  slug: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

AuthorSchema.virtual('novelCount', {
  ref: 'Novel', // We will need to use 'Novel' string or forwardRef if circular, but 'Novel' string works if model is registered
  localField: '_id',
  foreignField: 'author',
  count: true,
});
