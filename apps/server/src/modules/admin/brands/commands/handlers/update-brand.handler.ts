import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBrandCommand } from '../impl/update-brand.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { BrandResponseDto } from '../../dto/brand-response.dto';

@CommandHandler(UpdateBrandCommand)
export class UpdateBrandHandler implements ICommandHandler<UpdateBrandCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateBrandHandler.name);
  }

  async execute(command: UpdateBrandCommand): Promise<BrandResponseDto> {
    const { brandId, dto, orgId, userId } = command;

    try {
      const existing = await this.prisma.brand.findFirst({
        where: { id: brandId, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Brand not found');
      }

      // If name changed, check slug uniqueness
      if (dto.name && dto.name !== existing.name) {
        const newSlug = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const slugExists = await this.prisma.brand.findFirst({
          where: {
            orgId,
            slug: newSlug,
            deletedAt: null,
            id: { not: brandId },
          },
        });

        if (slugExists) {
          throw this.errorService.conflict(
            'Brand with this name already exists',
          );
        }
      }

      const updateData: any = { updatedBy: userId };
      if (dto.name !== undefined) {
        updateData.name = dto.name;
        updateData.slug = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.logo !== undefined) updateData.logo = dto.logo;
      if (dto.website !== undefined) updateData.website = dto.website;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      const updated = await this.prisma.brand.update({
        where: { id: brandId },
        data: updateData,
      });

      this.logger.log('Brand updated', undefined, { id: brandId, orgId });
      return BrandResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update brand', error.stack);
      throw this.errorService.internalServerError('Failed to update brand');
    }
  }
}
