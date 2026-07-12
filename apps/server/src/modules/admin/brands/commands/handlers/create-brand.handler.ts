import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBrandCommand } from '../impl/create-brand.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { BrandResponseDto } from '../../dto/brand-response.dto';

@CommandHandler(CreateBrandCommand)
export class CreateBrandHandler implements ICommandHandler<CreateBrandCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(CreateBrandHandler.name);
  }

  async execute(command: CreateBrandCommand): Promise<BrandResponseDto> {
    const { dto, orgId, userId } = command;

    try {
      // Verify organization exists
      const organization = await this.prisma.organization.findFirst({
        where: { id: orgId, deletedAt: null },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // Generate slug from name
      const slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check uniqueness among active records in this org
      const existing = await this.prisma.brand.findFirst({
        where: { orgId, slug, deletedAt: null },
      });

      if (existing) {
        throw this.errorService.conflict('Brand with this name already exists');
      }

      const brand = await this.prisma.brand.create({
        data: {
          orgId,
          name: dto.name,
          slug,
          description: dto.description,
          logo: dto.logo,
          website: dto.website,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('Brand created', undefined, {
        id: brand.id,
        orgId,
        name: dto.name,
      });
      return BrandResponseDto.fromEntity(brand);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create brand', error.stack);
      throw this.errorService.internalServerError('Failed to create brand');
    }
  }
}
