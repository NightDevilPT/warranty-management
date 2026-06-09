import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureResponseDto } from '../../dto/feature-response.dto';
import { UpdateFeatureStatusCommand } from '../impl/update-feature-status.command';

@CommandHandler(UpdateFeatureStatusCommand)
export class UpdateFeatureStatusHandler
  implements ICommandHandler<UpdateFeatureStatusCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateFeatureStatusHandler.name);
  }

  async execute(
    command: UpdateFeatureStatusCommand,
  ): Promise<FeatureResponseDto> {
    const { featureId, dto, adminId } = command;
    this.logger.log('Executing UpdateFeatureStatusCommand', undefined, {
      featureId,
      newStatus: dto.status,
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

      // Update feature status
      const updatedFeature = await this.prisma.feature.update({
        where: { id: featureId },
        data: {
          status: dto.status,
          updatedBy: adminId,
        },
      });

      this.logger.log('Feature status updated successfully', undefined, {
        featureId,
        oldStatus: existingFeature.status,
        newStatus: dto.status,
      });

      return FeatureResponseDto.fromEntity(updatedFeature);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update feature status', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update feature status',
      );
    }
  }
}
