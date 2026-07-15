import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';

@Exclude()
export class UploadedFileDto {
  @ApiProperty({ description: 'File key in S3 bucket' })
  @Expose()
  key: string;

  @ApiProperty({ description: 'Presigned URL (temporary, with expiration)' })
  @Expose()
  url: string;

  @ApiProperty({ description: 'Public URL (permanent, no expiration)' })
  @Expose()
  publicUrl: string;

  @ApiProperty({ description: 'Generated file name' })
  @Expose()
  fileName: string;

  @ApiProperty({ description: 'Original file name' })
  @Expose()
  originalName: string;

  @ApiProperty({ description: 'File MIME type' })
  @Expose()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Expose()
  size: number;

  static fromEntity(entity: any): UploadedFileDto {
    return plainToInstance(UploadedFileDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): UploadedFileDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

@Exclude()
export class SingleFileUploadResponseDto {
  @ApiProperty({ description: 'Uploaded file details' })
  @Expose()
  @Type(() => UploadedFileDto)
  file: UploadedFileDto;

  static fromEntity(file: any): SingleFileUploadResponseDto {
    return plainToInstance(
      SingleFileUploadResponseDto,
      { file },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

@Exclude()
export class MultipleFilesUploadResponseDto {
  @ApiProperty({
    description: 'Uploaded files details',
    type: [UploadedFileDto],
  })
  @Expose()
  @Type(() => UploadedFileDto)
  files: UploadedFileDto[];

  @ApiProperty({ description: 'Number of files uploaded' })
  @Expose()
  count: number;

  static fromEntities(files: any[]): MultipleFilesUploadResponseDto {
    return plainToInstance(
      MultipleFilesUploadResponseDto,
      {
        files,
        count: files.length,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
