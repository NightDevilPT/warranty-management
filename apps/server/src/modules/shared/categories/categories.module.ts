import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { CategoriesService } from './categories.service';
import { CategoryCommandHandlers } from './commands';
import { CategoryQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  providers: [
    CategoriesService,
    ...CategoryCommandHandlers,
    ...CategoryQueryHandlers,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
