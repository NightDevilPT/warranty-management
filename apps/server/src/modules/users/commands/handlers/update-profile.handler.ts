import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileCommand } from '../impl/update-profile.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserResponseDto } from '../../dto/user-response.dto';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateProfileHandler.name);
  }

  async execute(command: UpdateProfileCommand): Promise<UserResponseDto> {
    const { userId, dto } = command;
    this.logger.log('Executing UpdateProfileCommand', undefined, { userId });

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      if (!existingUser) {
        throw this.errorService.notFound('User not found');
      }

      // Check email uniqueness
      if (dto.email && dto.email !== existingUser.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: dto.email },
        });
        if (emailExists) {
          throw this.errorService.conflict('Email already in use');
        }
      }

      // Check phone uniqueness
      if (dto.phoneNumber && dto.phoneNumber !== existingUser.phoneNumber) {
        const phoneExists = await this.prisma.user.findUnique({
          where: { phoneNumber: dto.phoneNumber },
        });
        if (phoneExists) {
          throw this.errorService.conflict('Phone number already in use');
        }
      }

      // Build update data
      const updateData: any = {};
      if (dto.firstName) updateData.firstName = dto.firstName;
      if (dto.lastName) updateData.lastName = dto.lastName;
      if (dto.firstName || dto.lastName) {
        updateData.fullName =
          `${dto.firstName || existingUser.firstName} ${dto.lastName || existingUser.lastName}`.trim();
      }
      if (dto.email) {
        updateData.email = dto.email;
        updateData.emailVerified = false;
      }
      if (dto.phoneNumber) {
        updateData.phoneNumber = dto.phoneNumber;
        updateData.phoneVerified = false;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
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

      this.logger.log('Profile updated successfully', undefined, { userId });
      return UserResponseDto.fromEntity(updatedUser);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update profile', error.stack);
      throw this.errorService.internalServerError('Failed to update profile');
    }
  }
}
