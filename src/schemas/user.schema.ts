import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    trim: true,
    minlength: 6,
    maxlength: 24,
    unique: true,
    validate: {
      validator: (v: string) => /[a-zA-Z0-9]$/.test(v),
      message: 'tên đăng nhập không hợp lệ',
    },
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: (v: string) =>
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          v,
        ),
      message: 'email không hợp lệ',
    },
  })
  email: string;

  @Prop({ required: true, trim: true, minlength: 8 })
  password: string;

  @Prop({ default: '/images/tt4.jpg' })
  image: string;

  @Prop({ default: 20 })
  goldcard: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('chapCount', {
  ref: 'Chap',
  localField: '_id',
  foreignField: 'poster',
  count: true,
});
