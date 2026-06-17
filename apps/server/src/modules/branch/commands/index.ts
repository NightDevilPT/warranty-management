// src/modules/branch/commands/index.ts
import { CreateBranchHandler } from './handlers/create-branch.handler';
import { UpdateBranchHandler } from './handlers/update-branch.handler';
import { UploadBranchLogoHandler } from './handlers/upload-branch-logo.handler';

export const BranchCommandHandlers = [
  CreateBranchHandler,
  UpdateBranchHandler,
  UploadBranchLogoHandler,
];
