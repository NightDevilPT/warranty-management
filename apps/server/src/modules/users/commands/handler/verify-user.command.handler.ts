// src/modules/users/commands/handler/verify-user.command.handler.ts
import {
  ErrorTypes,
  ErrorResponseMessages,
  IApiResponse,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpException, Injectable } from '@nestjs/common';
import { UserResponseDto } from '../../dto/response-user.dto';
import { UserRepository } from '../../repository/user.repository';
import { VerifyUserCommand } from '../impl/verify-user.command';
import { LoggerService } from 'services/logger-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(VerifyUserCommand)
@Injectable()
export class VerifyUserHandler implements ICommandHandler<VerifyUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly httpErrorService: HttpErrorService,
    private readonly commandBus: CommandBus, // If you need to dispatch other commands
  ) {
    this.loggerService.setContext(VerifyUserHandler.name);
  }

  async execute(
    command: VerifyUserCommand,
  ): Promise<IApiResponse<UserResponseDto>> {
    const { token, email } = command;

    try {
      this.loggerService.log(`Starting user verification for email: ${email}`);

      if (!token || !email) {
        this.loggerService.warn(
          'Token or email missing in verification request',
        );
        throw this.httpErrorService.throwError(
          ErrorTypes.BadRequest,
          ErrorResponseMessages.TOKEN_AND_EMAIL_MUST_BE_PROVIDED, // You can define a constant if desired
        );
      }

      const user = await this.userRepository.findOne({
        email: email.toLowerCase(),
      });
      if (!user) {
        this.loggerService.warn(`User not found for email: ${email}`);
        throw this.httpErrorService.throwError(
          ErrorTypes.NotFound,
          ErrorResponseMessages.USER_NOT_FOUND,
        );
      }

      if (!user.token || user.token !== token) {
        this.loggerService.warn(`Invalid token provided for email: ${email}`);
        throw this.httpErrorService.throwError(
          ErrorTypes.BadRequest,
          ErrorResponseMessages.INVALID_VERIFICATION_TOKEN, // You can define a constant if desired
        );
      }

      if (user.tokenExpire && Date.now() > user.tokenExpire) {
        this.loggerService.warn(
          `Verification token expired for email: ${email}`,
        );
        throw this.httpErrorService.throwError(
          ErrorTypes.BadRequest,
          ErrorResponseMessages.VERIFICATION_TOKEN_EXPIRED, // You can define a constant if desired
        );
      }

      user.token = null;
      user.tokenExpire = null;
      (user as any).verified = true; // Ensure this field exists in schema
      const updatedUser = await user.save();

      this.loggerService.log(`User verified successfully for email: ${email}`);
      return {
        message: SuccessResponseMessages.USER_VERIFIED_SUCCESSFULLY,
        status: 'success',
        statusCode: 200,
        data: new UserResponseDto(updatedUser),
        error: null,
      };
    } catch (error) {
      this.loggerService.error(
        'Error during user verification',
        error.stack || error.message,
      );

      // Rethrow known HTTP exceptions to be handled by NestJS
      if (error instanceof HttpException) {
        throw error;
      }

      // Wrap any unexpected errors as InternalServerError
      throw this.httpErrorService.throwError(
        ErrorTypes.InternalServerError,
        error.message || ErrorResponseMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
