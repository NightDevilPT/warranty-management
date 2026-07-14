import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrganizationOptionsQuery } from '../impl/get-organization-options.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@QueryHandler(GetOrganizationOptionsQuery)
export class GetOrganizationOptionsHandler
  implements IQueryHandler<GetOrganizationOptionsQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetOrganizationOptionsHandler.name);
  }

  async execute(query: GetOrganizationOptionsQuery) {
    const { search } = query;

    try {
      const where: any = {
        slug: { not: 'system' },
        deletedAt: null,
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      const organizations = await this.prisma.organization.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { name: 'asc' },
        take: 50,
      });

      return {
        data: organizations.map((org) => ({
          id: org.id,
          label: org.name,
          slug: org.slug,
        })),
        message: 'Organization options retrieved successfully',
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get organization options', error.stack);
      throw this.errorService.internalServerError(
        'Failed to get organization options',
      );
    }
  }
}
