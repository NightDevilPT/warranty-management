// src/modules/branch/queries/handlers/get-branch.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBranchQuery } from '../impl/get-branch.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@QueryHandler(GetBranchQuery)
export class GetBranchHandler implements IQueryHandler<GetBranchQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetBranchHandler.name);
  }

  async execute(query: GetBranchQuery): Promise<OrganizationResponseDto> {
    this.logger.log('Executing GetBranchQuery', undefined, {
      branchId: query.branchId,
    });

    try {
      const branch = await this.prisma.organization.findUnique({
        where: { id: query.branchId },
        include: {
          parent: {
            select: { id: true, name: true, slug: true },
          },
          root: {
            select: { id: true, name: true, slug: true },
          },
          children: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              isActive: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              children: true,
              userAccesses: true,
            },
          },
        },
      });

      if (!branch) {
        throw this.errorService.notFound('Branch not found');
      }

      return OrganizationResponseDto.fromEntity(branch);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get branch', error.stack, undefined, {
        branchId: query.branchId,
      });
      throw this.errorService.internalServerError('Failed to get branch', {
        cause: error,
      });
    }
  }
}
