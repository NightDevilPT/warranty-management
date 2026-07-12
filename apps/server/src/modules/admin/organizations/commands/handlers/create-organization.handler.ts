import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from '../impl/create-organization.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';
import { v4 as uuidv4 } from 'uuid';

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
    const { dto, userId } = command;

    try {
      // Check slug uniqueness among active records
      const existing = await this.prisma.organization.findFirst({
        where: { slug: dto.slug, deletedAt: null },
      });

      if (existing) {
        throw this.errorService.conflict(
          'Organization with this slug already exists',
        );
      }

      const hash = uuidv4().substring(0, 8);

      const organization = await this.prisma.organization.create({
        data: {
          name: dto.name,
          companyName: dto.companyName,
          slug: dto.slug,
          hash,
          type: dto.type || 'ROOT',
          logo: dto.logo,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('Organization created', undefined, {
        id: organization.id,
        slug: dto.slug,
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
