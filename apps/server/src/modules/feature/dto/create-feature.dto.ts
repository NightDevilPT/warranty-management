import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeatureDto {
  @ApiProperty({ description: 'Display name', example: 'Product Management' })
  @IsNotEmpty({ message: 'Feature name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Unique code (UPPERCASE with underscores)',
    example: 'PRODUCT_MANAGEMENT',
  })
  @IsNotEmpty({ message: 'Feature code is required' })
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message:
      'Code must be UPPERCASE with underscores (e.g., PRODUCT_MANAGEMENT)',
  })
  @Type(() => String)
  code: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Manage products and inventory',
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
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
