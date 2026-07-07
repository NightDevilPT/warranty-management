import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDealerTypeDto {
  @ApiProperty({
    description: 'Display name of the dealer type',
    example: 'Support Agent',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Partner type - INTERNAL for staff, EXTERNAL for partners',
    example: 'INTERNAL',
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @IsNotEmpty({ message: 'Partner type is required' })
  @IsString()
  @IsIn(['INTERNAL', 'EXTERNAL'], {
    message: 'Partner type must be INTERNAL or EXTERNAL',
  })
  partnerType: string;

  @ApiPropertyOptional({
    description: 'Description of what this role does',
    example: 'Handles customer support tickets and warranty claims',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;
}
