import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListDealerTypesQuery } from '../impl/list-dealer-types.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { DealerTypeResponseDto } from '../../dto/dealer-type-response.dto';

@QueryHandler(ListDealerTypesQuery)
export class ListDealerTypesHandler
  implements IQueryHandler<ListDealerTypesQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListDealerTypesHandler.name);
  }

  async execute(query: ListDealerTypesQuery) {
    const { orgId, page, limit, search, partnerType } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = { orgId, deletedAt: null };

      if (partnerType) where.partnerType = partnerType;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.dealerType.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                featureAccess: { where: { isActive: true } },
                userAccesses: { where: { deletedAt: null } },
              },
            },
          },
        }),
        this.prisma.dealerType.count({ where }),
      ]);

      const itemsWithCounts = items.map((item) => ({
        ...item,
        featuresCount: item._count.featureAccess,
        usersCount: item._count.userAccesses,
      }));

      return {
        items: DealerTypeResponseDto.fromEntities(itemsWithCounts),
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
      this.logger.error('Failed to list dealer types', error.stack);
      throw this.errorService.internalServerError(
        'Failed to list dealer types',
      );
    }
  }
}
