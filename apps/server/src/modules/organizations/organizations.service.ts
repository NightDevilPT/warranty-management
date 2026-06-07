// src/modules/organization/organization.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { CreateOrganizationCommand } from './commands/impl/create-organization.command';
import { ListOrganizationsQuery } from './queries/impl/list-organizations.query';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(new CreateOrganizationCommand(dto));
  }

  async findAll(page: number, limit: number, search?: string) {
    return this.queryBus.execute(
      new ListOrganizationsQuery(page, limit, search),
    );
  }
}
