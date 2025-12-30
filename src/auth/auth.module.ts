import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { RatingsModule } from '../ratings/ratings.module';
import { CommentsModule } from '../comments/comments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VotesModule } from '../votes/votes.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    RatingsModule,
    CommentsModule,
    NotificationsModule,
    VotesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TOKEN_SECRET') || 'fallbackSecret',
        signOptions: { expiresIn: '60d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
