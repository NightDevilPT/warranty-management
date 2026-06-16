// src/modules/brand/brand.module.ts
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandCommandHandlers } from './commands';
import { BrandQueryHandlers } from './queries';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [...CommonModules],
  controllers: [BrandController],
  providers: [
    BrandService,
    RolesGuard,
    ...BrandCommandHandlers,
    ...BrandQueryHandlers,
  ],
})
export class BrandModule {}
