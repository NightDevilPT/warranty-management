import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InviteUserCommand } from '../impl/invite-user.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { MailService } from 'services/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { InviteUserResponseDto } from '../../dto/user-response.dto';

@CommandHandler(InviteUserCommand)
export class InviteUserHandler implements ICommandHandler<InviteUserCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(InviteUserHandler.name);
  }

  async execute(command: InviteUserCommand): Promise<InviteUserResponseDto> {
    const { dto, orgId, userId } = command;

    try {
      const organization = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // Validate dealer type if provided
      let dealerType: any = null;
      if (dto.dealerTypeId) {
        dealerType = await this.prisma.dealerType.findFirst({
          where: { id: dto.dealerTypeId, orgId, deletedAt: null },
        });

        if (!dealerType) {
          throw this.errorService.notFound('Dealer type not found');
        }
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

      // Check if already has access to this org
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

      // Create UserAccess
      const userAccess = await this.prisma.userAccess.create({
        data: {
          userId: user.id,
          orgId,
          portalType: 'company',
          role: dto.role,
          partnerType: dto.partnerType,
          dealerTypeId: dto.dealerTypeId || null,
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
          subject: `You've been invited to join ${organization.name}`,
          html: `<p>You have been invited as ${dto.role} for ${organization.name}.</p>
                 <p>Login at: <a href="http://localhost:3000/${organization.hash}/login">${organization.name} Portal</a></p>`,
        });
      }

      this.logger.log('User invited', undefined, {
        orgId,
        email: dto.email,
        role: dto.role,
      });

      return {
        userId: user.id,
        userAccessId: userAccess.id,
        email: dto.email,
        fullName: userAccess.fullName,
        role: dto.role,
        dealerType: dealerType?.name,
        invitationSent: !isDev,
      } as InviteUserResponseDto;
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to invite user', error.stack);
      throw this.errorService.internalServerError('Failed to invite user');
    }
  }
}
