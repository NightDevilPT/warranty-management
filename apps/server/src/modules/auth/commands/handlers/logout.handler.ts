// src/modules/auth/commands/handlers/logout.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '../impl/logout.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(LogoutHandler.name);
  }

  async execute(command: LogoutCommand) {
    this.logger.log('Executing LogoutCommand', undefined, {
      userId: command.userId,
    });

    try {
      // Try to find and cleanup user data
      if (command.userId && command.userId !== 'unknown') {
        const user = await this.prisma.user.findUnique({
          where: { id: command.userId },
        });

        if (user) {
          // Mark all unused OTPs as used (cleanup)
          await this.prisma.otpVerification.updateMany({
            where: {
              userId: command.userId,
              isUsed: false,
              expiresAt: { gt: new Date() },
            },
            data: { isUsed: true },
          });
        }
      }

      // Clear cookies
      const response = command.res;
      if (response) {
        response.clearCookie('accessToken', { path: '/' });
        response.clearCookie('refreshToken', { path: '/' });
      }

      this.logger.log('Logout successful', undefined, {
        userId: command.userId,
      });

      return {
        data: null,
        message: 'Logged out successfully',
      };
    } catch (error) {
      // Even if DB cleanup fails, still clear cookies
      if (command.res) {
        command.res.clearCookie('accessToken', { path: '/' });
        command.res.clearCookie('refreshToken', { path: '/' });
      }

      if (error.status) throw error;

      this.logger.error('Logout failed', error.stack);
      throw this.errorService.internalServerError('Failed to logout');
    }
  }
}
