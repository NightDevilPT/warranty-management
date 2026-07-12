import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFeatureDto {
  @ApiPropertyOptional({
    description: 'Display name',
    example: 'Brand Management',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({ description: 'Feature description' })
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

  @ApiPropertyOptional({ description: 'Sort order within parent', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
