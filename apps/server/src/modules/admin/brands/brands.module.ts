import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BrandCommandHandlers } from './commands';
import { BrandQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [BrandsController],
  providers: [BrandsService, ...BrandCommandHandlers, ...BrandQueryHandlers],
})
export class BrandsModule {}
