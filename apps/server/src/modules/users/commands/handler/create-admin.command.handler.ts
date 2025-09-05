// handlers/create-user.handler.ts
import {
  ColorEnum,
  LanguageEnum,
  ThemeEnum,
  ViewEnum,
} from 'interfaces/setting.interface';
import {
  IApiResponse,
  ErrorResponseMessages,
  ErrorTypes,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { UserRoles } from '../../entities/user.entity';
import { ROLES } from '../../interface/user.interface';
import { UserResponseDto } from '../../dto/response-user.dto';
import { CONFIG_ENUM } from 'config/mongoose.configuration';
import { UserRepository } from '../../repository/user.repository';
import { HashService } from 'services/hash-service/index.service';
import { CreateUserCommand } from '../impl/create-user.command';
import { LoggerService } from 'services/logger-service/index.service';
import { CreateAdminCommand } from '../impl/create-admin.command';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSettingsCommand } from 'src/modules/settings/commands/impl/create-settings.command';

@CommandHandler(CreateAdminCommand)
export class CreateAdminUserHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly httpErrorService: HttpErrorService,
    private readonly hashService: HashService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    this.loggerService.setContext('CreateUserHandler');
  }

  async execute(
    command: CreateUserCommand,
  ): Promise<IApiResponse<UserResponseDto>> {
    try {
      this.loggerService.log(`Start creating admin user`);
      const adminEmail = this.configService.get<string>(
        CONFIG_ENUM.ADMIN_EMAIL,
      ) as string;
      const password = this.configService.get<string>(
        CONFIG_ENUM.ADMIN_PASSWORD,
      ) as string;
      const username = 'PawanKumar';

      // Check for existing user with the same email
      const existingUser = await this.userRepository.findOne({
        email: adminEmail,
      });
      if (existingUser) {
        this.loggerService.warn(`Admin user already exist : ${adminEmail}`);
        throw this.httpErrorService.throwError(
          ErrorTypes.Conflict,
          ErrorResponseMessages.USER_ALREADY_EXISTS,
        );
      }

      // Hash password securely
      const hashedPassword = await this.hashService.hashValue(password);

      let userRoles: UserRoles[] = [
        {
          organizationId: 'global',
          rootOrganizationId: 'global',
          role: ROLES.ADMIN,
        },
      ];

      // Create and save new user
      const user = await this.userRepository.create({
        username,
        firstName: 'Pawan',
        lastName: 'Kumar',
        email: adminEmail.toLowerCase(),
        contact: '9540079162',
        roles: userRoles,
        password: hashedPassword,
        token: null,
        tokenExpire: null,
        verified: true,
      });

      const userDto = new UserResponseDto(user);
      this.loggerService.log(
        `Admin user successfully created with username: ${username} and email: ${adminEmail}`,
      );

      // Creating default settings for the user
      const defaultSettings = await this.commandBus.execute(
        new CreateSettingsCommand(user.id, {
          language: LanguageEnum.EN,
          theme: ThemeEnum.LIGHT,
          color: ColorEnum.BLUE,
          view: ViewEnum.GRID,
        }),
      );

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
        error.message || ErrorResponseMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
