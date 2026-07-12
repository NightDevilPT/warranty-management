import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFeatureQuery } from '../impl/get-feature.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureDetailDto } from '../../dto/feature-response.dto';

@QueryHandler(GetFeatureQuery)
export class GetFeatureHandler implements IQueryHandler<GetFeatureQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetFeatureHandler.name);
  }

  async execute(query: GetFeatureQuery): Promise<FeatureDetailDto> {
    const { featureId } = query;

    try {
      const feature = await this.prisma.feature.findUnique({
        where: { id: featureId },
        include: {
          parent: { select: { id: true, name: true, code: true } },
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
      });

      if (!feature) {
        throw this.errorService.notFound('Feature not found');
      }

      const assignedDealerTypesCount = await this.prisma.featureAccess.count({
        where: { featureId, isActive: true },
      });

      return {
        ...feature,
        assignedDealerTypesCount,
      } as FeatureDetailDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get feature', error.stack);
      throw this.errorService.internalServerError('Failed to get feature');
    }
  }
}
