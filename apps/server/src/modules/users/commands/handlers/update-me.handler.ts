// src/modules/users/commands/handlers/update-me.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserResponseDto } from '../../dto/user-response.dto';
import { UpdateMeCommand } from '../impl/update-me.command';

@CommandHandler(UpdateMeCommand)
export class UpdateMeHandler implements ICommandHandler<UpdateMeCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateMeHandler.name);
  }

  async execute(command: UpdateMeCommand): Promise<UserResponseDto> {
    const { userId, dto } = command;
    this.logger.log('Executing UpdateMeCommand', undefined, {
      userId,
      fields: Object.keys(dto).filter((key) => dto[key] !== undefined),
    });

    try {
      // Check user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw this.errorService.notFound('User not found');
      }

      if (!existingUser.isActive || existingUser.deletedAt) {
        throw this.errorService.forbidden('Account is not active');
      }

      // Check email uniqueness if email is being updated
      if (dto.email && dto.email !== existingUser.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: dto.email.toLowerCase().trim() },
        });

        if (emailExists) {
          throw this.errorService.conflict('Email already in use');
        }
      }

      // Check phone uniqueness if phone is being updated
      if (dto.phoneNumber && dto.phoneNumber !== existingUser.phoneNumber) {
        const phoneExists = await this.prisma.user.findUnique({
          where: { phoneNumber: dto.phoneNumber.trim() },
        });

        if (phoneExists) {
          throw this.errorService.conflict('Phone number already in use');
        }
      }

      // Build update data
      const updateData: any = {};

      if (dto.firstName !== undefined) {
        updateData.firstName = dto.firstName;
      }

      if (dto.lastName !== undefined) {
        updateData.lastName = dto.lastName;
      }

      // Update fullName if first or last name changed
      if (dto.firstName !== undefined || dto.lastName !== undefined) {
        const firstName = dto.firstName ?? existingUser.firstName;
        const lastName = dto.lastName ?? existingUser.lastName;
        updateData.fullName = `${firstName} ${lastName}`.trim();
      }

      if (dto.email !== undefined) {
        updateData.email = dto.email.toLowerCase().trim();
        updateData.emailVerified = false;
      }

      if (dto.phoneNumber !== undefined) {
        updateData.phoneNumber = dto.phoneNumber.trim();
        updateData.phoneVerified = false;
      }

      // Update user
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      this.logger.log('Profile updated successfully', undefined, {
        userId: user.id,
      });

      return UserResponseDto.fromEntity(user);
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('Failed to update profile', error.stack);
      throw this.errorService.internalServerError('Failed to update profile');
    }
  }
}
