// src/modules/settings/entities/settings.entity.ts
import {
  ColorEnum,
  LanguageEnum,
  ThemeEnum,
  ViewEnum,
} from 'interfaces/setting.interface';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true, collection: 'settings' })
export class Settings {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ThemeEnum, default: ThemeEnum.LIGHT })
  theme: ThemeEnum;

  @Prop({ type: String, enum: ColorEnum, default: ColorEnum.BLUE })
  color: ColorEnum;

  @Prop({ type: String, enum: ViewEnum, default: ViewEnum.TABLE })
  view: ViewEnum;

  @Prop({ type: String, enum: LanguageEnum, default: LanguageEnum.EN })
  language: LanguageEnum;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
