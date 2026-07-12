import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponseDto,
  CategoryDetailDto,
  CategoryTreeResponseDto,
} from './dto/category-response.dto';
import { CreateCategoryCommand } from './commands/impl/create-category.command';
import { UpdateCategoryCommand } from './commands/impl/update-category.command';
import { DeleteCategoryCommand } from './commands/impl/delete-category.command';
import { GetCategoryQuery } from './queries/impl/get-category.query';
import { ListCategoriesQuery } from './queries/impl/list-categories.query';
import { GetCategoryTreeQuery } from './queries/impl/get-category-tree.query';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(
    dto: CreateCategoryDto,
    orgId: string,
    userId: string,
  ): Promise<CategoryResponseDto> {
    return this.commandBus.execute(
      new CreateCategoryCommand(dto, orgId, userId),
    );
  }

  async getTree(orgId: string): Promise<CategoryTreeResponseDto> {
    return this.queryBus.execute(new GetCategoryTreeQuery(orgId));
  }

  async findAll(
    orgId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string,
    parentId?: string,
  ) {
    return this.queryBus.execute(
      new ListCategoriesQuery(orgId, page, limit, search, status, parentId),
    );
  }

  async findById(
    categoryId: string,
    orgId: string,
  ): Promise<CategoryDetailDto> {
    return this.queryBus.execute(new GetCategoryQuery(categoryId, orgId));
  }

  async update(
    categoryId: string,
    dto: UpdateCategoryDto,
    orgId: string,
    userId: string,
  ): Promise<CategoryResponseDto> {
    return this.commandBus.execute(
      new UpdateCategoryCommand(categoryId, dto, orgId, userId),
    );
  }

  async remove(
    categoryId: string,
    orgId: string,
    userId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteCategoryCommand(categoryId, orgId, userId),
    );
  }
}
