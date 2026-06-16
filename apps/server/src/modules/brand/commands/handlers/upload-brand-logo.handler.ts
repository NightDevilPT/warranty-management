// src/modules/brand/commands/handlers/upload-brand-logo.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadBrandLogoCommand } from '../impl/upload-brand-logo.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FileService } from 'services/files/file.service';
import { BrandResponseDto } from '../../dto/brand-response.dto';

@CommandHandler(UploadBrandLogoCommand)
export class UploadBrandLogoHandler
  implements ICommandHandler<UploadBrandLogoCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly fileService: FileService,
  ) {
    this.logger.setContext(UploadBrandLogoHandler.name);
  }

  async execute(command: UploadBrandLogoCommand): Promise<BrandResponseDto> {
    const { id, file, userId } = command;

    this.logger.log('Executing UploadBrandLogoCommand', undefined, {
      brandId: id,
      fileName: file.originalname,
    });

    try {
      // 1. Check if brand exists
      const existingBrand = await this.prisma.brand.findUnique({
        where: { id },
      });

      if (!existingBrand) {
        throw this.errorService.notFound('Brand not found');
      }

      // 2. Delete old logo if exists
      if (existingBrand.logo) {
        try {
          // Extract key from URL if stored as full URL, or use as is if it's just the key
          const oldKey = existingBrand.logo.includes('http')
            ? existingBrand.logo.split('/').pop() || existingBrand.logo
            : existingBrand.logo;

          if (oldKey) {
            await this.fileService.deleteFile(oldKey);
            this.logger.log('Old logo deleted', undefined, { oldKey });
          }
        } catch (error) {
          // Log but don't fail - old file might already be deleted
          this.logger.warn('Failed to delete old logo', undefined, {
            error: error.message,
          });
        }
      }

      // 3. Upload new logo
      const uploadedFile = await this.fileService.uploadFile(file, 'brands');

      this.logger.log('New logo uploaded', undefined, {
        key: uploadedFile.key,
      });

      // 4. Update brand with new logo URL
      const result = await this.prisma.brand.update({
        where: { id },
        data: {
          logo: uploadedFile.url,
          updatedBy: userId,
        },
        include: {
          organization: {
            select: { name: true },
          },
        },
      });

      this.logger.log('Brand logo updated successfully', undefined, {
        id: result.id,
        logo: result.logo,
      });

      return BrandResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to upload brand logo', error.stack, undefined, {
        brandId: id,
      });
      throw this.errorService.internalServerError(
        'Failed to upload brand logo',
        {
          cause: error,
        },
      );
    }
  }
}
