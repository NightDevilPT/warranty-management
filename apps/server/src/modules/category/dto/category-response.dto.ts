import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Organization ID this category belongs to' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'electronics' })
  @Expose()
  slug: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Consumer electronics category',
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon or image URL' })
  @Expose()
  image?: string;

  @ApiPropertyOptional({ description: 'Parent category ID for hierarchy' })
  @Expose()
  parentId?: string;

  @ApiProperty({ description: 'Sort order', example: 0 })
  @Expose()
  sortOrder: number;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @Expose()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID' })
  @Expose()
  updatedBy?: string;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Children categories',
    type: [CategoryResponseDto],
  })
  @Expose()
  @Type(() => CategoryResponseDto)
  children?: CategoryResponseDto[];

  static fromEntity(entity: any): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): CategoryResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
