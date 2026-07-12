import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeatureDto {
  @ApiProperty({ description: 'Feature name', example: 'Brand Management' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Unique permission code (UPPERCASE with underscores)',
    example: 'BRAND',
  })
  @IsNotEmpty({ message: 'Code is required' })
  @IsString()
  @Type(() => String)
  code: string;

  @ApiPropertyOptional({
    description: 'Feature description',
    example: 'Manage product brands',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({ description: 'Lucide icon name', example: 'Tag' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Parent feature ID (null = root module)',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Sort order within parent',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
