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
    this.logger.log('Executing CreateDealerTypeCommand', undefined, {
      name: dto.name,
      orgId,
      userId,
    });

    try {
      // 1. Check if dealer type name already exists in this organization
      const existing = await this.prisma.dealerType.findFirst({
        where: {
          orgId,
          name: {
            equals: dto.name,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw this.errorService.conflict(
          `Dealer type with name "${dto.name}" already exists in this organization`,
        );
      }

      // 2. Verify organization exists
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // 3. Verify user has access to this organization
      // ADMIN users have global access - skip UserAccess check
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });

      if (!user) {
        throw this.errorService.unauthorized('User not found');
      }

      // Only check UserAccess for non-ADMIN users
      if (user.role !== 'ADMIN') {
        const userAccess = await this.prisma.userAccess.findUnique({
          where: {
            userId_orgId: {
              userId,
              orgId,
            },
          },
        });

        if (!userAccess) {
          throw this.errorService.forbidden(
            'You do not have access to this organization',
          );
        }
      }

      // 4. Create the dealer type
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

      this.logger.log('DealerType created successfully', undefined, {
        id: dealerType.id,
        name: dealerType.name,
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
