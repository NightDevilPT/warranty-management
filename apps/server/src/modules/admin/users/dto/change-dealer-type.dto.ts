import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ChangeDealerTypeDto {
  @ApiProperty({ description: 'New dealer type ID' })
  @IsNotEmpty({ message: 'Dealer type ID is required' })
  @IsString()
  @Type(() => String)
  dealerTypeId: string;
}
