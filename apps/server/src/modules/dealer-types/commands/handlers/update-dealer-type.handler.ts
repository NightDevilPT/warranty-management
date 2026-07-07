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
    this.logger.log('Executing UpdateDealerTypeCommand', undefined, {
      dealerTypeId,
      updates: Object.keys(dto),
    });

    try {
      // 1. Find the dealer type and verify it belongs to this organization
      const existingDealerType = await this.prisma.dealerType.findFirst({
        where: {
          id: dealerTypeId,
          orgId,
        },
      });

      if (!existingDealerType) {
        throw this.errorService.notFound(
          'Dealer type not found in this organization',
        );
      }

      // 2. If name is being updated, check for uniqueness
      if (dto.name) {
        const nameConflict = await this.prisma.dealerType.findFirst({
          where: {
            orgId,
            name: {
              equals: dto.name,
              mode: 'insensitive',
            },
            id: {
              not: dealerTypeId,
            },
          },
        });

        if (nameConflict) {
          throw this.errorService.conflict(
            `Dealer type with name "${dto.name}" already exists`,
          );
        }
      }

      // 3. Update the dealer type
      const updatedDealerType = await this.prisma.dealerType.update({
        where: { id: dealerTypeId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.partnerType && { partnerType: dto.partnerType }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          updatedBy: userId,
        },
      });

      this.logger.log('DealerType updated successfully', undefined, {
        id: updatedDealerType.id,
      });

      return DealerTypeResponseDto.fromEntity(updatedDealerType);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update dealer type', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update dealer type',
      );
    }
  }
}
