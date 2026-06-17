// src/modules/branch/commands/handlers/update-branch.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBranchCommand } from '../impl/update-branch.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';

@CommandHandler(UpdateBranchCommand)
export class UpdateBranchHandler
  implements ICommandHandler<UpdateBranchCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UpdateBranchHandler.name);
  }

  async execute(
    command: UpdateBranchCommand,
  ): Promise<OrganizationResponseDto> {
    const { branchId, dto, userId } = command;

    this.logger.log('Executing UpdateBranchCommand', undefined, {
      branchId,
      updates: Object.keys(dto),
    });

    try {
      // 1. Check if branch exists and is a BRANCH type
      const existingBranch = await this.prisma.organization.findUnique({
        where: { id: branchId },
      });

      if (!existingBranch) {
        throw this.errorService.notFound('Branch not found');
      }

      if (existingBranch.type !== 'BRANCH') {
        throw this.errorService.badRequest(
          'Can only update BRANCH type organizations',
        );
      }

      // 2. If name is being updated, check slug uniqueness
      let slug = existingBranch.slug;
      if (dto.name) {
        slug = dto.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        const slugConflict = await this.prisma.organization.findUnique({
          where: { slug },
        });

        if (slugConflict && slugConflict.id !== branchId) {
          throw this.errorService.conflict(
            `Organization with slug "${slug}" already exists`,
          );
        }
      }

      // 3. Prepare update data
      const updateData: any = {
        updatedBy: userId,
      };

      if (dto.name !== undefined) {
        updateData.name = dto.name;
        updateData.slug = slug;
      }
      if (dto.companyName !== undefined)
        updateData.companyName = dto.companyName;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.logo !== undefined) updateData.logo = dto.logo;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      // 4. Update branch
      const branch = await this.prisma.organization.update({
        where: { id: branchId },
        data: updateData,
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

      this.logger.log('Branch updated successfully', undefined, {
        branchId: branch.id,
        slug: branch.slug,
      });

      return OrganizationResponseDto.fromEntity(branch);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update branch', error.stack, undefined, {
        branchId,
      });
      throw this.errorService.internalServerError('Failed to update branch', {
        cause: error,
      });
    }
  }
}
