import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel('Cmt') private commentModel: Model<CommentDocument>,
  ) {}

  async create(createCommentDto: any, userId: string): Promise<Comment> {
    const newComment = new this.commentModel({
      ...createCommentDto,
      auth: userId,
    });
    return newComment.save();
  }

  async findByNovel(novelId: string) {
    // Only fetch parent comments first, or all and thread them?
    // Old logic likely fetched parents and populated replies? Or just fetched all.
    // Let's fetch root comments (parent: null) for pagination usually, but for simplicity fetch root comments.
    // If client expects all, we can adjust. Assuming root comments first.
    return this.commentModel
      .find({ novel: novelId, parent: null })
      .populate('auth', 'username image')
      .populate({
        path: 'repCount', // Ensure virtual is working
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findReplies(parentId: string) {
    return this.commentModel
      .find({ parent: parentId })
      .populate('auth', 'username image')
      .sort({ createdAt: 1 })
      .exec();
  }
}
