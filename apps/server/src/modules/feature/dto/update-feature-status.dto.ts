import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { FeatureStatus } from 'generated/prisma/enums';

export class UpdateFeatureStatusDto {
  @ApiProperty({
    description: 'Feature status',
    enum: FeatureStatus,
    example: FeatureStatus.ENABLED,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(FeatureStatus)
  status: FeatureStatus;
}
