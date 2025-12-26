import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NovelsService } from './novels.service';
import { FollowsService } from '../follows/follows.service';
import { RatingsService } from '../ratings/ratings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('novels')
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly followsService: FollowsService,
    private readonly ratingsService: RatingsService,
  ) {}

  @Get('new')
  async getNewNovels() {
    return this.novelsService.getNewNovels();
  }

  @Get('newnovels') 
  async getNewNovelsAlias() {
    return this.novelsService.getNewNovels();
  }

  @Get('newest')
  async getNewest() {
    return this.novelsService.getNewest();
  }

  @Get('modvote')
  async getModVote() {
    return this.novelsService.getModVote();
  }

  @Get('hasnewchap')
  async getHasNewChap() {
    return this.novelsService.getHasNewChap();
  }

  @Get('mostviews')
  async getMostViews() {
    return this.novelsService.getMostViews();
  }

  @Get('mostlikes')
  async getMostLikes() {
    return this.novelsService.getMostLikes();
  }

  @Get('mostfollow')
  async getMostFollow() {
    return this.novelsService.getMostFollow();
  }

  @Get('bestrates')
  async getBestRates() {
    return this.novelsService.getBestRates();
  }

  @Get('bestvotes')
  async getBestVotes() {
    return this.novelsService.getBestVotes();
  }

  @Get('hot')
  async getHot() {
    return this.novelsService.getModVote(); // Fallback to modvote for 'hot'
  }

  @Get('turn/:turn')
  async getByTurn(
    @Param('turn') turn: string,
    @Query('page') page: number,
  ) {
    let query = {};
    let sort = { updatedAt: -1 } as any;

    if (turn === 'truyen-hot' || turn === 'hot') {
      sort = { views: -1 };
    } else if (turn === 'moi-nhat') {
      sort = { updatedAt: -1 };
    } else if (turn === 'hoan-thanh') {
      query = { status: 'completed' };
    }

    return this.novelsService.getPaged(query, sort, page, 15);
  }

  @Get(':slug')
  async getNovel(@Param('slug') slug: string) {
    try {
      return await this.novelsService.getNovelBySlug(slug);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // Old backend used novelId, but param named :novel. 
  @Get('chaps/:novelId')
  async getChapsAlias(
    @Param('novelId') novelId: string,
    @Query('page') page: number,
  ) {
    return this.novelsService.getChaps(novelId, page);
  }

  @Get(':novelId/chaps')
  async getChaps(
    @Param('novelId') novelId: string,
    @Query('page') page: number,
  ) {
    return this.novelsService.getChaps(novelId, page);
  }

  // --- Follow Compatibility ---
  @UseGuards(JwtAuthGuard)
  @Get('checkfollow/:novelId')
  async checkFollow(@Param('novelId') novelId: string, @Request() req) {
    return this.followsService.checkFollow(novelId, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('follow/:novelId')
  async follow(@Param('novelId') novelId: string, @Request() req) {
    return this.followsService.create({ novel: novelId }, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cancelfollow/:novelId')
  async cancelFollow(@Param('novelId') novelId: string, @Request() req) {
    return this.followsService.remove(novelId, req.user._id);
  }

  // --- Rating Compatibility ---
  @UseGuards(JwtAuthGuard)
  @Post('ratting')
  async rate(@Body() createRatingDto: any, @Request() req) {
    return this.ratingsService.create(createRatingDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('checkrated/:novelId')
  async checkRated(@Param('novelId') novelId: string, @Request() req) {
    return this.ratingsService.checkRated(novelId, req.user._id);
  }

  @Get('allrates/:novelId')
  async allRates(@Param('novelId') novelId: string) {
    return this.ratingsService.findByNovel(novelId);
  }

  // --- Filtering & Selection ---
  @Get('getbycate/:cateId')
  async getByCate(
    @Param('cateId') cateId: string,
    @Query('page') page: number,
  ) {
    return this.novelsService.getByCate(cateId, page);
  }

  @Get('getcompleted/:cateId')
  async getCompletedByCate(
    @Param('cateId') cateId: string,
    @Query('page') page: number,
  ) {
    return this.novelsService.getCompletedByCate(cateId, page);
  }

  @Get('bestviews/:cateId')
  async getBestViewsByCate(
    @Param('cateId') cateId: string,
    @Query('page') page: number,
  ) {
    return this.novelsService.getBestViewsByCate(cateId, page);
  }

  @Get('getbyauthor/:authorId')
  async getByAuthor(@Param('authorId') authorId: string) {
    return this.novelsService.getByAuthor(authorId);
  }

  @Get('search/:text')
  async searchAll(@Param('text') text: string) {
    // Basic search returning novels
    return this.novelsService.search(text);
  }
}
