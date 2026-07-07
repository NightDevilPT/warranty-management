import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateDealerTypeDto } from './dto/create-dealer-type.dto';
import { UpdateDealerTypeDto } from './dto/update-dealer-type.dto';
import { DealerTypeResponseDto } from './dto/dealer-type-response.dto';
import { CreateDealerTypeCommand } from './commands/impl/create-dealer-type.command';
import { UpdateDealerTypeCommand } from './commands/impl/update-dealer-type.command';
import { DeleteDealerTypeCommand } from './commands/impl/delete-dealer-type.command';
import { GetDealerTypeQuery } from './queries/impl/get-dealer-type.query';
import { ListDealerTypesQuery } from './queries/impl/list-dealer-types.query';

@Injectable()
export class DealerTypeService {
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

  async findById(
    dealerTypeId: string,
    orgId: string,
  ): Promise<DealerTypeResponseDto> {
    return this.queryBus.execute(new GetDealerTypeQuery(dealerTypeId, orgId));
  }

  async findAll(
    orgId: string,
    page: number,
    limit: number,
    search?: string,
    partnerType?: string,
    isActive?: boolean,
  ) {
    return this.queryBus.execute(
      new ListDealerTypesQuery(
        orgId,
        page,
        limit,
        search,
        partnerType,
        isActive,
      ),
    );
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

  async delete(
    dealerTypeId: string,
    orgId: string,
    userId: string,
  ): Promise<{ message: string }> {
    return this.commandBus.execute(
      new DeleteDealerTypeCommand(dealerTypeId, orgId, userId),
    );
  }
}
