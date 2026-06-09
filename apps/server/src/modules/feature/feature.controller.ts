import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { FeatureService } from './feature.service';
import { UpdateFeatureStatusDto } from './dto/update-feature-status.dto';
import { FeatureResponseDto } from './dto/feature-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@ApiTags('Admin - Features')
@Controller('admin/features')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature/module' })
  @ApiResponse({
    status: 201,
    description: 'Feature created',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Feature code already exists' })
  @ApiBody({ type: CreateFeatureDto })
  async create(@Body() dto: CreateFeatureDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not found in request');
    }
    return this.featureService.create(dto, userId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get full feature tree hierarchy' })
  @ApiResponse({
    status: 200,
    description: 'Feature tree',
    type: [FeatureResponseDto],
  })
  async getTree() {
    return this.featureService.getTree();
  }

  @Get()
  @ApiOperation({ summary: 'List features (search, paginate)' })
  @ApiResponse({ status: 200, description: 'Features listed' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or code',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['COMING_SOON', 'ENABLED', 'DISABLED'],
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter by parent ID (null for root)',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.featureService.findAll(page, limit, search, status, parentId);
  }

  @Get(':featureId')
  @ApiOperation({ summary: 'Get feature by ID with children' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature found',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('featureId') featureId: string) {
    return this.featureService.findById(featureId);
  }

  @Patch(':featureId')
  @ApiOperation({ summary: 'Update feature' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature updated',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBody({ type: UpdateFeatureDto })
  async update(
    @Param('featureId') featureId: string,
    @Body() dto: UpdateFeatureDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not found in request');
    }
    return this.featureService.update(featureId, dto, userId);
  }

  @Patch(':featureId/status')
  @ApiOperation({ summary: 'Update feature status' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Status updated',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBody({ type: UpdateFeatureStatusDto })
  async updateStatus(
    @Param('featureId') featureId: string,
    @Body() dto: UpdateFeatureStatusDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not found in request');
    }
    return this.featureService.updateStatus(featureId, dto, userId);
  }
}
