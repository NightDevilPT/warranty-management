import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationCommand } from '../impl/update-organization.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { FileService } from 'services/files/file.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler
  implements ICommandHandler<UpdateOrganizationCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateOrganizationHandler.name);
  }

  async execute(
    command: UpdateOrganizationCommand,
  ): Promise<OrganizationResponseDto> {
    const { orgId, dto, userId } = command;

    try {
      const existing = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Organization not found');
      }

      // Check slug uniqueness if changing slug
      if (dto.slug && dto.slug !== existing.slug) {
        const slugExists = await this.prisma.organization.findFirst({
          where: { slug: dto.slug, deletedAt: null, id: { not: orgId } },
        });

        if (slugExists) {
          throw this.errorService.conflict(
            'Organization with this slug already exists',
          );
        }
      }

      // Handle logo replacement
      if (dto.logo !== undefined && dto.logo !== existing.logo) {
        // Delete old logo if exists and it's different from the new one
        if (existing.logo) {
          try {
            const oldKey = this.extractKeyFromUrl(existing.logo);
            if (oldKey) {
              await this.fileService.deleteFile(oldKey);
              this.logger.log('Old logo deleted', undefined, {
                orgId,
                oldKey,
              });
            }
          } catch (deleteError) {
            // Log but don't fail the update if old file deletion fails
            this.logger.warn(
              'Failed to delete old logo, continuing with update',
              undefined,
              { orgId, error: deleteError.message },
            );
          }
        }
      }

      // Build update data
      const updateData: any = { updatedBy: userId };
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.companyName !== undefined)
        updateData.companyName = dto.companyName;
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.logo !== undefined) updateData.logo = dto.logo;

      const updated = await this.prisma.organization.update({
        where: { id: orgId },
        data: updateData,
      });

      this.logger.log('Organization updated', undefined, { id: orgId });
      return OrganizationResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update organization', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update organization',
      );
    }
  }

  /**
   * Extract S3 key from a file URL
   * Supports both local (LocalStack) and AWS S3 URLs
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      // For LocalStack URLs: http://localhost:4566/bucket-name/folder/filename.png
      // For AWS S3 URLs: https://bucket-name.s3.region.amazonaws.com/folder/filename.png
      // For presigned URLs: https://bucket-name.s3.amazonaws.com/folder/filename.png?X-Amz-...

      // Remove query parameters (presigned URLs have ?X-Amz-...)
      const urlWithoutQuery = url.split('?')[0];

      // Try to extract key from path (everything after bucket name)
      const parts = urlWithoutQuery.split('/');

      // Find the part after the bucket name
      // Format: protocol://host/bucket/key
      // For local: http://localhost:4566/warranty-system-uploads/organizations/123-file.png
      // For AWS: https://bucket.s3.region.amazonaws.com/organizations/123-file.png
      const bucketIndex = parts.findIndex(
        (part) =>
          part === 'warranty-system-uploads' ||
          part.includes('warranty-system'),
      );

      if (bucketIndex !== -1 && bucketIndex < parts.length - 1) {
        return parts.slice(bucketIndex + 1).join('/');
      }

      // Fallback: try to get the last meaningful path segments
      // Look for common folder patterns like "organizations/", "uploads/", etc.
      const commonFolders = ['organizations', 'uploads', 'profiles', 'brands'];
      for (const folder of commonFolders) {
        const folderIndex = parts.indexOf(folder);
        if (folderIndex !== -1 && folderIndex < parts.length - 1) {
          return parts.slice(folderIndex).join('/');
        }
      }

      // Last resort: return the last part as filename
      const fileName = parts[parts.length - 1];
      if (fileName && fileName.includes('.')) {
        return fileName;
      }

      return null;
    } catch (error) {
      this.logger.warn('Failed to extract key from URL', undefined, {
        url,
        error: error.message,
      });
      return null;
    }
  }
}
