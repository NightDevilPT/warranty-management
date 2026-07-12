import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadProfilePictureCommand } from '../impl/upload-profile-picture.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { FileService } from 'services/files/file.service';
import { ErrorService } from 'services/errors/error.service';
import { ProfileResponseDto } from '../../dto/profile-response.dto';

@CommandHandler(UploadProfilePictureCommand)
export class UploadProfilePictureHandler
  implements ICommandHandler<UploadProfilePictureCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UploadProfilePictureHandler.name);
  }

  async execute(
    command: UploadProfilePictureCommand,
  ): Promise<ProfileResponseDto> {
    const { file, userAccessId, orgId } = command;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
        include: { user: true, organization: true },
      });

      if (!userAccess) {
        throw this.errorService.notFound('Profile not found');
      }

      // Delete old profile picture if exists
      if (userAccess.profile) {
        const oldKey = userAccess.profile.split('/').pop();
        if (oldKey) {
          await this.fileService.deleteFile(`profiles/${oldKey}`);
        }
      }

      // Upload new profile picture
      const uploadedFile = await this.fileService.uploadFile(file, 'profiles');

      // Update UserAccess with new profile URL
      await this.prisma.userAccess.update({
        where: { id: userAccessId },
        data: { profile: uploadedFile.url },
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

      this.logger.log('Profile picture uploaded', undefined, {
        userAccessId,
        orgId,
      });

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
      this.logger.error(
        'Failed to upload profile picture',
        error.stack,
        undefined,
        { userAccessId },
      );
      throw this.errorService.internalServerError(
        'Failed to upload profile picture',
      );
    }
  }
}
