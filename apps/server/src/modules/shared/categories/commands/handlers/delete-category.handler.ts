import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { DeleteCategoryCommand } from '../impl/delete-category.command';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(DeleteCategoryHandler.name);
  }

  async execute(command: DeleteCategoryCommand): Promise<void> {
    const { categoryId, orgId, userId } = command;

    try {
      const existing = await this.prisma.category.findFirst({
        where: { id: categoryId, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Category not found');
      }

      // Move child categories to root level (parentId = null)
      await this.prisma.category.updateMany({
        where: { parentId: categoryId, orgId, deletedAt: null },
        data: { parentId: null, updatedBy: userId },
      });

      // Soft delete the category
      await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
          isActive: false,
        },
      });

      this.logger.log(
        'Category soft deleted, children moved to root',
        undefined,
        { id: categoryId, orgId },
      );
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete category', error.stack);
      throw this.errorService.internalServerError('Failed to delete category');
    }
  }
}
