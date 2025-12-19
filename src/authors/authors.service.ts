import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Author, AuthorDocument } from '../schemas/author.schema';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel('Author') private authorModel: Model<AuthorDocument>,
  ) {}

  async create(createAuthorDto: any) {
    const createdAuthor = new this.authorModel(createAuthorDto);
    return createdAuthor.save();
  }

  async search(text: string) {
    return this.authorModel
      .find({ name: { $regex: text, $options: 'i' } })
      .exec();
  }

  async findBySlug(slug: string) {
    return this.authorModel.findOne({ slug }).exec();
  }
}
