// src/modules/organization/queries/handlers/list-organizations.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListOrganizationsQuery } from '../impl/list-organizations.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';
import { Prisma } from 'generated/prisma/client';

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
    this.logger.log('Executing ListOrganizationsQuery', undefined, {
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      const search = query.search?.trim();

      // Build where clause
      const where: Prisma.OrganizationWhereInput = {
        isActive: true,
      };

      // Add search filter if search term provided
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [organizations, total] = await Promise.all([
        this.prisma.organization.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.organization.count({ where }),
      ]);

      this.logger.log('Organizations listed successfully', undefined, {
        total,
        page,
        limit,
        search,
      });

      return {
        items: OrganizationResponseDto.fromEntities(organizations),
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
