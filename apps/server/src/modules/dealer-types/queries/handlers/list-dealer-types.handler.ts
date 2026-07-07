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
    const { orgId, page, limit, search, partnerType, isActive } = query;
    const skip = (page - 1) * limit;

    this.logger.log('Executing ListDealerTypesQuery', undefined, {
      orgId,
      page,
      limit,
      search,
      partnerType,
      isActive,
    });

    try {
      const where: any = { orgId };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (partnerType) {
        where.partnerType = partnerType;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [dealerTypes, total] = await Promise.all([
        this.prisma.dealerType.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { userAccesses: true },
            },
          },
        }),
        this.prisma.dealerType.count({ where }),
      ]);

      const items = dealerTypes.map((dt) => {
        const dto = DealerTypeResponseDto.fromEntity(dt);
        (dto as any).userCount = dt._count.userAccesses;
        return dto;
      });

      return {
        items,
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
