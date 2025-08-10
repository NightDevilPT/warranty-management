// src/modules/organization/organization.service.ts
import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/response-organization.dto';
import { CreateOrganizationCommand } from './commands/impl/create-organization.command';
import { UpdateOrganizationCommand } from './commands/impl/update-organization.command';

@Injectable()
export class OrganizationService {
  constructor(private readonly commandBus: CommandBus) {}

  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(
      new CreateOrganizationCommand(createOrganizationDto),
    );
  }

  async updateOrganization(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.commandBus.execute(
      new UpdateOrganizationCommand(id, updateOrganizationDto),
    );
  }
}
