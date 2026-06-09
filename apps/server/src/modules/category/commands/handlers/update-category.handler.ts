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
    const { categoryId, dto, userId } = command;
    this.logger.log('Executing UpdateCategoryCommand', undefined, {
      categoryId,
    });

    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw this.errorService.notFound('User not found');
      }

      // Check if category exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!existingCategory) {
        throw this.errorService.notFound('Category not found');
      }

      // Check slug uniqueness if name is being updated
      if (dto.name) {
        const slug = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const duplicate = await this.prisma.category.findFirst({
          where: {
            orgId: existingCategory.orgId,
            slug,
            id: { not: categoryId },
          },
        });

        if (duplicate) {
          throw this.errorService.conflict(
            'Category with this name already exists in this organization',
          );
        }
      }

      // Validate parent if provided
      if (dto.parentId) {
        if (dto.parentId === categoryId) {
          throw this.errorService.badRequest(
            'Category cannot be its own parent',
          );
        }

        const parentCategory = await this.prisma.category.findFirst({
          where: {
            id: dto.parentId,
            orgId: existingCategory.orgId,
          },
        });

        if (!parentCategory) {
          throw this.errorService.notFound(
            'Parent category not found in this organization',
          );
        }
      }

      // Build update data
      const updateData: any = {
        updatedBy: userId,
      };

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
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      // Update category
      const updatedCategory = await this.prisma.category.update({
        where: { id: categoryId },
        data: updateData,
      });

      this.logger.log('Category updated successfully', undefined, {
        categoryId,
      });

      return CategoryResponseDto.fromEntity(updatedCategory);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update category', error.stack);
      throw this.errorService.internalServerError('Failed to update category');
    }
  }
}
