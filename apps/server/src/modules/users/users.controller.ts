import {
  Controller,
  Post,
  Body,
  FileValidator,
  UploadedFile,
  UseInterceptors,
  Param,
  BadRequestException,
  UseGuards,
  Req,
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
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';

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

  @Post('profile-picture')
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

    // Get userId from authenticated user (JwtAuthGuard attaches user to request)
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.usersService.uploadProfilePicture(userId, file);
  }
}
