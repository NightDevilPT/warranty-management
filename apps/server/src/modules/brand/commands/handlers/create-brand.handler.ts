// src/modules/brand/commands/handlers/create-brand.handler.ts
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
    const { dto, userId } = command;

    // Generate slug from name
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    this.logger.log('Executing CreateBrandCommand', undefined, {
      name: dto.name,
      slug,
      orgId: dto.orgId,
    });

    try {
      // 1. Check if organization exists
      const organization = await this.prisma.organization.findUnique({
        where: { id: dto.orgId },
      });

      if (!organization) {
        throw this.errorService.notFound('Organization not found');
      }

      // 2. Check for existing brand with same slug in org
      const existing = await this.prisma.brand.findUnique({
        where: {
          orgId_slug: {
            orgId: dto.orgId,
            slug: slug,
          },
        },
      });

      if (existing) {
        throw this.errorService.conflict(
          `Brand with name "${dto.name}" already exists in this organization`,
        );
      }

      // 3. Create brand
      const result = await this.prisma.brand.create({
        data: {
          name: dto.name,
          slug: slug,
          description: dto.description,
          website: dto.website,
          orgId: dto.orgId,
          createdBy: userId,
          updatedBy: userId,
        },
        include: {
          organization: {
            select: { name: true },
          },
        },
      });

      this.logger.log('Brand created successfully', undefined, {
        id: result.id,
        name: result.name,
      });

      return BrandResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create brand', error.stack, undefined, {
        name: dto.name,
        orgId: dto.orgId,
      });
      throw this.errorService.internalServerError('Failed to create brand', {
        cause: error,
      });
    }
  }
}
