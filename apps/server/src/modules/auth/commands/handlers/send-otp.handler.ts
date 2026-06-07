// src/modules/auth/commands/handlers/send-otp.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendOtpCommand } from '../impl/send-otp.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

@CommandHandler(SendOtpCommand)
export class SendOtpHandler implements ICommandHandler<SendOtpCommand> {
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(SendOtpHandler.name);
  }

  async execute(command: SendOtpCommand) {
    const { dto } = command;
    this.logger.log('Executing SendOtpCommand', undefined, {
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

      // Generate and store OTP
      const otp = this.generateOtp();
      const expiresAt = new Date(
        Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
      );

      await this.prisma.otpVerification.create({
        data: {
          userId: user.id,
          code: otp,
          type: dto.type,
          expiresAt,
        },
      });

      // Log OTP for development (REMOVE IN PRODUCTION)
      if (dto.email) {
        this.logger.debug(`📧 OTP for ${user.email}: ${otp}`);
      } else if (dto.phoneNumber) {
        this.logger.debug(`📱 OTP for ${user.phoneNumber}: ${otp}`);
      }

      this.logger.log('OTP generated and stored successfully', undefined, {
        userId: user.id,
        type: dto.type,
      });

      // In development, return OTP in response
      // In production, return only success message (no OTP)
      const isProduction = process.env.NODE_ENV === 'production';

      const responseData: any = {
        message: `OTP sent to your ${dto.email ? 'email' : 'phone'}`,
        expiresIn: `${this.OTP_EXPIRY_MINUTES} minutes`,
      };

      // Only include OTP in response for development
      if (!isProduction) {
        responseData.otp = otp; // Development only!
        responseData.warning =
          'OTP is returned in response for development only. Remove in production!';
      }

      return {
        data: responseData,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('Failed to send OTP', error.stack);
      throw this.errorService.internalServerError('Failed to send OTP');
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

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
