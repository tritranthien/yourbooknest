import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Novel, NovelDocument } from '../schemas/novel.schema';
import { Chap, ChapDocument } from '../schemas/chap.schema';

@Injectable()
export class NovelsService {
  constructor(
    @InjectModel(Novel.name) private novelModel: Model<NovelDocument>,
    @InjectModel(Chap.name) private chapModel: Model<ChapDocument>,
  ) {}

  async getNewNovels(limit: number = 15): Promise<Novel[]> {
    return this.novelModel
      .find({})
      .sort({ createdAt: -1 })
      .populate('author')
      .populate('category')
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
    return this.getBySort({}, { updatedAt: -1 }); // Fallback
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
    const novels = await this.novelModel
      .find(query)
      .populate('author')
      .populate('category')
      .populate('chapCount')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.novelModel.countDocuments(query);
    return { novels, total };
  }

  async getByCate(cateId: string, page: number = 1) {
    return this.getPaged({ category: cateId }, { updatedAt: -1 }, page, 15);
  }

  async getCompletedByCate(cateId: string, page: number = 1) {
    return this.getPaged({ category: cateId, status: 'completed' }, { updatedAt: -1 }, page, 15);
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
}
