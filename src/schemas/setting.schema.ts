import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true })
export class Setting {
  @Prop({ default: 'Your Book' })
  siteName: string;

  @Prop({ default: '/logo.png' })
  logo: string;

  @Prop({ default: '/banner.jpg' })
  banner: string;

  // Comment settings
  @Prop({ default: true })
  commentEnabled: boolean;

  @Prop({ default: false })
  commentPreApproval: boolean;

  // Reading settings
  @Prop({ default: 'Inter' })
  defaultFont: string;

  @Prop({ default: 18 })
  defaultFontSize: number;

  @Prop({ default: false })
  defaultNightMode: boolean;

  @Prop({ type: [{ name: String, url: String }], default: [] })
  customFonts: { name: string, url: string }[];
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
