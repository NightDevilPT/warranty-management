import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class BrandResponseDto {
  @ApiProperty({ description: 'Brand ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Brand name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @Expose()
  slug: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @Expose()
  logo?: string;

  @ApiPropertyOptional({ description: 'Official website' })
  @Expose()
  website?: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): BrandResponseDto {
    return plainToInstance(BrandResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): BrandResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

@Exclude()
export class BrandDetailDto extends BrandResponseDto {
  @ApiProperty({ description: 'Number of products using this brand' })
  @Expose()
  productCount: number;
}
