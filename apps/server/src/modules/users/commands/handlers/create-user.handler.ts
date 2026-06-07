import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { CreateUserCommand } from '../impl/create-user.command';
import { UserRole } from 'generated/prisma/enums';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserResponseDto } from '../../dto/user-response.dto';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(CreateUserHandler.name);
  }

  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    const { dto } = command;
    this.logger.log('Executing CreateUserCommand', undefined, {
      email: dto.email,
      phone: dto.phoneNumber,
    });

    try {
      // 1. Validate if Email already exists
      if (dto.email) {
        const existingEmail = await this.prisma.user.findUnique({
          where: { email: dto.email },
        });
        if (existingEmail) {
          throw this.errorService.conflict(
            'User with this email already exists',
          );
        }
      }

      // 2. Validate if Phone already exists
      if (dto.phoneNumber) {
        const existingPhone = await this.prisma.user.findUnique({
          where: { phoneNumber: dto.phoneNumber },
        });
        if (existingPhone) {
          throw this.errorService.conflict(
            'User with this phone number already exists',
          );
        }
      }

      // 3. Compute business data
      const fullName = `${dto.firstName} ${dto.lastName}`.trim();

      let passwordHash = null;
      if (dto.password) {
        passwordHash = await bcrypt.hash(dto.password, 10);
      }

      // 4. Perform DB Write
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          fullName: fullName,
          email: dto.email || null,
          phoneNumber: dto.phoneNumber || null,
          passwordHash: passwordHash,
          role: dto.role || UserRole.CONSUMER,
        },
      });

      this.logger.log('User created successfully', undefined, {
        userId: user.id,
        email: user.email,
        phone: user.phoneNumber,
      });

      // Clean and safe transformation
      return UserResponseDto.fromEntity(user);
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('Failed to create user', error.stack);
      throw this.errorService.internalServerError('Failed to create user');
    }
  }
}
