import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveUserCommand } from '../impl/remove-user.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler implements ICommandHandler<RemoveUserCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(RemoveUserHandler.name);
  }

  async execute(command: RemoveUserCommand): Promise<void> {
    const { userAccessId, orgId, userId } = command;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
      });

      if (!userAccess) {
        throw this.errorService.notFound('User not found');
      }

      // Soft delete UserAccess - User's global account remains
      await this.prisma.userAccess.update({
        where: { id: userAccessId },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
          isActive: false,
        },
      });

      this.logger.log('User removed from organization', undefined, {
        userAccessId,
        orgId,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to remove user', error.stack);
      throw this.errorService.internalServerError('Failed to remove user');
    }
  }
}
