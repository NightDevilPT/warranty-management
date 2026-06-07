// src/modules/users/users.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ProfilePictureResponseDto } from './dto/profile-picture-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user globally' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Email or Phone number already exists.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiConsumes('application/json')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req: any) {
    const userId = req.user?.id;
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email or phone already in use' })
  @ApiConsumes('application/json')
  @ApiBody({ type: UpdateMeDto })
  async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
    const userId = req.user?.id;
    return this.usersService.updateMe(userId, dto);
  }

  @Post('me/profile-picture')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiResponse({
    status: 201,
    description: 'Profile picture uploaded successfully',
    type: ProfilePictureResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['profilePicture'],
      properties: {
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture (jpg, png, webp - max 5MB)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only jpg, png, webp files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadProfilePicture(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Profile picture file is required');
    }

    const userId = req.user?.id;
    return this.usersService.uploadProfilePicture(userId, file);
  }
}
