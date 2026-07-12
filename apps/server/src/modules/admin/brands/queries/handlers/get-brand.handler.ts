import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBrandQuery } from '../impl/get-brand.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { BrandDetailDto } from '../../dto/brand-response.dto';

@QueryHandler(GetBrandQuery)
export class GetBrandHandler implements IQueryHandler<GetBrandQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetBrandHandler.name);
  }

  async execute(query: GetBrandQuery): Promise<BrandDetailDto> {
    const { brandId, orgId } = query;

    try {
      const brand = await this.prisma.brand.findFirst({
        where: { id: brandId, orgId, deletedAt: null },
      });

      if (!brand) {
        throw this.errorService.notFound('Brand not found');
      }

      // Count products using this brand (via FormData.brandFormDataId)
      const productCount = await this.prisma.formData.count({
        where: { brandFormDataId: brandId, deletedAt: null },
      });

      return { ...brand, productCount } as BrandDetailDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get brand', error.stack);
      throw this.errorService.internalServerError('Failed to get brand');
    }
  }
}
