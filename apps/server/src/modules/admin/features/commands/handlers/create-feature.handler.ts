import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFeatureCommand } from '../impl/create-feature.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureResponseDto } from '../../dto/feature-response.dto';

@CommandHandler(CreateFeatureCommand)
export class CreateFeatureHandler
  implements ICommandHandler<CreateFeatureCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(CreateFeatureHandler.name);
  }

  async execute(command: CreateFeatureCommand): Promise<FeatureResponseDto> {
    const { dto, userId } = command;

    try {
      // Check code uniqueness (Feature.code is @unique globally)
      const existing = await this.prisma.feature.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw this.errorService.conflict(
          'Feature with this code already exists',
        );
      }

      // If parentId provided, verify parent exists
      if (dto.parentId) {
        const parent = await this.prisma.feature.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent) {
          throw this.errorService.notFound('Parent feature not found');
        }
      }

      const feature = await this.prisma.feature.create({
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description,
          icon: dto.icon,
          parentId: dto.parentId || null,
          sortOrder: dto.sortOrder || 0,
          status: 'COMING_SOON',
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('Feature created', undefined, {
        id: feature.id,
        code: dto.code,
      });
      return FeatureResponseDto.fromEntity(feature);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create feature', error.stack);
      throw this.errorService.internalServerError('Failed to create feature');
    }
  }
}
