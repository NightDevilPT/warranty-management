import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDashboardQuery } from '../impl/get-dashboard.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { DashboardResponseDto } from '../../dto/dashboard-response.dto';

@QueryHandler(GetDashboardQuery)
export class GetDashboardHandler implements IQueryHandler<GetDashboardQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetDashboardHandler.name);
  }

  async execute(): Promise<DashboardResponseDto> {
    try {
      const [
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        totalBrands,
        totalCategories,
        totalDealerTypes,
        orgsByType,
        orgsByStatus,
        recentOrgs,
      ] = await Promise.all([
        // Total orgs (exclude system org)
        this.prisma.organization.count({
          where: { slug: { not: 'system' }, deletedAt: null },
        }),

        // Active orgs
        this.prisma.organization.count({
          where: { slug: { not: 'system' }, isActive: true, deletedAt: null },
        }),

        // Total users
        this.prisma.userAccess.count({ where: { deletedAt: null } }),

        // Total brands
        this.prisma.brand.count({ where: { deletedAt: null } }),

        // Total categories
        this.prisma.category.count({ where: { deletedAt: null } }),

        // Total dealer types
        this.prisma.dealerType.count({ where: { deletedAt: null } }),

        // Orgs by type (grouped)
        this.prisma.organization.groupBy({
          by: ['type'],
          where: { slug: { not: 'system' }, deletedAt: null },
          _count: true,
        }),

        // Orgs by status
        this.prisma.organization.findMany({
          where: { slug: { not: 'system' } },
          select: { isActive: true, deletedAt: true },
        }),

        // Recent organizations (last 5)
        this.prisma.organization.findMany({
          where: { slug: { not: 'system' }, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            isActive: true,
            createdAt: true,
          },
        }),
      ]);

      // Calculate orgs by status
      const activeCount = orgsByStatus.filter(
        (o) => o.isActive && !o.deletedAt,
      ).length;
      const inactiveCount = orgsByStatus.filter(
        (o) => !o.isActive && !o.deletedAt,
      ).length;
      const deletedCount = orgsByStatus.filter((o) => o.deletedAt).length;

      return DashboardResponseDto.from({
        stats: {
          totalOrganizations,
          activeOrganizations,
          totalUsers,
          totalBrands,
          totalCategories,
          totalDealerTypes,
        },
        organizationsByType: orgsByType.map((item) => ({
          label: item.type,
          count: item._count,
        })),
        organizationsByStatus: [
          { label: 'Active', count: activeCount },
          { label: 'Inactive', count: inactiveCount },
          { label: 'Deleted', count: deletedCount },
        ],
        recentOrganizations: recentOrgs,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get dashboard data', error.stack);
      throw this.errorService.internalServerError(
        'Failed to get dashboard data',
      );
    }
  }
}
