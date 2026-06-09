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
    const { featureId, dto, adminId } = command;
    this.logger.log('Executing UpdateFeatureCommand', undefined, {
      featureId,
      adminId,
    });

    try {
      // Validate adminId
      if (!adminId) {
        throw this.errorService.badRequest('Admin user ID is required');
      }

      // Check if admin user exists
      const adminExists = await this.prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!adminExists) {
        throw this.errorService.notFound('Admin user not found');
      }

      // Check if feature exists
      const existingFeature = await this.prisma.feature.findUnique({
        where: { id: featureId },
      });

      if (!existingFeature) {
        throw this.errorService.notFound('Feature not found');
      }

      // Validate parent if provided
      if (dto.parentId) {
        if (dto.parentId === featureId) {
          throw this.errorService.badRequest(
            'Feature cannot be its own parent',
          );
        }

        const parentExists = await this.prisma.feature.findUnique({
          where: { id: dto.parentId },
        });

        if (!parentExists) {
          throw this.errorService.notFound('Parent feature not found');
        }
      }

      // Build update data
      const updateData: any = {
        updatedBy: adminId,
      };

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.parentId !== undefined) updateData.parentId = dto.parentId;
      if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

      // Update feature
      const updatedFeature = await this.prisma.feature.update({
        where: { id: featureId },
        data: updateData,
      });

      this.logger.log('Feature updated successfully', undefined, { featureId });

      return FeatureResponseDto.fromEntity(updatedFeature);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update feature', error.stack);
      throw this.errorService.internalServerError('Failed to update feature');
    }
  }
}
