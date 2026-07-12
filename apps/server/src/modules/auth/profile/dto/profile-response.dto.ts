import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Type as CTType,
} from 'class-transformer';

@Exclude()
class CurrentOrgDto {
  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Organization name' })
  @Expose()
  orgName: string;

  @ApiProperty({ description: 'Portal type' })
  @Expose()
  portalType: string;

  @ApiProperty({ description: 'Current role' })
  @Expose()
  role: string;

  @ApiProperty({ description: 'Feature permissions' })
  @Expose()
  permissions: string[];
}

@Exclude()
export class ProfileResponseDto {
  @ApiProperty({ description: 'Current UserAccess ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User email (from User table)' })
  @Expose()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number for this org context' })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({ description: 'First name for this org context' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Last name for this org context' })
  @Expose()
  lastName: string;

  @ApiProperty({ description: 'Display name for this org context' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Role in this org context' })
  @Expose()
  role: string;

  @ApiPropertyOptional({ description: 'Profile picture for this org context' })
  @Expose()
  profile?: string;

  @ApiProperty({ description: 'Email verification status' })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({ description: 'Phone verification status' })
  @Expose()
  phoneVerified: boolean;

  @ApiProperty({ description: 'Current organization context' })
  @Expose()
  @CTType(() => CurrentOrgDto)
  currentOrg: CurrentOrgDto;

  static fromEntity(entity: any): ProfileResponseDto {
    return plainToInstance(ProfileResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
