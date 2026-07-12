import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDealerTypeDto {
  @ApiProperty({ description: 'Role template name', example: 'Support Agent' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({ description: 'Partner type', enum: ['INTERNAL', 'EXTERNAL'] })
  @IsNotEmpty({ message: 'Partner type is required' })
  @IsString()
  @IsIn(['INTERNAL', 'EXTERNAL'], {
    message: 'Partner type must be INTERNAL or EXTERNAL',
  })
  @Type(() => String)
  partnerType: string;

  @ApiPropertyOptional({
    description: 'Description of this role',
    example: 'Handles customer support tickets',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;
}
