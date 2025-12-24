import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { NovelsService } from '../novels/novels.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private novelsService: NovelsService,
  ) {}

  @Get('stats')
  async getStats() {
    const userCount = await this.usersService.countDocuments();
    const { total: novelCount } = await this.novelsService.getPaged({}, {});
    return {
      userCount,
      novelCount,
    };
  }

  @Get('users')
  async getUsers() {
    return this.usersService.findAll();
  }

  @Get('novels')
  async getNovels(@Query() allQuery: any) {
    console.log('!!! ALL RAW PARAMS !!!', allQuery);
    const { title, categoryId, status, page, limit } = allQuery;
    const query: any = {};
    if (title && title.trim() !== '') {
      query.title = { $regex: title, $options: 'i' };
    }
    if (categoryId && categoryId.trim() !== '' && categoryId !== 'undefined') {
      try {
        query.category = new Types.ObjectId(categoryId);
      } catch (e) {
        query.category = categoryId;
      }
    }
    if (status && status.trim() !== '' && status !== 'undefined') {
      query.status = status;
    }

    const pageNum = parseInt(page as any) || 1;
    const limitNum = parseInt(limit as any) || 20;

    console.log('[Admin] Final Query:', query);
    
    const result = await this.novelsService.getPaged(query, { createdAt: -1 }, pageNum, limitNum);
    console.log('[Admin] Returning:', result.novels.length, 'novels. First ID:', result.novels[0]?._id);
    return result;
  }

  @Patch('novels/:id')
  async updateNovel(@Param('id') id: string, @Body() updateNovelDto: any) {
    return this.novelsService.update(id, updateNovelDto);
  }

  @Delete('novels/:id')
  async deleteNovel(@Param('id') id: string) {
    return this.novelsService.remove(id);
  }
}
