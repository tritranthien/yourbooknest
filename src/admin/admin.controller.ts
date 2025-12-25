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
  async getUsers(@Query() allQuery: any) {
    const { search, role, page, limit } = allQuery;
    const query: any = {};
    if (search && search.trim() !== '') {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role.trim() !== '' && role !== 'undefined') {
      const roles = Array.isArray(role) ? role : role.toString().split(',').filter(r => r.trim() !== '');
      if (roles.length > 0) {
        query.role = { $in: roles };
      }
    }

    const pageNum = parseInt(page as any) || 1;
    const limitNum = parseInt(limit as any) || 20;

    return this.usersService.getPaged(query, { createdAt: -1 }, pageNum, limitNum);
  }

  @Get('novels')
  async getNovels(@Query() allQuery: any) {
    console.log('!!! ALL RAW PARAMS !!!', allQuery);
    const { title, categoryId, status, page, limit } = allQuery;
    const query: any = {};
    if (title && title.trim() !== '') {
      query.title = { $regex: title, $options: 'i' };
    }
    if (categoryId && categoryId !== '' && categoryId !== 'undefined') {
      const categoryIds = Array.isArray(categoryId) ? categoryId : categoryId.toString().split(',').filter(id => id.trim() !== '');
      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds.map(id => {
          try { return new Types.ObjectId(id); } catch (e) { return id; }
        }) };
      }
    }
    if (status && status !== '' && status !== 'undefined') {
      const statuses = Array.isArray(status) ? status : status.toString().split(',').filter(s => s.trim() !== '');
      if (statuses.length > 0) {
        query.status = { $in: statuses };
      }
    }
    if (allQuery.authorId && allQuery.authorId !== '' && allQuery.authorId !== 'undefined') {
      const authorIds = Array.isArray(allQuery.authorId) ? allQuery.authorId : allQuery.authorId.toString().split(',').filter(id => id.trim() !== '');
      if (authorIds.length > 0) {
        query.author = { $in: authorIds.map(id => {
          try { return new Types.ObjectId(id); } catch (e) { return id; }
        }) };
      }
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
