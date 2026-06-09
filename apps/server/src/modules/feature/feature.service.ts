import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateFeatureStatusDto } from './dto/update-feature-status.dto';
import { CreateFeatureCommand } from './commands/impl/create-feature.command';
import { UpdateFeatureCommand } from './commands/impl/update-feature.command';
import { UpdateFeatureStatusCommand } from './commands/impl/update-feature-status.command';
import { GetFeatureQuery } from './queries/impl/get-feature.query';
import { ListFeaturesQuery } from './queries/impl/list-features.query';
import { GetFeatureTreeQuery } from './queries/impl/get-feature-tree.query';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@Injectable()
export class FeatureService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateFeatureDto, adminId: string) {
    return this.commandBus.execute(new CreateFeatureCommand(dto, adminId));
  }

  async getTree() {
    return this.queryBus.execute(new GetFeatureTreeQuery());
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    parentId?: string,
  ) {
    return this.queryBus.execute(
      new ListFeaturesQuery(page, limit, search, status, parentId),
    );
  }

  async findById(featureId: string) {
    return this.queryBus.execute(new GetFeatureQuery(featureId));
  }

  async update(featureId: string, dto: UpdateFeatureDto, adminId: string) {
    return this.commandBus.execute(
      new UpdateFeatureCommand(featureId, dto, adminId),
    );
  }

  async updateStatus(
    featureId: string,
    dto: UpdateFeatureStatusDto,
    adminId: string,
  ) {
    return this.commandBus.execute(
      new UpdateFeatureStatusCommand(featureId, dto, adminId),
    );
  }
}
