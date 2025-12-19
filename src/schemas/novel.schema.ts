import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Author } from './author.schema';
import { Category } from './category.schema';
import { User } from './user.schema';

export type NovelDocument = Novel & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Novel {
  @Prop({ required: true, maxlength: 255 })
  title: string;

  @Prop({ maxlength: 255 })
  slug: string;

  @Prop({ default: 'người đăng quá lười không chịu thêm thông tin' })
  description: string;

  @Prop({ default: '/images/tt.jpg' })
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'Author', required: true })
  author: Author | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cate', required: true })
  category: Category | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  poster: User | Types.ObjectId;

  @Prop({ default: 0 })
  likes: number;

  @Prop({
    default: 'continue',
    enum: ['continue', 'completed', 'drop'],
  })
  status: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  scores: number;

  @Prop({ default: 0 })
  rate_nums: number;

  @Prop({ default: false })
  modvote: boolean;
}

export const NovelSchema = SchemaFactory.createForClass(Novel);

NovelSchema.virtual('chapCount', {
  ref: 'Chap',
  localField: '_id',
  foreignField: 'novel',
  count: true,
});

NovelSchema.virtual('followCount', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'novel',
  count: true,
});
