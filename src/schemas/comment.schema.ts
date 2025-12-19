import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Novel } from './novel.schema';

export type CommentDocument = Comment & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  auth: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Novel', required: true })
  novel: Novel | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cmt' })
  parent: Comment | Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.virtual('repCount', {
  ref: 'Cmt',
  localField: '_id',
  foreignField: 'parent',
  count: true,
});
