import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrganizationQuery } from '../impl/get-organization.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationDetailDto } from '../../dto/organization-response.dto';

@QueryHandler(GetOrganizationQuery)
export class GetOrganizationHandler
  implements IQueryHandler<GetOrganizationQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetOrganizationHandler.name);
  }

  async execute(query: GetOrganizationQuery): Promise<OrganizationDetailDto> {
    const { orgId } = query;

    try {
      const organization = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
        include: {
          root: true,
          parent: true,
          children: {
            where: { deletedAt: null },
            select: { id: true, name: true, type: true },
          },
        },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // Get stats
      const [totalUsers, totalBrands, totalCategories, totalDealerTypes] =
        await Promise.all([
          this.prisma.userAccess.count({ where: { orgId, deletedAt: null } }),
          this.prisma.brand.count({ where: { orgId, deletedAt: null } }),
          this.prisma.category.count({ where: { orgId, deletedAt: null } }),
          this.prisma.dealerType.count({ where: { orgId, deletedAt: null } }),
        ]);

      return {
        ...organization,
        hierarchy: {
          root: organization.root
            ? { id: organization.root.id, name: organization.root.name }
            : null,
          parent: organization.parent
            ? { id: organization.parent.id, name: organization.parent.name }
            : null,
          children: organization.children,
        },
        stats: { totalUsers, totalBrands, totalCategories, totalDealerTypes },
      } as OrganizationDetailDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get organization', error.stack);
      throw this.errorService.internalServerError('Failed to get organization');
    }
  }
}
