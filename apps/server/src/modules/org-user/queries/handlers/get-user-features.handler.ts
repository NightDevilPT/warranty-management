// src/modules/org-user/queries/handlers/get-user-features.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserFeaturesQuery } from '../impl/get-user-features.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@QueryHandler(GetUserFeaturesQuery)
export class GetUserFeaturesHandler
  implements IQueryHandler<GetUserFeaturesQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetUserFeaturesHandler.name);
  }

  async execute(query: GetUserFeaturesQuery) {
    const { orgId, userId } = query;

    this.logger.log('Executing GetUserFeaturesQuery', undefined, {
      orgId,
      userId,
    });

    try {
      // Check if user is in organization
      const userAccess = await this.prisma.userAccess.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId,
          },
        },
      });

      if (!userAccess) {
        throw this.errorService.notFound(
          'User is not a member of this organization',
        );
      }

      // Get features
      const featureAccesses = await this.prisma.featureAccess.findMany({
        where: {
          orgId,
          userId,
        },
        include: {
          feature: {
            select: {
              id: true,
              name: true,
              code: true,
              description: true,
              icon: true,
              status: true,
            },
          },
        },
        orderBy: {
          feature: {
            sortOrder: 'asc',
          },
        },
      });

      const features = featureAccesses.map((fa) => ({
        id: fa.feature.id,
        name: fa.feature.name,
        code: fa.feature.code,
        description: fa.feature.description,
        icon: fa.feature.icon,
        status: fa.feature.status,
        isActive: fa.isActive,
        enabledAt: fa.enabledAt,
        disabledAt: fa.disabledAt,
      }));

      return {
        userId,
        orgId,
        role: userAccess.role,
        features,
        totalFeatures: features.length,
        activeFeatures: features.filter((f) => f.isActive).length,
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get user features', error.stack, undefined, {
        orgId,
        userId,
      });
      throw this.errorService.internalServerError(
        'Failed to get user features',
        {
          cause: error,
        },
      );
    }
  }
}
