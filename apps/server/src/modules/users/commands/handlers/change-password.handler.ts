import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../impl/change-password.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import * as bcrypt from 'bcrypt';

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

  async execute(command: ChangePasswordCommand) {
    const { userId, dto } = command;
    this.logger.log('Executing ChangePasswordCommand', undefined, { userId });

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        throw this.errorService.notFound('User not found');
      }

      // Check if user has a password set
      if (!user.passwordHash) {
        throw this.errorService.badRequest(
          'No password set. Use OTP login or set a password first.',
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.passwordHash,
      );

      if (!isCurrentPasswordValid) {
        throw this.errorService.badRequest('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      this.logger.log('Password changed successfully', undefined, { userId });

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to change password', error.stack);
      throw this.errorService.internalServerError('Failed to change password');
    }
  }
}
