import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCategoryCommand } from '../impl/delete-category.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

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

  async execute(command: DeleteCategoryCommand) {
    const { categoryId, userId } = command;
    this.logger.log('Executing DeleteCategoryCommand', undefined, {
      categoryId,
    });

    try {
      // Check if category exists
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { children: true },
          },
        },
      });

      if (!category) {
        throw this.errorService.notFound('Category not found');
      }

      // Check if category has children
      if (category._count.children > 0) {
        throw this.errorService.badRequest(
          'Cannot delete category with subcategories. Remove subcategories first.',
        );
      }

      // Delete category
      await this.prisma.category.delete({
        where: { id: categoryId },
      });

      this.logger.log('Category deleted successfully', undefined, {
        categoryId,
      });

      return {
        message: 'Category deleted successfully',
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete category', error.stack);
      throw this.errorService.internalServerError('Failed to delete category');
    }
  }
}
