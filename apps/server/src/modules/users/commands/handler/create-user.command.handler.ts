// handlers/create-user.handler.ts
import {
  ApiResponse,
  ErrorResponseMessages,
  ErrorTypes,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpException } from '@nestjs/common';
import { MailProvider } from 'services/mail/interface';
import { UserResponseDto } from '../../dto/response-user.dto';
import { UserRepository } from '../../repository/user.repository';
import { HashService } from 'services/hash-service/index.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { LoggerService } from 'services/logger-service/index.service';
import { TemplateEnum } from 'services/mail/helpers/template-generator';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { MailSenderService } from 'services/mail/services/mail-sender.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly httpErrorService: HttpErrorService,
    private readonly hashService: HashService,
    private readonly loggerService: LoggerService,
    private readonly mailService: MailSenderService,
  ) {
    this.loggerService.setContext('CreateUserHandler');
  }

  async execute(
    command: CreateUserCommand,
  ): Promise<ApiResponse<UserResponseDto>> {
    const { firstName, lastName, email, contact, role, password } =
      command.createUserDto;

    try {
      this.loggerService.log(`Start creating user with email: ${email}`);

      // Check for existing user with the same email
      const existingUser = await this.userRepository.findOne({ email });
      if (existingUser) {
        this.loggerService.warn(
          `User creation failed: email ${email} already exists.`,
        );
        throw this.httpErrorService.throwError(
          ErrorTypes.Conflict,
          ErrorResponseMessages.USER_ALREADY_EXISTS,
        );
      }

      // Hash password securely
      const hashedPassword = await this.hashService.hashValue(password);

      // Generate a base username (e.g. "john.doe") and ensure uniqueness
      let baseUsername = `${firstName.trim()} ${lastName.trim()}`;
      let username = baseUsername;
      let attempt = 0;

      // Generate a token for email verification
      const timestamp = new Date().getTime();
      const tokenSeed = `${timestamp}-${email}`;
      const hashedToken = await this.hashService.hashValue(tokenSeed);
      const expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 ms


      // Create and save new user
      const user = await this.userRepository.create({
        username,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        contact,
        role,
        password: hashedPassword,
        token: hashedToken,
        tokenExpire: new Date().getTime() + expireIn,
      });

      const userDto = new UserResponseDto(user);
      this.loggerService.log(
        `User successfully created with username: ${username} and email: ${email}`,
      );

      // Send verification email
      const verificationUrl = `https://example.com/verify?token=${hashedToken}`; // Replace with actual frontend URL

      const mailSent = await this.mailService.sendMailTemplate({
        templateName: TemplateEnum.VERIFY_EMAIL,
        payload: {
          username: userDto.email,
          url: verificationUrl,
        },
        to: userDto.email,
        subject: 'Welcome to Our Service - Verify Your Email',
        provider: MailProvider.GMAIL,
      });

      if (!mailSent.success) {
        this.loggerService.error(
          `Failed to send verification email to ${userDto.email}`,
        );
        throw this.httpErrorService.throwError(
          ErrorTypes.InternalServerError,
          ErrorResponseMessages.FAILED_TO_SEND_MAIL,
        );
      }

      return {
        status: 'success',
        statusCode: 201,
        message: SuccessResponseMessages.USER_CREATED_SUCCESSFULLY,
        data: userDto,
        error: null,
      };
    } catch (error: any) {
      this.loggerService.error(
        'Error during user creation',
        error.stack || error.message,
      );

      // Rethrow known HTTP exceptions to be handled by NestJS
      if (error instanceof HttpException) {
        throw error;
      }

      // Wrap any unexpected errors as InternalServerError
      throw this.httpErrorService.throwError(
        ErrorTypes.InternalServerError,
        ErrorResponseMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
