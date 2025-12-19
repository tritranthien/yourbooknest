import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from '../schemas/rating.schema';
import { Novel, NovelDocument } from '../schemas/novel.schema';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel('Ratting') private ratingModel: Model<RatingDocument>,
    @InjectModel(Novel.name) private novelModel: Model<NovelDocument>,
  ) {}

  async create(createRatingDto: any, userId: string) {
    const { novel: novelId, scores } = createRatingDto;

    // Check if user already rated
    const existingRating = await this.ratingModel.findOne({
      novel: novelId,
      rater: userId,
    });

    if (existingRating) {
      throw new BadRequestException('User has already rated this novel');
    }

    // Create rating
    await this.ratingModel.create({
      ...createRatingDto,
      rater: userId,
    });

    // Update Novel score
    const novel = await this.novelModel.findById(novelId);
    if (!novel) {
      throw new NotFoundException('Novel not found'); // Should roll back rating? Ideally use transaction but Mongo replica set needed. simplifying.
    }

    const currentScores = novel.scores || 0;
    const currentRateNums = novel.rate_nums || 0;

    const newScore =
      (currentScores * currentRateNums + scores) / (currentRateNums + 1);
    const newTotal = currentRateNums + 1;

    await this.novelModel.findByIdAndUpdate(novelId, {
      scores: newScore,
      rate_nums: newTotal,
    });

    return { success: true };
  }

  async checkRated(novelId: string, userId: string) {
    const existingRating = await this.ratingModel.findOne({
      novel: novelId,
      rater: userId,
    });
    return { rated: !!existingRating };
  }

  async findByNovel(novelId: string) {
    return this.ratingModel
      .find({ novel: novelId })
      .populate('rater', 'username')
      .exec();
  }
}
