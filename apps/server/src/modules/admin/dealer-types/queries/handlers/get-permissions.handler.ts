import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPermissionsQuery } from '../impl/get-permissions.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { PermissionsResponseDto } from '../../dto/dealer-type-response.dto';

@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler
  implements IQueryHandler<GetPermissionsQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetPermissionsHandler.name);
  }

  async execute(query: GetPermissionsQuery): Promise<PermissionsResponseDto> {
    const { dealerTypeId, orgId } = query;

    try {
      const dealerType = await this.prisma.dealerType.findFirst({
        where: { id: dealerTypeId, orgId, deletedAt: null },
      });

      if (!dealerType) {
        throw this.errorService.notFound('Dealer type not found');
      }

      // Get all active feature assignments grouped by module
      const featureAccess = await this.prisma.featureAccess.findMany({
        where: { dealerTypeId, orgId, isActive: true },
        include: {
          feature: {
            include: {
              parent: {
                select: { id: true, name: true, code: true, icon: true },
              },
            },
          },
        },
      });

      const moduleMap = new Map<string, any>();
      for (const fa of featureAccess) {
        const parent = fa.feature.parent;
        const moduleId = parent?.id || 'root';
        const moduleName = parent?.name || 'Root';
        const moduleCode = parent?.code || 'ROOT';
        const moduleIcon = parent?.icon || 'Box';

        if (!moduleMap.has(moduleId)) {
          moduleMap.set(moduleId, {
            moduleId,
            moduleName,
            moduleCode,
            moduleIcon,
            features: [],
          });
        }

        moduleMap.get(moduleId)!.features.push({
          id: fa.feature.id,
          name: fa.feature.name,
          code: fa.feature.code,
          isActive: fa.isActive,
        });
      }

      return {
        features: Array.from(moduleMap.values()),
      } as PermissionsResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get permissions', error.stack);
      throw this.errorService.internalServerError('Failed to get permissions');
    }
  }
}
