import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { ChangePasswordCommand } from '../impl/change-password.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(ChangePasswordHandler.name);
  }

  async execute(command: ChangePasswordCommand): Promise<{ message: string }> {
    const { dto, userAccessId, orgId } = command;

    try {
      const userAccess = await this.prisma.userAccess.findFirst({
        where: { id: userAccessId, orgId, deletedAt: null },
      });

      if (!userAccess) {
        throw this.errorService.notFound('Profile not found');
      }

      if (!userAccess.passwordHash) {
        throw this.errorService.badRequest('No password set for this account');
      }

      const isPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        userAccess.passwordHash,
      );
      if (!isPasswordValid) {
        throw this.errorService.unauthorized('Current password is incorrect');
      }

      const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

      await this.prisma.userAccess.update({
        where: { id: userAccessId },
        data: { passwordHash: newPasswordHash },
      });

      this.logger.log('Password changed', undefined, { userAccessId, orgId });

      return {
        message:
          'Password updated successfully for current organization context',
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to change password', error.stack, undefined, {
        userAccessId,
      });
      throw this.errorService.internalServerError('Failed to change password');
    }
  }
}
