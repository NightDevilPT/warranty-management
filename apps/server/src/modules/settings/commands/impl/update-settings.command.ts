// src/modules/settings/commands/impl/update-settings.command.ts

import { UpdateSettingsDto } from "../../dto/update-setting.dto";

export class UpdateSettingsCommand {
  constructor(
    public readonly userId: string,
    public readonly updateSettingsDto: UpdateSettingsDto,
  ) {}
}
