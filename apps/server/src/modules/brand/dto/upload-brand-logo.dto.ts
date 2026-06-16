// src/modules/brand/dto/upload-brand-logo.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadBrandLogoDto {
  @ApiProperty({
    description: 'Brand logo image file',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
