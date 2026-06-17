// src/modules/org-user/org-user.controller.ts
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
import { OrgUserService } from './org-user.service';
import { AddUserDto } from './dto/add-user.dto';
import { OrgUserResponseDto } from './dto/org-user-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { UpdateOrgUserDto } from './dto/update-org-user.dto';

@ApiTags('Organization Users')
@ApiBearerAuth()
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrgUserController {
  constructor(private readonly orgUserService: OrgUserService) {}

  @Post(':orgId/users')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Add user to organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({
    status: 201,
    description: 'User added',
    type: OrgUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User or organization not found' })
  @ApiResponse({ status: 409, description: 'User already in organization' })
  @ApiBody({ type: AddUserDto })
  @HttpCode(HttpStatus.CREATED)
  async addUser(@Param('orgId') orgId: string, @Body() dto: AddUserDto) {
    return this.orgUserService.addUser(orgId, dto);
  }

  @Get(':orgId/users')
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF)
  @ApiOperation({ summary: 'List users in organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Users listed' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: [
      'COMPANY_SUPER_ADMIN',
      'COMPANY_STAFF',
      'COMPANY_PARTNER',
      'CONSUMER',
    ],
  })
  @ApiQuery({
    name: 'portalType',
    required: false,
    enum: ['STAFF', 'CONSUMER'],
  })
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('portalType') portalType?: string,
  ) {
    return this.orgUserService.findAll(
      orgId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      role,
      portalType,
    );
  }

  @Get(':orgId/users/:userId')
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF)
  @ApiOperation({ summary: 'Get user detail in organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: OrgUserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not in organization' })
  async findById(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
  ) {
    return this.orgUserService.findById(orgId, userId);
  }

  @Patch(':orgId/users/:userId')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user role/access in organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    type: OrgUserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not in organization' })
  @ApiBody({ type: UpdateOrgUserDto })
  async update(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateOrgUserDto,
    @Req() req: any,
  ) {
    return this.orgUserService.update(orgId, userId, dto, req.user?.id);
  }

  @Delete(':orgId/users/:userId')
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove user from organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User removed' })
  @ApiResponse({ status: 404, description: 'User not in organization' })
  async remove(@Param('orgId') orgId: string, @Param('userId') userId: string) {
    return this.orgUserService.remove(orgId, userId);
  }

  @Get(':orgId/users/:userId/features')
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF)
  @ApiOperation({ summary: "Get user's features in organization" })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Features retrieved' })
  async getUserFeatures(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
  ) {
    return this.orgUserService.getUserFeatures(orgId, userId);
  }

  @Get(':orgId/me/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user's permissions in organization" })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved' })
  @ApiResponse({
    status: 404,
    description: 'Not a member of this organization',
  })
  async getMyPermissions(@Param('orgId') orgId: string, @Req() req: any) {
    return this.orgUserService.getMyPermissions(orgId, req.user?.id);
  }
}
