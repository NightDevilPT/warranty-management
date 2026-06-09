import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { FeatureStatus } from 'generated/prisma/enums';

@Exclude()
export class FeatureResponseDto {
  @ApiProperty({
    description: 'Feature ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Display name', example: 'Product Management' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Unique code for permission checks',
    example: 'PRODUCT_MANAGEMENT',
  })
  @Expose()
  code: string;

  @ApiPropertyOptional({
    description: 'Description of this feature',
    example: 'Manage products and inventory',
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier for UI',
    example: 'package',
  })
  @Expose()
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent feature ID for hierarchy' })
  @Expose()
  parentId?: string;

  @ApiProperty({ description: 'Sort order within parent level', example: 0 })
  @Expose()
  sortOrder: number;

  @ApiProperty({ description: 'Feature status', enum: FeatureStatus })
  @Expose()
  status: FeatureStatus;

  @ApiPropertyOptional({ description: 'Admin who created this feature' })
  @Expose()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Admin who last updated this feature' })
  @Expose()
  updatedBy?: string;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Children features',
    type: [FeatureResponseDto],
  })
  @Expose()
  @Type(() => FeatureResponseDto)
  children?: FeatureResponseDto[];

  static fromEntity(entity: any): FeatureResponseDto {
    return plainToInstance(FeatureResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): FeatureResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
