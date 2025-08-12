// src/modules/settings/commands/impl/create-settings.command.ts

import { CreateSettingsDto } from "../../dto/create-setting.dto";

export class CreateSettingsCommand {
  constructor(
    public readonly userId: string,
    public readonly createSettingsDto: CreateSettingsDto,
  ) {}
}
