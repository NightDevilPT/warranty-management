import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationCommand } from '../impl/update-organization.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler
  implements ICommandHandler<UpdateOrganizationCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateOrganizationHandler.name);
  }

  async execute(
    command: UpdateOrganizationCommand,
  ): Promise<OrganizationResponseDto> {
    const { orgId, dto, userId } = command;

    try {
      const existing = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('Organization not found');
      }

      // Check slug uniqueness if changing slug
      if (dto.slug && dto.slug !== existing.slug) {
        const slugExists = await this.prisma.organization.findFirst({
          where: { slug: dto.slug, deletedAt: null, id: { not: orgId } },
        });

        if (slugExists) {
          throw this.errorService.conflict(
            'Organization with this slug already exists',
          );
        }
      }

      const updateData: any = { updatedBy: userId };
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.companyName !== undefined)
        updateData.companyName = dto.companyName;
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.logo !== undefined) updateData.logo = dto.logo;

      const updated = await this.prisma.organization.update({
        where: { id: orgId },
        data: updateData,
      });

      this.logger.log('Organization updated', undefined, { id: orgId });
      return OrganizationResponseDto.fromEntity(updated);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update organization', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update organization',
      );
    }
  }
}
