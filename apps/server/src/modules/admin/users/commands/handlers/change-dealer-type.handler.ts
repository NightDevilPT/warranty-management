import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeDealerTypeCommand } from '../impl/change-dealer-type.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { ChangeDealerTypeResponseDto } from '../../dto/user-response.dto';

@CommandHandler(ChangeDealerTypeCommand)
export class ChangeDealerTypeHandler
  implements ICommandHandler<ChangeDealerTypeCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ChangeDealerTypeHandler.name);
  }

  async execute(
    command: ChangeDealerTypeCommand,
  ): Promise<ChangeDealerTypeResponseDto> {
    const { userAccessId, dto, orgId, userId } = command;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
        include: { dealerType: true },
      });

      if (!userAccess) {
        throw this.errorService.notFound('User not found');
      }

      const newDealerType = await this.prisma.dealerType.findFirst({
        where: { id: dto.dealerTypeId, orgId, deletedAt: null },
      });

      if (!newDealerType) {
        throw this.errorService.notFound('Dealer type not found');
      }

      const previousDealerTypeName = userAccess.dealerType?.name || null;

      await this.prisma.userAccess.update({
        where: { id: userAccessId },
        data: { dealerTypeId: dto.dealerTypeId },
      });

      this.logger.log('User dealer type changed', undefined, {
        userAccessId,
        orgId,
        previous: previousDealerTypeName,
        new: newDealerType.name,
      });

      return {
        message: 'Dealer type changed successfully',
        previousDealerType: previousDealerTypeName,
        newDealerType: newDealerType.name,
      } as ChangeDealerTypeResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to change dealer type', error.stack);
      throw this.errorService.internalServerError(
        'Failed to change dealer type',
      );
    }
  }
}
