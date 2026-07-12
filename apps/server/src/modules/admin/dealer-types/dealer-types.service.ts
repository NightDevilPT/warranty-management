import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateDealerTypeDto } from './dto/create-dealer-type.dto';
import { UpdateDealerTypeDto } from './dto/update-dealer-type.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import {
  DealerTypeResponseDto,
  DealerTypeDetailDto,
  PermissionsResponseDto,
  UpdatePermissionsResponseDto,
} from './dto/dealer-type-response.dto';
import { CreateDealerTypeCommand } from './commands/impl/create-dealer-type.command';
import { UpdateDealerTypeCommand } from './commands/impl/update-dealer-type.command';
import { DeleteDealerTypeCommand } from './commands/impl/delete-dealer-type.command';
import { UpdatePermissionsCommand } from './commands/impl/update-permissions.command';
import { GetDealerTypeQuery } from './queries/impl/get-dealer-type.query';
import { ListDealerTypesQuery } from './queries/impl/list-dealer-types.query';
import { GetPermissionsQuery } from './queries/impl/get-permissions.query';

@Injectable()
export class DealerTypesService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(
    dto: CreateDealerTypeDto,
    orgId: string,
    userId: string,
  ): Promise<DealerTypeResponseDto> {
    return this.commandBus.execute(
      new CreateDealerTypeCommand(dto, orgId, userId),
    );
  }

  async findAll(
    orgId: string,
    page: number,
    limit: number,
    search?: string,
    partnerType?: string,
  ) {
    return this.queryBus.execute(
      new ListDealerTypesQuery(orgId, page, limit, search, partnerType),
    );
  }

  async findById(
    dealerTypeId: string,
    orgId: string,
  ): Promise<DealerTypeDetailDto> {
    return this.queryBus.execute(new GetDealerTypeQuery(dealerTypeId, orgId));
  }

  async update(
    dealerTypeId: string,
    dto: UpdateDealerTypeDto,
    orgId: string,
    userId: string,
  ): Promise<DealerTypeResponseDto> {
    return this.commandBus.execute(
      new UpdateDealerTypeCommand(dealerTypeId, dto, orgId, userId),
    );
  }

  async remove(
    dealerTypeId: string,
    orgId: string,
    userId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteDealerTypeCommand(dealerTypeId, orgId, userId),
    );
  }

  async getPermissions(
    dealerTypeId: string,
    orgId: string,
  ): Promise<PermissionsResponseDto> {
    return this.queryBus.execute(new GetPermissionsQuery(dealerTypeId, orgId));
  }

  async updatePermissions(
    dealerTypeId: string,
    dto: UpdatePermissionsDto,
    orgId: string,
    userId: string,
  ): Promise<UpdatePermissionsResponseDto> {
    return this.commandBus.execute(
      new UpdatePermissionsCommand(dealerTypeId, dto, orgId, userId),
    );
  }
}
