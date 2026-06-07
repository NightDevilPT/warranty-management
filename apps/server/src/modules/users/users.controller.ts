import {
  Controller,
  Post,
  Body,
  FileValidator,
  UploadedFile,
  UseInterceptors,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ProfilePictureResponseDto } from './dto/profile-picture-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users') // Swagger Tag grouping
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user globally' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Email or Phone number already exists.',
  })
  @ApiBody({ type: CreateUserDto }) // For Swagger documentation - show both content types
  @ApiConsumes('application/json', 'multipart/form-data')
  async createUser(@Body() createUserDto: CreateUserDto) {
    // We return the raw object. The ResponseInterceptor will format it.
    return this.usersService.createUser(createUserDto);
  }

  @Post(':id/profile-picture')
  @ApiOperation({ summary: '📸 Upload profile picture' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile picture URL',
    type: ProfilePictureResponseDto,
  })
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
        // Simple validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new Error('Only jpg, png, webp files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadProfilePicture(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfilePictureResponseDto> {
    if (!file) {
      throw new BadRequestException('Profile picture file is required');
    }

    return this.usersService.uploadProfilePicture(userId, file);
  }
}
