import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Type as CTType,
} from 'class-transformer';

@Exclude()
class FeatureChildDto {
  @ApiProperty({ description: 'Feature ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Feature name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Permission code' })
  @Expose()
  code: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon name' })
  @Expose()
  icon?: string;

  @ApiProperty({ description: 'Sort order' })
  @Expose()
  sortOrder: number;

  @ApiProperty({ description: 'Status' })
  @Expose()
  status: string;
}

@Exclude()
export class FeatureResponseDto {
  @ApiProperty({ description: 'Feature ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Feature name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Unique permission code' })
  @Expose()
  code: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'Lucide icon name' })
  @Expose()
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent feature ID' })
  @Expose()
  parentId?: string;

  @ApiProperty({ description: 'Sort order' })
  @Expose()
  sortOrder: number;

  @ApiProperty({ description: 'Feature status' })
  @Expose()
  status: string;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): FeatureResponseDto {
    return plainToInstance(FeatureResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): FeatureResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

@Exclude()
class FeatureTreeItemDto extends FeatureResponseDto {
  @ApiProperty({ description: 'Child features', type: [FeatureChildDto] })
  @Expose()
  @CTType(() => FeatureChildDto)
  children: FeatureChildDto[];
}

@Exclude()
export class FeatureDetailDto extends FeatureResponseDto {
  @ApiPropertyOptional({ description: 'Parent feature' })
  @Expose()
  parent: { id: string; name: string; code: string } | null;

  @ApiProperty({ description: 'Child features', type: [FeatureChildDto] })
  @Expose()
  @CTType(() => FeatureChildDto)
  children: FeatureChildDto[];

  @ApiProperty({
    description: 'Number of DealerTypes assigned to this feature',
  })
  @Expose()
  assignedDealerTypesCount: number;
}

@Exclude()
export class FeatureTreeResponseDto {
  @ApiProperty({
    description: 'Feature tree items',
    type: [FeatureTreeItemDto],
  })
  @Expose()
  @CTType(() => FeatureTreeItemDto)
  items: FeatureTreeItemDto[];
}
