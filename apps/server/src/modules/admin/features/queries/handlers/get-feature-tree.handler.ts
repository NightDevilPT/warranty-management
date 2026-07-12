import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFeatureTreeQuery } from '../impl/get-feature-tree.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureTreeResponseDto } from '../../dto/feature-response.dto';

@QueryHandler(GetFeatureTreeQuery)
export class GetFeatureTreeHandler
  implements IQueryHandler<GetFeatureTreeQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetFeatureTreeHandler.name);
  }

  async execute(): Promise<FeatureTreeResponseDto> {
    try {
      // Get all root features (modules) with their children
      const items = await this.prisma.feature.findMany({
        where: { parentId: null },
        include: {
          children: {
            select: {
              id: true,
              name: true,
              code: true,
              description: true,
              icon: true,
              sortOrder: true,
              status: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      return { items } as FeatureTreeResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get feature tree', error.stack);
      throw this.errorService.internalServerError('Failed to get feature tree');
    }
  }
}
