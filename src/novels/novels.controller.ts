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
  Patch,
  Delete,
} from '@nestjs/common';
import { NovelsService } from './novels.service';
import { FollowsService } from '../follows/follows.service';
import { RatingsService } from '../ratings/ratings.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('novels')
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly followsService: FollowsService,
    private readonly ratingsService: RatingsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createNovelDto: CreateNovelDto, @Request() req) {
    return this.novelsService.create(createNovelDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllMyNovels(@Request() req) {
    return this.novelsService.findByUploader(req.user._id);
  }

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
    @Query('stt') stt: string,
    @Query('cnum') cnum: number,
    @Query('srt') srt: string,
    @Query('search') search: string,
  ) {
    return this.novelsService.getFilteredByTurn(
      turn,
      page || 1,
      stt,
      cnum,
      srt,
      search
    );
  }

  // Old backend used novelId, but param named :novel. 
  @Get('chaps/:novelId')
  async getChapsAlias(
    @Param('novelId') novelId: string,
    @Query('page') page: number,
  ) {
    return this.novelsService.getChaps(novelId, page);
  }

  @Get('fullchaps/:novelId')
  async getFullChaps(@Param('novelId') novelId: string) {
    return this.novelsService.getFullChaps(novelId);
  }

  @Get(':novelId/chaps')
  async getChaps(
    @Param('novelId') novelId: string,
    @Query('page') page: number,
  ) {
    return this.novelsService.getChaps(novelId, page);
  }

  @Get('chap/:novelId/:chap')
  async getChap(
    @Param('novelId') novelId: string,
    @Param('chap') chap: number,
  ) {
    return this.novelsService.getChap(novelId, chap);
  }

  @UseGuards(JwtAuthGuard)
  @Post('newchap')
  async createChap(@Body() createChapDto: any, @Request() req) {
    return this.novelsService.createChap(createChapDto, req.user._id);
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

  @UseGuards(JwtAuthGuard)
  @Get('myfollowed')
  async getMyFollowed(@Request() req) {
    return this.followsService.findByUser(req.user._id);
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

  @Get('filterincate/:cateId')
  async getFiltered(
    @Param('cateId') cateId: string,
    @Query('page') page: number,
    @Query('status') status: string,
    @Query('stt') stt: string,
    @Query('cnum') cnum: number,
    @Query('srt') srt: string,
    @Query('search') search: string,
  ) {
    return this.novelsService.getFiltered(
      cateId,
      page || 1,
      stt || status,
      cnum,
      srt,
      search,
    );
  }

  @Get('search/:text')
  async searchAll(@Param('text') text: string) {
    // Basic search returning novels
    return this.novelsService.search(text);
  }

  @Get(':slug')
  async getNovel(@Param('slug') slug: string) {
    try {
      return await this.novelsService.getNovelBySlug(slug);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // --- Admin Moderation ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/pending')
  async getPendingNovels(@Query('page') page: number) {
    return this.novelsService.getPendingNovels(page || 1);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/approve/:id')
  async approveNovel(@Param('id') id: string) {
    return this.novelsService.approveNovel(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('admin/reject/:id')
  async rejectNovel(@Param('id') id: string) {
    return this.novelsService.rejectNovel(id);
  }
}
