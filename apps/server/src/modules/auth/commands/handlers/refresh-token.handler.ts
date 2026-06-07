// src/modules/auth/commands/handlers/refresh-token.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../impl/refresh-token.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { JwtService } from 'services/jwt/jwt.service';
import { AuthResponseDto } from '../../dto/auth-response.dto';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(RefreshTokenHandler.name);
  }

  async execute(command: RefreshTokenCommand): Promise<AuthResponseDto> {
    this.logger.log('Executing RefreshTokenCommand');

    try {
      const payload = await this.jwtService.verifyRefreshToken(
        command.refreshToken,
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw this.errorService.unauthorized('User not found');
      }

      if (!user.isActive) {
        throw this.errorService.forbidden('Account is deactivated');
      }

      if (user.deletedAt) {
        throw this.errorService.forbidden('Account no longer exists');
      }

      const tokens = await this.jwtService.generateTokenPair({
        sub: user.id,
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,
        role: user.role,
      });

      this.logger.log('Token refresh successful', undefined, {
        userId: user.id,
      });

      return AuthResponseDto.fromLogin(
        user,
        tokens.accessToken,
        tokens.refreshToken,
      );
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('Token refresh failed', error.stack);
      throw this.errorService.internalServerError('Failed to refresh token');
    }
  }
}
