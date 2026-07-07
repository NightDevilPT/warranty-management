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
  ApiConsumes,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateDealerTypeDto } from './dto/create-dealer-type.dto';
import { UpdateDealerTypeDto } from './dto/update-dealer-type.dto';
import { DealerTypeResponseDto } from './dto/dealer-type-response.dto';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { DealerTypeService } from './dealer-types.service';

@ApiTags('Dealer Types')
@ApiBearerAuth()
@Controller('organizations/:orgId/dealer-types')
export class DealerTypeController {
  constructor(private readonly dealerTypeService: DealerTypeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new dealer type for the organization',
    description:
      'Creates a role template that can be assigned to users. COMPANY_SUPER_ADMIN and ADMIN can create dealer types.',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID', type: String })
  @ApiResponse({
    status: 201,
    description: 'Dealer type created successfully',
    type: DealerTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Dealer type with this name already exists',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: CreateDealerTypeDto })
  async create(
    @Param('orgId') orgId: string,
    @Req() req: any,
    @Body() dto: CreateDealerTypeDto,
  ) {
    const userId = req.user?.id;
    return this.dealerTypeService.create(dto, orgId, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF, UserRole.ADMIN)
  @ApiOperation({
    summary: 'List all dealer types in the organization',
    description: 'Returns paginated list with optional search and filters.',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Dealer types retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or description',
  })
  @ApiQuery({
    name: 'partnerType',
    required: false,
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Param('orgId') orgId: string,
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('partnerType') partnerType?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.dealerTypeService.findAll(
      orgId,
      page,
      limit,
      search,
      partnerType,
      isActive,
    );
  }

  @Get(':dealerTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get dealer type by ID',
    description: 'Returns detailed dealer type information with user count.',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID', type: String })
  @ApiParam({ name: 'dealerTypeId', description: 'Dealer Type UUID' })
  @ApiResponse({
    status: 200,
    description: 'Dealer type found',
    type: DealerTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  async findById(
    @Param('orgId') orgId: string,
    @Param('dealerTypeId') dealerTypeId: string,
    @Req() req: any,
  ) {
    return this.dealerTypeService.findById(dealerTypeId, orgId);
  }

  @Patch(':dealerTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update dealer type',
    description: 'Update name, description, partner type, or active status.',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID', type: String })
  @ApiParam({ name: 'dealerTypeId', description: 'Dealer Type UUID' })
  @ApiResponse({
    status: 200,
    description: 'Dealer type updated',
    type: DealerTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  @ApiResponse({ status: 409, description: 'Name conflict' })
  @ApiConsumes('application/json')
  @ApiBody({ type: UpdateDealerTypeDto })
  async update(
    @Param('orgId') orgId: string,
    @Param('dealerTypeId') dealerTypeId: string,
    @Req() req: any,
    @Body() dto: UpdateDealerTypeDto,
  ) {
    const userId = req.user?.id;
    return this.dealerTypeService.update(dealerTypeId, dto, orgId, userId);
  }

  @Delete(':dealerTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete dealer type',
    description: 'Deletes the dealer type. Fails if users are assigned to it.',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID', type: String })
  @ApiParam({ name: 'dealerTypeId', description: 'Dealer Type UUID' })
  @ApiResponse({ status: 200, description: 'Dealer type deleted' })
  @ApiResponse({ status: 404, description: 'Dealer type not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete - users assigned' })
  async delete(
    @Param('orgId') orgId: string,
    @Param('dealerTypeId') dealerTypeId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.dealerTypeService.delete(dealerTypeId, orgId, userId);
  }
}
