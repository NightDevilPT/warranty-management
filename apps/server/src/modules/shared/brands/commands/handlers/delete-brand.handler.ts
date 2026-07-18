import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBrandCommand } from '../impl/delete-brand.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@CommandHandler(DeleteBrandCommand)
export class DeleteBrandHandler implements ICommandHandler<DeleteBrandCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(DeleteBrandHandler.name);
  }

  async execute(command: DeleteBrandCommand): Promise<void> {
    const { brandId, orgId, userId } = command;

    try {
      const existing = await this.prisma.brand.findFirst({
        where: { id: brandId, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Brand not found');
      }

      // Soft delete
      await this.prisma.brand.update({
        where: { id: brandId },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
          isActive: false,
        },
      });

      this.logger.log('Brand soft deleted', undefined, { id: brandId, orgId });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete brand', error.stack);
      throw this.errorService.internalServerError('Failed to delete brand');
    }
  }
}
