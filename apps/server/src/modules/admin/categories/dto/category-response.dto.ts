import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Type as CTType,
} from 'class-transformer';

@Exclude()
class CategoryChildDto {
  @ApiProperty({ description: 'Category ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Category name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @Expose()
  slug: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @Expose()
  image?: string;

  @ApiProperty({ description: 'Sort order' })
  @Expose()
  sortOrder: number;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;
}

@Exclude()
class CategoryBreadcrumbDto {
  @ApiProperty({ description: 'Category ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Category name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @Expose()
  slug: string;
}

@Exclude()
export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Category name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @Expose()
  slug: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @Expose()
  image?: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  @Expose()
  parentId?: string;

  @ApiProperty({ description: 'Sort order' })
  @Expose()
  sortOrder: number;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): CategoryResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

@Exclude()
class CategoryTreeItemDto extends CategoryResponseDto {
  @ApiProperty({ description: 'Child categories', type: [CategoryChildDto] })
  @Expose()
  @CTType(() => CategoryChildDto)
  children: CategoryChildDto[];
}

@Exclude()
export class CategoryDetailDto extends CategoryResponseDto {
  @ApiPropertyOptional({ description: 'Parent category' })
  @Expose()
  parent: { id: string; name: string; slug: string } | null;

  @ApiProperty({ description: 'Child categories', type: [CategoryChildDto] })
  @Expose()
  @CTType(() => CategoryChildDto)
  children: CategoryChildDto[];

  @ApiProperty({
    description: 'Breadcrumb path from root',
    type: [CategoryBreadcrumbDto],
  })
  @Expose()
  @CTType(() => CategoryBreadcrumbDto)
  breadcrumb: CategoryBreadcrumbDto[];

  @ApiProperty({ description: 'Number of products in this category' })
  @Expose()
  productCount: number;
}

@Exclude()
export class CategoryTreeResponseDto {
  @ApiProperty({
    description: 'Category tree items',
    type: [CategoryTreeItemDto],
  })
  @Expose()
  @CTType(() => CategoryTreeItemDto)
  items: CategoryTreeItemDto[];
}
