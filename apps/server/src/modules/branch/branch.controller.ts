// src/modules/branch/branch.controller.ts
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
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@ApiTags('Branches - Organization Hierarchy')
@ApiBearerAuth()
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post(':orgId/branches')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a child branch under an organization' })
  @ApiParam({
    name: 'orgId',
    description: 'Parent organization ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - COMPANY_SUPER_ADMIN only',
  })
  @ApiResponse({ status: 404, description: 'Parent organization not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiBody({ type: CreateBranchDto })
  @HttpCode(HttpStatus.CREATED)
  async createBranch(
    @Param('orgId') orgId: string,
    @Body() dto: CreateBranchDto,
    @Req() req: any,
  ) {
    return this.branchService.createBranch(orgId, dto, req.user?.id);
  }

  @Get(':orgId/branches')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'List branches under an organization' })
  @ApiParam({
    name: 'orgId',
    description: 'Parent organization ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Branches listed successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, company name, or slug',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  async listBranches(
    @Param('orgId') orgId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.branchService.listBranches(
      orgId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Get(':orgId/hierarchy')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get full organization hierarchy tree (root + branches)',
    description:
      'Returns the complete hierarchy tree starting from the root organization. If a branch ID is provided, it will find the root and return the full tree.',
  })
  @ApiParam({
    name: 'orgId',
    description: 'Organization ID (can be root or branch)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization hierarchy retrieved successfully',
  })
  @ApiQuery({
    name: 'depth',
    required: false,
    type: Number,
    description: 'Maximum depth of hierarchy tree (default: 3)',
    example: 3,
  })
  async getHierarchy(
    @Param('orgId') orgId: string,
    @Query('depth') depth?: string,
  ) {
    return this.branchService.getHierarchy(
      orgId,
      depth ? parseInt(depth, 10) : undefined,
    );
  }

  @Get('branches/:branchId')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiParam({
    name: 'branchId',
    description: 'Branch organization ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch found',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  async getBranch(@Param('branchId') branchId: string) {
    return this.branchService.getBranch(branchId);
  }

  @Patch('branches/:branchId')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Update branch details' })
  @ApiParam({
    name: 'branchId',
    description: 'Branch organization ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch updated successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiBody({ type: UpdateBranchDto })
  async updateBranch(
    @Param('branchId') branchId: string,
    @Body() dto: UpdateBranchDto,
    @Req() req: any,
  ) {
    return this.branchService.updateBranch(branchId, dto, req.user?.id);
  }

  @Post('branches/:branchId/logo')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload branch logo' })
  @ApiParam({
    name: 'branchId',
    description: 'Branch organization ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiConsumes('multipart/form-data')
  async uploadLogo(
    @Param('branchId') branchId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.branchService.uploadLogo(branchId, file, req.user?.id);
  }
}
