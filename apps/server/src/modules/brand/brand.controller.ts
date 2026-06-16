// src/modules/brand/brand.controller.ts
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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UploadBrandLogoDto } from './dto/upload-brand-logo.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Brands')
@ApiBearerAuth()
@Controller('admin/brands')
@UseGuards(JwtAuthGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({
    status: 409,
    description: 'Brand already exists in organization',
  })
  @ApiBody({ type: CreateBrandDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBrandDto, @Req() req: any) {
    return this.brandService.create(dto, req.user?.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'List all brands with pagination and search' })
  @ApiResponse({ status: 200, description: 'Brands listed successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, description, or slug',
  })
  @ApiQuery({
    name: 'orgId',
    required: false,
    type: String,
    description: 'Filter by organization ID',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('orgId') orgId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.brandService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      orgId,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Get(':brandId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiParam({ name: 'brandId', description: 'Brand UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Brand found',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findById(@Param('brandId') id: string) {
    return this.brandService.findById(id);
  }

  @Patch(':brandId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update brand details' })
  @ApiParam({ name: 'brandId', description: 'Brand UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({
    status: 409,
    description: 'Brand name conflict in organization',
  })
  @ApiBody({ type: UpdateBrandDto })
  async update(
    @Param('brandId') id: string,
    @Body() dto: UpdateBrandDto,
    @Req() req: any,
  ) {
    return this.brandService.update(id, dto, req.user?.id);
  }

  @Post(':brandId/logo')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload brand logo' })
  @ApiParam({ name: 'brandId', description: 'Brand UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded successfully',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadBrandLogoDto })
  async uploadLogo(
    @Param('brandId') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.brandService.uploadLogo(id, file, req.user?.id);
  }

  @Delete(':brandId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete brand' })
  @ApiParam({ name: 'brandId', description: 'Brand UUID', type: String })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete brand with associated products',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('brandId') id: string, @Req() req: any) {
    return this.brandService.delete(id, req.user?.id);
  }
}
