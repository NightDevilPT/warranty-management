// src/modules/settings/repository/settings.repository.ts
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'common/repository/base.repository';
import { Settings, SettingsDocument } from '../entities/setting.entity';

@Injectable()
export class SettingsRepository extends BaseRepository<SettingsDocument> {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
  ) {
    super(settingsModel);
  }

  public async findByUserId(userId: Types.ObjectId): Promise<SettingsDocument | null> {
	return this.settingsModel.findOne({ userId });
  }
}
