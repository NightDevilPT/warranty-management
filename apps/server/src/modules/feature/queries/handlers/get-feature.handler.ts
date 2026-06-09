import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFeatureQuery } from '../impl/get-feature.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureResponseDto } from '../../dto/feature-response.dto';

@QueryHandler(GetFeatureQuery)
export class GetFeatureHandler implements IQueryHandler<GetFeatureQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetFeatureHandler.name);
  }

  async execute(query: GetFeatureQuery): Promise<FeatureResponseDto> {
    this.logger.log('Executing GetFeatureQuery', undefined, {
      featureId: query.featureId,
    });

    try {
      const feature = await this.prisma.feature.findUnique({
        where: { id: query.featureId },
        include: {
          children: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!feature) {
        throw this.errorService.notFound('Feature not found');
      }

      return FeatureResponseDto.fromEntity(feature);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get feature', error.stack);
      throw this.errorService.internalServerError('Failed to get feature');
    }
  }
}
