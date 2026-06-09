import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../impl/login.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { JwtService } from 'services/jwt/jwt.service';
import { AuthResponseDto, TokenResponseDto } from '../../dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(LoginHandler.name);
  }

  async execute(command: LoginCommand): Promise<TokenResponseDto> {
    const { dto } = command;
    this.logger.log('Executing LoginCommand', undefined, {
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      hasPassword: !!dto.password,
      hasOtp: !!dto.otp,
    });

    try {
      // Validate at least one identifier
      if (!dto.email && !dto.phoneNumber) {
        throw this.errorService.badRequest('Email or phone number is required');
      }

      // Validate login method
      if (!dto.password && !dto.otp) {
        throw this.errorService.badRequest('Password or OTP is required');
      }

      // Find user
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: dto.email || undefined },
            { phoneNumber: dto.phoneNumber || undefined },
          ],
          isActive: true,
          deletedAt: null,
        },
      });

      if (!user) {
        throw this.errorService.unauthorized('Invalid credentials');
      }

      // **PASSWORD-BASED LOGIN**
      if (dto.password) {
        if (!user.passwordHash) {
          throw this.errorService.badRequest(
            'Password login not set up for this account. Use OTP.',
          );
        }

        const isPasswordValid = await bcrypt.compare(
          dto.password,
          user.passwordHash,
        );
        if (!isPasswordValid) {
          throw this.errorService.unauthorized('Invalid Credentials');
        }
      }

      // **PASSWORDLESS LOGIN (OTP)**
      if (dto.otp) {
        const otpRecord = await this.prisma.otpVerification.findFirst({
          where: {
            userId: user.id,
            code: dto.otp,
            type: 'LOGIN',
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
      }

      // Generate tokens
      const tokenPair = await this.jwtService.generateTokenPair({
        sub: user.id,
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,
        role: user.role,
        type: 'access',
      });

      this.logger.log('Login successful', undefined, { userId: user.id });

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user: AuthResponseDto.fromEntity(user),
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Login failed', error.stack);
      throw this.errorService.internalServerError('Login failed');
    }
  }
}
