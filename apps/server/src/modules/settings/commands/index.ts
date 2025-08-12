import { CreateSettingsHandler } from './handler/create-settings.command.handler';
import { UpdateSettingsHandler } from './handler/update-settings.command.handler';

export const SettingCommandHandlers = [
  CreateSettingsHandler,
  UpdateSettingsHandler,
];
