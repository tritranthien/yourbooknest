import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Novel } from './novel.schema';
import { User } from './user.schema';

export type FollowDocument = Follow & Document;

@Schema()
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'Novel' })
  novel: Novel | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  follower: User | Types.ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
