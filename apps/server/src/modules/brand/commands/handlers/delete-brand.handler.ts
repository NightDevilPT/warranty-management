// src/modules/brand/commands/handlers/delete-brand.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBrandCommand } from '../impl/delete-brand.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FileService } from 'services/files/file.service';

@CommandHandler(DeleteBrandCommand)
export class DeleteBrandHandler implements ICommandHandler<DeleteBrandCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly fileService: FileService,
  ) {
    this.logger.setContext(DeleteBrandHandler.name);
  }

  async execute(command: DeleteBrandCommand): Promise<{ message: string }> {
    const { id, userId } = command;

    this.logger.log('Executing DeleteBrandCommand', undefined, {
      brandId: id,
    });

    try {
      // 1. Check if brand exists
      const existingBrand = await this.prisma.brand.findUnique({
        where: { id },
      });

      if (!existingBrand) {
        throw this.errorService.notFound('Brand not found');
      }

      // 2. Check if brand has associated form data
      const linkedFormData = await this.prisma.formData.findFirst({
        where: { brandFormDataId: id },
      });

      if (linkedFormData) {
        throw this.errorService.conflict(
          'Cannot delete brand with associated products. Remove brand from all products first.',
        );
      }

      // 3. Delete logo file if exists
      if (existingBrand.logo) {
        try {
          // Extract key from URL if stored as full URL, or use as is if it's just the key
          const oldKey = existingBrand.logo.includes('http')
            ? existingBrand.logo.split('/').pop() || existingBrand.logo
            : existingBrand.logo;

          if (oldKey) {
            await this.fileService.deleteFile(oldKey);
            this.logger.log('Brand logo deleted', undefined, { oldKey });
          }
        } catch (error) {
          // Log but don't fail - file might already be deleted
          this.logger.warn('Failed to delete brand logo file', undefined, {
            error: error.message,
          });
        }
      }

      // 4. Delete brand
      await this.prisma.brand.delete({
        where: { id },
      });

      this.logger.log('Brand deleted successfully', undefined, {
        id,
        name: existingBrand.name,
      });

      return { message: 'Brand deleted successfully' };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete brand', error.stack, undefined, {
        brandId: id,
      });
      throw this.errorService.internalServerError('Failed to delete brand', {
        cause: error,
      });
    }
  }
}
