import { Controller, Post, Body, Request, UseGuards, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
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
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getmyinfo')
  async getMyInfo(@Request() req) {
    return req.user;
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
}
