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
    const { dto, orgId, userId } = command;

    try {
      // Verify organization exists
      const organization = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // If parentId provided, verify parent exists in same org
      if (dto.parentId) {
        const parent = await this.prisma.category.findFirst({
          where: { id: dto.parentId, orgId, deletedAt: null },
        });

        if (!parent) {
          throw this.errorService.notFound('Parent category not found');
        }
      }

      // Generate slug
      const slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check uniqueness among active records in this org
      const existing = await this.prisma.category.findFirst({
        where: { orgId, slug, deletedAt: null },
      });

      if (existing) {
        throw this.errorService.conflict(
          'Category with this name already exists',
        );
      }

      const category = await this.prisma.category.create({
        data: {
          orgId,
          name: dto.name,
          slug,
          description: dto.description,
          image: dto.image,
          parentId: dto.parentId || null,
          sortOrder: dto.sortOrder || 0,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('Category created', undefined, {
        id: category.id,
        orgId,
        name: dto.name,
      });
      return CategoryResponseDto.fromEntity(category);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create category', error.stack);
      throw this.errorService.internalServerError('Failed to create category');
    }
  }
}
