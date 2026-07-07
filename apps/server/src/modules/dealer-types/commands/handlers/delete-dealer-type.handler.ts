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

  async execute(
    command: DeleteDealerTypeCommand,
  ): Promise<{ message: string }> {
    const { dealerTypeId, orgId, userId } = command;
    this.logger.log('Executing DeleteDealerTypeCommand', undefined, {
      dealerTypeId,
    });

    try {
      // 1. Find the dealer type and verify it belongs to this organization
      const dealerType = await this.prisma.dealerType.findFirst({
        where: {
          id: dealerTypeId,
          orgId,
        },
        include: {
          userAccesses: {
            select: { id: true },
          },
        },
      });

      if (!dealerType) {
        throw this.errorService.notFound(
          'Dealer type not found in this organization',
        );
      }

      // 2. Check if any users are currently assigned to this dealer type
      if (dealerType.userAccesses.length > 0) {
        throw this.errorService.conflict(
          `Cannot delete dealer type. ${dealerType.userAccesses.length} user(s) are currently assigned to this role. Reassign them first.`,
        );
      }

      // 3. Delete the dealer type
      await this.prisma.dealerType.delete({
        where: { id: dealerTypeId },
      });

      this.logger.log('DealerType deleted successfully', undefined, {
        id: dealerTypeId,
        name: dealerType.name,
      });

      return {
        message: `Dealer type "${dealerType.name}" deleted successfully`,
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete dealer type', error.stack);
      throw this.errorService.internalServerError(
        'Failed to delete dealer type',
      );
    }
  }
}
