import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Novel } from './novel.schema';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, enum: ['newchap', 'newmess'] })
  type: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User | Types.ObjectId;

  @Prop({ type: String })
  link: string;

  @Prop({ type: Types.ObjectId, ref: 'Novel' })
  novel: Novel | Types.ObjectId;

  @Prop({ type: Number })
  chap: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender: User | Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
