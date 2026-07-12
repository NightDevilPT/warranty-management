import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Type as CTType,
} from 'class-transformer';

@Exclude()
class StatItemDto {
  @ApiProperty({ description: 'Label' })
  @Expose()
  label: string;

  @ApiProperty({ description: 'Count' })
  @Expose()
  count: number;
}

@Exclude()
class RecentOrgDto {
  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Organization name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL slug' })
  @Expose()
  slug: string;

  @ApiProperty({ description: 'Organization type' })
  @Expose()
  type: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;
}

@Exclude()
class DashboardStatsDto {
  @ApiProperty({ description: 'Total organizations' })
  @Expose()
  totalOrganizations: number;

  @ApiProperty({ description: 'Active organizations' })
  @Expose()
  activeOrganizations: number;

  @ApiProperty({ description: 'Total users across all orgs' })
  @Expose()
  totalUsers: number;

  @ApiProperty({ description: 'Total brands across all orgs' })
  @Expose()
  totalBrands: number;

  @ApiProperty({ description: 'Total categories across all orgs' })
  @Expose()
  totalCategories: number;

  @ApiProperty({ description: 'Total dealer types across all orgs' })
  @Expose()
  totalDealerTypes: number;
}

@Exclude()
export class DashboardResponseDto {
  @ApiProperty({ description: 'Dashboard statistics' })
  @Expose()
  @CTType(() => DashboardStatsDto)
  stats: DashboardStatsDto;

  @ApiProperty({ description: 'Organizations by type', type: [StatItemDto] })
  @Expose()
  @CTType(() => StatItemDto)
  organizationsByType: StatItemDto[];

  @ApiProperty({ description: 'Organizations by status', type: [StatItemDto] })
  @Expose()
  @CTType(() => StatItemDto)
  organizationsByStatus: StatItemDto[];

  @ApiProperty({ description: 'Recent organizations', type: [RecentOrgDto] })
  @Expose()
  @CTType(() => RecentOrgDto)
  recentOrganizations: RecentOrgDto[];

  static from(data: any): DashboardResponseDto {
    return plainToInstance(DashboardResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
