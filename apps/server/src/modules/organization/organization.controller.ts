// src/modules/organization/organization.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RolesGuard } from 'common/guards/roles.guard';
import { ROLES } from '../users/interface/user.interface';
import { Roles } from 'common/decorators/roles.decorator';
import { JwtAuthGuard } from 'common/guards/auth.guard';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/response-organization.dto';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(ROLES.ADMIN) // Only these roles can create organizations
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new organization',
    description:
      'Creates a new organization. Requires ADMIN or COMPANY_ADMIN role.',
  })
  @ApiBody({
    type: CreateOrganizationDto,
    description: 'Organization creation payload',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization created successfully',
    type: OrganizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Organization with this name or slug already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
  })
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Req() req: Request,
  ): Promise<OrganizationResponseDto> {
    return this.organizationService.createOrganization(createOrganizationDto);
  }

  @Put(':id')
  @Roles(ROLES.ADMIN, ROLES.COMPANY_SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an organization',
    description:
      'Updates organization details. Requires ADMIN or COMPANY_SUPER_ADMIN role.',
  })
  @ApiBody({
    type: UpdateOrganizationDto,
    description: 'Organization update payload',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization updated successfully',
    type: OrganizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
  })
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationService.updateOrganization(
      id,
      updateOrganizationDto,
    );
  }
}
