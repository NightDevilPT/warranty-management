// src/modules/users/dto/login-user.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'nightdevilpt@gmail.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: 'securepassword123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
