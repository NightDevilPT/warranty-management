import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFeatureTreeQuery } from '../impl/get-feature-tree.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FeatureResponseDto } from '../../dto/feature-response.dto';
import { plainToInstance } from 'class-transformer';

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

  async execute(query: GetFeatureTreeQuery) {
    this.logger.log('Executing GetFeatureTreeQuery');

    try {
      // Get all features
      const allFeatures = await this.prisma.feature.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });

      // Build tree structure
      const featureMap = new Map<string, any>();
      const rootFeatures: any[] = [];

      // First pass: create map of all features with children arrays
      allFeatures.forEach((feature) => {
        featureMap.set(feature.id, {
          ...feature,
          children: [],
        });
      });

      // Second pass: build hierarchy
      allFeatures.forEach((feature) => {
        const featureWithChildren = featureMap.get(feature.id);

        if (feature.parentId && featureMap.has(feature.parentId)) {
          // Add as child to parent
          const parent = featureMap.get(feature.parentId);
          parent.children.push(featureWithChildren);
        } else {
          // Root feature
          rootFeatures.push(featureWithChildren);
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
          // Convert each node to DTO
          return plainToInstance(FeatureResponseDto, cleanNode, {
            excludeExtraneousValues: true,
          });
        });
      };

      const cleanedTree = cleanTree(rootFeatures);

      this.logger.log('Feature tree retrieved successfully', undefined, {
        totalFeatures: allFeatures.length,
        rootFeatures: rootFeatures.length,
      });

      // Return as data property to use Pattern 1 (raw data)
      // The interceptor will wrap it properly
      return cleanedTree;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get feature tree', error.stack);
      throw this.errorService.internalServerError('Failed to get feature tree');
    }
  }
}
