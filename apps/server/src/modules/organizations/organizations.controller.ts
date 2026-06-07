// src/modules/organization/organization.controller.ts
import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { OrganizationService } from './organizations.service';

@ApiTags('Admin - Organizations')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ROOT organization (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiConsumes('application/json')
  @ApiBody({ type: CreateOrganizationDto })
  async create(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations with search (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Organizations listed successfully',
    type: [OrganizationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'acme' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.organizationService.findAll(page, limit, search);
  }
}
