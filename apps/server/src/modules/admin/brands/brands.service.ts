import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandResponseDto, BrandDetailDto } from './dto/brand-response.dto';
import { CreateBrandCommand } from './commands/impl/create-brand.command';
import { UpdateBrandCommand } from './commands/impl/update-brand.command';
import { DeleteBrandCommand } from './commands/impl/delete-brand.command';
import { GetBrandQuery } from './queries/impl/get-brand.query';
import { ListBrandsQuery } from './queries/impl/list-brands.query';

@Injectable()
export class BrandsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(
    dto: CreateBrandDto,
    orgId: string,
    userId: string,
  ): Promise<BrandResponseDto> {
    return this.commandBus.execute(new CreateBrandCommand(dto, orgId, userId));
  }

  async findAll(
    orgId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ) {
    return this.queryBus.execute(
      new ListBrandsQuery(orgId, page, limit, search, status),
    );
  }

  async findById(brandId: string, orgId: string): Promise<BrandDetailDto> {
    return this.queryBus.execute(new GetBrandQuery(brandId, orgId));
  }

  async update(
    brandId: string,
    dto: UpdateBrandDto,
    orgId: string,
    userId: string,
  ): Promise<BrandResponseDto> {
    return this.commandBus.execute(
      new UpdateBrandCommand(brandId, dto, orgId, userId),
    );
  }

  async remove(brandId: string, orgId: string, userId: string): Promise<void> {
    return this.commandBus.execute(
      new DeleteBrandCommand(brandId, orgId, userId),
    );
  }
}
