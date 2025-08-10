// src/modules/users/commands/handler/update-user.command.handler.ts
import {
  IApiResponse,
  ErrorResponseMessages,
  ErrorTypes,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpException } from '@nestjs/common';
import { UserResponseDto } from '../../dto/response-user.dto';
import { UserRepository } from '../../repository/user.repository';
import { HashService } from 'services/hash-service/index.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../impl/update-user.command';
import { LoggerService } from 'services/logger-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly httpErrorService: HttpErrorService,
    private readonly loggerService: LoggerService,
    private readonly hashService: HashService,
  ) {
    this.loggerService.setContext('UpdateUserHandler');
  }

  async execute(
    command: UpdateUserCommand,
  ): Promise<IApiResponse<UserResponseDto>> {
    const { userId, updateUserDto } = command;

    try {
      this.loggerService.log(`Start updating user: ${userId}`);

      // Get existing user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw this.httpErrorService.throwError(
          ErrorTypes.NotFound,
          ErrorResponseMessages.USER_NOT_FOUND,
        );
      }

      // Prepare update data
      const updateData: any = {
        firstName: updateUserDto.firstName || user.firstName,
        lastName: updateUserDto.lastName || user.lastName,
        email: updateUserDto.email || user.email,
        contact: updateUserDto.contact || user.contact,
        avatar: updateUserDto.avatar ?? user.avatar,
      };

      updateData.username =
        `${updateUserDto.firstName || user.firstName} ${updateUserDto.lastName || user.lastName}`.trim();

      // Handle password update if provided
      if (updateUserDto.password) {
        updateData.password = await this.hashService.hashValue(
          updateUserDto.password,
        );
      }

      // Update user
      const updatedUser = await this.userRepository.updateById(
        userId,
        updateData,
      );
      if (!updatedUser) {
        throw this.httpErrorService.throwError(
          ErrorTypes.InternalServerError,
          ErrorResponseMessages.USER_UPDATE_FAILED,
        );
      }

      this.loggerService.log(`User updated successfully: ${updatedUser.email}`);

      return {
        status: 'success',
        statusCode: 200,
        message: SuccessResponseMessages.USER_UPDATED_SUCCESSFULLY,
        data: new UserResponseDto(updatedUser),
        error: null,
      };
    } catch (error) {
      this.loggerService.error(
        `Error updating user ${userId}`,
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
