// src/modules/settings/dto/response-settings.dto.ts
import {
  ColorEnum,
  LanguageEnum,
  ThemeEnum,
  ViewEnum,
} from 'interfaces/setting.interface';
import { ApiProperty } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ThemeEnum })
  theme: ThemeEnum;

  @ApiProperty({ enum: ColorEnum })
  color: ColorEnum;

  @ApiProperty({ enum: ViewEnum })
  view: ViewEnum;

  @ApiProperty({ enum: LanguageEnum })
  language: LanguageEnum;

  @ApiProperty()
  createdAt: Date;

  constructor(settings: any) {
    this.id = settings._id?.toString() || settings.id;
    this.userId = settings.userId?.toString() || settings.userId;
    this.theme = settings.theme;
    this.color = settings.color;
    this.view = settings.view;
    this.language = settings.language;
    this.createdAt = settings.createdAt;
  }
}
