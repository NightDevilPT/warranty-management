// src/modules/brand/dto/update-brand.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBrandDto {
  @ApiPropertyOptional({
    description: 'Brand name',
    example: 'Samsung Electronics',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Brand description',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({
    description: 'Brand website URL',
    example: 'https://www.samsung.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid website URL' })
  @Type(() => String)
  website?: string;

  @ApiPropertyOptional({ description: 'Active status', example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
