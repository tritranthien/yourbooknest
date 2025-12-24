import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { NovelsModule } from '../novels/novels.module';

@Module({
  imports: [UsersModule, NovelsModule],
  controllers: [AdminController]
})
export class AdminModule {}
