import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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
import { BrandsService } from 'src/modules/shared/brands/brands.service';
import {
  BrandDetailDto,
  BrandResponseDto,
} from 'src/modules/shared/brands/dto/brand-response.dto';
import { CreateBrandDto } from 'src/modules/shared/brands/dto/create-brand.dto';
import { UpdateBrandDto } from 'src/modules/shared/brands/dto/update-brand.dto';

@ApiTags('Admin - Brands')
@Controller('admin/brands')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post('organizations/:orgId')
  @ApiOperation({ summary: 'Create a brand for an organization' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({
    status: 201,
    description: 'Brand created',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 409,
    description: 'Brand with this name already exists',
  })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateBrandDto,
    @Req() req: any,
  ): Promise<BrandResponseDto> {
    return this.brandsService.create(dto, orgId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List brands (all or filtered by orgId)' })
  @ApiQuery({
    name: 'orgId',
    required: false,
    type: String,
    description:
      'Optional - filter by organization ID. If not provided, returns all brands.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'deleted'],
  })
  @ApiResponse({ status: 200, description: 'Brands list' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async findAll(
    @Query('orgId') orgId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.brandsService.findAll(orgId, page, limit, search, status);
  }

  @Get('organizations/:orgId/:id')
  @ApiOperation({ summary: 'Get brand details with product count' })
  @ApiResponse({
    status: 200,
    description: 'Brand details',
    type: BrandDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findById(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ): Promise<BrandDetailDto> {
    return this.brandsService.findById(id, orgId);
  }

  @Patch('organizations/:orgId/:id')
  @ApiOperation({ summary: 'Update brand details' })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({
    status: 200,
    description: 'Brand updated',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({
    status: 409,
    description: 'Brand with this name already exists',
  })
  async update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @Req() req: any,
  ): Promise<BrandResponseDto> {
    return this.brandsService.update(id, dto, orgId, req.user.id);
  }

  @Delete('organizations/:orgId/:id')
  @ApiOperation({ summary: 'Soft delete a brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    return this.brandsService.remove(id, orgId, req.user.id);
  }
}
