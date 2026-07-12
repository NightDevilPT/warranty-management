import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFeatureStatusDto {
  @ApiProperty({
    description: 'Feature status',
    enum: ['ENABLED', 'DISABLED', 'COMING_SOON'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  @IsIn(['ENABLED', 'DISABLED', 'COMING_SOON'], { message: 'Invalid status' })
  @Type(() => String)
  status: 'ENABLED' | 'DISABLED' | 'COMING_SOON';
}
