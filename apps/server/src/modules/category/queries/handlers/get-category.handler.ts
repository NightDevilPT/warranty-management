import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryQuery } from '../impl/get-category.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { CategoryResponseDto } from '../../dto/category-response.dto';

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetCategoryHandler.name);
  }

  async execute(query: GetCategoryQuery): Promise<CategoryResponseDto> {
    this.logger.log('Executing GetCategoryQuery', undefined, {
      categoryId: query.categoryId,
    });

    try {
      const category = await this.prisma.category.findUnique({
        where: { id: query.categoryId },
        include: {
          children: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!category) {
        throw this.errorService.notFound('Category not found');
      }

      return CategoryResponseDto.fromEntity(category);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get category', error.stack);
      throw this.errorService.internalServerError('Failed to get category');
    }
  }
}
