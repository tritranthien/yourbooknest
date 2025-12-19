import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from '../schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Cmt', schema: CommentSchema }]), // Note: name 'Cmt' to match existing data if needed, or 'Comment' if migrating. Old model was 'Cmt'. Let's stick to 'Cmt' for safety or check schema file. Update: Schema file used 'Comment' class but in AppModule we used 'Cmt'. Let's consistency use 'Cmt' string token in MongooseModule to match database collection name mapping if implicit, or just use class name if we want to modernize. The Schema factory creates a schema. The collection name is determined by Mongoose pluralization unless specified. Old code used 'Cmt'. Let's check schema definition again. I will use 'Cmt' to be safe with old codebase compatibility if populate refers to 'Cmt'.
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
