import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListOrganizationsQuery } from '../impl/list-organizations.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@QueryHandler(ListOrganizationsQuery)
export class ListOrganizationsHandler
  implements IQueryHandler<ListOrganizationsQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListOrganizationsHandler.name);
  }

  async execute(query: ListOrganizationsQuery) {
    const { page, limit, search, type, status } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = {};

      // Exclude system organization
      where.slug = { not: 'system' };

      // Status filter
      if (status === 'active') {
        where.isActive = true;
        where.deletedAt = null;
      } else if (status === 'disabled') {
        where.isActive = false;
        where.deletedAt = null;
      } else if (status === 'deleted') {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }

      // Type filter
      if (type) {
        where.type = type;
      }

      // Search
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.organization.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
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
        },
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to list organizations', error.stack);
      throw this.errorService.internalServerError(
        'Failed to list organizations',
      );
    }
  }
}
