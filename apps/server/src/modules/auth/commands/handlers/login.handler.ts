// src/modules/auth/commands/handlers/login.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { LoginCommand } from '../impl/login.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { JwtService } from 'services/jwt/jwt.service';
import { AuthResponseDto } from '../../dto/auth-response.dto';
import { OtpType } from 'generated/prisma/enums';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(LoginHandler.name);
  }

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { dto } = command;
    this.logger.log('Executing LoginCommand', undefined, {
      email: dto.email,
      phone: dto.phoneNumber,
      hasPassword: !!dto.password,
    });

    try {
      // Validate that at least one identifier is provided
      if (!dto.email && !dto.phoneNumber) {
        throw this.errorService.badRequest(
          'Email or phone number is required for login',
        );
      }

      // Find user by email or phone
      const user = await this.findUser(dto);

      if (!user) {
        throw this.errorService.unauthorized(
          'Invalid credentials. No account found with these details.',
        );
      }

      // Validate user status
      await this.validateUserStatus(user);

      // Determine login method based on what was provided
      if (dto.email && dto.password) {
        // PASSWORD-BASED LOGIN
        return this.handlePasswordLogin(user, dto.password);
      } else if (dto.email && !dto.password) {
        // PASSWORDLESS LOGIN - EMAIL
        return this.handlePasswordlessLogin(user, 'email');
      } else if (dto.phoneNumber) {
        // PASSWORDLESS LOGIN - PHONE
        return this.handlePasswordlessLogin(user, 'phone');
      }

      throw this.errorService.badRequest('Invalid login method');
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('Login failed', error.stack, undefined, {
        email: dto.email,
        phone: dto.phoneNumber,
      });
      throw this.errorService.internalServerError(
        'Login failed. Please try again.',
      );
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

  private async validateUserStatus(user: any) {
    if (!user.isActive) {
      throw this.errorService.forbidden(
        'Account is deactivated. Please contact support.',
      );
    }

    if (user.deletedAt) {
      throw this.errorService.forbidden(
        'Account no longer exists. Please contact support.',
      );
    }
  }

  /**
   * Handle password-based login
   */
  private async handlePasswordLogin(
    user: any,
    password: string,
  ): Promise<AuthResponseDto> {
    if (!user.passwordHash) {
      throw this.errorService.badRequest(
        'Password login is not set up for this account. Please use OTP login.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn('Invalid password attempt', undefined, {
        userId: user.id,
        email: user.email,
      });

      throw this.errorService.unauthorized(
        'Invalid credentials. Please check your email and password.',
      );
    }

    // Password valid - generate tokens
    const tokens = await this.jwtService.generateTokenPair({
      sub: user.id,
      email: user.email || undefined,
      phoneNumber: user.phoneNumber || undefined,
      role: user.role,
    });

    this.logger.log('Password login successful', undefined, {
      userId: user.id,
      email: user.email,
    });

    return AuthResponseDto.fromLogin(
      user,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  /**
   * Handle passwordless login (OTP)
   */
  private async handlePasswordlessLogin(
    user: any,
    method: 'email' | 'phone',
  ): Promise<AuthResponseDto> {
    // Generate OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    // Store OTP in database
    await this.prisma.otpVerification.create({
      data: {
        userId: user.id,
        code: otp,
        type: OtpType.LOGIN,
        expiresAt,
      },
    });

    // Log OTP for development
    if (method === 'email') {
      this.logger.debug(`📧 Login OTP for ${user.email}: ${otp}`);
    } else {
      this.logger.debug(`📱 Login OTP for ${user.phoneNumber}: ${otp}`);
    }

    this.logger.log('OTP generated for passwordless login', undefined, {
      userId: user.id,
      method,
      expiresAt: expiresAt.toISOString(),
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Return response with OTP in development mode
    return {
      user: { id: user.id } as any,
      requiresOtp: true,
      // Include OTP in response for development only
      ...(isProduction
        ? {}
        : {
            devOtp: otp,
            devMessage: `Development: OTP is ${otp}. Use /api/auth/verify-otp to login.`,
          }),
    } as AuthResponseDto;
  }

  /**
   * Generate a random OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
