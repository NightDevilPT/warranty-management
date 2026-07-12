import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationStatusCommand } from '../impl/update-organization-status.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { StatusResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(UpdateOrganizationStatusCommand)
export class UpdateOrganizationStatusHandler
  implements ICommandHandler<UpdateOrganizationStatusCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateOrganizationStatusHandler.name);
  }

  async execute(
    command: UpdateOrganizationStatusCommand,
  ): Promise<StatusResponseDto> {
    const { orgId, dto, userId } = command;

    try {
      const existing = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Organization not found');
      }

      let status: string;
      let isActive: boolean;
      const updateData: any = { updatedBy: userId };

      switch (dto.action) {
        case 'activate':
          status = 'activated';
          isActive = true;
          break;
        case 'deactivate':
          status = 'deactivated';
          isActive = false;
          updateData.isActive = false;
          break;
        case 'soft-delete':
          status = 'soft-deleted';
          isActive = false;
          updateData.isActive = false;
          updateData.deletedAt = new Date();
          updateData.deletedBy = userId;
          break;
        default:
          throw this.errorService.badRequest('Invalid action');
      }

      await this.prisma.organization.update({
        where: { id: orgId },
        data: updateData,
      });

      this.logger.log(`Organization ${status}`, undefined, {
        id: orgId,
        action: dto.action,
      });

      return {
        id: orgId,
        status,
        isActive,
        message: `Organization ${status} successfully`,
      } as StatusResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update organization status', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update organization status',
      );
    }
  }
}
