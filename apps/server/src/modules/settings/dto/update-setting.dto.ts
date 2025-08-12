// src/modules/settings/dto/update-settings.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSettingsDto } from './create-setting.dto';

export class UpdateSettingsDto extends PartialType(CreateSettingsDto) {}
