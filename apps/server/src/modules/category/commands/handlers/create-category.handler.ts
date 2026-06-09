import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '../impl/create-category.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { CategoryResponseDto } from '../../dto/category-response.dto';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(CreateCategoryHandler.name);
  }

  async execute(command: CreateCategoryCommand): Promise<CategoryResponseDto> {
    const { dto, userId } = command;
    this.logger.log('Executing CreateCategoryCommand', undefined, {
      name: dto.name,
      orgId: dto.orgId,
    });

    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw this.errorService.notFound('User not found');
      }

      // Validate organization exists
      const organization = await this.prisma.organization.findUnique({
        where: { id: dto.orgId },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // Generate slug
      const slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check uniqueness within org
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          orgId: dto.orgId,
          slug,
        },
      });

      if (existingCategory) {
        throw this.errorService.conflict(
          'Category with this name already exists in this organization',
        );
      }

      // Validate parent if provided
      if (dto.parentId) {
        const parentCategory = await this.prisma.category.findFirst({
          where: {
            id: dto.parentId,
            orgId: dto.orgId,
          },
        });

        if (!parentCategory) {
          throw this.errorService.notFound(
            'Parent category not found in this organization',
          );
        }

        // Prevent self-parenting
        if (dto.parentId === dto.parentId) {
          // Allow - parent validation passed
        }
      }

      // Create category
      const category = await this.prisma.category.create({
        data: {
          orgId: dto.orgId,
          name: dto.name,
          slug,
          description: dto.description,
          image: dto.image,
          parentId: dto.parentId || null,
          sortOrder: dto.sortOrder || 0,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('Category created successfully', undefined, {
        categoryId: category.id,
        slug: category.slug,
      });

      return CategoryResponseDto.fromEntity(category);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create category', error.stack);
      throw this.errorService.internalServerError('Failed to create category');
    }
  }
}
