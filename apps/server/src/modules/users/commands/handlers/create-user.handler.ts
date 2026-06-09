import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserResponseDto } from '../../dto/user-response.dto';
import * as bcrypt from 'bcrypt';

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
    const { dto, adminId } = command;
    this.logger.log('Executing CreateUserCommand', undefined, {
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    try {
      // Validate at least one contact method
      if (!dto.email && !dto.phoneNumber) {
        throw this.errorService.badRequest('Email or phone number is required');
      }

      // Check email uniqueness
      if (dto.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: dto.email },
        });
        if (emailExists) {
          throw this.errorService.conflict('Email already in use');
        }
      }

      // Check phone uniqueness
      if (dto.phoneNumber) {
        const phoneExists = await this.prisma.user.findUnique({
          where: { phoneNumber: dto.phoneNumber },
        });
        if (phoneExists) {
          throw this.errorService.conflict('Phone number already in use');
        }
      }

      // Hash password if provided
      let passwordHash: string | undefined;
      if (dto.password) {
        passwordHash = await bcrypt.hash(dto.password, 10);
      }

      // Create user
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          fullName: `${dto.firstName} ${dto.lastName}`.trim(),
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          passwordHash,
          role: dto.role || 'CONSUMER',
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          fullName: true,
          role: true,
          emailVerified: true,
          phoneVerified: true,
          isActive: true,
          profile: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log('User created successfully', undefined, {
        userId: user.id,
        createdBy: adminId,
      });

      return UserResponseDto.fromEntity(user);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create user', error.stack);
      throw this.errorService.internalServerError('Failed to create user');
    }
  }
}
