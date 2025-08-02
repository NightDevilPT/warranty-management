import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  Matches,
  IsUrl,
} from 'class-validator';
import { ROLES } from '../interface/user.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const E164_PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export class CreateUserDto {
  @ApiProperty({ example: 'Night', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty({ example: 'Devil', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({
    example: 'nightdevilpt@gmail.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'User avatar URL',
  })
  @IsOptional()
  @IsUrl()
  readonly avatar?: string | null;

  @ApiProperty({
    example: '+1234567890',
    description: 'User contact phone number in E.164 format',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(E164_PHONE_REGEX, {
    message: 'contact must be a valid E.164 phone number',
  })
  readonly contact: string;

  @ApiProperty({ enum: ROLES, description: 'Role of the user' })
  @IsEnum(ROLES)
  @IsNotEmpty()
  readonly role: ROLES;

  @ApiProperty({ example: 'securepassword123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
