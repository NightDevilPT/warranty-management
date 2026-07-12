import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { UpdateFeatureStatusDto } from './dto/update-feature-status.dto';
import {
  FeatureResponseDto,
  FeatureDetailDto,
  FeatureTreeResponseDto,
} from './dto/feature-response.dto';
import { CreateFeatureCommand } from './commands/impl/create-feature.command';
import { UpdateFeatureCommand } from './commands/impl/update-feature.command';
import { UpdateFeatureStatusCommand } from './commands/impl/update-feature-status.command';
import { GetFeatureQuery } from './queries/impl/get-feature.query';
import { ListFeaturesQuery } from './queries/impl/list-features.query';
import { GetFeatureTreeQuery } from './queries/impl/get-feature-tree.query';

@Injectable()
export class FeaturesService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(
    dto: CreateFeatureDto,
    userId: string,
  ): Promise<FeatureResponseDto> {
    return this.commandBus.execute(new CreateFeatureCommand(dto, userId));
  }

  async getTree(): Promise<FeatureTreeResponseDto> {
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

  async findById(featureId: string): Promise<FeatureDetailDto> {
    return this.queryBus.execute(new GetFeatureQuery(featureId));
  }

  async update(
    featureId: string,
    dto: UpdateFeatureDto,
    userId: string,
  ): Promise<FeatureResponseDto> {
    return this.commandBus.execute(
      new UpdateFeatureCommand(featureId, dto, userId),
    );
  }

  async updateStatus(
    featureId: string,
    dto: UpdateFeatureStatusDto,
    userId: string,
  ): Promise<FeatureResponseDto> {
    return this.commandBus.execute(
      new UpdateFeatureStatusCommand(featureId, dto, userId),
    );
  }
}
