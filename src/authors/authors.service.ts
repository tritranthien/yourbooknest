import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Author, AuthorDocument } from '../schemas/author.schema';
import { Novel, NovelDocument } from '../schemas/novel.schema';

@Injectable()
export class AuthorsService implements OnModuleInit {
  private readonly logger = new Logger(AuthorsService.name);

  constructor(
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
    @InjectModel(Novel.name) private novelModel: Model<NovelDocument>,
  ) {}

  async onModuleInit() {
    // Initialize default author if none exist
    let defaultAuthor = await this.authorModel.findOne({ slug: 'khong-ten-tac-gia' }).exec();
    if (!defaultAuthor) {
      defaultAuthor = await this.authorModel.create({
        name: 'Không tên tác giả',
        slug: 'khong-ten-tac-gia',
        des: 'Tác giả mặc định cho các truyện không có thông tin tác giả.',
        editable: false,
      });
      this.logger.log('Default author "Không tên tác giả" initialized');
    } else if (defaultAuthor.editable !== false) {
      await this.authorModel.updateOne({ _id: defaultAuthor._id }, { editable: false }).exec();
      this.logger.log('Updated "Không tên tác giả" to be non-editable');
    }

    // Cleanup: Fix novels with missing/orphaned authors
    const orphanedNovelsCount = await this.novelModel.countDocuments({
      $or: [
        { author: { $exists: false } },
        { author: null }
      ]
    });

    if (orphanedNovelsCount > 0) {
      await this.novelModel.updateMany(
        { $or: [{ author: { $exists: false } }, { author: null }] },
        { author: defaultAuthor._id }
      );
      this.logger.log(`Fixed ${orphanedNovelsCount} novels with missing author field`);
    }

  }

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

  async findAll(name?: string, novel?: string) {
    const query: any = {};
    this.logger.log(`Fetching authors with filters - Name: "${name || ''}", Novel: "${novel || ''}"`);
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (novel) {
      // Find novels with matching title or slug
      const matchingNovels = await this.novelModel.find({
        $or: [
          { title: { $regex: novel, $options: 'i' } },
          { slug: { $regex: novel, $options: 'i' } }
        ]
      }).select('author').exec();
      
      const authorIds = matchingNovels
        .map(n => n.author ? n.author.toString() : null)
        .filter(a => a !== null);
      
      const uniqueAuthorObjectIds = [...new Set(authorIds)].map(id => new Types.ObjectId(id));
      this.logger.log(`Novel search "${novel}" matched ${matchingNovels.length} novels from ${uniqueAuthorObjectIds.length} unique authors`);
      
      query._id = { $in: uniqueAuthorObjectIds };
    }

    const authors = await this.authorModel.find(query).populate('novelCount').sort({ name: 1 }).exec();
    this.logger.log(`Found ${authors.length} authors matching criteria`);
    return authors;
  }

  async update(id: string, updateAuthorDto: any) {
    const author = await this.authorModel.findById(id).exec();
    if (author && author.editable === false) {
      throw new BadRequestException('Không thể chỉnh sửa tác giả mặc định');
    }
    return this.authorModel.findByIdAndUpdate(id, updateAuthorDto, { new: true }).exec();
  }

  async getNovels(id: string) {
    this.logger.log(`Fetching novels for author ID: ${id}`);
    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(id);
    } catch (e) {
      this.logger.error(`Invalid author ID format: ${id}`);
      return [];
    }
    const novels = await this.novelModel.find({ 
      $or: [
        { author: id },
        { author: objectId }
      ]
    }).select('title _id').exec();
    this.logger.log(`Found ${novels.length} novels for author ${id}`);
    return novels;
  }

  async removeWithMode(id: string, mode?: string) {
    this.logger.log(`Starting advanced removal for author ID: ${id}, mode: ${mode}`);
    
    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(id);
    } catch (e) {
      throw new BadRequestException('Invalid author ID format');
    }

    // Prevent deleting default authors
    const author = await this.authorModel.findById(objectId).exec();
    if (author && author.editable === false) {
      throw new BadRequestException('Không thể xóa tác giả mặc định');
    }

    // Explicitly search by ObjectId
    const novels = await this.novelModel.find({ author: objectId }).exec();
    this.logger.log(`Found ${novels.length} novels related to author ${id}`);
    
    if (novels.length > 0) {
      if (!mode) {
        this.logger.log(`Returning novel list requirement for author ${id}`);
        return {
          hasNovels: true,
          novels: novels.map(n => ({ _id: n._id, title: n.title }))
        };
      }

      if (mode === 'unlink') {
        this.logger.log(`Unlinking ${novels.length} novels from author ${id}`);
        const defaultAuthor = await this.authorModel.findOne({ slug: 'khong-ten-tac-gia' }).exec();
        if (!defaultAuthor) {
          throw new BadRequestException('Tác giả mặc định không tồn tại');
        }
        await this.novelModel.updateMany({ author: objectId }, { author: defaultAuthor._id }).exec();
      } else if (mode === 'delete') {
        this.logger.log(`Deleting ${novels.length} novels for author ${id}`);
        await this.novelModel.deleteMany({ author: objectId }).exec();
      } else {
        throw new BadRequestException('Invalid deletion mode');
      }
    }

    this.logger.log(`Final deletion of author ${id}`);
    const result = await this.authorModel.findByIdAndDelete(objectId).exec();
    return { success: true, result };
  }

  async remove(id: string) {
    return this.authorModel.findByIdAndDelete(id).exec();
  }
}
