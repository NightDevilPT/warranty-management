// src/modules/branch/commands/handlers/upload-branch-logo.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadBranchLogoCommand } from '../impl/upload-branch-logo.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FileService } from 'services/files/file.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(UploadBranchLogoCommand)
export class UploadBranchLogoHandler
  implements ICommandHandler<UploadBranchLogoCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly fileService: FileService,
  ) {
    this.logger.setContext(UploadBranchLogoHandler.name);
  }

  async execute(
    command: UploadBranchLogoCommand,
  ): Promise<OrganizationResponseDto> {
    const { branchId, file, userId } = command;

    this.logger.log('Executing UploadBranchLogoCommand', undefined, {
      branchId,
      fileName: file.originalname,
    });

    try {
      // 1. Check if branch exists
      const existingBranch = await this.prisma.organization.findUnique({
        where: { id: branchId },
      });

      if (!existingBranch) {
        throw this.errorService.notFound('Branch not found');
      }

      // 2. Delete old logo if exists
      if (existingBranch.logo) {
        try {
          const oldKey = existingBranch.logo.includes('http')
            ? existingBranch.logo.split('/').pop() || existingBranch.logo
            : existingBranch.logo;

          if (oldKey) {
            await this.fileService.deleteFile(oldKey);
            this.logger.log('Old logo deleted', undefined, { oldKey });
          }
        } catch (error) {
          this.logger.warn('Failed to delete old logo', undefined, {
            error: error.message,
          });
        }
      }

      // 3. Upload new logo
      const uploadedFile = await this.fileService.uploadFile(
        file,
        'organizations',
      );

      // 4. Update branch with new logo
      const branch = await this.prisma.organization.update({
        where: { id: branchId },
        data: {
          logo: uploadedFile.url,
          updatedBy: userId,
        },
        include: {
          parent: {
            select: { id: true, name: true, slug: true },
          },
          root: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      this.logger.log('Branch logo updated successfully', undefined, {
        branchId: branch.id,
        logo: branch.logo,
      });

      return OrganizationResponseDto.fromEntity(branch);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error(
        'Failed to upload branch logo',
        error.stack,
        undefined,
        {
          branchId,
        },
      );
      throw this.errorService.internalServerError(
        'Failed to upload branch logo',
        { cause: error },
      );
    }
  }
}
