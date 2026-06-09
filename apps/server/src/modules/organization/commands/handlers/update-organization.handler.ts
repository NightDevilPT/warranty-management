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
    const { orgId, dto, adminId } = command;
    console.log(adminId, ' ADMINID');
    this.logger.log('Executing UpdateOrganizationCommand', undefined, {
      orgId,
      adminId,
    });

    try {
      // Validate adminId
      if (!adminId) {
        throw this.errorService.badRequest('Admin user ID is required');
      }

      // Check if admin user exists
      const adminExists = await this.prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!adminExists) {
        throw this.errorService.notFound('Admin user not found');
      }

      // Check if organization exists
      const existingOrg = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!existingOrg) {
        throw this.errorService.notFound('Organization not found');
      }

      // Check slug uniqueness if being updated
      if (dto.slug && dto.slug !== existingOrg.slug) {
        const slugExists = await this.prisma.organization.findUnique({
          where: { slug: dto.slug },
        });

        if (slugExists) {
          throw this.errorService.conflict(
            'Organization with this slug already exists',
          );
        }
      }

      // Build update data (only include fields that are provided)
      const updateData: any = {
        updatedBy: adminId, // Validated admin ID
      };

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.companyName !== undefined)
        updateData.companyName = dto.companyName;
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      // Update organization
      const updatedOrg = await this.prisma.organization.update({
        where: { id: orgId },
        data: updateData,
      });

      this.logger.log('Organization updated successfully', undefined, {
        orgId,
        updatedBy: adminId,
      });

      return OrganizationResponseDto.fromEntity(updatedOrg);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update organization', error.stack);
      throw this.errorService.internalServerError(
        'Failed to update organization',
      );
    }
  }
}
