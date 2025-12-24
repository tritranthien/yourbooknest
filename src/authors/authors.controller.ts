import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller(['author', 'authors'])
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get('search/:text')
  search(@Param('text') text: string) {
    return this.authorsService.search(text);
  }

  @Get('all')
  findAll() {
    return this.authorsService.findAll();
  }

  @Get('getbyslug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.authorsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createAuthorDto: any) {
    return this.authorsService.create(createAuthorDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateAuthorDto: any) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Get(':id/novels')
  getAuthorNovels(@Param('id') id: string) {
    return this.authorsService.getNovels(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Query('mode') mode?: string) {
    return this.authorsService.removeWithMode(id, mode);
  }
}
