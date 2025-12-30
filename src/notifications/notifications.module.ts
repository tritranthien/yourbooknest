import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationSchema } from '../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Noti', schema: NotificationSchema }]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
