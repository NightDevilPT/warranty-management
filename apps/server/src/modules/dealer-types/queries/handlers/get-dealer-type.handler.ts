import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDealerTypeQuery } from '../impl/get-dealer-type.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { DealerTypeResponseDto } from '../../dto/dealer-type-response.dto';

@QueryHandler(GetDealerTypeQuery)
export class GetDealerTypeHandler implements IQueryHandler<GetDealerTypeQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetDealerTypeHandler.name);
  }

  async execute(query: GetDealerTypeQuery): Promise<DealerTypeResponseDto> {
    this.logger.log('Executing GetDealerTypeQuery', undefined, {
      dealerTypeId: query.dealerTypeId,
    });

    try {
      const dealerType = await this.prisma.dealerType.findFirst({
        where: {
          id: query.dealerTypeId,
          orgId: query.orgId,
        },
        include: {
          _count: {
            select: { userAccesses: true },
          },
        },
      });

      if (!dealerType) {
        throw this.errorService.notFound('Dealer type not found');
      }

      const response = DealerTypeResponseDto.fromEntity(dealerType);
      (response as any).userCount = dealerType._count.userAccesses;

      return response;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get dealer type', error.stack);
      throw this.errorService.internalServerError('Failed to get dealer type');
    }
  }
}
