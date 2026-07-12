import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFeatureCommand } from '../impl/update-feature.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureResponseDto } from '../../dto/feature-response.dto';

@CommandHandler(UpdateFeatureCommand)
export class UpdateFeatureHandler
  implements ICommandHandler<UpdateFeatureCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateFeatureHandler.name);
  }

  async execute(command: UpdateFeatureCommand): Promise<FeatureResponseDto> {
    const { featureId, dto, userId } = command;

    try {
      const existing = await this.prisma.feature.findUnique({
        where: { id: featureId },
      });

      if (!existing) {
        throw this.errorService.notFound('Feature not found');
      }

      // ⚠️ CODE IS NEVER UPDATABLE - it's used in decorators and seed data
      // Only allow updating: name, description, icon, parentId, sortOrder

      // If parentId provided, validate
      if (dto.parentId !== undefined) {
        if (dto.parentId === featureId) {
          throw this.errorService.badRequest(
            'Feature cannot be its own parent',
          );
        }

        if (dto.parentId !== null) {
          const parent = await this.prisma.feature.findUnique({
            where: { id: dto.parentId },
          });

          if (!parent) {
            throw this.errorService.notFound('Parent feature not found');
          }
        }
      }

      const updateData: any = { updatedBy: userId };
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.parentId !== undefined) updateData.parentId = dto.parentId;
      if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

      const updated = await this.prisma.feature.update({
        where: { id: featureId },
        data: updateData,
      });

      this.logger.log('Feature updated', undefined, { id: featureId });
      return FeatureResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update feature', error.stack);
      throw this.errorService.internalServerError('Failed to update feature');
    }
  }
}
