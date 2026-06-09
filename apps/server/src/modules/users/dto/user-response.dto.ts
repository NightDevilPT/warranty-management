import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'user@example.com',
  })
  @Expose()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+919876543210',
  })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @Expose()
  lastName: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Global platform role', enum: UserRole })
  @Expose()
  role: UserRole;

  @ApiProperty({ description: 'Email verification status' })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({ description: 'Phone verification status' })
  @Expose()
  phoneVerified: boolean;

  @ApiProperty({ description: 'Account active status' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @Expose()
  profile?: string;

  @ApiProperty({ description: 'Account created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Account last updated at' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): UserResponseDto {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
