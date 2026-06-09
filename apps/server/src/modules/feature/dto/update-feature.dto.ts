import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFeatureDto {
  @ApiPropertyOptional({
    description: 'Display name',
    example: 'Product Management Updated',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({ description: 'Icon identifier', example: 'package' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent feature ID for hierarchy' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Sort order within parent level',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
