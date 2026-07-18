import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListCategoriesQuery } from '../impl/list-categories.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { CategoryResponseDto } from '../../dto/category-response.dto';

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler
  implements IQueryHandler<ListCategoriesQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListCategoriesHandler.name);
  }

  async execute(query: ListCategoriesQuery) {
    const { orgId, page, limit, search, status, parentId } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = {};

      // Only filter by orgId if provided (admin can skip this)
      if (orgId) {
        where.orgId = orgId;
      }

      // Status filter
      if (status === 'active') {
        where.isActive = true;
        where.deletedAt = null;
      } else if (status === 'inactive') {
        where.isActive = false;
        where.deletedAt = null;
      } else if (status === 'deleted') {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }

      // Parent filter
      if (parentId !== undefined) {
        where.parentId = parentId || null;
      }

      // Search
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy: { sortOrder: 'asc' },
          include: {
            parent: { select: { id: true, name: true, slug: true } },
          },
        }),
        this.prisma.category.count({ where }),
      ]);

      return {
        items: CategoryResponseDto.fromEntities(items),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to list categories', error.stack);
      throw this.errorService.internalServerError('Failed to list categories');
    }
  }
}
