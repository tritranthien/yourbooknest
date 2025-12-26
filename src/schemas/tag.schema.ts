import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({
  timestamps: true,
})
export class Tag {
  @Prop({ required: true, unique: true, maxlength: 50 })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 100 })
  slug: string;

  @Prop({ maxlength: 255 })
  description: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
