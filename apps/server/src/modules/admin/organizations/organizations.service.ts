import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';
import { InviteSuperAdminDto } from './dto/invite-super-admin.dto';
import {
  OrganizationResponseDto,
  OrganizationDetailDto,
  StatusResponseDto,
  InviteSuperAdminResponseDto,
} from './dto/organization-response.dto';
import { CreateOrganizationCommand } from './commands/impl/create-organization.command';
import { UpdateOrganizationCommand } from './commands/impl/update-organization.command';
import { UpdateOrganizationStatusCommand } from './commands/impl/update-organization-status.command';
import { InviteSuperAdminCommand } from './commands/impl/invite-super-admin.command';
import { UploadOrganizationLogoCommand } from './commands/impl/upload-organization-logo.command';
import { GetOrganizationQuery } from './queries/impl/get-organization.query';
import { ListOrganizationsQuery } from './queries/impl/list-organizations.query';
import { GetOrganizationOptionsQuery } from './queries/impl/get-organization-options.query';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(
    dto: CreateOrganizationDto,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(new CreateOrganizationCommand(dto, userId));
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    type?: string,
    status?: string,
  ) {
    return this.queryBus.execute(
      new ListOrganizationsQuery(page, limit, search, type, status),
    );
  }

  async getOptions(search?: string) {
    return this.queryBus.execute(new GetOrganizationOptionsQuery(search));
  }

  async findById(orgId: string): Promise<OrganizationDetailDto> {
    return this.queryBus.execute(new GetOrganizationQuery(orgId));
  }

  async update(
    orgId: string,
    dto: UpdateOrganizationDto,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(
      new UpdateOrganizationCommand(orgId, dto, userId),
    );
  }

  async updateStatus(
    orgId: string,
    dto: UpdateOrganizationStatusDto,
    userId: string,
  ): Promise<StatusResponseDto> {
    return this.commandBus.execute(
      new UpdateOrganizationStatusCommand(orgId, dto, userId),
    );
  }

  async inviteSuperAdmin(
    orgId: string,
    dto: InviteSuperAdminDto,
    userId: string,
  ): Promise<InviteSuperAdminResponseDto> {
    return this.commandBus.execute(
      new InviteSuperAdminCommand(orgId, dto, userId),
    );
  }

  async uploadLogo(
    orgId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(
      new UploadOrganizationLogoCommand(orgId, file, userId),
    );
  }
}
