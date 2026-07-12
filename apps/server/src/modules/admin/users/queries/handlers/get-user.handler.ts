import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../impl/get-user.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserDetailDto } from '../../dto/user-response.dto';
import { UserRole } from 'generated/prisma/enums';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetUserHandler.name);
  }

  async execute(query: GetUserQuery): Promise<UserDetailDto> {
    const { userAccessId, orgId } = query;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
        include: {
          user: true,
          dealerType: {
            include: {
              featureAccess: {
                where: { isActive: true },
                include: {
                  feature: {
                    include: {
                      parent: { select: { id: true, name: true, icon: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!userAccess) {
        throw this.errorService.notFound('User not found');
      }

      // Resolve permissions
      let permissions: any[] | string;
      if (userAccess.role === UserRole.COMPANY_SUPER_ADMIN) {
        permissions = 'FULL_ACCESS';
      } else if (userAccess.dealerType) {
        const moduleMap = new Map<string, any>();
        for (const fa of userAccess.dealerType.featureAccess) {
          const parent = fa.feature.parent;
          const moduleId = parent?.id || 'root';
          if (!moduleMap.has(moduleId)) {
            moduleMap.set(moduleId, {
              moduleId,
              moduleName: parent?.name || 'Root',
              moduleIcon: parent?.icon || 'Box',
              permissions: [],
            });
          }
          moduleMap.get(moduleId).permissions.push({
            id: fa.feature.id,
            name: fa.feature.name,
            code: fa.feature.code,
            isActive: fa.isActive,
          });
        }
        permissions = Array.from(moduleMap.values());
      } else {
        permissions = [];
      }

      return {
        ...userAccess,
        email: userAccess.user.email,
        userId: userAccess.user.id,
        dealerType: userAccess.dealerType
          ? {
              id: userAccess.dealerType.id,
              name: userAccess.dealerType.name,
              partnerType: userAccess.dealerType.partnerType,
            }
          : null,
        permissions,
      } as UserDetailDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get user', error.stack);
      throw this.errorService.internalServerError('Failed to get user');
    }
  }
}
