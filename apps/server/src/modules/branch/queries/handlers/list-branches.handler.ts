// src/modules/branch/queries/handlers/list-branches.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListBranchesQuery } from '../impl/list-branches.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@QueryHandler(ListBranchesQuery)
export class ListBranchesHandler implements IQueryHandler<ListBranchesQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListBranchesHandler.name);
  }

  async execute(query: ListBranchesQuery) {
    const { parentOrgId, page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    this.logger.log('Executing ListBranchesQuery', undefined, {
      parentOrgId,
      page,
      limit,
      search,
    });

    try {
      // 1. Verify parent organization exists (more efficient with ID)
      const parentOrg = await this.prisma.organization.findUnique({
        where: { id: parentOrgId },
        select: { id: true, name: true, slug: true, type: true },
      });

      if (!parentOrg) {
        throw this.errorService.notFound(
          `Organization with ID "${parentOrgId}" not found`,
        );
      }

      // 2. Build where clause for branches
      const where: any = {
        parentId: parentOrgId,
        type: 'BRANCH',
      };

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      // 3. Get branches with counts
      const [items, total] = await Promise.all([
        this.prisma.organization.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                children: true,
                userAccesses: true,
              },
            },
          },
        }),
        this.prisma.organization.count({ where }),
      ]);

      return {
        items: OrganizationResponseDto.fromEntities(items),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
          parentOrg: {
            id: parentOrg.id,
            name: parentOrg.name,
            slug: parentOrg.slug,
            type: parentOrg.type,
          },
        },
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to list branches', error.stack, undefined, {
        parentOrgId,
        page,
        limit,
      });
      throw this.errorService.internalServerError('Failed to list branches', {
        cause: error,
      });
    }
  }
}
