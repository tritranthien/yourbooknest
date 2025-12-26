import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(createUserDto: any): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async getPaged(query: any, sort: any, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const users = await this.userModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.userModel.countDocuments(query);
    return { users, total };
  }

  async countDocuments(query: any = {}): Promise<number> {
    return this.userModel.countDocuments(query).exec();
  }

  async update(id: string, updateUserDto: any): Promise<UserDocument | null> {
    // Prevent updating critical fields directly if needed, but for now allow generic update
    // Ideally we should filter updateUserDto in controller
    if (updateUserDto.password) {
      // If password update is needed, hashing should happen before calling this or inside here.
      // For now assuming password update is handled separately or pre-hashed.
      // But let's keep it simple for generic updates.
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }
}
