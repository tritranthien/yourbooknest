import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  
  console.log('MONGODB_URL:', configService.get('MONGODB_URL'));
  console.log('TOKEN_SECRET:', configService.get('TOKEN_SECRET'));
  console.log('PORT:', configService.get('PORT'));
  
  await app.close();
}
bootstrap();
