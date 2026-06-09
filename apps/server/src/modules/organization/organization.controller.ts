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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizationService } from './organization.service';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@ApiTags('Admin - Organizations')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create ROOT organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiBody({ type: CreateOrganizationDto })
  async create(@Body() dto: CreateOrganizationDto, @Req() req: any) {
    return this.organizationService.create(dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations (search, paginate)' })
  @ApiResponse({ status: 200, description: 'Organizations listed' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, company name, or slug',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['ROOT', 'BRANCH'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.organizationService.findAll(
      page,
      limit,
      search,
      type,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization found',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('orgId') orgId: string) {
    return this.organizationService.findById(orgId);
  }

  @Patch(':orgId')
  @ApiOperation({ summary: 'Update organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiBody({ type: UpdateOrganizationDto })
  async update(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
    @Req() req: any,
  ) {
    console.log(req.user, 'sdfghjkl;');
    return this.organizationService.update(orgId, dto, req.user?.id);
  }

  @Post(':orgId/logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload organization logo' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file',
        },
      },
    },
  })
  async uploadLogo(
    @Param('orgId') orgId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.organizationService.uploadLogo(orgId, file);
  }
}
