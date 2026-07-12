import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendOtpCommand } from '../impl/send-otp.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { MailService } from 'services/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { SendOtpResponseDto } from '../../dto/otp-response.dto';

@CommandHandler(SendOtpCommand)
export class SendOtpHandler implements ICommandHandler<SendOtpCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(SendOtpHandler.name);
  }

  async execute(command: SendOtpCommand): Promise<SendOtpResponseDto> {
    const { dto, portalType } = command;
    const { email, orgHash } = dto;

    try {
      let isNewUser = false;
      let orgId: string;

      // Step 1: Find Organization
      if (portalType === 'admin') {
        const systemOrg = await this.prisma.organization.findFirst({
          where: { slug: 'system', deletedAt: null },
        });
        if (!systemOrg) {
          throw this.errorService.internalServerError(
            'System organization not found',
          );
        }
        orgId = systemOrg.id;
      } else {
        if (!orgHash) {
          throw this.errorService.badRequest('Organization hash is required');
        }
        const organization = await this.prisma.organization.findFirst({
          where: { hash: orgHash, deletedAt: null, isActive: true },
        });
        if (!organization) {
          throw this.errorService.notFound('Organization not found');
        }
        orgId = organization.id;
      }

      // Step 2: Find or Create User
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user && portalType === 'consumer') {
        user = await this.prisma.user.create({
          data: { email, isActive: true },
        });
        isNewUser = true;
      } else if (!user) {
        throw this.errorService.notFound('No account found with this email');
      }

      // Step 3: Find or Create UserAccess
      let userAccess = await this.prisma.userAccess.findFirst({
        where: {
          userId: user.id,
          orgId,
          portalType,
          deletedAt: null,
        },
      });

      if (!userAccess && portalType === 'consumer') {
        userAccess = await this.prisma.userAccess.create({
          data: {
            userId: user.id,
            orgId,
            portalType: 'consumer',
            role: 'CONSUMER',
            firstName: '',
            lastName: '',
            fullName: '',
            emailVerified: false,
            phoneVerified: false,
            isActive: true,
          },
        });
        isNewUser = true;
      } else if (!userAccess) {
        throw this.errorService.notFound(
          `No ${portalType} access found for this organization`,
        );
      }

      if (!userAccess.isActive) {
        throw this.errorService.forbidden('Account is deactivated');
      }

      // Step 4: Mark all previous OTPs as used
      await this.prisma.otpVerification.updateMany({
        where: {
          userAccessId: userAccess.id,
          type: 'LOGIN',
          isUsed: false,
        },
        data: {
          isUsed: true,
        },
      });

      // Step 5: Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.otpVerification.create({
        data: {
          userAccessId: userAccess.id,
          code: otp,
          type: 'LOGIN',
          expiresAt,
        },
      });

      // Step 6: Send OTP via email (only in production)
      const isDev = this.configService.get('NODE_ENV') !== 'production';

      //   if (!isDev) {
      //     await this.mailService.sendMail({
      //       to: email,
      //       subject: 'Your OTP for Login',
      //       html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`,
      //     });
      //   }

      this.logger.log('OTP sent successfully', undefined, {
        email,
        portalType,
        isNewUser,
        ...(isDev && { otp }),
      });

      return SendOtpResponseDto.from({
        message: 'OTP sent successfully',
        expiresIn: 600,
        isNewUser: isNewUser || undefined,
        ...(isDev && { otp }),
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to send OTP', error.stack, undefined, {
        email,
        portalType,
      });
      throw this.errorService.internalServerError('Failed to send OTP');
    }
  }
}
