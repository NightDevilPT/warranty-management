import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from '../impl/create-organization.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler
  implements ICommandHandler<CreateOrganizationCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(CreateOrganizationHandler.name);
  }

  async execute(
    command: CreateOrganizationCommand,
  ): Promise<OrganizationResponseDto> {
    const { dto, adminId } = command;
    this.logger.log('Executing CreateOrganizationCommand', undefined, {
      name: dto.name,
    });

    try {
      // Generate slug if not provided
      const slug =
        dto.slug ||
        dto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      // Check slug uniqueness
      const existingOrg = await this.prisma.organization.findUnique({
        where: { slug },
      });

      if (existingOrg) {
        throw this.errorService.conflict(
          'Organization with this slug already exists',
        );
      }

      // Create ROOT organization
      const organization = await this.prisma.organization.create({
        data: {
          name: dto.name,
          companyName: dto.companyName,
          slug,
          type: 'ROOT',
          createdBy: adminId,
          updatedBy: adminId,
        },
      });

      this.logger.log('Organization created successfully', undefined, {
        orgId: organization.id,
        slug: organization.slug,
      });

      return OrganizationResponseDto.fromEntity(organization);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create organization', error.stack);
      throw this.errorService.internalServerError(
        'Failed to create organization',
      );
    }
  }
}
