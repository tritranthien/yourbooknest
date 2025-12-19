import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createRatingDto: any, @Request() req) {
    return this.ratingsService.create(createRatingDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:novelId')
  checkRated(@Param('novelId') novelId: string, @Request() req) {
    return this.ratingsService.checkRated(novelId, req.user._id);
  }

  @Get('novel/:novelId')
  getByNovel(@Param('novelId') novelId: string) {
    return this.ratingsService.findByNovel(novelId);
  }
}
