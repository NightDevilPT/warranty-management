// src/modules/brand/queries/handlers/list-brands.handler.ts
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
    const { page, limit, search, orgId, isActive } = query;
    const skip = (page - 1) * limit;

    this.logger.log('Executing ListBrandsQuery', undefined, {
      page,
      limit,
      search,
      orgId,
      isActive,
    });

    try {
      const where: any = {};

      // Filter by organization
      if (orgId) {
        where.orgId = orgId;
      }

      // Filter by active status
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Search across multiple fields
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.brand.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            organization: {
              select: { name: true },
            },
          },
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
      this.logger.error('Failed to list brands', error.stack, undefined, {
        page,
        limit,
        search,
      });
      throw this.errorService.internalServerError('Failed to list brands', {
        cause: error,
      });
    }
  }
}
