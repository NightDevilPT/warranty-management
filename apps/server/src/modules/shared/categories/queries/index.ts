import { GetCategoryHandler } from './handlers/get-category.handler';
import { ListCategoriesHandler } from './handlers/list-categories.handler';
import { GetCategoryTreeHandler } from './handlers/get-category-tree.handler';

export const CategoryQueryHandlers = [
  GetCategoryHandler,
  ListCategoriesHandler,
  GetCategoryTreeHandler,
];
