// src/modules/org-user/commands/handlers/remove-user.handler.ts
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

  async execute(command: RemoveUserCommand): Promise<{ message: string }> {
    const { orgId, userId } = command;

    this.logger.log('Executing RemoveUserCommand', undefined, {
      orgId,
      userId,
    });

    try {
      // 1. Find user access
      const userAccess = await this.prisma.userAccess.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId,
          },
        },
      });

      if (!userAccess) {
        throw this.errorService.notFound(
          'User is not a member of this organization',
        );
      }

      // 2. Delete feature access records for this user in this org
      await this.prisma.featureAccess.deleteMany({
        where: {
          orgId,
          userId,
        },
      });

      // 3. Delete user access
      await this.prisma.userAccess.delete({
        where: { id: userAccess.id },
      });

      this.logger.log(
        'User removed from organization successfully',
        undefined,
        {
          orgId,
          userId,
        },
      );

      return { message: 'User removed from organization successfully' };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error(
        'Failed to remove user from organization',
        error.stack,
        undefined,
        {
          orgId,
          userId,
        },
      );
      throw this.errorService.internalServerError(
        'Failed to remove user from organization',
        {
          cause: error,
        },
      );
    }
  }
}
