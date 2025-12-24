import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { Author, AuthorSchema } from '../schemas/author.schema';
import { Novel, NovelSchema } from '../schemas/novel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Author.name, schema: AuthorSchema },
      { name: Novel.name, schema: NovelSchema },
    ]),
  ],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
