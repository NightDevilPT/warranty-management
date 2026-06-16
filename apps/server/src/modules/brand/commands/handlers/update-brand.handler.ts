// src/modules/brand/commands/handlers/update-brand.handler.ts
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
    const { id, dto, userId } = command;

    this.logger.log('Executing UpdateBrandCommand', undefined, {
      brandId: id,
      updates: Object.keys(dto),
    });

    try {
      // 1. Check if brand exists
      const existingBrand = await this.prisma.brand.findUnique({
        where: { id },
        include: {
          organization: {
            select: { name: true },
          },
        },
      });

      if (!existingBrand) {
        throw this.errorService.notFound('Brand not found');
      }

      // 2. If name is being updated, check slug uniqueness
      let slug = existingBrand.slug;
      if (dto.name) {
        slug = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        const slugConflict = await this.prisma.brand.findUnique({
          where: {
            orgId_slug: {
              orgId: existingBrand.orgId,
              slug: slug,
            },
          },
        });

        if (slugConflict && slugConflict.id !== id) {
          throw this.errorService.conflict(
            `Brand with name "${dto.name}" already exists in this organization`,
          );
        }
      }

      // 3. Prepare update data
      const updateData: any = {
        updatedBy: userId,
      };

      if (dto.name !== undefined) {
        updateData.name = dto.name;
        updateData.slug = slug;
      }
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.website !== undefined) updateData.website = dto.website;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      // 4. Update brand
      const result = await this.prisma.brand.update({
        where: { id },
        data: updateData,
        include: {
          organization: {
            select: { name: true },
          },
        },
      });

      this.logger.log('Brand updated successfully', undefined, {
        id: result.id,
        name: result.name,
      });

      return BrandResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update brand', error.stack, undefined, {
        brandId: id,
      });
      throw this.errorService.internalServerError('Failed to update brand', {
        cause: error,
      });
    }
  }
}
