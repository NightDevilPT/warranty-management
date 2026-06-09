import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './commands/impl/create-organization.command';
import { UpdateOrganizationCommand } from './commands/impl/update-organization.command';
import { UploadLogoCommand } from './commands/impl/upload-logo.command';
import { GetOrganizationQuery } from './queries/impl/get-organization.query';
import { ListOrganizationsQuery } from './queries/impl/list-organizations.query';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateOrganizationDto, adminId: string) {
    return this.commandBus.execute(new CreateOrganizationCommand(dto, adminId));
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    type?: string,
    isActive?: boolean,
  ) {
    return this.queryBus.execute(
      new ListOrganizationsQuery(page, limit, search, type, isActive),
    );
  }

  async findById(orgId: string) {
    return this.queryBus.execute(new GetOrganizationQuery(orgId));
  }

  async update(orgId: string, dto: UpdateOrganizationDto, adminId: string) {
    return this.commandBus.execute(
      new UpdateOrganizationCommand(orgId, dto, adminId),
    );
  }

  async uploadLogo(orgId: string, file: Express.Multer.File) {
    return this.commandBus.execute(new UploadLogoCommand(orgId, file));
  }
}
