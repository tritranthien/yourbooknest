import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Novel } from './novel.schema';

export type RatingDocument = Rating & Document;

@Schema()
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  rater: User | Types.ObjectId;

  @Prop({ default: 'this is my ratting' }) // Keeping typo for consistency with old default? or I can fix it "rating"
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Novel' })
  novel: Novel | Types.ObjectId;

  @Prop()
  scores: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
