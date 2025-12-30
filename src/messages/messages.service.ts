import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Mess') private messageModel: Model<MessageDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createMessDto: any, senderId: string) {
    // FE sends recieverList as an array of User objects or IDs
    const recieverIds = createMessDto.recieverList.map((r: any) => 
      typeof r === 'string' ? r : r._id
    );

    const newMessage = new this.messageModel({
      title: createMessDto.title,
      content: createMessDto.content,
      sender: senderId,
      reciever: recieverIds,
    });
    const savedMess = await newMessage.save();

    // Create notifications for each receiver
    for (const recId of recieverIds) {
      await this.notificationsService.create({
        type: 'newmess',
        user: recId,
        sender: senderId,
      });
    }

    return savedMess;
  }

  async findMySent(userId: string) {
    return this.messageModel
      .find({ sender: userId })
      .populate('sender', 'username image')
      .populate('reciever', 'username image')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMyReceived(userId: string) {
    return this.messageModel
      .find({ reciever: userId })
      .populate('sender', 'username image')
      .populate('reciever', 'username image')
      .sort({ createdAt: -1 })
      .exec();
  }
}
