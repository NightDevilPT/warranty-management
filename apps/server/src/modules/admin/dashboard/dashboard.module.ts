import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [DashboardController],
  providers: [DashboardService, ...DashboardQueryHandlers],
})
export class DashboardModule {}
