import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('Noti') private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: any) {
    return this.notificationModel.create(data);
  }

  async findByUser(userId: string) {
    const notis = await this.notificationModel
      .find({ user: userId })
      .populate('sender', 'username image')
      .populate('novel', 'title slug')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    
    const count = await this.notificationModel.countDocuments({ user: userId, read: false });
    
    return { notis, count };
  }

  async markAsRead(userId: string) {
    await this.notificationModel.updateMany({ user: userId, read: false }, { read: true }).exec();
    return { success: true };
  }

  async markListAsRead(notiIds: string[]) {
    await this.notificationModel.updateMany({ _id: { $in: notiIds } }, { read: true }).exec();
    return { success: true };
  }
}
