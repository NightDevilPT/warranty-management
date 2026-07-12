import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileCommand } from '../impl/update-profile.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { ProfileResponseDto } from '../../dto/profile-response.dto';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateProfileHandler.name);
  }

  async execute(command: UpdateProfileCommand): Promise<ProfileResponseDto> {
    const { dto, userAccessId, orgId } = command;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
        include: { user: true, organization: true },
      });

      if (!userAccess) {
        throw this.errorService.notFound('Profile not found');
      }

      const updateData: any = {};

      if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
      if (dto.lastName !== undefined) updateData.lastName = dto.lastName;

      if (dto.firstName !== undefined || dto.lastName !== undefined) {
        updateData.fullName =
          `${updateData.firstName || userAccess.firstName} ${updateData.lastName || userAccess.lastName}`.trim();
      }

      if (dto.phoneNumber !== undefined) {
        const existingPhone = await this.prisma.userAccess.findFirst({
          where: {
            orgId,
            phoneNumber: dto.phoneNumber,
            deletedAt: null,
            id: { not: userAccessId },
          },
        });

        if (existingPhone) {
          throw this.errorService.conflict('Phone number already in use');
        }

        updateData.phoneNumber = dto.phoneNumber;
        updateData.phoneVerified = false;
      }

      if (dto.profile !== undefined) updateData.profile = dto.profile;

      await this.prisma.userAccess.update({
        where: { id: userAccessId },
        data: updateData,
      });

      const updated = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
        include: { user: true, organization: true },
      });

      let permissions: string[] = [];

      if (updated!.role === 'COMPANY_SUPER_ADMIN') {
        const features = await this.prisma.featureAccess.findMany({
          where: { orgId, isActive: true },
          include: { feature: true },
        });
        permissions = features.map((f) => f.feature.code);
      } else if (updated!.dealerTypeId) {
        const features = await this.prisma.featureAccess.findMany({
          where: { orgId, dealerTypeId: updated!.dealerTypeId, isActive: true },
          include: { feature: true },
        });
        permissions = features.map((f) => f.feature.code);
      }

      this.logger.log('Profile updated', undefined, { userAccessId, orgId });

      return ProfileResponseDto.fromEntity({
        id: updated!.id,
        email: updated!.user.email,
        phoneNumber: updated!.phoneNumber,
        firstName: updated!.firstName,
        lastName: updated!.lastName,
        fullName: updated!.fullName,
        role: updated!.role,
        profile: updated!.profile,
        emailVerified: updated!.emailVerified,
        phoneVerified: updated!.phoneVerified,
        currentOrg: {
          orgId: updated!.organization.id,
          orgName: updated!.organization.name,
          portalType: updated!.portalType,
          role: updated!.role,
          permissions,
        },
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update profile', error.stack, undefined, {
        userAccessId,
      });
      throw this.errorService.internalServerError('Failed to update profile');
    }
  }
}
