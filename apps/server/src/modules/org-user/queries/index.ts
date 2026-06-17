// src/modules/org-user/queries/index.ts
import { GetOrgUserHandler } from './handlers/get-org-user.handler';
import { ListOrgUsersHandler } from './handlers/list-org-users.handler';
import { GetUserFeaturesHandler } from './handlers/get-user-features.handler';

export const OrgUserQueryHandlers = [
  GetOrgUserHandler,
  ListOrgUsersHandler,
  GetUserFeaturesHandler,
];
