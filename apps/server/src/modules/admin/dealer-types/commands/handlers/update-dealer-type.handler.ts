import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDealerTypeCommand } from '../impl/update-dealer-type.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { DealerTypeResponseDto } from '../../dto/dealer-type-response.dto';

@CommandHandler(UpdateDealerTypeCommand)
export class UpdateDealerTypeHandler
  implements ICommandHandler<UpdateDealerTypeCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateDealerTypeHandler.name);
  }

  async execute(
    command: UpdateDealerTypeCommand,
  ): Promise<DealerTypeResponseDto> {
    const { dealerTypeId, dto, orgId, userId } = command;

    try {
      const existing = await this.prisma.dealerType.findFirst({
        where: { id: dealerTypeId, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Dealer type not found');
      }

      // Check unique name if changing
      if (dto.name && dto.name !== existing.name) {
        const nameExists = await this.prisma.dealerType.findFirst({
          where: {
            orgId,
            name: dto.name,
            deletedAt: null,
            id: { not: dealerTypeId },
          },
        });

        if (nameExists) {
          throw this.errorService.conflict(
            'Dealer type with this name already exists',
          );
        }
      }

      const updateData: any = { updatedBy: userId };
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.partnerType !== undefined)
        updateData.partnerType = dto.partnerType;

      const updated = await this.prisma.dealerType.update({
        where: { id: dealerTypeId },
        data: updateData,
      });

      this.logger.log('Dealer type updated', undefined, {
        id: dealerTypeId,
        orgId,
      });
      return DealerTypeResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update dealer type', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update dealer type',
      );
    }
  }
}
