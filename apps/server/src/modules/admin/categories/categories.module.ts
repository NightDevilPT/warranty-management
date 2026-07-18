import { Module } from '@nestjs/common';
import { AdminCategoriesController } from './categories.controller';
import { CategoriesModule } from 'src/modules/shared/categories/categories.module';

@Module({
  imports: [CategoriesModule],
  controllers: [AdminCategoriesController],
})
export class AdminCategoriesModule {}
