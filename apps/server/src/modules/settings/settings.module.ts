// src/modules/settings/settings.module.ts
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SettingsService } from './settings.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingCommandHandlers } from './commands';
import { SettingsController } from './settings.controller';
import { User, UserSchema } from '../users/entities/user.entity';
import { Settings, SettingsSchema } from './entities/setting.entity';
import { SettingsRepository } from './repository/settings.repository';
import { UserRepository } from '../users/repository/user.repository';
import { LoggerService } from 'services/logger-service/index.service';
import { JwtTokenService } from 'services/jwt-token-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    SettingsRepository,
    UserRepository,
    LoggerService,
    HttpErrorService,
    JwtTokenService,
    ...SettingCommandHandlers,
  ],
  exports: [SettingsRepository],
})
export class SettingsModule {}
