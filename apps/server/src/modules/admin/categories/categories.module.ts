import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryCommandHandlers } from './commands';
import { CategoryQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    ...CategoryCommandHandlers,
    ...CategoryQueryHandlers,
  ],
})
export class CategoriesModule {}
