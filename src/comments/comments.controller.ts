import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommentDto: any, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user._id);
  }

  @Get('novel/:novelId')
  findByNovel(@Param('novelId') novelId: string) {
    return this.commentsService.findByNovel(novelId);
  }

  @Get('replies/:parentId')
  findReplies(@Param('parentId') parentId: string) {
    return this.commentsService.findReplies(parentId);
  }
}
