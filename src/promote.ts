import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  
  const username = process.argv[2];
  if (!username) {
    console.error('Vui lòng cung cấp username: npm run promote <username>');
    process.exit(1);
  }

  const user = await usersService.findOne(username);
  if (!user) {
    console.error(`Không tìm thấy user: ${username}`);
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();
  
  console.log(`Đã chuyển user ${username} thành ADMIN thành công!`);
  await app.close();
}
bootstrap();
