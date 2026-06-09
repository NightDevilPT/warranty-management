import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './commands/impl/create-category.command';
import { UpdateCategoryCommand } from './commands/impl/update-category.command';
import { DeleteCategoryCommand } from './commands/impl/delete-category.command';
import { GetCategoryQuery } from './queries/impl/get-category.query';
import { ListCategoriesQuery } from './queries/impl/list-categories.query';
import { GetCategoryTreeQuery } from './queries/impl/get-category-tree.query';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateCategoryDto, userId: string) {
    return this.commandBus.execute(new CreateCategoryCommand(dto, userId));
  }

  async getTree(orgId: string) {
    return this.queryBus.execute(new GetCategoryTreeQuery(orgId));
  }

  async findAll(
    page: number,
    limit: number,
    orgId?: string,
    search?: string,
    parentId?: string,
    isActive?: boolean,
  ) {
    return this.queryBus.execute(
      new ListCategoriesQuery(page, limit, orgId, search, parentId, isActive),
    );
  }

  async findById(categoryId: string) {
    return this.queryBus.execute(new GetCategoryQuery(categoryId));
  }

  async update(categoryId: string, dto: UpdateCategoryDto, userId: string) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(categoryId, dto, userId),
    );
  }

  async delete(categoryId: string, userId: string) {
    return this.commandBus.execute(
      new DeleteCategoryCommand(categoryId, userId),
    );
  }
}
