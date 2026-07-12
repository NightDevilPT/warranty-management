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
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { FeaturesService } from './features.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { UpdateFeatureStatusDto } from './dto/update-feature-status.dto';
import {
  FeatureResponseDto,
  FeatureDetailDto,
  FeatureTreeResponseDto,
} from './dto/feature-response.dto';

@ApiTags('Admin - Features')
@Controller('admin/features')
@UseGuards(JwtAuthGuard, TenantGuard)
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feature (module or permission)' })
  @ApiBody({ type: CreateFeatureDto })
  @ApiResponse({
    status: 201,
    description: 'Feature created',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({
    status: 409,
    description: 'Feature with this code already exists',
  })
  async create(
    @Body() dto: CreateFeatureDto,
    @Req() req: any,
  ): Promise<FeatureResponseDto> {
    return this.featuresService.create(dto, req.user.id);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get complete feature hierarchy as nested tree' })
  @ApiResponse({
    status: 200,
    description: 'Feature tree',
    type: FeatureTreeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getTree(): Promise<FeatureTreeResponseDto> {
    return this.featuresService.getTree();
  }

  @Get()
  @ApiOperation({ summary: 'List all features with search and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ENABLED', 'DISABLED', 'COMING_SOON'],
  })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Features list' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.featuresService.findAll(page, limit, search, status, parentId);
  }

  @Get(':featureId')
  @ApiOperation({
    summary: 'Get feature details with children and assigned count',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature details',
    type: FeatureDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async findById(
    @Param('featureId') featureId: string,
  ): Promise<FeatureDetailDto> {
    return this.featuresService.findById(featureId);
  }

  @Patch(':featureId')
  @ApiOperation({ summary: 'Update feature metadata' })
  @ApiBody({ type: UpdateFeatureDto })
  @ApiResponse({
    status: 200,
    description: 'Feature updated',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  @ApiResponse({
    status: 409,
    description: 'Feature with this code already exists',
  })
  async update(
    @Param('featureId') featureId: string,
    @Body() dto: UpdateFeatureDto,
    @Req() req: any,
  ): Promise<FeatureResponseDto> {
    return this.featuresService.update(featureId, dto, req.user.id);
  }

  @Patch(':featureId/status')
  @ApiOperation({
    summary: 'Change feature status (ENABLED/DISABLED/COMING_SOON)',
  })
  @ApiBody({ type: UpdateFeatureStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Status updated',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async updateStatus(
    @Param('featureId') featureId: string,
    @Body() dto: UpdateFeatureStatusDto,
    @Req() req: any,
  ): Promise<FeatureResponseDto> {
    return this.featuresService.updateStatus(featureId, dto, req.user.id);
  }
}
