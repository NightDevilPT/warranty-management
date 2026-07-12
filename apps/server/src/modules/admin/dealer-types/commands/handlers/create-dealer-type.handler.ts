import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDealerTypeCommand } from '../impl/create-dealer-type.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { DealerTypeResponseDto } from '../../dto/dealer-type-response.dto';

@CommandHandler(CreateDealerTypeCommand)
export class CreateDealerTypeHandler
  implements ICommandHandler<CreateDealerTypeCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(CreateDealerTypeHandler.name);
  }

  async execute(
    command: CreateDealerTypeCommand,
  ): Promise<DealerTypeResponseDto> {
    const { dto, orgId, userId } = command;

    try {
      const organization = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // Check unique name within org among active records
      const existing = await this.prisma.dealerType.findFirst({
        where: { orgId, name: dto.name, deletedAt: null },
      });

      if (existing) {
        throw this.errorService.conflict(
          'Dealer type with this name already exists',
        );
      }

      const dealerType = await this.prisma.dealerType.create({
        data: {
          orgId,
          name: dto.name,
          partnerType: dto.partnerType,
          description: dto.description,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('Dealer type created', undefined, {
        id: dealerType.id,
        orgId,
        name: dto.name,
      });
      return DealerTypeResponseDto.fromEntity(dealerType);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create dealer type', error.stack);
      throw this.errorService.internalServerError(
        'Failed to create dealer type',
      );
    }
  }
}
