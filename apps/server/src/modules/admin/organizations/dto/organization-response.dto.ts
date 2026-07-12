import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Type as CTType,
} from 'class-transformer';

@Exclude()
class OrgHierarchyDto {
  @ApiProperty({ description: 'Root organization' })
  @Expose()
  root: { id: string; name: string } | null;

  @ApiProperty({ description: 'Parent organization' })
  @Expose()
  parent: { id: string; name: string } | null;

  @ApiProperty({ description: 'Child organizations' })
  @Expose()
  children: { id: string; name: string; type: string }[];
}

@Exclude()
class OrgStatsDto {
  @ApiProperty({ description: 'Total users' })
  @Expose()
  totalUsers: number;

  @ApiProperty({ description: 'Total brands' })
  @Expose()
  totalBrands: number;

  @ApiProperty({ description: 'Total categories' })
  @Expose()
  totalCategories: number;

  @ApiProperty({ description: 'Total dealer types' })
  @Expose()
  totalDealerTypes: number;
}

@Exclude()
export class OrganizationResponseDto {
  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Display name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Legal company name' })
  @Expose()
  companyName: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @Expose()
  slug: string;

  @ApiProperty({ description: 'Public hash for routing' })
  @Expose()
  hash: string;

  @ApiProperty({ description: 'Organization type' })
  @Expose()
  type: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @Expose()
  logo?: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): OrganizationResponseDto {
    return plainToInstance(OrganizationResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): OrganizationResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

@Exclude()
export class OrganizationDetailDto extends OrganizationResponseDto {
  @ApiProperty({ description: 'Organization hierarchy' })
  @Expose()
  @CTType(() => OrgHierarchyDto)
  hierarchy: OrgHierarchyDto;

  @ApiProperty({ description: 'Statistics' })
  @Expose()
  @CTType(() => OrgStatsDto)
  stats: OrgStatsDto;
}

@Exclude()
export class StatusResponseDto {
  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Current status' })
  @Expose()
  status: string;

  @ApiProperty({ description: 'Active flag' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Success message' })
  @Expose()
  message: string;
}

@Exclude()
export class InviteSuperAdminResponseDto {
  @ApiProperty({ description: 'User ID' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'UserAccess ID' })
  @Expose()
  userAccessId: string;

  @ApiProperty({ description: 'Email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Role' })
  @Expose()
  role: string;

  @ApiProperty({ description: 'Invitation sent' })
  @Expose()
  invitationSent: boolean;
}
