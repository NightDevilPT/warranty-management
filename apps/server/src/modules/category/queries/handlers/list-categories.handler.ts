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
    const { page, limit, orgId, search, parentId, isActive } = query;
    const skip = (page - 1) * limit;

    this.logger.log('Executing ListCategoriesQuery', undefined, {
      page,
      limit,
      orgId,
      search,
    });

    try {
      const where: any = {};

      // Filter by organization
      if (orgId) {
        where.orgId = orgId;
      }

      // Search by name or description
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Filter by parent
      if (parentId !== undefined) {
        where.parentId = parentId === 'null' ? null : parentId;
      }

      // Filter by active status
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [items, total] = await Promise.all([
        this.prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            _count: {
              select: { children: true },
            },
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
