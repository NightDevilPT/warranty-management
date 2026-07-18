import { CreateBrandHandler } from './handlers/create-brand.handler';
import { UpdateBrandHandler } from './handlers/update-brand.handler';
import { DeleteBrandHandler } from './handlers/delete-brand.handler';

export const BrandCommandHandlers = [
  CreateBrandHandler,
  UpdateBrandHandler,
  DeleteBrandHandler,
];
