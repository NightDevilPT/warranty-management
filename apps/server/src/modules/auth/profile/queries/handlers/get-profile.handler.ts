import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetProfileQuery } from '../impl/get-profile.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { ProfileResponseDto } from '../../dto/profile-response.dto';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetProfileHandler.name);
  }

  async execute(query: GetProfileQuery): Promise<ProfileResponseDto> {
    const { userAccessId, orgId } = query;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
        include: { user: true, organization: true },
      });

      if (!userAccess) {
        throw this.errorService.notFound('Profile not found');
      }

      let permissions: string[] = [];

      if (userAccess.role === 'COMPANY_SUPER_ADMIN') {
        const features = await this.prisma.featureAccess.findMany({
          where: { orgId, isActive: true },
          include: { feature: true },
        });
        permissions = features.map((f) => f.feature.code);
      } else if (userAccess.dealerTypeId) {
        const features = await this.prisma.featureAccess.findMany({
          where: {
            orgId,
            dealerTypeId: userAccess.dealerTypeId,
            isActive: true,
          },
          include: { feature: true },
        });
        permissions = features.map((f) => f.feature.code);
      }

      this.logger.log('Profile retrieved', undefined, { userAccessId, orgId });

      return ProfileResponseDto.fromEntity({
        id: userAccess.id,
        email: userAccess.user.email,
        phoneNumber: userAccess.phoneNumber,
        firstName: userAccess.firstName,
        lastName: userAccess.lastName,
        fullName: userAccess.fullName,
        role: userAccess.role,
        profile: userAccess.profile,
        emailVerified: userAccess.emailVerified,
        phoneVerified: userAccess.phoneVerified,
        currentOrg: {
          orgId: userAccess.organization.id,
          orgName: userAccess.organization.name,
          portalType: userAccess.portalType,
          role: userAccess.role,
          permissions,
        },
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get profile', error.stack);
      throw this.errorService.internalServerError('Failed to get profile');
    }
  }
}
