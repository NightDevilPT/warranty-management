// src/modules/branch/commands/handlers/create-branch.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBranchCommand } from '../impl/create-branch.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(CreateBranchCommand)
export class CreateBranchHandler
  implements ICommandHandler<CreateBranchCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(CreateBranchHandler.name);
  }

  async execute(
    command: CreateBranchCommand,
  ): Promise<OrganizationResponseDto> {
    const { parentOrgId, dto, userId } = command;

    this.logger.log('Executing CreateBranchCommand', undefined, {
      parentOrgId,
      branchName: dto.name,
    });

    try {
      // 1. Find parent organization by ID (more efficient than slug lookup)
      const parentOrg = await this.prisma.organization.findUnique({
        where: { id: parentOrgId },
        include: {
          root: true,
        },
      });

      if (!parentOrg) {
        throw this.errorService.notFound(
          `Parent organization with ID "${parentOrgId}" not found`,
        );
      }

      // 2. Verify parent is active
      if (!parentOrg.isActive) {
        throw this.errorService.badRequest(
          'Cannot create branch under inactive organization',
        );
      }

      // 3. Generate slug from name
      const slug =
        dto.slug ||
        dto.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

      // 4. Check slug uniqueness (more efficient with unique constraint)
      const existingSlug = await this.prisma.organization.findUnique({
        where: { slug },
        select: { id: true }, // Only select id for efficiency
      });

      if (existingSlug) {
        throw this.errorService.conflict(
          `Organization with slug "${slug}" already exists`,
        );
      }

      // 5. Determine root organization
      const rootId =
        parentOrg.type === 'ROOT' ? parentOrg.id : parentOrg.rootId;

      if (!rootId) {
        throw this.errorService.internalServerError(
          'Could not determine root organization for branch',
        );
      }

      // 6. Create branch organization
      const branch = await this.prisma.organization.create({
        data: {
          name: dto.name,
          companyName: dto.companyName,
          slug: slug,
          type: 'BRANCH',
          rootId: rootId,
          parentId: parentOrg.id,
          logo: dto.logo,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          root: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              children: true,
              userAccesses: true,
            },
          },
        },
      });

      this.logger.log('Branch created successfully', undefined, {
        branchId: branch.id,
        parentOrgId,
        slug: branch.slug,
      });

      return OrganizationResponseDto.fromEntity(branch);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create branch', error.stack, undefined, {
        parentOrgId,
        branchName: dto.name,
      });
      throw this.errorService.internalServerError('Failed to create branch', {
        cause: error,
      });
    }
  }
}
