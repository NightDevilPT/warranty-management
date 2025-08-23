// src/modules/form-schema-template/form-schema-template.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ROLES } from '../users/interface/user.interface';
import { Roles } from 'common/decorators/roles.decorator';
import { JwtAuthGuard } from 'common/guards/auth.guard';
import { FormSchemaCategory } from 'interfaces/form-schema.interface';
import { FormSchemaTemplateService } from './form-schema-template.service';
import { CreateFormSchemaTemplateDto } from './dto/create-form-schema-template.dto';
import { FormSchemaTemplateResponseDto } from './dto/response-form-schema-template.dto';
import { CreateFormSchemaTemplatePayloadExample } from './data/exmaple.payload';

@ApiTags('Form Schema Templates')
@ApiBearerAuth()
@Controller('form-schema-templates')
@UseGuards(JwtAuthGuard)
export class FormSchemaTemplateController {
  constructor(
    private readonly formSchemaTemplateService: FormSchemaTemplateService,
  ) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.COMPANY_SUPER_ADMIN, ROLES.COMPANY_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create form schema template',
    description:
      'Creates a new form schema template for an organization. Returns the created template with all default values populated.',
  })
  @ApiBody({
    type: CreateFormSchemaTemplateDto,
    description: 'Form schema template creation payload',
    examples: CreateFormSchemaTemplatePayloadExample,
  })
  @ApiCreatedResponse({
    description: 'Form schema template created successfully',
    type: FormSchemaTemplateResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data or template with same title already exists for this organization',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
  })
  async createFormSchemaTemplate(
    @Body() createFormSchemaTemplateDto: CreateFormSchemaTemplateDto,
    @Req() req: Request,
  ): Promise<FormSchemaTemplateResponseDto> {
    const userId = req?.user?.sub; // Assuming user is attached to request by JwtAuthGuard
    if (!userId) {
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.formSchemaTemplateService.createFormSchemaTemplate(
      createFormSchemaTemplateDto,
      userId,
    );
  }

  // ... other methods (get, update, delete) will be here
}
