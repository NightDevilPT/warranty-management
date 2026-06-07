// src/modules/organization/commands/handlers/create-organization.handler.ts
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
    const { dto } = command;
    this.logger.log('Executing CreateOrganizationCommand', undefined, {
      name: dto.name,
      slug: dto.slug,
    });

    try {
      // Check if slug already exists
      const existingSlug = await this.prisma.organization.findUnique({
        where: { slug: dto.slug.toLowerCase().trim() },
      });

      if (existingSlug) {
        throw this.errorService.conflict(
          `Organization with slug "${dto.slug}" already exists`,
        );
      }

      // Create organization
      const organization = await this.prisma.organization.create({
        data: {
          name: dto.name,
          companyName: dto.companyName,
          slug: dto.slug.toLowerCase().trim(),
          type: (dto.type as any) || 'ROOT',
          isActive: true,
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
