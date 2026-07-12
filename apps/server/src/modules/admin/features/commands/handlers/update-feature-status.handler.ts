import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFeatureStatusCommand } from '../impl/update-feature-status.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureResponseDto } from '../../dto/feature-response.dto';

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
    const { featureId, dto, userId } = command;

    try {
      const existing = await this.prisma.feature.findUnique({
        where: { id: featureId },
      });

      if (!existing) {
        throw this.errorService.notFound('Feature not found');
      }

      const updated = await this.prisma.feature.update({
        where: { id: featureId },
        data: {
          status: dto.status,
          updatedBy: userId,
        },
      });

      this.logger.log(`Feature status updated to ${dto.status}`, undefined, {
        id: featureId,
      });
      return FeatureResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update feature status', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update feature status',
      );
    }
  }
}
