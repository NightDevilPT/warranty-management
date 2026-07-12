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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandResponseDto, BrandDetailDto } from './dto/brand-response.dto';

@ApiTags('Admin - Brands')
@Controller('admin/organizations/:orgId/brands')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
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
  @ApiOperation({ summary: 'List brands for an organization' })
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
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.brandsService.findAll(orgId, page, limit, search, status);
  }

  @Get(':id')
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

  @Patch(':id')
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

  @Delete(':id')
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
