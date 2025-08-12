// src/modules/settings/dto/create-settings.dto.ts
import {
  ColorEnum,
  LanguageEnum,
  ThemeEnum,
  ViewEnum,
} from 'interfaces/setting.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export class CreateSettingsDto {
  @ApiProperty({ enum: ThemeEnum, default: ThemeEnum.LIGHT, required: false })
  @IsOptional()
  @IsEnum(ThemeEnum)
  theme?: ThemeEnum;

  @ApiProperty({ enum: ColorEnum, default: ColorEnum.BLUE, required: false })
  @IsOptional()
  @IsEnum(ColorEnum)
  color?: ColorEnum;

  @ApiProperty({ enum: ViewEnum, default: ViewEnum.TABLE, required: false })
  @IsOptional()
  @IsEnum(ViewEnum)
  view?: ViewEnum;

  @ApiProperty({
    enum: LanguageEnum,
    default: LanguageEnum.EN,
    required: false,
  })
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}
