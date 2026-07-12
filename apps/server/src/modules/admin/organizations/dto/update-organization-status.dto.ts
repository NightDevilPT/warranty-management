import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrganizationStatusDto {
  @ApiProperty({
    description: 'Action to perform',
    enum: ['activate', 'deactivate', 'soft-delete'],
  })
  @IsNotEmpty({ message: 'Action is required' })
  @IsString()
  @IsIn(['activate', 'deactivate', 'soft-delete'], {
    message: 'Invalid action',
  })
  @Type(() => String)
  action: 'activate' | 'deactivate' | 'soft-delete';
}
