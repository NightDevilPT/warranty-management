// src/modules/org-user/commands/handlers/add-user.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddUserCommand } from '../impl/add-user.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrgUserResponseDto } from '../../dto/org-user-response.dto';

@CommandHandler(AddUserCommand)
export class AddUserHandler implements ICommandHandler<AddUserCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(AddUserHandler.name);
  }

  async execute(command: AddUserCommand): Promise<OrgUserResponseDto> {
    const { orgId, dto } = command;

    this.logger.log('Executing AddUserCommand', undefined, {
      orgId,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    try {
      // 1. Find organization
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      if (!organization.isActive) {
        throw this.errorService.badRequest(
          'Cannot add users to inactive organization',
        );
      }

      // 2. Find user by email or phone
      let user;
      if (dto.email) {
        user = await this.prisma.user.findUnique({
          where: { email: dto.email.toLowerCase().trim() },
        });
      } else if (dto.phoneNumber) {
        user = await this.prisma.user.findUnique({
          where: { phoneNumber: dto.phoneNumber },
        });
      } else {
        throw this.errorService.badRequest(
          'Either email or phone number is required',
        );
      }

      if (!user) {
        throw this.errorService.notFound(
          'User not found. User must register first before being added to organization.',
        );
      }

      if (!user.isActive) {
        throw this.errorService.badRequest(
          'Cannot add inactive user to organization',
        );
      }

      // 3. Check if user is already in organization
      const existingAccess = await this.prisma.userAccess.findUnique({
        where: {
          userId_orgId: {
            userId: user.id,
            orgId: orgId,
          },
        },
      });

      if (existingAccess) {
        throw this.errorService.conflict(
          'User is already a member of this organization',
        );
      }

      // 4. Validate dealerType if provided
      if (dto.dealerTypeId) {
        const dealerType = await this.prisma.dealerType.findFirst({
          where: {
            id: dto.dealerTypeId,
            orgId: orgId,
          },
        });

        if (!dealerType) {
          throw this.errorService.notFound(
            'DealerType not found in this organization',
          );
        }
      }

      // 5. Create user access
      const userAccess = await this.prisma.userAccess.create({
        data: {
          userId: user.id,
          orgId: orgId,
          role: dto.role,
          portalType: dto.portalType,
          partnerType: dto.partnerType || 'INTERNAL',
          dealerTypeId: dto.dealerTypeId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              fullName: true,
              profile: true,
              isActive: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          dealerType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // 6. Assign features if provided
      const features: Array<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
      }> = [];

      if (dto.featureIds && dto.featureIds.length > 0) {
        const validFeatures = await this.prisma.feature.findMany({
          where: {
            id: { in: dto.featureIds },
            status: 'ENABLED',
          },
          select: { id: true, name: true, code: true },
        });

        if (validFeatures.length !== dto.featureIds.length) {
          throw this.errorService.badRequest(
            'One or more feature IDs are invalid or disabled',
          );
        }

        const featureAccessData = validFeatures.map((feature) => ({
          orgId: orgId,
          userId: user.id,
          featureId: feature.id,
          isActive: true,
          enabledAt: new Date(),
        }));

        await this.prisma.featureAccess.createMany({
          data: featureAccessData,
          skipDuplicates: true,
        });

        features.push(
          ...validFeatures.map((f) => ({
            id: f.id,
            name: f.name,
            code: f.code,
            isActive: true,
          })),
        );
      }

      this.logger.log('User added to organization successfully', undefined, {
        userId: user.id,
        orgId,
        userAccessId: userAccess.id,
      });

      return OrgUserResponseDto.fromEntity({
        ...userAccess,
        features,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error(
        'Failed to add user to organization',
        error.stack,
        undefined,
        {
          orgId,
          email: dto.email,
        },
      );
      throw this.errorService.internalServerError(
        'Failed to add user to organization',
        {
          cause: error,
        },
      );
    }
  }
}
