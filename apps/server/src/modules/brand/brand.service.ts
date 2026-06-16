// src/modules/brand/brand.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandCommand } from './commands/impl/create-brand.command';
import { UpdateBrandCommand } from './commands/impl/update-brand.command';
import { UploadBrandLogoCommand } from './commands/impl/upload-brand-logo.command';
import { DeleteBrandCommand } from './commands/impl/delete-brand.command';
import { GetBrandQuery } from './queries/impl/get-brand.query';
import { ListBrandsQuery } from './queries/impl/list-brands.query';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateBrandDto, userId: string): Promise<BrandResponseDto> {
    return this.commandBus.execute(new CreateBrandCommand(dto, userId));
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    orgId?: string,
    isActive?: boolean,
  ) {
    return this.queryBus.execute(
      new ListBrandsQuery(page, limit, search, orgId, isActive),
    );
  }

  async findById(id: string): Promise<BrandResponseDto> {
    return this.queryBus.execute(new GetBrandQuery(id));
  }

  async update(
    id: string,
    dto: UpdateBrandDto,
    userId: string,
  ): Promise<BrandResponseDto> {
    return this.commandBus.execute(new UpdateBrandCommand(id, dto, userId));
  }

  async uploadLogo(
    id: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<BrandResponseDto> {
    return this.commandBus.execute(
      new UploadBrandLogoCommand(id, file, userId),
    );
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    return this.commandBus.execute(new DeleteBrandCommand(id, userId));
  }
}
