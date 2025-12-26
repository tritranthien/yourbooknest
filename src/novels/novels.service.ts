import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNovelDto } from './dto/create-novel.dto';
import { slugify } from '../utils/slugify';
import { Novel, NovelDocument } from '../schemas/novel.schema';
import { Chap, ChapDocument } from '../schemas/chap.schema';
import { Tag, TagDocument } from '../schemas/tag.schema';

@Injectable()
export class NovelsService {
  constructor(
    @InjectModel(Novel.name) private novelModel: Model<NovelDocument>,
    @InjectModel(Chap.name) private chapModel: Model<ChapDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
  ) { }

  private async processTags(tagNamesOrIds: string[]): Promise<{ tagId: Types.ObjectId; name: string }[]> {
    if (!tagNamesOrIds || tagNamesOrIds.length === 0) return [];
    
    const result: { tagId: Types.ObjectId, name: string }[] = [];
    const uniqueIds = new Set<string>();

    for (const item of tagNamesOrIds) {
      if (!item) continue;
      
      let tag: TagDocument | null = null;
      if (Types.ObjectId.isValid(item)) {
        tag = await this.tagModel.findById(item).exec();
      }

      if (!tag) {
        // Find by name (case-insensitive via slug)
        const slug = slugify(item);
        tag = await this.tagModel.findOne({ slug }).exec();
      }

      if (!tag) {
        // Create new tag automatically
        tag = await this.tagModel.create({
          name: item,
          slug: slugify(item),
          description: `Tạo tự động từ truyện`
        });
      }

      if (tag && !uniqueIds.has(tag._id.toString())) {
        uniqueIds.add(tag._id.toString());
        result.push({
          tagId: tag._id as Types.ObjectId,
          name: tag.name
        });
      }
    }
    return result;
  }

  async create(createNovelDto: CreateNovelDto, posterId: string): Promise<Novel> {
    const slugBase = slugify(createNovelDto.title);
    let slug = slugBase;
    let count = 1;
    while (await this.novelModel.findOne({ slug }).exec()) {
      slug = `${slugBase}-${count++}`;
    }

    const tags = await this.processTags(createNovelDto.tags || []);

    const createdNovel = new this.novelModel({
      ...createNovelDto,
      tags,
      slug,
      poster: posterId,
    });
    return createdNovel.save();
  }

  async getNewNovels(limit: number = 20): Promise<Novel[]> {
    return this.novelModel
      .find({})
      .sort({ createdAt: -1 })
      .populate('author')
      .populate('category')
      .populate('tags.tagId')
      .populate('chapCount')
      .limit(limit)
      .exec();
  }

  async getBySort(query: any, sort: any, limit: number = 10): Promise<Novel[]> {
    return this.novelModel
      .find(query)
      .sort(sort)
      .populate('author')
      .populate('category')
      .populate('tags.tagId')
      .populate('chapCount')
      .limit(limit)
      .exec();
  }

  async getNewest() {
    return this.getBySort({}, { createdAt: -1 });
  }

  async getModVote() {
    return this.getBySort({}, { updatedAt: -1 }); // Fallback
  }

  async getHasNewChap() {
    return this.getBySort({}, { updatedAt: -1 }, 20); // Fallback
  }

  async getMostViews() {
    return this.getBySort({}, { views: -1 });
  }

  async getMostLikes() {
    return this.getBySort({}, { likes: -1 });
  }

  async getMostFollow() {
    return this.getBySort({}, { followCount: -1 });
  }

  async getBestRates() {
    return this.getBySort({}, { score: -1 });
  }

  async getBestVotes() {
    return this.getBySort({}, { updatedAt: -1 }); // Fallback
  }

  async getNovelBySlug(slug: string): Promise<Novel> {
    const novel = await this.novelModel
      .findOne({ slug })
      .populate('author')
      .populate('category')
      .populate('tags.tagId')
      .populate('chapCount')
      .exec();
    if (!novel) {
      throw new Error('Novel not found'); // Best practice: Use NotFoundException from @nestjs/common in Controller or here
    }
    return novel;
  }

  async getChaps(novelId: string, page: number = 1): Promise<Chap[]> {
    const limit = 50;
    const skip = (page - 1) * limit;
    return this.chapModel
      .find({ novel: novelId }, { content: 0 }) // Exclude content for list view
      .sort({ chap: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getPaged(query: any, sort: any, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    console.log('[Service] getPaged Query:', JSON.stringify(query));
    const novels = await this.novelModel
      .find(query)
      .populate('author')
      .populate('category')
      .populate('tags.tagId')
      .populate('chapCount')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.novelModel.countDocuments(query);
    console.log('[Service] getPaged Total:', total);
    return { novels, total };
  }

  async getByCate(cateId: string, page: number = 1) {
    return this.getPaged({ category: cateId }, { updatedAt: -1 }, page, 15);
  }

  async getCompletedByCate(cateId: string, page: number = 1) {
    return this.getPaged({ category: cateId, status: 'completed' }, { updatedAt: -1 }, page, 15);
  }

  async getBestViewsByCate(cateId: string, page: number = 1) {
    return this.getPaged({ category: cateId }, { views: -1 }, page, 15);
  }

  async getByAuthor(authorId: string) {
    return this.novelModel
      .find({ author: authorId })
      .populate('category')
      .populate('chapCount')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async search(text: string) {
    return this.novelModel
      .find({ title: { $regex: text, $options: 'i' } })
      .populate('author')
      .populate('category')
      .limit(20)
      .exec();
  }

  async update(id: string, updateNovelDto: any): Promise<Novel> {
    const data = { ...updateNovelDto };
    if (data.tags) {
      data.tags = await this.processTags(data.tags);
    }
    const updatedNovel = await this.novelModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedNovel) {
      throw new Error('Novel not found');
    }
    return updatedNovel;
  }

  async remove(id: string): Promise<any> {
    const result = await this.novelModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new Error('Novel not found');
    }
    return result;
  }
}
