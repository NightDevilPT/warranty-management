// src/modules/org-user/queries/index.ts
import { GetOrgUserHandler } from './handlers/get-org-user.handler';
import { ListOrgUsersHandler } from './handlers/list-org-users.handler';
import { GetUserFeaturesHandler } from './handlers/get-user-features.handler';
import { GetMyPermissionsHandler } from './handlers/get-my-permissions.handler';

export const OrgUserQueryHandlers = [
  GetOrgUserHandler,
  ListOrgUsersHandler,
  GetUserFeaturesHandler,
  GetMyPermissionsHandler,
];
