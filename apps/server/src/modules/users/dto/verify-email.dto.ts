// src/modules/users/dto/verify-user.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserDto {
  @ApiProperty({
    example: 'hashed-token-string',
    description: 'Verification token',
  })
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
