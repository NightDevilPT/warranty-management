import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListFeaturesQuery } from '../impl/list-features.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureResponseDto } from '../../dto/feature-response.dto';

@QueryHandler(ListFeaturesQuery)
export class ListFeaturesHandler implements IQueryHandler<ListFeaturesQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListFeaturesHandler.name);
  }

  async execute(query: ListFeaturesQuery) {
    const { page, limit, search, status, parentId } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = {};

      if (status) where.status = status;
      if (parentId !== undefined) where.parentId = parentId || null;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.feature.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
          include: {
            parent: { select: { id: true, name: true, code: true } },
          },
        }),
        this.prisma.feature.count({ where }),
      ]);

      return {
        items: FeatureResponseDto.fromEntities(items),
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
      this.logger.error('Failed to list features', error.stack);
      throw this.errorService.internalServerError('Failed to list features');
    }
  }
}
