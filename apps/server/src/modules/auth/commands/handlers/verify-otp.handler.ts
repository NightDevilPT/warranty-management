// src/modules/auth/commands/handlers/verify-otp.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../impl/verify-otp.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { JwtService } from 'services/jwt/jwt.service';
import { AuthResponseDto } from '../../dto/auth-response.dto';

@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  private readonly MAX_OTP_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(VerifyOtpHandler.name);
  }

  async execute(command: VerifyOtpCommand): Promise<AuthResponseDto> {
    const { dto } = command;
    this.logger.log('Executing VerifyOtpCommand', undefined, {
      email: dto.email,
      phone: dto.phoneNumber,
      type: dto.type,
    });

    try {
      // Validate identifier
      if (!dto.email && !dto.phoneNumber) {
        throw this.errorService.badRequest('Email or phone number is required');
      }

      // Find user
      const user = await this.findUser(dto);

      if (!user) {
        throw this.errorService.notFound('No account found with these details');
      }

      if (!user.isActive || user.deletedAt) {
        throw this.errorService.forbidden('Account is not active');
      }

      // Find valid OTP
      const otpRecord = await this.prisma.otpVerification.findFirst({
        where: {
          userId: user.id,
          type: dto.type,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw this.errorService.badRequest(
          'OTP has expired or does not exist. Please request a new one.',
        );
      }

      // Verify OTP code
      if (otpRecord.code !== dto.code) {
        this.logger.warn('Invalid OTP attempt', undefined, {
          userId: user.id,
          type: dto.type,
        });

        throw this.errorService.unauthorized(
          'Invalid OTP code. Please try again.',
        );
      }

      // Mark OTP as used
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // Handle different OTP types
      switch (dto.type) {
        case 'LOGIN':
          return this.handleLoginOtp(user);
        case 'PASSWORD_RESET':
          return this.handlePasswordResetOtp(user);
        default:
          throw this.errorService.badRequest('Invalid OTP type');
      }
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('OTP verification failed', error.stack);
      throw this.errorService.internalServerError('OTP verification failed');
    }
  }

  private async findUser(dto: any) {
    const where: any = { isActive: true, deletedAt: null };

    if (dto.email) {
      where.email = dto.email.toLowerCase().trim();
    } else if (dto.phoneNumber) {
      where.phoneNumber = dto.phoneNumber.trim();
    }

    return this.prisma.user.findFirst({ where });
  }

  /**
   * Handle login OTP - generate tokens
   */
  private async handleLoginOtp(user: any): Promise<AuthResponseDto> {
    const tokens = await this.jwtService.generateTokenPair({
      sub: user.id,
      email: user.email || undefined,
      phoneNumber: user.phoneNumber || undefined,
      role: user.role,
    });

    // Update phone/email verified status if needed
    if (user.phoneNumber && !user.phoneVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    this.logger.log('OTP login successful', undefined, {
      userId: user.id,
    });

    return AuthResponseDto.fromLogin(
      user,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  /**
   * Handle password reset OTP
   */
  private async handlePasswordResetOtp(user: any) {
    // Generate a temporary token for password reset
    const resetToken = await this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.logger.log('Password reset OTP verified', undefined, {
      userId: user.id,
    });

    return {
      user: { id: user.id } as any,
      accessToken: resetToken,
      message: 'OTP verified. You can now reset your password.',
    } as AuthResponseDto;
  }
}
