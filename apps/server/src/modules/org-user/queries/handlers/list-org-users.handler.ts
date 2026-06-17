// src/modules/org-user/queries/handlers/list-org-users.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListOrgUsersQuery } from '../impl/list-org-users.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrgUserResponseDto } from '../../dto/org-user-response.dto';

@QueryHandler(ListOrgUsersQuery)
export class ListOrgUsersHandler implements IQueryHandler<ListOrgUsersQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListOrgUsersHandler.name);
  }

  async execute(query: ListOrgUsersQuery) {
    const { orgId, page, limit, search, role, portalType } = query;
    const skip = (page - 1) * limit;

    this.logger.log('Executing ListOrgUsersQuery', undefined, {
      orgId,
      page,
      limit,
      search,
      role,
      portalType,
    });

    try {
      // Verify organization exists
      const org = await this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, name: true, slug: true },
      });

      if (!org) {
        throw this.errorService.notFound('Organization not found');
      }

      // Build where clause
      const where: any = { orgId };

      if (role) {
        where.role = role;
      }

      if (portalType) {
        where.portalType = portalType;
      }

      if (search) {
        where.user = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const [items, total] = await Promise.all([
        this.prisma.userAccess.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
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
            dealerType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.userAccess.count({ where }),
      ]);

      return {
        items: OrgUserResponseDto.fromEntities(items),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
          organization: org,
        },
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error(
        'Failed to list users in organization',
        error.stack,
        undefined,
        {
          orgId,
          page,
          limit,
        },
      );
      throw this.errorService.internalServerError(
        'Failed to list users in organization',
        {
          cause: error,
        },
      );
    }
  }
}
