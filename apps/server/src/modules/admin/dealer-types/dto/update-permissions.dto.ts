import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePermissionsDto {
  @ApiProperty({
    description: 'Array of feature IDs to assign',
    example: ['uuid1', 'uuid2'],
  })
  @IsArray({ message: 'featureIds must be an array' })
  @ArrayMinSize(0, { message: 'featureIds cannot be empty' })
  @IsString({ each: true, message: 'Each feature ID must be a string' })
  @Type(() => String)
  featureIds: string[];
}
