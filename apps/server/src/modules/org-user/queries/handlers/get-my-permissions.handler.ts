// src/modules/org-user/queries/handlers/get-my-permissions.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMyPermissionsQuery } from '../impl/get-my-permissions.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@QueryHandler(GetMyPermissionsQuery)
export class GetMyPermissionsHandler
  implements IQueryHandler<GetMyPermissionsQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetMyPermissionsHandler.name);
  }

  async execute(query: GetMyPermissionsQuery) {
    const { orgId, userId } = query;

    this.logger.log('Executing GetMyPermissionsQuery', undefined, {
      orgId,
      userId,
    });

    try {
      // 1. Get user access in this organization
      const userAccess = await this.prisma.userAccess.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              fullName: true,
              profile: true,
              isActive: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              isActive: true,
            },
          },
          dealerType: {
            select: {
              id: true,
              name: true,
              partnerType: true,
            },
          },
        },
      });

      if (!userAccess) {
        throw this.errorService.notFound(
          'You are not a member of this organization',
        );
      }

      if (!userAccess.organization.isActive) {
        throw this.errorService.forbidden(
          'This organization is currently inactive',
        );
      }

      if (!userAccess.user.isActive) {
        throw this.errorService.forbidden('Your account is currently inactive');
      }

      // 2. Get all features assigned to user in this organization
      const featureAccesses = await this.prisma.featureAccess.findMany({
        where: {
          orgId,
          userId,
          isActive: true,
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
              parentId: true,
              sortOrder: true,
            },
          },
        },
        orderBy: {
          feature: {
            sortOrder: 'asc',
          },
        },
      });

      // 3. Build permission data
      const permissions = featureAccesses.map((fa) => ({
        id: fa.feature.id,
        name: fa.feature.name,
        code: fa.feature.code,
        description: fa.feature.description,
        icon: fa.feature.icon,
        status: fa.feature.status,
        parentId: fa.feature.parentId,
        sortOrder: fa.feature.sortOrder,
        enabledAt: fa.enabledAt,
      }));

      // 4. Build feature tree structure
      const featureTree = buildFeatureTree(permissions);

      // 5. Get flat feature codes for quick permission checks
      const featureCodes = permissions.map((f) => f.code);

      return {
        user: {
          id: userAccess.user.id,
          email: userAccess.user.email,
          phoneNumber: userAccess.user.phoneNumber,
          firstName: userAccess.user.firstName,
          lastName: userAccess.user.lastName,
          fullName: userAccess.user.fullName,
          profile: userAccess.user.profile,
        },
        organization: {
          id: userAccess.organization.id,
          name: userAccess.organization.name,
          slug: userAccess.organization.slug,
          type: userAccess.organization.type,
        },
        role: userAccess.role,
        portalType: userAccess.portalType,
        partnerType: userAccess.partnerType,
        dealerType: userAccess.dealerType,
        permissions: {
          featureCodes,
          features: featureTree,
          totalFeatures: permissions.length,
        },
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get permissions', error.stack, undefined, {
        orgId,
        userId,
      });
      throw this.errorService.internalServerError('Failed to get permissions', {
        cause: error,
      });
    }
  }
}

/**
 * Build feature tree from flat feature list
 */
function buildFeatureTree(features: any[]): any[] {
  const map = new Map<string, any>();
  const roots: any[] = [];

  // Create map of all features
  features.forEach((feature) => {
    map.set(feature.id, { ...feature, children: [] });
  });

  // Build tree structure
  features.forEach((feature) => {
    const node = map.get(feature.id);
    if (feature.parentId && map.has(feature.parentId)) {
      map.get(feature.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
