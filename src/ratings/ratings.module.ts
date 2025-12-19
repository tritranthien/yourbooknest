import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating, RatingSchema } from '../schemas/rating.schema';
import { Novel, NovelSchema } from '../schemas/novel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ratting', schema: RatingSchema }, // Keeping 'Ratting' name as per old schema to avoid data loss or issues
      { name: Novel.name, schema: NovelSchema }, // Needed for updating score
    ]),
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
