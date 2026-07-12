import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';
import { InviteSuperAdminDto } from './dto/invite-super-admin.dto';
import {
  OrganizationResponseDto,
  OrganizationDetailDto,
  StatusResponseDto,
  InviteSuperAdminResponseDto,
} from './dto/organization-response.dto';

@ApiTags('Admin - Organizations')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({
    status: 201,
    description: 'Organization created',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({
    status: 409,
    description: 'Organization with this slug already exists',
  })
  async create(
    @Body() dto: CreateOrganizationDto,
    @Req() req: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['ROOT', 'BRANCH'] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'disabled', 'deleted'],
  })
  @ApiResponse({ status: 200, description: 'Organizations retrieved' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.organizationsService.findAll(page, limit, search, type, status);
  }

  @Get(':orgId')
  @ApiOperation({
    summary: 'Get organization details with hierarchy and stats',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization details',
    type: OrganizationDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findById(
    @Param('orgId') orgId: string,
  ): Promise<OrganizationDetailDto> {
    return this.organizationsService.findById(orgId);
  }

  @Patch(':orgId')
  @ApiOperation({ summary: 'Update organization details' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({
    status: 200,
    description: 'Organization updated',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 409,
    description: 'Organization with this slug already exists',
  })
  async update(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
    @Req() req: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.update(orgId, dto, req.user.id);
  }

  @Patch(':orgId/status')
  @ApiOperation({
    summary: 'Manage organization status (activate/deactivate/soft-delete)',
  })
  @ApiBody({ type: UpdateOrganizationStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Status updated',
    type: StatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updateStatus(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationStatusDto,
    @Req() req: any,
  ): Promise<StatusResponseDto> {
    return this.organizationsService.updateStatus(orgId, dto, req.user.id);
  }

  @Post(':orgId/invite-super-admin')
  @ApiOperation({
    summary: 'Invite COMPANY_SUPER_ADMIN to manage this organization',
  })
  @ApiBody({ type: InviteSuperAdminDto })
  @ApiResponse({
    status: 201,
    description: 'Super admin invited',
    type: InviteSuperAdminResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 409,
    description: 'User already has access to this organization',
  })
  async inviteSuperAdmin(
    @Param('orgId') orgId: string,
    @Body() dto: InviteSuperAdminDto,
    @Req() req: any,
  ): Promise<InviteSuperAdminResponseDto> {
    return this.organizationsService.inviteSuperAdmin(orgId, dto, req.user.id);
  }

  @Post(':orgId/logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload organization logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Logo file (jpg, png, svg)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'File is required' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 413, description: 'File too large' })
  @ApiResponse({ status: 500, description: 'Failed to upload logo' })
  async uploadLogo(
    @Param('orgId') orgId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.uploadLogo(orgId, file, req.user.id);
  }
}
