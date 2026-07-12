import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDealerTypeDto {
  @ApiPropertyOptional({
    description: 'Role template name',
    example: 'Senior Support Agent',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({
    description: 'Partner type',
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['INTERNAL', 'EXTERNAL'], {
    message: 'Partner type must be INTERNAL or EXTERNAL',
  })
  @Type(() => String)
  partnerType?: string;
}
