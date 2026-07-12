import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBrandDto {
  @ApiProperty({ description: 'Brand name', example: 'Samsung' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiPropertyOptional({
    description: 'Brand description',
    example: 'Samsung Electronics',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  logo?: string;

  @ApiPropertyOptional({
    description: 'Official website',
    example: 'https://samsung.com',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  website?: string;
}
