import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { ErrorService } from 'services/errors/error.service';
import { LoggerService } from 'services/logger/logger.service';
import { MailService } from 'services/mail/mail.service';
import { EmailTemplatesEnum } from 'interface/email.interface';
import * as bcrypt from 'bcrypt';
import { CreateUserCommand } from '../impl/create-user.command';
import { UserRepository } from '../../repositories/user.repository';
import { UserResponseDto } from '../../dto/user-response.dto';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly errorService: ErrorService,
    private readonly loggerService: LoggerService,
    private readonly mailService: MailService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserResponseDto | null> {
    const { createUserDto } = command;
    const { email, username, password, firstname, lastname } = createUserDto;

    // Set logger context
    this.loggerService.setContext('CreateUserCommandHandler');

    try {
      // Check if email or username already exists
      const existingEmail = await this.userRepository.checkEmailExists(email);
      if (existingEmail) {
        this.loggerService.warn(`Email already exists: ${email}`);
        throw this.errorService.conflict('Email already exists');
      }

      const existingUsername =
        await this.userRepository.checkUsernameExists(username);
      if (existingUsername) {
        this.loggerService.warn(`Username already exists: ${username}`);
        throw this.errorService.conflict('Username already exists');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in the database
      const user = await this.userRepository.create({
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
      });

      // Log successful user creation
      this.loggerService.info(`User created successfully: ${user.id}`);

      // Send Mail Logic here

      // Prepare response DTO
      const response: UserResponseDto = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return response;
    } catch (error) {
      // Log error details
      this.loggerService.error(`Failed to create user: ${error.message}`);

      // Rethrow known exceptions or wrap unknown errors
      if (error instanceof ConflictException) {
        throw error;
      }
      throw this.errorService.internalServerError('Failed to create user', {
        cause: error,
      });
    }
  }
}
