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
  HttpCode,
  HttpStatus,
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
import { CategoryService } from './category.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Admin - Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() dto: CreateCategoryDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.categoryService.create(dto, userId);
  }

  @Get('tree')
  @Roles(UserRole.ADMIN, UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Get category tree hierarchy' })
  @ApiQuery({ name: 'orgId', required: true, description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Category tree',
    type: [CategoryResponseDto],
  })
  async getTree(@Query('orgId') orgId: string) {
    return this.categoryService.getTree(orgId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'List categories (search, paginate)' })
  @ApiResponse({ status: 200, description: 'Categories listed' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'orgId',
    required: false,
    description: 'Filter by organization',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or description',
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter by parent (null for root)',
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('orgId') orgId?: string,
    @Query('search') search?: string,
    @Query('parentId') parentId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.categoryService.findAll(
      page,
      limit,
      orgId,
      search,
      parentId,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Get(':categoryId')
  @Roles(UserRole.ADMIN, UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Get category by ID with children' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('categoryId') categoryId: string) {
    return this.categoryService.findById(categoryId);
  }

  @Patch(':categoryId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBody({ type: UpdateCategoryDto })
  async update(
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    return this.categoryService.update(categoryId, dto, userId);
  }

  @Delete(':categoryId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete - has subcategories',
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  async delete(@Param('categoryId') categoryId: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.categoryService.delete(categoryId, userId);
  }
}
