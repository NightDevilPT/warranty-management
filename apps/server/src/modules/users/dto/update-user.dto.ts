// src/modules/users/dto/update-me.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMeDto {
  @ApiPropertyOptional({
    description: 'The first name of the user',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Must provide a valid email' })
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
    example: '+1234567890',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  phoneNumber?: string;
}
