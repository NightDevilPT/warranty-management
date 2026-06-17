// src/modules/branch/queries/index.ts
import { GetBranchHandler } from './handlers/get-branch.handler';
import { ListBranchesHandler } from './handlers/list-branches.handler';
import { GetHierarchyHandler } from './handlers/get-hierarchy.handler';

export const BranchQueryHandlers = [
  GetBranchHandler,
  ListBranchesHandler,
  GetHierarchyHandler,
];
