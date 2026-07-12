import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryTreeQuery } from '../impl/get-category-tree.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { CategoryTreeResponseDto } from '../../dto/category-response.dto';

@QueryHandler(GetCategoryTreeQuery)
export class GetCategoryTreeHandler
  implements IQueryHandler<GetCategoryTreeQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetCategoryTreeHandler.name);
  }

  async execute(query: GetCategoryTreeQuery): Promise<CategoryTreeResponseDto> {
    const { orgId } = query;

    try {
      const items = await this.prisma.category.findMany({
        where: { orgId, parentId: null, deletedAt: null },
        include: {
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
        orderBy: { sortOrder: 'asc' },
      });

      return { items } as CategoryTreeResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get category tree', error.stack);
      throw this.errorService.internalServerError(
        'Failed to get category tree',
      );
    }
  }
}
