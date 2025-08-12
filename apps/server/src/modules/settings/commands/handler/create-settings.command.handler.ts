// src/modules/settings/commands/handler/create-settings.command.handler.ts
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
import { CreateSettingsCommand } from '../impl/create-settings.command';
import { HttpErrorService } from 'services/http-error-service/index.service';

@CommandHandler(CreateSettingsCommand)
export class CreateSettingsHandler
  implements ICommandHandler<CreateSettingsCommand>
{
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly httpErrorService: HttpErrorService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('CreateSettingsHandler');
  }

  async execute(
    command: CreateSettingsCommand,
  ): Promise<IApiResponse<SettingsResponseDto>> {
    const { userId, createSettingsDto } = command;

    try {
      this.loggerService.log(`Start creating settings for user: ${userId}`);

      // Convert string userId to ObjectId
      const userIdObjectId = new Types.ObjectId(userId);

      // Check if settings already exist for this user
      const existingSettings =
        await this.settingsRepository.findByUserId(userIdObjectId);
      if (existingSettings) {
        throw this.httpErrorService.throwError(
          ErrorTypes.BadRequest,
          ErrorResponseMessages.SETTINGS_ALREADY_EXIST,
        );
      }

      // Create settings
      const settings = await this.settingsRepository.create({
        userId: userIdObjectId, // Use the ObjectId here
        ...createSettingsDto,
      });

      if (!settings) {
        throw this.httpErrorService.throwError(
          ErrorTypes.InternalServerError,
          ErrorResponseMessages.SETTINGS_CREATION_FAILED,
        );
      }

      this.loggerService.log(
        `Settings created successfully for user: ${userId}`,
      );

      return {
        status: 'success',
        statusCode: 201,
        message: SuccessResponseMessages.SETTINGS_CREATED_SUCCESSFULLY,
        data: new SettingsResponseDto(settings),
        error: null,
      };
    } catch (error) {
      this.loggerService.error(
        'Error during settings creation',
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
