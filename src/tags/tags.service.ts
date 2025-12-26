import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from '../schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { slugify } from '../utils/slugify';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) {}

  async create(createTagDto: CreateTagDto) {
    const slug = slugify(createTagDto.name);
    const existing = await this.tagModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }
    const createdTag = new this.tagModel({ ...createTagDto, slug });
    return createdTag.save();
  }

  async findAll() {
    return this.tagModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const updateData: any = { ...updateTagDto };
    if (updateTagDto.name) {
      const slug = slugify(updateTagDto.name);
      const existing = await this.tagModel.findOne({ slug, _id: { $ne: id } }).exec();
      if (existing) {
        throw new ConflictException('Tag with this name already exists');
      }
      updateData.slug = slug;
    }
    const updatedTag = await this.tagModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedTag) {
      throw new NotFoundException('Tag not found');
    }
    return updatedTag;
  }

  async remove(id: string) {
    const result = await this.tagModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Tag not found');
    }
    return result;
  }
}
