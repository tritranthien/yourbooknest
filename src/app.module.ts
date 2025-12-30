import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserSchema } from './schemas/user.schema';
import { CategorySchema } from './schemas/category.schema';
import { AuthorSchema } from './schemas/author.schema';
import { NovelSchema } from './schemas/novel.schema';
import { ChapSchema } from './schemas/chap.schema';
import { CommentSchema } from './schemas/comment.schema';
import { FollowSchema } from './schemas/follow.schema';
import { RatingSchema } from './schemas/rating.schema';
import { SettingSchema } from './schemas/setting.schema';
import { TagSchema } from './schemas/tag.schema';
import { NovelsModule } from './novels/novels.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { FollowsModule } from './follows/follows.module';
import { RatingsModule } from './ratings/ratings.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthorsModule } from './authors/authors.module';
import { FilesModule } from './files/files.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { TagsModule } from './tags/tags.module';
import { MessagesModule } from './messages/messages.module';
import { VotesModule } from './votes/votes.module';
import { VoteSchema } from './schemas/vote.schema';
import { MessageSchema } from './schemas/message.schema';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Cate', schema: CategorySchema },
      { name: 'Author', schema: AuthorSchema },
      { name: 'Novel', schema: NovelSchema },
      { name: 'Chap', schema: ChapSchema },
      { name: 'Cmt', schema: CommentSchema },
      { name: 'Follow', schema: FollowSchema },
      { name: 'Ratting', schema: RatingSchema },
      { name: 'Setting', schema: SettingSchema },
      { name: 'Tag', schema: TagSchema },
      { name: 'Mess', schema: MessageSchema },
      { name: 'Vote', schema: VoteSchema },
    ]),
    NovelsModule,
    UsersModule,
    AuthModule,
    CommentsModule,
    FollowsModule,
    RatingsModule,
    CategoriesModule,
    AuthorsModule,
    FilesModule,
    AdminModule,
    SettingsModule,
    NotificationsModule,
    MessagesModule,
    VotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
