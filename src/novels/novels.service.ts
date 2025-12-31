import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNovelDto } from './dto/create-novel.dto';
import { slugify } from '../utils/slugify';
import { Novel, NovelDocument } from '../schemas/novel.schema';
import { Chap, ChapDocument } from '../schemas/chap.schema';
import { Tag, TagDocument } from '../schemas/tag.schema';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class NovelsService implements OnModuleInit {
  constructor(
    @InjectModel(Novel.name) private novelModel: Model<NovelDocument>,
    @InjectModel(Chap.name) private chapModel: Model<ChapDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    private settingsService: SettingsService,
  ) { }

  async onModuleInit() {
    // Migrations: Approve all existing novels if they don't have isApproved field
    // (In reality, since we just added it, many might be 'false' by default from Mongoose)
    // We only want to do this once. Let's just approve everything that isn't specifically disapproved if it's an old book.
    // For now, let's just approve all existing ones to avoid breaking the site.
    const result = await this.novelModel.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Approved ${result.modifiedCount} existing novels.`);
    }
  }

  async getPendingNovels(page: number = 1, limit: number = 20): Promise<{ novels: Novel[], total: number }> {
    const skip = (page - 1) * limit;
    const [novels, total] = await Promise.all([
      this.novelModel
        .find({ isApproved: false })
        .sort({ createdAt: -1 })
        .populate('author')
        .populate('category')
        .populate('poster', 'username email')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.novelModel.countDocuments({ isApproved: false }),
    ]);
    return { novels, total };
  }

  async approveNovel(id: string): Promise<Novel | null> {
    return this.novelModel.findByIdAndUpdate(id, { isApproved: true }, { new: true }).exec();
  }

  async rejectNovel(id: string): Promise<any> {
    // Can either delete or mark as rejected. Deleting is cleaner for now.
    return this.novelModel.findByIdAndDelete(id).exec();
  }

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
    const settings = await this.settingsService.getSettings();

    const createdNovel = new this.novelModel({
      ...createNovelDto,
      tags,
      slug,
      poster: posterId,
      isApproved: settings.autoApproveNovel,
    });
    return createdNovel.save();
  }

  async getNewNovels(limit: number = 20): Promise<Novel[]> {
    return this.novelModel
      .find({ isApproved: true })
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
      .find({ ...query, isApproved: true })
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
      .findOne({ slug, isApproved: true })
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

  async getChaps(novelId: string, page: number = 1): Promise<any> {
    const limit = 50;
    const skip = (page - 1) * limit;
    
    const objectId = Types.ObjectId.isValid(novelId) ? new Types.ObjectId(novelId) : null;
    const query = objectId ? { novel: objectId } : { novel: novelId };

    return this.chapModel
      .find(query, { content: 0 }) // Exclude content for list view
      .sort({ chap: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getChap(novelId: string, chapNum: number): Promise<any> {
    const num = Number(chapNum);
    
    // Resolve novel first
    let novel;
    if (Types.ObjectId.isValid(novelId)) {
      novel = await this.novelModel.findById(novelId).exec();
    }
    if (!novel) {
      novel = await this.novelModel.findOne({ slug: novelId }).exec();
    }

    if (!novel) {
      throw new NotFoundException('Truyện không tồn tại');
    }

    const chap = await this.chapModel
      .findOne({ novel: novel._id, chap: num })
      .populate({
        path: 'novel',
        populate: { path: 'chapCount' }
      })
      .populate('poster', 'username email')
      .exec();

    if (!chap) {
      throw new NotFoundException('Chương không tồn tại');
    }
    return chap;
  }

  async getFullChaps(novelId: string): Promise<any> {
    const novel = await this.novelModel.findOne({
      $or: [
        { _id: Types.ObjectId.isValid(novelId) ? new Types.ObjectId(novelId) : null },
        { slug: novelId }
      ].filter(Boolean)
    }).exec();

    if (!novel) throw new NotFoundException('Novel not found');

    return this.chapModel
      .find({ novel: novel._id }, { content: 0 })
      .sort({ chap: 1 })
      .exec();
  }

  async createChap(createChapDto: any, posterId: string): Promise<any> {
    const novel = await this.novelModel.findById(createChapDto.novel).exec();
    if (!novel) throw new Error('Novel not found');

    const chap = await this.chapModel.create({
      ...createChapDto,
      poster: posterId,
    });

    // Update novel updatedAt
    await this.novelModel.findByIdAndUpdate(createChapDto.novel, { updatedAt: new Date() }).exec();

    return chap;
  }

  async getPaged(query: any, sort: any, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    console.log('[Service] getPaged Query:', JSON.stringify(query));
    const novels = await this.novelModel
      .find({ ...query, isApproved: true })
      .populate('author')
      .populate('category')
      .populate('tags.tagId')
      .populate('chapCount')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.novelModel.countDocuments({ ...query, isApproved: true });
    console.log('[Service] getPaged Total:', total);
    return { novels, total };
  }

  async getByCate(cateId: string, page: number = 1) {
    const objectId = Types.ObjectId.isValid(cateId) ? new Types.ObjectId(cateId) : null;
    const query = objectId 
      ? { $or: [{ category: cateId }, { category: objectId }] }
      : { category: cateId };
    return this.getPaged(query, { updatedAt: -1 }, page, 15);
  }

  async getCompletedByCate(cateId: string, page: number = 1) {
    const objectId = Types.ObjectId.isValid(cateId) ? new Types.ObjectId(cateId) : null;
    const categoryQuery = objectId 
      ? { $or: [{ category: cateId }, { category: objectId }] }
      : { category: cateId };
      
    const query = { ...categoryQuery, status: 'completed' };
    const result = await this.getPaged(query, { updatedAt: -1 }, page, 10);
    return result.novels; // Return array as expected by frontend
  }

  async getBestViewsByCate(cateId: string, page: number = 1) {
    const objectId = Types.ObjectId.isValid(cateId) ? new Types.ObjectId(cateId) : null;
    const query = objectId 
      ? { $or: [{ category: cateId }, { category: objectId }] }
      : { category: cateId };
      
    const result = await this.getPaged(query, { views: -1 }, page, 10);
    return result.novels; // Return array as expected by frontend
  }

  async getByAuthor(authorId: string) {
    return this.novelModel
      .find({ author: authorId, isApproved: true })
      .populate('category')
      .populate('chapCount')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async search(text: string) {
    return this.novelModel
      .find({ title: { $regex: text, $options: 'i' }, isApproved: true })
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

  async findByUploader(posterId: string): Promise<Novel[]> {
    return this.novelModel
      .find({ poster: posterId })
      .populate('author')
      .populate('category')
      .populate('tags.tagId')
      .populate('chapCount')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getFiltered(cateId: string, page: number = 1, status?: string, cnum?: number, sort?: string, search?: string) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const objectId = Types.ObjectId.isValid(cateId) ? new Types.ObjectId(cateId) : null;

    const matchQuery: any = { isApproved: true };
    if (objectId) {
      matchQuery.$or = [{ category: cateId }, { category: objectId }];
    } else {
      matchQuery.category = cateId;
    }

    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    if (search) {
      matchQuery.title = { $regex: search, $options: 'i' };
    }

    const pipeline: any[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'chaps',
          localField: '_id',
          foreignField: 'novel',
          as: 'chaps',
        },
      },
      {
        $addFields: {
          chapCount: { $size: '$chaps' },
        },
      },
    ];

    // Chapter count filtering
    if (cnum && cnum > 0) {
      if (cnum > 2000) {
        pipeline.push({ $match: { chapCount: { $gt: 2000 } } });
      } else if (cnum > 1000) {
        pipeline.push({ $match: { chapCount: { $gte: 1000, $lte: 2000 } } });
      } else if (cnum > 300) {
        pipeline.push({ $match: { chapCount: { $gte: 300, $lt: 1000 } } });
      } else {
        pipeline.push({ $match: { chapCount: { $gt: 0, $lt: 300 } } });
      }
    }

    // Sorting
    const sortStage: any = {};
    if (sort === 'views') {
      sortStage.views = -1;
    } else if (sort === 'likes') {
      sortStage.likes = -1;
    } else {
      sortStage.updatedAt = -1;
    }
    pipeline.push({ $sort: sortStage });

    // Pagination & Populating
    pipeline.push({
      $facet: {
        novels: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'authors',
              localField: 'author',
              foreignField: '_id',
              as: 'author',
            },
          },
          { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'cates',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          { $project: { chaps: 0 } }
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await this.novelModel.aggregate(pipeline).exec();
    const novels = result[0]?.novels || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return { novels, total };
  }
  async getFilteredByTurn(turn: string, page: number = 1, status?: string, cnum?: number, sort?: string, search?: string) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const matchQuery: any = { isApproved: true };
    let defaultSort: any = { updatedAt: -1 };

    if (turn === 'hoan-thanh') {
      matchQuery.status = 'completed';
    } else if (turn === 'truyen-hot' || turn === 'hot') {
      defaultSort = { views: -1 };
    }

    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    if (search) {
      matchQuery.title = { $regex: search, $options: 'i' };
    }

    const pipeline: any[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'chaps',
          localField: '_id',
          foreignField: 'novel',
          as: 'chaps',
        },
      },
      {
        $addFields: {
          chapCount: { $size: '$chaps' },
        },
      },
    ];

    // Chapter count filtering
    if (cnum && cnum > 0) {
      if (cnum > 2000) {
        pipeline.push({ $match: { chapCount: { $gt: 2000 } } });
      } else if (cnum > 1000) {
        pipeline.push({ $match: { chapCount: { $gte: 1000, $lte: 2000 } } });
      } else if (cnum > 300) {
        pipeline.push({ $match: { chapCount: { $gte: 300, $lt: 1000 } } });
      } else {
        pipeline.push({ $match: { chapCount: { $gt: 0, $lt: 300 } } });
      }
    }

    // Sorting
    const sortStage: any = {};
    if (sort) {
       if (sort === 'views') {
        sortStage.views = -1;
      } else if (sort === 'likes') {
        sortStage.likes = -1;
      } else if (sort === 'updatedAt') {
        sortStage.updatedAt = -1;
      }
    } else {
        // Use default sort from turn if no explicit sort provided
        Object.assign(sortStage, defaultSort);
    }
    
    // Ensure we always have a sort
    if(Object.keys(sortStage).length === 0) sortStage.updatedAt = -1;

    pipeline.push({ $sort: sortStage });

    // Pagination & Populating
    pipeline.push({
      $facet: {
        novels: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'authors',
              localField: 'author',
              foreignField: '_id',
              as: 'author',
            },
          },
          { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'cates',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          { $project: { chaps: 0 } }
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await this.novelModel.aggregate(pipeline).exec();
    const novels = result[0]?.novels || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return { novels, total };
  }
}
