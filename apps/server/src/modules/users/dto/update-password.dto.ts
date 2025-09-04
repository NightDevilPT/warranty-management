import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'nightdevilpt@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password reset token from email link' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'New password (min 6 chars)', minLength: 6, example: "Test@123" })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
