import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data',
    type: DashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getDashboard(): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard();
  }
}
