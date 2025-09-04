import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ROLES } from '../interface/user.interface';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'Email of the user requesting password reset',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Portal type can be (ADMIN | COMPANY | CONSUMER)',
    example: ROLES.ADMIN,
  })
  @IsEnum(ROLES)
  @IsNotEmpty()
  role: ROLES;
}
