import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'OldPass@123' })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  @Type(() => String)
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'NewPass@456',
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @Type(() => String)
  newPassword: string;
}
