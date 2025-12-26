
import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CategoryDocument } from '../schemas/category.schema';
import { NovelDocument } from '../schemas/novel.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectModel('Cate') private categoryModel: Model<CategoryDocument>,
    @InjectModel('Novel') private novelModel: Model<NovelDocument>,
  ) {}

  async onModuleInit() {
    const slug = 'khac';
    const existing = await this.categoryModel.findOne({ slug }).exec();
    if (!existing) {
      await this.categoryModel.create({
        cate: 'Khác',
        e_cate: 'Other',
        slug: 'khac',
        icon: '',
        editable: false,
      });
      console.log('Seeded default category: Khác');
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll() {
    return this.categoryModel.find().populate('novelCount').sort({ cate: 1 }).exec();
  }

  async findBySlug(slug: string) {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string, option?: 'reassign' | 'delete_novels') {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    if (category.editable === false) {
      throw new HttpException(
        'Cannot delete this default category',
        HttpStatus.FORBIDDEN,
      );
    }

    let objectId: Types.ObjectId;
    try {
      if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
        objectId = new Types.ObjectId(id);
      } else {
        throw new Error('Invalid ID format');
      }
    } catch (e) {
      throw new HttpException('Invalid category ID', HttpStatus.BAD_REQUEST);
    }

    const novelsCount = await this.novelModel
      .countDocuments({ 
        $or: [
          { category: id },
          { category: objectId }
        ]
      })
      .exec();

    if (novelsCount > 0) {
      if (!option) {
        return {
          requireOption: true,
          novelCount: novelsCount,
        };
      }

      if (option === 'reassign') {
        const defaultCate = await this.categoryModel
          .findOne({ slug: 'khac' })
          .exec();
        if (!defaultCate) {
          throw new HttpException(
            'Default category "Khác" not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        await this.novelModel
          .updateMany({ category: objectId }, { category: defaultCate._id })
          .exec();
      } else if (option === 'delete_novels') {
        await this.novelModel.deleteMany({ category: objectId }).exec();
      }
    }

    const removed = await this.categoryModel.findByIdAndDelete(objectId).exec();
    return { success: true, removed };
  }
}
