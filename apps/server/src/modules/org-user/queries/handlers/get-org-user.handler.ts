// src/modules/org-user/queries/handlers/get-org-user.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrgUserQuery } from '../impl/get-org-user.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrgUserResponseDto } from '../../dto/org-user-response.dto';

@QueryHandler(GetOrgUserQuery)
export class GetOrgUserHandler implements IQueryHandler<GetOrgUserQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetOrgUserHandler.name);
  }

  async execute(query: GetOrgUserQuery): Promise<OrgUserResponseDto> {
    const { orgId, userId } = query;

    this.logger.log('Executing GetOrgUserQuery', undefined, { orgId, userId });

    try {
      const userAccess = await this.prisma.userAccess.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId,
          },
        },
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
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          dealerType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!userAccess) {
        throw this.errorService.notFound(
          'User is not a member of this organization',
        );
      }

      // Get user features
      const featureAccesses = await this.prisma.featureAccess.findMany({
        where: {
          orgId,
          userId,
        },
        include: {
          feature: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const features = featureAccesses.map((fa) => ({
        id: fa.feature.id,
        name: fa.feature.name,
        code: fa.feature.code,
        isActive: fa.isActive,
      }));

      return OrgUserResponseDto.fromEntity({
        ...userAccess,
        features,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error(
        'Failed to get user in organization',
        error.stack,
        undefined,
        {
          orgId,
          userId,
        },
      );
      throw this.errorService.internalServerError(
        'Failed to get user in organization',
        {
          cause: error,
        },
      );
    }
  }
}
