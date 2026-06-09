import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'OldP@ss123' })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  @Type(() => String)
  currentPassword: string;

  @ApiProperty({ description: 'New password', example: 'NewP@ss456' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Type(() => String)
  newPassword: string;
}
