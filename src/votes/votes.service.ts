import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vote, VoteDocument } from '../schemas/vote.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel('Vote') private voteModel: Model<VoteDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  async create(novelId: string, goldcard: number, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.goldcard < goldcard) {
      throw new BadRequestException('Không đủ kim phiếu');
    }

    // Deduct goldcard
    user.goldcard -= goldcard;
    await user.save();

    const newVote = new this.voteModel({
      novel: novelId,
      voter: userId,
      goldcard: goldcard,
    });
    return newVote.save();
  }

  async findByUser(userId: string) {
    return this.voteModel
      .find({ voter: userId })
      .populate('novel')
      .sort({ createdAt: -1 })
      .exec();
  }
}
