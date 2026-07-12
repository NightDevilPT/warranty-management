import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../impl/verify-otp.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { JwtService } from 'services/jwt/jwt.service';
import { VerifyOtpResponseDto } from '../../dto/otp-response.dto';

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

  async execute(command: VerifyOtpCommand): Promise<VerifyOtpResponseDto> {
    const { dto, portalType } = command;
    const { email, otp, orgHash } = dto;

    try {
      let orgId: string;
      let organization: any = null;

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
        organization = systemOrg;
      } else {
        if (!orgHash) {
          throw this.errorService.badRequest('Organization hash is required');
        }
        organization = await this.prisma.organization.findFirst({
          where: { hash: orgHash, deletedAt: null, isActive: true },
        });
        if (!organization) {
          throw this.errorService.notFound('Organization not found');
        }
        orgId = organization.id;
      }

      // Step 2: Find User
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw this.errorService.notFound('No account found with this email');
      }

      // Step 3: Find UserAccess
      const userAccess = await this.prisma.userAccess.findFirst({
        where: {
          userId: user.id,
          orgId,
          portalType,
          deletedAt: null,
        },
      });

      if (!userAccess) {
        throw this.errorService.notFound(
          `No ${portalType} access found for this organization`,
        );
      }

      if (!userAccess.isActive) {
        throw this.errorService.forbidden('Account is deactivated');
      }

      // Step 4: Validate OTP
      const otpRecord = await this.prisma.otpVerification.findFirst({
        where: {
          userAccessId: userAccess.id,
          code: otp.toString(),
          type: 'LOGIN',
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw this.errorService.unauthorized('Invalid or expired OTP');
      }

      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // Step 5: Resolve Permissions
      let permissions: string[] = [];

      if (portalType === 'admin') {
        permissions = [];
      } else if (userAccess.role === 'COMPANY_SUPER_ADMIN') {
        const features = await this.prisma.featureAccess.findMany({
          where: {
            orgId,
            isActive: true,
          },
          include: {
            feature: true,
          },
        });
        permissions = features.map((fa) => fa.feature.code);
      } else if (userAccess.dealerTypeId) {
        const features = await this.prisma.featureAccess.findMany({
          where: {
            orgId,
            dealerTypeId: userAccess.dealerTypeId,
            isActive: true,
          },
          include: {
            feature: true,
          },
        });
        permissions = features.map((fa) => fa.feature.code);
      }

      // Step 6: Generate Tokens
      const role = userAccess.role || 'CONSUMER';

      const tokenPayload = {
        sub: userAccess.id,
        userId: user.id,
        email: user.email,
        orgId,
        orgHash: organization.hash,
        portalType,
        role,
        permissions,
        fullName: userAccess.fullName,
        profile: userAccess.profile,
      };

      const tokenPair = await this.jwtService.generateTokenPair(tokenPayload);

      this.logger.log('OTP verified successfully', undefined, {
        email,
        portalType,
        role,
      });

      return VerifyOtpResponseDto.from({
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user: {
          id: userAccess.id,
          email: user.email,
          fullName: userAccess.fullName,
          role,
          profile: userAccess.profile,
        },
        org: {
          id: organization.id,
          name: organization.name,
          hash: organization.hash,
        },
        portalType,
        permissions,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to verify OTP', error.stack, undefined, {
        email,
        portalType,
      });
      throw this.errorService.internalServerError('Failed to verify OTP');
    }
  }
}
