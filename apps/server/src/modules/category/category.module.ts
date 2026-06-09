import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryCommandHandlers } from './commands';
import { CategoryQueryHandlers } from './queries';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [...CommonModules],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    JwtAuthGuard,
    RolesGuard,
    ...CategoryCommandHandlers,
    ...CategoryQueryHandlers,
  ],
})
export class CategoryModule {}
