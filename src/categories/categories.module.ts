import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Novel, NovelSchema } from '../schemas/novel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Cate', schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: 'Novel', schema: NovelSchema }]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
