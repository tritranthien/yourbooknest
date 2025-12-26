import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';
import { Novel, NovelSchema } from '../schemas/novel.schema';
import { Chap, ChapSchema } from '../schemas/chap.schema';
import { Tag, TagSchema } from '../schemas/tag.schema';
import { FollowsModule } from '../follows/follows.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Novel.name, schema: NovelSchema },
      { name: Chap.name, schema: ChapSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    FollowsModule,
    RatingsModule,
  ],
  controllers: [NovelsController],
  providers: [NovelsService],
  exports: [NovelsService],
})
export class NovelsModule {}
