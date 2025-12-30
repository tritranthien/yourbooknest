import { Controller, Post, Body, Request, UseGuards, Get, HttpCode, HttpStatus, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { RatingsService } from '../ratings/ratings.service';
import { CommentsService } from '../comments/comments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VotesService } from '../votes/votes.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private ratingsService: RatingsService,
    private commentsService: CommentsService,
    private notificationsService: NotificationsService,
    private votesService: VotesService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() req) {
    // In a real app, use LocalGuard, but for now direct call or validateUser first
    const user = await this.authService.validateUser(req.username, req.password);
    if (!user) {
        return { error: 'Invalid credentials' };
    }
    return this.authService.login(user); // user here is the result object without password
  }

  @Post('register')
  async register(@Body() createUserDto: any) {
    return this.authService.register(createUserDto);
  }

  @Post('signup')
  async signup(@Body() createUserDto: any) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findById(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getmyinfo')
  async getMyInfo(@Request() req) {
    return this.usersService.findById(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getvoted')
  async getVoted(@Request() req) {
    return this.votesService.findByUser(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('vote/:novelId')
  async vote(@Param('novelId') novelId: string, @Body() body: any, @Request() req) {
    return this.votesService.create(novelId, body.goldcard, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getcmt')
  async getCmt(@Request() req) {
    return this.commentsService.findByUser(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notis')
  async getNotis(@Request() req) {
    return this.notificationsService.findByUser(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('readnotis')
  async readNotis(@Request() req) {
    return this.notificationsService.markAsRead(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('readnotisinnav')
  async readNotisInNav(@Body() notiIds: string[]) {
    return this.notificationsService.markListAsRead(notiIds);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateProfile(@Request() req, @Body() body: any) {
    const userId = req.user._id;
    // Filter allowed fields
    const allowedUpdates = {};
    if (body.image) allowedUpdates['image'] = body.image;
    // if (body.email) allowedUpdates['email'] = body.email; // Allow email update if needed
    // if (body.password) ... // Handle password separately usually

    // For now allow upgrading generic fields passed from FE
    // BE CAREFUL: Don't allow role or balance update here without checks
    const safeUpdate = { ...body };
    delete safeUpdate.role;
    delete safeUpdate.goldcard;
    delete safeUpdate.username; // Usually username is immutable or requires special process
    delete safeUpdate._id; 
    delete safeUpdate.password; // Handle password change in a dedicated endpoint or with encryption

    return this.usersService.update(userId, safeUpdate);
  }

  @Get('findbyname/:text')
  async findByName(@Param('text') text: string) {
    return this.usersService.findByName(text);
  }
}
