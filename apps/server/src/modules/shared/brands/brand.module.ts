import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { BrandsService } from './brands.service';
import { BrandCommandHandlers } from './commands';
import { BrandQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  providers: [BrandsService, ...BrandCommandHandlers, ...BrandQueryHandlers],
  exports: [BrandsService],
})
export class BrandsModule {}
