import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Novel } from './novel.schema';

export type VoteDocument = Vote & Document;

@Schema({ timestamps: true })
export class Vote {
  @Prop({ type: Types.ObjectId, ref: 'Novel', required: true })
  novel: Novel | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  voter: User | Types.ObjectId;

  @Prop({ default: 'hãy nhận lấy kim phiếu của tôi' })
  content: string;

  @Prop({ required: true })
  goldcard: number;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
