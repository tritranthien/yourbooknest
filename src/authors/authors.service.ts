import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Author, AuthorDocument } from '../schemas/author.schema';
import { Novel, NovelDocument } from '../schemas/novel.schema';

@Injectable()
export class AuthorsService {
  private readonly logger = new Logger(AuthorsService.name);

  constructor(
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
    @InjectModel(Novel.name) private novelModel: Model<NovelDocument>,
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

  async findAll() {
    return this.authorModel.find().populate('novelCount').sort({ name: 1 }).exec();
  }

  async update(id: string, updateAuthorDto: any) {
    const author = await this.authorModel.findById(id).exec();
    if (author && ['an-danh', 'khong-ten-tac-gia'].includes(author.slug)) {
      throw new BadRequestException('Không thể chỉnh sửa tác giả mặc định');
    }
    return this.authorModel.findByIdAndUpdate(id, updateAuthorDto, { new: true }).exec();
  }

  async getNovels(id: string) {
    return this.novelModel.find({ author: id }).select('title _id').exec();
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
    if (author && ['an-danh', 'khong-ten-tac-gia'].includes(author.slug)) {
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
        let anonymousAuthor = await this.authorModel.findOne({ name: 'Ẩn danh' }).exec();
        if (!anonymousAuthor) {
          anonymousAuthor = await this.authorModel.create({
            name: 'Ẩn danh',
            slug: 'an-danh',
            des: 'Tác giả không xác định'
          });
        }
        await this.novelModel.updateMany({ author: objectId }, { author: anonymousAuthor._id }).exec();
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
