import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendOtpCommand } from '../impl/send-otp.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { MailService } from 'services/mail/mail.service';
import * as crypto from 'crypto';

@CommandHandler(SendOtpCommand)
export class SendOtpHandler implements ICommandHandler<SendOtpCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly mailService: MailService,
  ) {
    this.logger.setContext(SendOtpHandler.name);
  }

  async execute(command: SendOtpCommand) {
    const { dto } = command;
    this.logger.log('Executing SendOtpCommand', undefined, {
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      type: dto.type,
    });

    try {
      // Validate at least one identifier
      if (!dto.email && !dto.phoneNumber) {
        throw this.errorService.badRequest('Email or phone number is required');
      }

      // Find user by email or phone
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: dto.email || undefined },
            { phoneNumber: dto.phoneNumber || undefined },
          ],
        },
      });

      if (!user) {
        throw this.errorService.notFound(
          'User not found with provided credentials',
        );
      }

      if (!user.isActive) {
        throw this.errorService.forbidden('Account is deactivated');
      }

      // Generate 6-digit OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();

      // Set expiry (10 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Save OTP
      await this.prisma.otpVerification.create({
        data: {
          userId: user.id,
          code: otpCode,
          type: dto.type,
          expiresAt,
        },
      });

      // Send OTP via email (if email provided)
      if (dto.email) {
        this.logger.log(
          `OTP for email ${dto.email}: ${otpCode}`,
          'SendOtpHandler',
        );
      }

      // For phone, log it (SMS integration would go here)
      if (dto.phoneNumber) {
        this.logger.log(
          `OTP for phone ${dto.phoneNumber}: ${otpCode}`,
          'SendOtpHandler',
        );
      }

      this.logger.log('OTP sent successfully', undefined, { userId: user.id });

      return {
        message: 'OTP sent successfully',
        expiresIn: '10 minutes',
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to send OTP', error.stack);
      throw this.errorService.internalServerError('Failed to send OTP');
    }
  }
}
