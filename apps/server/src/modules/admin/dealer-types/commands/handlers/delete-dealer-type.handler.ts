import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDealerTypeCommand } from '../impl/delete-dealer-type.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@CommandHandler(DeleteDealerTypeCommand)
export class DeleteDealerTypeHandler
  implements ICommandHandler<DeleteDealerTypeCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(DeleteDealerTypeHandler.name);
  }

  async execute(command: DeleteDealerTypeCommand): Promise<void> {
    const { dealerTypeId, orgId, userId } = command;

    try {
      const existing = await this.prisma.dealerType.findFirst({
        where: { id: dealerTypeId, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Dealer type not found');
      }

      // Soft delete - users keep their current permissions
      await this.prisma.dealerType.update({
        where: { id: dealerTypeId },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
          isActive: false,
        },
      });

      this.logger.log('Dealer type soft deleted', undefined, {
        id: dealerTypeId,
        orgId,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete dealer type', error.stack);
      throw this.errorService.internalServerError(
        'Failed to delete dealer type',
      );
    }
  }
}
