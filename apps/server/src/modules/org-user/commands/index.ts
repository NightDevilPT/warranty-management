// src/modules/org-user/commands/index.ts
import { AddUserHandler } from './handlers/add-user.handler';
import { UpdateOrgUserHandler } from './handlers/update-org-user.handler';
import { RemoveUserHandler } from './handlers/remove-user.handler';

export const OrgUserCommandHandlers = [
  AddUserHandler,
  UpdateOrgUserHandler,
  RemoveUserHandler,
];
