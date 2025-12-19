import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
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
}
