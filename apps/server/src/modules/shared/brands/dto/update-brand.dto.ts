import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBrandDto {
  @ApiPropertyOptional({
    description: 'Brand name',
    example: 'Samsung Electronics',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({ description: 'Brand description' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  logo?: string;

  @ApiPropertyOptional({ description: 'Official website' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  website?: string;

  @ApiPropertyOptional({ description: 'Active status', example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
