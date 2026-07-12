import { InviteUserHandler } from './handlers/invite-user.handler';
import { UpdateUserHandler } from './handlers/update-user.handler';
import { RemoveUserHandler } from './handlers/remove-user.handler';
import { ChangeDealerTypeHandler } from './handlers/change-dealer-type.handler';

export const UserCommandHandlers = [
  InviteUserHandler,
  UpdateUserHandler,
  RemoveUserHandler,
  ChangeDealerTypeHandler,
];
