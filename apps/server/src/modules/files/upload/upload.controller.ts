import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import {
  SingleFileUploadResponseDto,
  MultipleFilesUploadResponseDto,
} from './dto/file-upload-response.dto';

@ApiTags('Files - Upload')
@ApiBearerAuth()
@Controller('files/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 10 MB)',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description:
      'Folder path inside bucket (e.g., organizations, brands, profiles)',
    example: 'organizations',
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    type: SingleFileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'File is required' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<SingleFileUploadResponseDto> {
    return this.uploadService.uploadSingleFile(file, folder);
  }

  @Post('multiple')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
      },
    }),
  )
  @ApiOperation({ summary: 'Upload multiple files (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload (max 10 files, 10 MB each)',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description:
      'Folder path inside bucket (e.g., organizations, brands, profiles)',
    example: 'organizations',
  })
  @ApiResponse({
    status: 200,
    description: 'Files uploaded successfully',
    type: MultipleFilesUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Files are required' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<MultipleFilesUploadResponseDto> {
    return this.uploadService.uploadMultipleFiles(files, folder);
  }
}
