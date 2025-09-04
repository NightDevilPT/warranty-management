// src/modules/users/commands/handler/login-user.command.handler.ts

import {
  IApiResponse,
  ErrorTypes,
  ErrorResponseMessages,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpException, Injectable } from '@nestjs/common';
import { UserResponseDto } from '../../dto/response-user.dto';
import { LoginUserCommand } from '../impl/login-user.command';
import { UserRepository } from '../../repository/user.repository';
import { HashService } from 'services/hash-service/index.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from 'services/logger-service/index.service';
import { JwtTokenService } from 'services/jwt-token-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';

@CommandHandler(LoginUserCommand)
@Injectable()
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly loggerService: LoggerService,
    private readonly httpErrorService: HttpErrorService,
    private readonly jwtService: JwtTokenService, // Inject if using JWT
  ) {
    this.loggerService.setContext('LoginUserHandler');
  }

  async execute(
    command: LoginUserCommand,
  ): Promise<IApiResponse<UserResponseDto>> {
    const { email, password } = command.loginUserDto;

    try {
      this.loggerService.log(`Login attempt for email: ${email}`);

      // Find user by email
      const user = await this.userRepository.findUserByEmailWithPassword(email); // Select only necessary fields
      if (!user) {
        throw this.httpErrorService.throwError(
          ErrorTypes.Unauthorized,
          ErrorResponseMessages.INVALID_EMAIL_OR_PASSWORD,
        );
      }

      // Optional: Check if user is verified
      if (user.verified === false) {
        throw this.httpErrorService.throwError(
          ErrorTypes.Unauthorized,
          ErrorResponseMessages.USER_NOT_VERIFIED || 'User email not verified',
        );
      }

      // Validate password
      const isPasswordValid = await this.hashService.compareValue(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw this.httpErrorService.throwError(
          ErrorTypes.Unauthorized,
          ErrorResponseMessages.INVALID_EMAIL_OR_PASSWORD,
        );
      }

      // Generate JWT (or session token) and return profile + token
      const payload = { sub: user._id, email: user.email, roles: user.roles }; // tweak as needed
      const accessToken = this.jwtService.generateAccessToken(payload);
      const refreshToken = this.jwtService.generateRefreshToken(payload);

      return {
        status: 'success',
        message: SuccessResponseMessages.LOGIN_SUCCESSFUL || 'Login successful',
        statusCode: 200,
        data: new UserResponseDto(user),
        accessToken,
        refreshToken,
        error: null,
      };
    } catch (error) {
      this.loggerService.error(
        'Error during login attempt',
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
