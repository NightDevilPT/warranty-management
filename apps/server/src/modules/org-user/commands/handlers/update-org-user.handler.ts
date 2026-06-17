// src/modules/org-user/commands/handlers/update-org-user.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrgUserCommand } from '../impl/update-org-user.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrgUserResponseDto } from '../../dto/org-user-response.dto';

@CommandHandler(UpdateOrgUserCommand)
export class UpdateOrgUserHandler
  implements ICommandHandler<UpdateOrgUserCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateOrgUserHandler.name);
  }

  async execute(command: UpdateOrgUserCommand): Promise<OrgUserResponseDto> {
    const { orgId, userId, dto, currentUserId } = command;

    this.logger.log('Executing UpdateOrgUserCommand', undefined, {
      orgId,
      userId,
      updates: Object.keys(dto),
    });

    try {
      // 1. Find user access
      const userAccess = await this.prisma.userAccess.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId,
          },
        },
      });

      if (!userAccess) {
        throw this.errorService.notFound(
          'User is not a member of this organization',
        );
      }

      // 2. Validate dealerType if provided
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

      // 3. Update user access
      const updateData: any = {};
      if (dto.role !== undefined) updateData.role = dto.role;
      if (dto.portalType !== undefined) updateData.portalType = dto.portalType;
      if (dto.partnerType !== undefined)
        updateData.partnerType = dto.partnerType;
      if (dto.dealerTypeId !== undefined)
        updateData.dealerTypeId = dto.dealerTypeId;

      const updated = await this.prisma.userAccess.update({
        where: { id: userAccess.id },
        data: updateData,
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

      // 4. Get user features
      const featureAccesses = await this.prisma.featureAccess.findMany({
        where: {
          orgId,
          userId,
        },
        include: {
          feature: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const features = featureAccesses.map((fa) => ({
        id: fa.feature.id,
        name: fa.feature.name,
        code: fa.feature.code,
        isActive: fa.isActive,
      }));

      this.logger.log('User access updated successfully', undefined, {
        orgId,
        userId,
      });

      return OrgUserResponseDto.fromEntity({
        ...updated,
        features,
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error(
        'Failed to update user access',
        error.stack,
        undefined,
        {
          orgId,
          userId,
        },
      );
      throw this.errorService.internalServerError(
        'Failed to update user access',
        {
          cause: error,
        },
      );
    }
  }
}
