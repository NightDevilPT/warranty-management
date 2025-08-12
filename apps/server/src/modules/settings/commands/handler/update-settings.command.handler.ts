// src/modules/settings/commands/handler/update-settings.command.handler.ts
import {
  IApiResponse,
  ErrorResponseMessages,
  ErrorTypes,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { Types } from 'mongoose';
import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SettingsResponseDto } from '../../dto/response.setting.dto';
import { LoggerService } from 'services/logger-service/index.service';
import { SettingsRepository } from '../../repository/settings.repository';
import { UpdateSettingsCommand } from '../impl/update-settings.command';
import { HttpErrorService } from 'services/http-error-service/index.service';

@CommandHandler(UpdateSettingsCommand)
export class UpdateSettingsHandler
  implements ICommandHandler<UpdateSettingsCommand>
{
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly httpErrorService: HttpErrorService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('UpdateSettingsHandler');
  }

  async execute(
    command: UpdateSettingsCommand,
  ): Promise<IApiResponse<SettingsResponseDto>> {
    const { userId, updateSettingsDto } = command;

    try {
      this.loggerService.log(`Start updating settings for user: ${userId}`);

      const userIdObjectId = new Types.ObjectId(userId);
      // Find existing settings
      const existingSettings =
        await this.settingsRepository.findByUserId(userIdObjectId);
      if (!existingSettings) {
        throw this.httpErrorService.throwError(
          ErrorTypes.NotFound,
          ErrorResponseMessages.SETTINGS_NOT_FOUND,
        );
      }

      // Update settings
      const updatedSettings = await this.settingsRepository.updateById(
        existingSettings.id.toString(),
        updateSettingsDto,
      );

      if (!updatedSettings) {
        throw this.httpErrorService.throwError(
          ErrorTypes.InternalServerError,
          ErrorResponseMessages.SETTINGS_UPDATE_FAILED,
        );
      }

      this.loggerService.log(
        `Settings updated successfully for user: ${userId}`,
      );

      return {
        status: 'success',
        statusCode: 200,
        message: SuccessResponseMessages.SETTINGS_UPDATED_SUCCESSFULLY,
        data: new SettingsResponseDto(updatedSettings),
        error: null,
      };
    } catch (error) {
      this.loggerService.error(
        'Error during settings update',
        error.stack || error.message,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw this.httpErrorService.throwError(
        ErrorTypes.InternalServerError,
        error.message || ErrorResponseMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
