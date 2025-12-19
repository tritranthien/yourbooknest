import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFollowDto: any, @Request() req) {
    return this.followsService.create(createFollowDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':novelId')
  remove(@Param('novelId') novelId: string, @Request() req) {
    return this.followsService.remove(novelId, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getFollowed(@Request() req) {
    return this.followsService.findByUser(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:novelId')
  checkFollow(@Param('novelId') novelId: string, @Request() req) {
    return this.followsService.checkFollow(novelId, req.user._id);
  }
}
