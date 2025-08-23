// src/modules/settings/settings.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Put,
  HttpException,
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
import { SettingsService } from './settings.service';
import { ROLES } from '../users/interface/user.interface';
import { Roles } from 'common/decorators/roles.decorator';
import { JwtAuthGuard } from 'common/guards/auth.guard';
import { CreateSettingsDto } from './dto/create-setting.dto';
import { UpdateSettingsDto } from './dto/update-setting.dto';
import { SettingsResponseDto } from './dto/response.setting.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @Roles(
    ROLES.ADMIN,
    ROLES.COMPANY_SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.PARTNER,
    ROLES.CONSUMER,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create user settings',
    description: 'Creates settings for the authenticated user.',
  })
  @ApiBody({
    type: CreateSettingsDto,
    description: 'Settings creation payload',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Settings created successfully',
    type: SettingsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or settings already exist',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
  })
  async createSettings(
    @Body() createSettingsDto: CreateSettingsDto,
    @Req() req: Request,
  ): Promise<SettingsResponseDto> {
    const userId = req?.user?.sub; // Assuming user is attached to request by JwtAuthGuard
    if (!userId) {
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.settingsService.createSettings(
      userId.toString(),
      createSettingsDto,
    );
  }

  @Put()
  @Roles(
    ROLES.ADMIN,
    ROLES.COMPANY_SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.CONSUMER,
    ROLES.PARTNER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user settings',
    description: 'Updates settings for the authenticated user.',
  })
  @ApiBody({
    type: UpdateSettingsDto,
    description: 'Settings update payload',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Settings updated successfully',
    type: SettingsResponseDto,
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
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Req() req: Request,
  ): Promise<SettingsResponseDto> {
    const userId = req?.user?.sub; // Assuming user is attached to request by JwtAuthGuard
    if (!userId) {
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.settingsService.updateSettings(
      userId.toString(),
      updateSettingsDto,
    );
  }
}
