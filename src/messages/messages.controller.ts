import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mess')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('sendmess')
  send(@Body() createMessDto: any, @Request() req) {
    return this.messagesService.create(createMessDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mysent')
  getSent(@Request() req) {
    return this.messagesService.findMySent(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('myrecieved')
  getReceived(@Request() req) {
    return this.messagesService.findMyReceived(req.user._id);
  }
}
