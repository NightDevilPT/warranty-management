// src/modules/brand/dto/create-brand.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Organization ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'Organization ID is required' })
  @IsUUID('4', { message: 'Invalid organization ID format' })
  @Type(() => String)
  orgId: string;

  @ApiProperty({ description: 'Brand name', example: 'Samsung' })
  @IsNotEmpty({ message: 'Brand name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiPropertyOptional({
    description: 'Brand description',
    example: 'Leading electronics manufacturer',
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
}
