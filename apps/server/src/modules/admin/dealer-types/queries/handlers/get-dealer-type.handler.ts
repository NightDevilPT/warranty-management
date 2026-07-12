import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDealerTypeQuery } from '../impl/get-dealer-type.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { DealerTypeDetailDto } from '../../dto/dealer-type-response.dto';

@QueryHandler(GetDealerTypeQuery)
export class GetDealerTypeHandler implements IQueryHandler<GetDealerTypeQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetDealerTypeHandler.name);
  }

  async execute(query: GetDealerTypeQuery): Promise<DealerTypeDetailDto> {
    const { dealerTypeId, orgId } = query;

    try {
      const dealerType = await this.prisma.dealerType.findFirst({
        where: { id: dealerTypeId, orgId, deletedAt: null },
      });

      if (!dealerType) {
        throw this.errorService.notFound('Dealer type not found');
      }

      // Get features grouped by module
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

      // Group by parent module
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

        moduleMap.get(moduleId).features.push({
          id: fa.feature.id,
          name: fa.feature.name,
          code: fa.feature.code,
          isActive: fa.isActive,
        });
      }

      const features = Array.from(moduleMap.values());

      // Get users assigned to this dealer type
      const users = await this.prisma.userAccess.findMany({
        where: { dealerTypeId, orgId, deletedAt: null },
        include: { user: { select: { email: true } } },
      });

      const assignedUsers = users.map((ua) => ({
        id: ua.id,
        fullName: ua.fullName,
        email: ua.user.email,
        role: ua.role || '',
        isActive: ua.isActive,
      }));

      return {
        ...dealerType,
        features,
        users: assignedUsers,
        featuresCount: featureAccess.length,
        usersCount: users.length,
      } as DealerTypeDetailDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get dealer type', error.stack);
      throw this.errorService.internalServerError('Failed to get dealer type');
    }
  }
}
