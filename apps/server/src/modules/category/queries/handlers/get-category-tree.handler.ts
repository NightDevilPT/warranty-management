import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryTreeQuery } from '../impl/get-category-tree.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { CategoryResponseDto } from '../../dto/category-response.dto';
import { plainToInstance } from 'class-transformer';

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

  async execute(query: GetCategoryTreeQuery) {
    this.logger.log('Executing GetCategoryTreeQuery', undefined, {
      orgId: query.orgId,
    });

    try {
      // Get all categories for the organization
      const allCategories = await this.prisma.category.findMany({
        where: {
          orgId: query.orgId,
          isActive: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });

      // Build tree structure
      const categoryMap = new Map<string, any>();
      const rootCategories: any[] = [];

      // First pass: create map
      allCategories.forEach((category) => {
        categoryMap.set(category.id, {
          ...category,
          children: [],
        });
      });

      // Second pass: build hierarchy
      allCategories.forEach((category) => {
        const categoryWithChildren = categoryMap.get(category.id);

        if (category.parentId && categoryMap.has(category.parentId)) {
          const parent = categoryMap.get(category.parentId);
          parent.children.push(categoryWithChildren);
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });

      // Clean up empty children arrays and convert to DTOs
      const cleanTree = (nodes: any[]) => {
        return nodes.map((node) => {
          const cleanNode = { ...node };
          if (cleanNode.children && cleanNode.children.length > 0) {
            cleanNode.children = cleanTree(cleanNode.children);
          } else {
            delete cleanNode.children;
          }
          return plainToInstance(CategoryResponseDto, cleanNode, {
            excludeExtraneousValues: true,
          });
        });
      };

      const cleanedTree = cleanTree(rootCategories);

      this.logger.log('Category tree retrieved successfully', undefined, {
        orgId: query.orgId,
        totalCategories: allCategories.length,
      });

      return cleanedTree;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get category tree', error.stack);
      throw this.errorService.internalServerError(
        'Failed to get category tree',
      );
    }
  }
}
