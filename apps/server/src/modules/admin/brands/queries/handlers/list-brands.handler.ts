import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListBrandsQuery } from '../impl/list-brands.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { BrandResponseDto } from '../../dto/brand-response.dto';

@QueryHandler(ListBrandsQuery)
export class ListBrandsHandler implements IQueryHandler<ListBrandsQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListBrandsHandler.name);
  }

  async execute(query: ListBrandsQuery) {
    const { orgId, page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = { orgId };

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

      // Search
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.brand.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.brand.count({ where }),
      ]);

      return {
        items: BrandResponseDto.fromEntities(items),
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
      this.logger.error('Failed to list brands', error.stack);
      throw this.errorService.internalServerError('Failed to list brands');
    }
  }
}
