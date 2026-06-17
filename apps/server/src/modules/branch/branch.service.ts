// src/modules/branch/branch.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { CreateBranchCommand } from './commands/impl/create-branch.command';
import { UpdateBranchCommand } from './commands/impl/update-branch.command';
import { UploadBranchLogoCommand } from './commands/impl/upload-branch-logo.command';
import { GetBranchQuery } from './queries/impl/get-branch.query';
import { ListBranchesQuery } from './queries/impl/list-branches.query';
import { GetHierarchyQuery } from './queries/impl/get-hierarchy.query';

@Injectable()
export class BranchService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createBranch(
    parentOrgId: string, // Changed from parentSlug
    dto: CreateBranchDto,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(
      new CreateBranchCommand(parentOrgId, dto, userId),
    );
  }

  async getBranch(branchId: string): Promise<OrganizationResponseDto> {
    return this.queryBus.execute(new GetBranchQuery(branchId));
  }

  async listBranches(
    parentOrgId: string, // Changed from parentSlug
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ) {
    return this.queryBus.execute(
      new ListBranchesQuery(parentOrgId, page, limit, search, isActive),
    );
  }

  async getHierarchy(orgId: string, depth?: number) {
    // Changed from slug
    return this.queryBus.execute(new GetHierarchyQuery(orgId, depth));
  }

  async updateBranch(
    branchId: string,
    dto: UpdateBranchDto,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(
      new UpdateBranchCommand(branchId, dto, userId),
    );
  }

  async uploadLogo(
    branchId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(
      new UploadBranchLogoCommand(branchId, file, userId),
    );
  }
}
