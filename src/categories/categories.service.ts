import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Cate') private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll() {
    return this.categoryModel.find().sort({ cate: 1 }).exec();
  }

  async findBySlug(slug: string) {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
