// src/modules/settings/settings.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSettingsDto } from './dto/create-setting.dto';
import { UpdateSettingsDto } from './dto/update-setting.dto';
import { SettingsResponseDto } from './dto/response.setting.dto';
import { CreateSettingsCommand } from './commands/impl/create-settings.command';
import { UpdateSettingsCommand } from './commands/impl/update-settings.command';

@Injectable()
export class SettingsService {
  constructor(private readonly commandBus: CommandBus) {}

  async createSettings(
    userId: string,
    createSettingsDto: CreateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.commandBus.execute(
      new CreateSettingsCommand(userId, createSettingsDto),
    );
  }

  async updateSettings(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.commandBus.execute(
      new UpdateSettingsCommand(userId, updateSettingsDto),
    );
  }
}
