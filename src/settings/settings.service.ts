import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from '../schemas/setting.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
  ) {}

  async onModuleInit() {
    // Initialize default settings if none exist
    const count = await this.settingModel.countDocuments();
    if (count === 0) {
      await this.settingModel.create({});
      console.log('Default settings initialized');
    }
  }

  async getSettings(): Promise<Setting> {
    const settings = await this.settingModel.findOne();
    if (!settings) {
        return await this.settingModel.create({});
    }
    return settings;
  }

  async updateSettings(updateData: Partial<Setting>): Promise<Setting> {
    const settings = await this.settingModel.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });
    return settings;
  }
}
