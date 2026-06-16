// src/modules/brand/commands/index.ts
import { CreateBrandHandler } from './handlers/create-brand.handler';
import { UploadBrandLogoHandler } from './handlers/upload-brand-logo.handler';
import { DeleteBrandHandler } from './handlers/delete-brand.handler';
import { UpdateBrandHandler } from './handlers/update-brand.handler';

export const BrandCommandHandlers = [
  CreateBrandHandler,
  UpdateBrandHandler,
  UploadBrandLogoHandler,
  DeleteBrandHandler,
];
