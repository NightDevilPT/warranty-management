import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from '../impl/list-users.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserResponseDto } from '../../dto/user-response.dto';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ListUsersHandler.name);
  }

  async execute(query: ListUsersQuery) {
    const {
      orgId,
      page,
      limit,
      search,
      role,
      dealerTypeId,
      partnerType,
      status,
    } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = { orgId, portalType: 'company' };

      if (status === 'active') {
        where.isActive = true;
        where.deletedAt = null;
      } else if (status === 'inactive') {
        where.isActive = false;
        where.deletedAt = null;
      } else if (status === 'deleted') {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }

      if (role) where.role = role;
      if (dealerTypeId) where.dealerTypeId = dealerTypeId;
      if (partnerType) where.partnerType = partnerType;

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.userAccess.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true } },
            dealerType: { select: { id: true, name: true, partnerType: true } },
          },
        }),
        this.prisma.userAccess.count({ where }),
      ]);

      const mappedItems = items.map((item) => ({
        ...item,
        email: item.user.email,
        userId: item.user.id,
        dealerType: item.dealerType
          ? {
              id: item.dealerType.id,
              name: item.dealerType.name,
              partnerType: item.dealerType.partnerType,
            }
          : null,
      }));

      return {
        items: UserResponseDto.fromEntities(mappedItems),
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
      this.logger.error('Failed to list users', error.stack);
      throw this.errorService.internalServerError('Failed to list users');
    }
  }
}
