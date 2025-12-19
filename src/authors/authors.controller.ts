import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Controller(['author', 'authors'])
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get('search/:text')
  search(@Param('text') text: string) {
    return this.authorsService.search(text);
  }

  @Get('getbyslug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.authorsService.findBySlug(slug);
  }

  @Post()
  create(@Body() createAuthorDto: any) {
    return this.authorsService.create(createAuthorDto);
  }
}
