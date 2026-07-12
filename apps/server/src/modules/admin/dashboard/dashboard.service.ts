import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { GetDashboardQuery } from './queries/impl/get-dashboard.query';

@Injectable()
export class DashboardService {
  constructor(private readonly queryBus: QueryBus) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    return this.queryBus.execute(new GetDashboardQuery());
  }
}
