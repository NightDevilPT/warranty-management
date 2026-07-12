import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../impl/update-user.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserResponseDto } from '../../dto/user-response.dto';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateUserHandler.name);
  }

  async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
    const { userAccessId, dto, orgId, userId } = command;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
        include: { user: true, dealerType: true },
      });

      if (!userAccess) {
        throw this.errorService.notFound('User not found');
      }

      // Validate dealer type if changing
      if (dto.dealerTypeId) {
        const dealerType = await this.prisma.dealerType.findFirst({
          where: { id: dto.dealerTypeId, orgId, deletedAt: null },
        });

        if (!dealerType) {
          throw this.errorService.notFound('Dealer type not found');
        }
      }

      const updateData: any = {};
      if (dto.role !== undefined) updateData.role = dto.role;
      if (dto.partnerType !== undefined)
        updateData.partnerType = dto.partnerType;
      if (dto.dealerTypeId !== undefined)
        updateData.dealerTypeId = dto.dealerTypeId;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      const updated = await this.prisma.userAccess.update({
        where: { id: userAccessId },
        data: updateData,
        include: { user: true, dealerType: true },
      });

      this.logger.log('User updated', undefined, { userAccessId, orgId });

      return UserResponseDto.fromEntity({
        ...updated,
        email: updated.user.email,
        userId: updated.user.id,
        dealerType: updated.dealerType
          ? {
              id: updated.dealerType.id,
              name: updated.dealerType.name,
              partnerType: updated.dealerType.partnerType,
            }
          : null,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update user', error.stack);
      throw this.errorService.internalServerError('Failed to update user');
    }
  }
}
