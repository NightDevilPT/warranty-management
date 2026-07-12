import { GetUserHandler } from './handlers/get-user.handler';
import { ListUsersHandler } from './handlers/list-users.handler';
import { GetUserPermissionsHandler } from './handlers/get-user-permissions.handler';

export const UserQueryHandlers = [
  GetUserHandler,
  ListUsersHandler,
  GetUserPermissionsHandler,
];
