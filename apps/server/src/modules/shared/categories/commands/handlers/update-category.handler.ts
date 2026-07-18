import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCategoryCommand } from '../impl/update-category.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { CategoryResponseDto } from '../../dto/category-response.dto';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateCategoryHandler.name);
  }

  async execute(command: UpdateCategoryCommand): Promise<CategoryResponseDto> {
    const { categoryId, dto, orgId, userId } = command;

    try {
      const existing = await this.prisma.category.findFirst({
        where: { id: categoryId, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Category not found');
      }

      // If name changed, check slug uniqueness
      if (dto.name && dto.name !== existing.name) {
        const newSlug = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const slugExists = await this.prisma.category.findFirst({
          where: {
            orgId,
            slug: newSlug,
            deletedAt: null,
            id: { not: categoryId },
          },
        });

        if (slugExists) {
          throw this.errorService.conflict(
            'Category with this name already exists',
          );
        }
      }

      // If parentId changed, validate and prevent circular reference
      if (dto.parentId !== undefined) {
        if (dto.parentId === categoryId) {
          throw this.errorService.badRequest(
            'Category cannot be its own parent',
          );
        }

        if (dto.parentId !== null) {
          const parent = await this.prisma.category.findFirst({
            where: { id: dto.parentId, orgId, deletedAt: null },
          });

          if (!parent) {
            throw this.errorService.notFound('Parent category not found');
          }

          // Prevent circular: check if new parent is a descendant
          const isDescendant = await this.isDescendant(
            categoryId,
            dto.parentId,
          );
          if (isDescendant) {
            throw this.errorService.badRequest(
              'Cannot move category under its own child',
            );
          }
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
      if (dto.image !== undefined) updateData.image = dto.image;
      if (dto.parentId !== undefined) updateData.parentId = dto.parentId;
      if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

      const updated = await this.prisma.category.update({
        where: { id: categoryId },
        data: updateData,
      });

      this.logger.log('Category updated', undefined, { id: categoryId, orgId });
      return CategoryResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update category', error.stack);
      throw this.errorService.internalServerError('Failed to update category');
    }
  }

  private async isDescendant(
    categoryId: string,
    targetParentId: string,
  ): Promise<boolean> {
    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === categoryId) return true;
      if (visited.has(currentId)) return false;
      visited.add(currentId);

      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = parent?.parentId || null;
    }

    return false;
  }
}
