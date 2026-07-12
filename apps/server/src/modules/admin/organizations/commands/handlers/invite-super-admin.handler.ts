import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InviteSuperAdminCommand } from '../impl/invite-super-admin.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { MailService } from 'services/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { InviteSuperAdminResponseDto } from '../../dto/organization-response.dto';
import { UserRole } from 'generated/prisma/enums';

@CommandHandler(InviteSuperAdminCommand)
export class InviteSuperAdminHandler
  implements ICommandHandler<InviteSuperAdminCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(InviteSuperAdminHandler.name);
  }

  async execute(
    command: InviteSuperAdminCommand,
  ): Promise<InviteSuperAdminResponseDto> {
    const { orgId, dto, userId } = command;

    try {
      // Verify organization exists
      const organization = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // Find or Create User
      let user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: { email: dto.email, isActive: true },
        });
      }

      // Check if already has access
      const existingAccess = await this.prisma.userAccess.findFirst({
        where: {
          userId: user.id,
          orgId,
          portalType: 'company',
          deletedAt: null,
        },
      });

      if (existingAccess) {
        throw this.errorService.conflict(
          'User already has access to this organization',
        );
      }

      // Create UserAccess as COMPANY_SUPER_ADMIN (no createdBy field in UserAccess)
      const userAccess = await this.prisma.userAccess.create({
        data: {
          userId: user.id,
          orgId,
          portalType: 'company',
          role: UserRole.COMPANY_SUPER_ADMIN,
          partnerType: 'INTERNAL',
          firstName: dto.firstName,
          lastName: dto.lastName,
          fullName: `${dto.firstName} ${dto.lastName}`.trim(),
          phoneNumber: dto.phoneNumber,
          emailVerified: false,
          phoneVerified: false,
          isActive: true,
        },
      });

      // Send invitation email (skip in dev)
      const isDev = this.configService.get('NODE_ENV') !== 'production';
      if (!isDev) {
        await this.mailService.sendMail({
          to: dto.email,
          subject: `You've been invited to manage ${organization.name}`,
          html: `<p>You have been invited as COMPANY_SUPER_ADMIN for ${organization.name}.</p>
                 <p>Login at: <a href="http://localhost:3000/${organization.hash}/login">${organization.name} Portal</a></p>`,
        });
      }

      this.logger.log('Super admin invited', undefined, {
        orgId,
        email: dto.email,
      });

      return {
        userId: user.id,
        userAccessId: userAccess.id,
        email: dto.email,
        fullName: userAccess.fullName,
        role: 'COMPANY_SUPER_ADMIN',
        invitationSent: !isDev,
      } as InviteSuperAdminResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to invite super admin', error.stack);
      throw this.errorService.internalServerError(
        'Failed to invite super admin',
      );
    }
  }
}
