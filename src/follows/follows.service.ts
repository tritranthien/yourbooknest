import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follow, FollowDocument } from '../schemas/follow.schema';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel('Follow') private followModel: Model<FollowDocument>,
  ) {}

  async create(createFollowDto: any, userId: string) {
    const { novel: novelId } = createFollowDto;
    const existing = await this.followModel.findOne({
      novel: novelId,
      follower: userId,
    });
    if (existing) {
      return { success: true };
    }
    await this.followModel.create({ novel: novelId, follower: userId });
    return { success: true };
  }

  async remove(novelId: string, userId: string) {
    await this.followModel.deleteOne({ novel: novelId, follower: userId });
    return { success: true };
  }

  async findByUser(userId: string) {
    return this.followModel
      .find({ follower: userId })
      .populate({
        path: 'novel',
        populate: ['category', 'author', 'chapCount'],
      })
      .exec();
  }

  async checkFollow(novelId: string, userId: string) {
    const existing = await this.followModel.findOne({
      novel: novelId,
      follower: userId,
    });
    return { followed: !!existing };
  }
}
