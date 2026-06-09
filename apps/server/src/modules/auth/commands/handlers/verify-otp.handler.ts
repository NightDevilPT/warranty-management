import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../impl/verify-otp.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { JwtService } from 'services/jwt/jwt.service';
import { AuthResponseDto, TokenResponseDto } from '../../dto/auth-response.dto';

@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(VerifyOtpHandler.name);
  }

  async execute(command: VerifyOtpCommand): Promise<TokenResponseDto> {
    const { dto } = command;
    this.logger.log('Executing VerifyOtpCommand', undefined, {
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    try {
      if (!dto.email && !dto.phoneNumber) {
        throw this.errorService.badRequest('Email or phone number is required');
      }

      // Find user
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: dto.email || undefined },
            { phoneNumber: dto.phoneNumber || undefined },
          ],
          isActive: true,
        },
      });

      if (!user) {
        throw this.errorService.notFound('User not found');
      }

      // Find valid OTP
      const otpRecord = await this.prisma.otpVerification.findFirst({
        where: {
          userId: user.id,
          code: dto.code,
          type: dto.type,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw this.errorService.badRequest('Invalid or expired OTP');
      }

      // Mark OTP as used
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // Update verification flags
      if (dto.type === 'VERIFY_EMAIL' && dto.email) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      } else if (dto.type === 'VERIFY_PHONE' && dto.phoneNumber) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        });
      }

      // Generate tokens
      const tokenPair = await this.jwtService.generateTokenPair({
        sub: user.id,
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,
        role: user.role,
        type: 'access',
      });

      this.logger.log('OTP verified successfully', undefined, {
        userId: user.id,
      });

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user: AuthResponseDto.fromEntity(user),
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to verify OTP', error.stack);
      throw this.errorService.internalServerError('Failed to verify OTP');
    }
  }
}
