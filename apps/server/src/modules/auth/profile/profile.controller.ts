import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
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
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Auth - Profile')
@Controller('auth/me')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required or session expired',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Req() req: any): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(req.user.id, req.user.orgId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update profile details' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required or session expired',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Phone number already in use' })
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(dto, req.user.id, req.user.orgId);
  }

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (jpg, png, webp)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture uploaded successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'File is required' })
  @ApiResponse({
    status: 401,
    description: 'Authentication required or session expired',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 413, description: 'File too large' })
  @ApiResponse({ status: 500, description: 'Failed to upload profile picture' })
  async uploadProfilePicture(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileResponseDto> {
    return this.profileService.uploadProfilePicture(
      file,
      req.user.id,
      req.user.orgId,
    );
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change password for current org context' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'No password set for this account or validation failed',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication required, session expired, or current password is incorrect',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.profileService.changePassword(dto, req.user.id, req.user.orgId);
  }
}
