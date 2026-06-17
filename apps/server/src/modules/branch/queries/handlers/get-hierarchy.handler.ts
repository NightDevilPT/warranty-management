// src/modules/branch/queries/handlers/get-hierarchy.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetHierarchyQuery } from '../impl/get-hierarchy.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@QueryHandler(GetHierarchyQuery)
export class GetHierarchyHandler implements IQueryHandler<GetHierarchyQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetHierarchyHandler.name);
  }

  async execute(query: GetHierarchyQuery) {
    const { orgId, depth = 3 } = query;

    this.logger.log('Executing GetHierarchyQuery', undefined, {
      orgId,
      depth,
    });

    try {
      // 1. Find the organization by ID (more efficient)
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, type: true, rootId: true },
      });

      if (!organization) {
        throw this.errorService.notFound(
          `Organization with ID "${orgId}" not found`,
        );
      }

      // 2. Determine the root organization
      const rootId =
        organization.type === 'ROOT' ? organization.id : organization.rootId;

      if (!rootId) {
        throw this.errorService.notFound('Root organization not found');
      }

      // 3. Get root organization with all details
      const rootOrg = await this.prisma.organization.findUnique({
        where: { id: rootId },
      });

      if (!rootOrg) {
        throw this.errorService.notFound('Root organization not found');
      }

      // 4. Build the full hierarchy tree
      const hierarchy = await this.buildHierarchyTree(rootOrg.id, 0, depth);

      // 5. Get statistics efficiently
      const [totalBranches, orgIds] = await Promise.all([
        this.prisma.organization.count({
          where: {
            rootId: rootOrg.id,
            type: 'BRANCH',
          },
        }),
        this.getAllOrgIdsInHierarchy(rootOrg.id),
      ]);

      const totalUsers = await this.prisma.userAccess.count({
        where: {
          orgId: { in: orgIds },
        },
      });

      return {
        organization: OrganizationResponseDto.fromEntity({
          ...rootOrg,
          children: hierarchy,
        }),
        stats: {
          totalBranches,
          totalUsers,
          maxDepth: depth,
        },
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get hierarchy', error.stack, undefined, {
        orgId,
      });
      throw this.errorService.internalServerError(
        'Failed to get organization hierarchy',
        { cause: error },
      );
    }
  }

  private async buildHierarchyTree(
    orgId: string,
    currentDepth: number,
    maxDepth: number,
  ): Promise<any[]> {
    if (currentDepth >= maxDepth) return [];

    const children = await this.prisma.organization.findMany({
      where: {
        parentId: orgId,
        type: 'BRANCH',
        isActive: true,
      },
      include: {
        _count: {
          select: {
            children: true,
            userAccesses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const childrenWithNested = await Promise.all(
      children.map(async (child) => {
        const nestedChildren = await this.buildHierarchyTree(
          child.id,
          currentDepth + 1,
          maxDepth,
        );

        return {
          ...child,
          children: nestedChildren,
        };
      }),
    );

    return childrenWithNested;
  }

  private async getAllOrgIdsInHierarchy(rootId: string): Promise<string[]> {
    const orgs = await this.prisma.organization.findMany({
      where: {
        OR: [{ id: rootId }, { rootId: rootId }],
      },
      select: { id: true },
    });

    return orgs.map((org) => org.id);
  }
}
