// src/modules/brand/queries/handlers/get-brand.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBrandQuery } from '../impl/get-brand.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { BrandResponseDto } from '../../dto/brand-response.dto';

@QueryHandler(GetBrandQuery)
export class GetBrandHandler implements IQueryHandler<GetBrandQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetBrandHandler.name);
  }

  async execute(query: GetBrandQuery): Promise<BrandResponseDto> {
    this.logger.log('Executing GetBrandQuery', undefined, {
      brandId: query.id,
    });

    try {
      const result = await this.prisma.brand.findUnique({
        where: { id: query.id },
        include: {
          organization: {
            select: { name: true },
          },
          creator: {
            select: { id: true, fullName: true, email: true },
          },
          updater: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      if (!result) {
        throw this.errorService.notFound('Brand not found');
      }

      return BrandResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get brand', error.stack, undefined, {
        brandId: query.id,
      });
      throw this.errorService.internalServerError('Failed to get brand', {
        cause: error,
      });
    }
  }
}
