import { Module } from '@nestjs/common';
import { AdminBrandsController } from './brands.controller';
import { BrandsModule } from 'src/modules/shared/brands/brand.module';

@Module({
  imports: [BrandsModule],
  controllers: [AdminBrandsController],
})
export class AdminBrandsModule {}
