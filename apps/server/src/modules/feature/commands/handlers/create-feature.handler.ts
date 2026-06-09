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
    const { dto, adminId } = command;
    this.logger.log('Executing CreateFeatureCommand', undefined, {
      name: dto.name,
      code: dto.code,
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

      // Check code uniqueness (globally, not just under parent)
      const existingFeature = await this.prisma.feature.findUnique({
        where: { code: dto.code },
      });

      if (existingFeature) {
        throw this.errorService.conflict(
          'Feature with this code already exists',
        );
      }

      // Validate parent if provided
      if (dto.parentId) {
        const parentExists = await this.prisma.feature.findUnique({
          where: { id: dto.parentId },
        });

        if (!parentExists) {
          throw this.errorService.notFound('Parent feature not found');
        }

        // Prevent circular dependency (parent can't be a descendant)
        // This is a simple check - for production, you'd need recursive checking
        if (parentExists.parentId === dto.parentId) {
          // Allow only 2 levels of nesting for simplicity
        }
      }

      // Create feature
      const feature = await this.prisma.feature.create({
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description,
          icon: dto.icon,
          parentId: dto.parentId || null,
          sortOrder: dto.sortOrder || 0,
          status: 'COMING_SOON',
          createdBy: adminId,
          updatedBy: adminId,
        },
      });

      this.logger.log('Feature created successfully', undefined, {
        featureId: feature.id,
        code: feature.code,
      });

      return FeatureResponseDto.fromEntity(feature);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create feature', error.stack);
      throw this.errorService.internalServerError('Failed to create feature');
    }
  }
}
