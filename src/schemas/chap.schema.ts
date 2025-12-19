import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Novel } from './novel.schema';
import { User } from './user.schema';
import * as mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AutoIncrement = require('mongoose-sequence')(mongoose);

export type ChapDocument = Chap & Document;

@Schema({ timestamps: true })
export class Chap {
  @Prop({ required: true, maxlength: 255 })
  title: string;

  @Prop({ unique: false })
  chap: number;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Novel' })
  novel: Novel | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  poster: User | Types.ObjectId;
}

export const ChapSchema = SchemaFactory.createForClass(Chap);

ChapSchema.plugin(AutoIncrement, {
  id: 'chap_seq',
  inc_field: 'chap',
  reference_fields: ['novel'],
});
