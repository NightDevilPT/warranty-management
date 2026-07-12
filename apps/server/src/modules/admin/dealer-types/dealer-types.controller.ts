import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Put,
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
import { DealerTypesService } from './dealer-types.service';
import { CreateDealerTypeDto } from './dto/create-dealer-type.dto';
import { UpdateDealerTypeDto } from './dto/update-dealer-type.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import {
  DealerTypeResponseDto,
  DealerTypeDetailDto,
  PermissionsResponseDto,
  UpdatePermissionsResponseDto,
} from './dto/dealer-type-response.dto';

@ApiTags('Admin - Dealer Types')
@Controller('admin/organizations/:orgId/dealer-types')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DealerTypesController {
  constructor(private readonly dealerTypesService: DealerTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a role template for an organization' })
  @ApiBody({ type: CreateDealerTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Dealer type created',
    type: DealerTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 409,
    description: 'Dealer type with this name already exists',
  })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateDealerTypeDto,
    @Req() req: any,
  ): Promise<DealerTypeResponseDto> {
    return this.dealerTypesService.create(dto, orgId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List role templates for an organization' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'partnerType',
    required: false,
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @ApiResponse({ status: 200, description: 'Dealer types list' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('partnerType') partnerType?: string,
  ) {
    return this.dealerTypesService.findAll(
      orgId,
      page,
      limit,
      search,
      partnerType,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dealer type details with features and users' })
  @ApiResponse({
    status: 200,
    description: 'Dealer type details',
    type: DealerTypeDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  async findById(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ): Promise<DealerTypeDetailDto> {
    return this.dealerTypesService.findById(id, orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dealer type details' })
  @ApiBody({ type: UpdateDealerTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Dealer type updated',
    type: DealerTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  @ApiResponse({
    status: 409,
    description: 'Dealer type with this name already exists',
  })
  async update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDealerTypeDto,
    @Req() req: any,
  ): Promise<DealerTypeResponseDto> {
    return this.dealerTypesService.update(id, dto, orgId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete dealer type' })
  @ApiResponse({ status: 200, description: 'Dealer type deleted' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  async remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    return this.dealerTypesService.remove(id, orgId, req.user.id);
  }

  @Get(':id/permissions')
  @ApiOperation({
    summary: 'View features assigned to this role, grouped by module',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions list',
    type: PermissionsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  async getPermissions(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ): Promise<PermissionsResponseDto> {
    return this.dealerTypesService.getPermissions(id, orgId);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Replace entire feature set for this role' })
  @ApiBody({ type: UpdatePermissionsDto })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated',
    type: UpdatePermissionsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid features' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  async updatePermissions(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
    @Req() req: any,
  ): Promise<UpdatePermissionsResponseDto> {
    return this.dealerTypesService.updatePermissions(
      id,
      dto,
      orgId,
      req.user.id,
    );
  }
}
