import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsNotEmpty({ message: 'Organization ID is required' })
  @IsUUID('4', { message: 'Invalid organization ID' })
  @Type(() => String)
  orgId: string;

  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Consumer electronics and gadgets',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({ description: 'Icon or image URL' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  image?: string;

  @ApiPropertyOptional({ description: 'Parent category ID for hierarchy' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid parent category ID' })
  @Type(() => String)
  parentId?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
