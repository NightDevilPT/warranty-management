import { CreateCategoryHandler } from './handlers/create-category.handler';
import { UpdateCategoryHandler } from './handlers/update-category.handler';
import { DeleteCategoryHandler } from './handlers/delete-category.handler';

export const CategoryCommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];
