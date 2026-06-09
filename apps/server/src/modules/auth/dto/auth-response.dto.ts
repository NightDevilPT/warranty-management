import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

@Exclude()
export class AuthResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: 'Email address for global login',
    example: 'user@example.com',
  })
  @Expose()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number for SMS OTP login',
    example: '+919876543210',
  })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({ description: 'First/given name', example: 'John' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Last/family name', example: 'Doe' })
  @Expose()
  lastName: string;

  @ApiProperty({ description: 'Auto-generated full name', example: 'John Doe' })
  @Expose()
  fullName: string;

  @ApiProperty({
    description: 'Global platform role',
    enum: UserRole,
    example: UserRole.CONSUMER,
  })
  @Expose()
  role: UserRole;

  @ApiProperty({ description: 'Email verification status', example: false })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({ description: 'Phone verification status', example: false })
  @Expose()
  phoneVerified: boolean;

  @ApiProperty({ description: 'Account active status', example: true })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Profile picture URL in S3',
    example: 'profiles/user-id-1234567890.jpg',
  })
  @Expose()
  profile?: string;

  @ApiProperty({ description: 'Account creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last profile update timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Soft-delete timestamp' })
  @Expose()
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Admin user ID who deleted this account',
  })
  @Expose()
  deletedBy?: string;

  static fromEntity(entity: any): AuthResponseDto {
    return plainToInstance(AuthResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}

// Internal use only - not exposed to Swagger as response
export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthResponseDto;
}
