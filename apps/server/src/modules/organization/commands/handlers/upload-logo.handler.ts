import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadLogoCommand } from '../impl/upload-logo.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FileService } from 'services/files/file.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(UploadLogoCommand)
export class UploadLogoHandler implements ICommandHandler<UploadLogoCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly fileService: FileService,
  ) {
    this.logger.setContext(UploadLogoHandler.name);
  }

  async execute(command: UploadLogoCommand): Promise<OrganizationResponseDto> {
    const { orgId, file } = command;
    this.logger.log('Executing UploadLogoCommand', undefined, {
      orgId,
      fileName: file.originalname,
    });

    try {
      // Check if organization exists
      const existingOrg = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!existingOrg) {
        throw this.errorService.notFound('Organization not found');
      }

      // Delete old logo if exists
      if (existingOrg.logo) {
        try {
          await this.fileService.deleteFile(existingOrg.logo);
          this.logger.log('Old logo deleted', undefined, { orgId });
        } catch (deleteError) {
          this.logger.warn('Failed to delete old logo', undefined, {
            error: deleteError.message,
          });
        }
      }

      // Upload new logo
      const uploadedFile = await this.fileService.uploadFile(
        file,
        'organizations',
      );

      // Update organization
      const updatedOrg = await this.prisma.organization.update({
        where: { id: orgId },
        data: { logo: uploadedFile.url },
      });

      this.logger.log('Logo uploaded successfully', undefined, {
        orgId,
        logoUrl: uploadedFile.url,
      });

      return OrganizationResponseDto.fromEntity(updatedOrg);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to upload logo', error.stack);
      throw this.errorService.internalServerError('Failed to upload logo');
    }
  }
}
