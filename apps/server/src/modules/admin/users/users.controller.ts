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
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeDealerTypeDto } from './dto/change-dealer-type.dto';
import {
  UserDetailDto,
  InviteUserResponseDto,
  UserPermissionsResponseDto,
  ChangeDealerTypeResponseDto,
} from './dto/user-response.dto';
import { UserRole } from 'generated/prisma/enums';

@ApiTags('Admin - Users')
@Controller('admin/organizations/:orgId/users')
@UseGuards(JwtAuthGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Invite a user to an organization' })
  @ApiBody({ type: InviteUserDto })
  @ApiResponse({
    status: 201,
    description: 'User invited',
    type: InviteUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({
    status: 404,
    description: 'Organization or dealer type not found',
  })
  @ApiResponse({ status: 409, description: 'User already has access' })
  async invite(
    @Param('orgId') orgId: string,
    @Body() dto: InviteUserDto,
    @Req() req: any,
  ): Promise<InviteUserResponseDto> {
    return this.usersService.invite(dto, orgId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all users in an organization' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'dealerTypeId', required: false, type: String })
  @ApiQuery({
    name: 'partnerType',
    required: false,
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'deleted'],
  })
  @ApiResponse({ status: 200, description: 'Users list' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('dealerTypeId') dealerTypeId?: string,
    @Query('partnerType') partnerType?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll(
      orgId,
      page,
      limit,
      search,
      role,
      dealerTypeId,
      partnerType,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details with permissions' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ): Promise<UserDetailDto> {
    return this.usersService.findById(id, orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user access details' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.update(id, dto, orgId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove user from organization (soft delete)' })
  @ApiResponse({ status: 200, description: 'User removed' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    return this.usersService.remove(id, orgId, req.user.id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'View effective permissions for a user' })
  @ApiResponse({
    status: 200,
    description: 'User permissions',
    type: UserPermissionsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPermissions(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
  ): Promise<UserPermissionsResponseDto> {
    return this.usersService.getPermissions(id, orgId);
  }

  @Patch(':id/dealer-type')
  @ApiOperation({ summary: 'Change user dealer type' })
  @ApiBody({ type: ChangeDealerTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Dealer type changed',
    type: ChangeDealerTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'User or dealer type not found' })
  async changeDealerType(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: ChangeDealerTypeDto,
    @Req() req: any,
  ): Promise<ChangeDealerTypeResponseDto> {
    return this.usersService.changeDealerType(id, dto, orgId, req.user.id);
  }
}
