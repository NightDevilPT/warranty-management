import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryQuery } from '../impl/get-category.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { CategoryDetailDto } from '../../dto/category-response.dto';

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetCategoryHandler.name);
  }

  async execute(query: GetCategoryQuery): Promise<CategoryDetailDto> {
    const { categoryId, orgId } = query;

    try {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, orgId, deletedAt: null },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              sortOrder: true,
              isActive: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!category) {
        throw this.errorService.notFound('Category not found');
      }

      // Build breadcrumb path
      const breadcrumb: { id: string; name: string; slug: string }[] = [];
      let currentParentId = category.parentId;

      while (currentParentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: currentParentId },
          select: { id: true, name: true, slug: true, parentId: true },
        });

        if (!parent) break;
        breadcrumb.unshift({
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
        });
        currentParentId = parent.parentId;
      }

      const productCount = 0; // Placeholder

      return {
        ...category,
        breadcrumb,
        productCount,
      } as CategoryDetailDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get category', error.stack);
      throw this.errorService.internalServerError('Failed to get category');
    }
  }
}
