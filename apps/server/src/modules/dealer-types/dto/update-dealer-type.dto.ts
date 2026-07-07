import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDealerTypeDto {
  @ApiPropertyOptional({
    description: 'Updated display name',
    example: 'Senior Support Agent',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated partner type',
    example: 'INTERNAL',
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['INTERNAL', 'EXTERNAL'], {
    message: 'Partner type must be INTERNAL or EXTERNAL',
  })
  partnerType?: string;

  @ApiPropertyOptional({
    description: 'Updated description',
    example: 'Senior support agent with escalated claim approval rights',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({
    description: 'Activate or deactivate this dealer type',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
