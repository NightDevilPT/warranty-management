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
import {
  CategoryDetailDto,
  CategoryResponseDto,
  CategoryTreeResponseDto,
} from 'src/modules/shared/categories/dto/category-response.dto';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { CategoriesService } from 'src/modules/shared/categories/categories.service';
import { CreateCategoryDto } from 'src/modules/shared/categories/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/shared/categories/dto/update-category.dto';

@ApiTags('Admin - Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('organizations/:orgId')
  @ApiOperation({ summary: 'Create a category for an organization' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization or parent not found' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateCategoryDto,
    @Req() req: any,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto, orgId, req.user.id);
  }

  @Get('organizations/:orgId/tree')
  @ApiOperation({ summary: 'Get category hierarchy as nested tree' })
  @ApiResponse({
    status: 200,
    description: 'Category tree',
    type: CategoryTreeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getTree(
    @Param('orgId') orgId: string,
  ): Promise<CategoryTreeResponseDto> {
    return this.categoriesService.getTree(orgId);
  }

  @Get()
  @ApiOperation({ summary: 'List categories (all or filtered by orgId)' })
  @ApiQuery({
    name: 'orgId',
    required: false,
    type: String,
    description:
      'Optional - filter by organization ID. If not provided, returns all categories.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'deleted'],
  })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Categories list' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async findAll(
    @Query('orgId') orgId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.categoriesService.findAll(
      orgId,
      page,
      limit,
      search,
      status,
      parentId,
    );
  }

  @Get('organizations/:orgId/:id')
  @ApiOperation({
    summary: 'Get category details with breadcrumb and children',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findById(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ): Promise<CategoryDetailDto> {
    return this.categoriesService.findById(id, orgId);
  }

  @Patch('organizations/:orgId/:id')
  @ApiOperation({ summary: 'Update category details' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot move under own child' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  async update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: any,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto, orgId, req.user.id);
  }

  @Delete('organizations/:orgId/:id')
  @ApiOperation({
    summary: 'Soft delete category (children become root-level)',
  })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    return this.categoriesService.remove(id, orgId, req.user.id);
  }
}
