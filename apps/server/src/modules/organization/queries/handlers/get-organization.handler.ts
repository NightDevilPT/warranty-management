import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrganizationQuery } from '../impl/get-organization.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@QueryHandler(GetOrganizationQuery)
export class GetOrganizationHandler
  implements IQueryHandler<GetOrganizationQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetOrganizationHandler.name);
  }

  async execute(query: GetOrganizationQuery): Promise<OrganizationResponseDto> {
    this.logger.log('Executing GetOrganizationQuery', undefined, {
      orgId: query.orgId,
    });

    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: query.orgId },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      return OrganizationResponseDto.fromEntity(organization);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get organization', error.stack);
      throw this.errorService.internalServerError('Failed to get organization');
    }
  }
}
