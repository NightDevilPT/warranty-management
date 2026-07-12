import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadOrganizationLogoCommand } from '../impl/upload-organization-logo.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { FileService } from 'services/files/file.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(UploadOrganizationLogoCommand)
export class UploadOrganizationLogoHandler
  implements ICommandHandler<UploadOrganizationLogoCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UploadOrganizationLogoHandler.name);
  }

  async execute(
    command: UploadOrganizationLogoCommand,
  ): Promise<OrganizationResponseDto> {
    const { orgId, file, userId } = command;

    try {
      const existing = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Organization not found');
      }

      // Delete old logo if exists
      if (existing.logo) {
        const oldKey = existing.logo.split('/').pop();
        if (oldKey) {
          await this.fileService.deleteFile(`organizations/${oldKey}`);
        }
      }

      // Upload new logo
      const uploaded = await this.fileService.uploadFile(file, 'organizations');

      // Update organization
      const updated = await this.prisma.organization.update({
        where: { id: orgId },
        data: {
          logo: uploaded.url,
          updatedBy: userId,
        },
      });

      this.logger.log('Organization logo uploaded', undefined, { orgId });
      return OrganizationResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to upload organization logo', error.stack);
      throw this.errorService.internalServerError(
        'Failed to upload organization logo',
      );
    }
  }
}
