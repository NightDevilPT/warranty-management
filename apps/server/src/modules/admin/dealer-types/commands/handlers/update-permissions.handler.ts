import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePermissionsCommand } from '../impl/update-permissions.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UpdatePermissionsResponseDto } from '../../dto/dealer-type-response.dto';
import { FeatureStatus } from 'generated/prisma/enums';

@CommandHandler(UpdatePermissionsCommand)
export class UpdatePermissionsHandler
  implements ICommandHandler<UpdatePermissionsCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdatePermissionsHandler.name);
  }

  async execute(
    command: UpdatePermissionsCommand,
  ): Promise<UpdatePermissionsResponseDto> {
    const { dealerTypeId, dto, orgId, userId } = command;

    try {
      const dealerType = await this.prisma.dealerType.findFirst({
        where: { id: dealerTypeId, orgId, deletedAt: null },
      });

      if (!dealerType) {
        throw this.errorService.notFound('Dealer type not found');
      }

      // Validate all features exist and are ENABLED
      const features = await this.prisma.feature.findMany({
        where: {
          id: { in: dto.featureIds },
          status: FeatureStatus.ENABLED,
        },
      });

      if (features.length !== dto.featureIds.length) {
        throw this.errorService.badRequest(
          'Some features are invalid or not enabled. Only ENABLED features can be assigned.',
        );
      }

      // Get existing feature access records for this dealer type
      const existingAccess = await this.prisma.featureAccess.findMany({
        where: { dealerTypeId, orgId },
      });

      const existingFeatureIds = existingAccess.map((fa) => fa.featureId);

      // Features to enable (exist but disabled) or create (don't exist)
      const featuresToEnable = dto.featureIds.filter((id) =>
        existingFeatureIds.includes(id),
      );
      const featuresToCreate = dto.featureIds.filter(
        (id) => !existingFeatureIds.includes(id),
      );

      // Features to disable (exist and active but not in new list)
      const featuresToDisable = existingAccess
        .filter((fa) => fa.isActive && !dto.featureIds.includes(fa.featureId))
        .map((fa) => fa.featureId);

      await this.prisma.$transaction(async (tx) => {
        // 1. Enable existing but disabled features
        if (featuresToEnable.length > 0) {
          await tx.featureAccess.updateMany({
            where: {
              dealerTypeId,
              orgId,
              featureId: { in: featuresToEnable },
              isActive: false,
            },
            data: {
              isActive: true,
              enabledAt: new Date(),
              disabledAt: null,
              updatedBy: userId,
            },
          });
        }

        // 2. Create new feature access records
        for (const featureId of featuresToCreate) {
          await tx.featureAccess.create({
            data: {
              orgId,
              dealerTypeId,
              featureId,
              isActive: true,
              enabledAt: new Date(),
              updatedBy: userId,
            },
          });
        }

        // 3. Disable features not in the new list
        if (featuresToDisable.length > 0) {
          await tx.featureAccess.updateMany({
            where: {
              dealerTypeId,
              orgId,
              featureId: { in: featuresToDisable },
              isActive: true,
            },
            data: {
              isActive: false,
              disabledAt: new Date(),
              updatedBy: userId,
            },
          });
        }
      });

      const enabledCount = featuresToEnable.length;
      const createdCount = featuresToCreate.length;
      const disabledCount = featuresToDisable.length;

      this.logger.log('Permissions updated', undefined, {
        dealerTypeId,
        orgId,
        enabled: enabledCount,
        created: createdCount,
        disabled: disabledCount,
        total: dto.featureIds.length,
      });

      return {
        message: 'Permissions updated successfully',
        assignedCount: dto.featureIds.length,
      } as UpdatePermissionsResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update permissions', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update permissions',
      );
    }
  }
}
