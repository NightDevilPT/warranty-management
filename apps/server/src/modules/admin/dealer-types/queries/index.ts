import { GetDealerTypeHandler } from './handlers/get-dealer-type.handler';
import { ListDealerTypesHandler } from './handlers/list-dealer-types.handler';
import { GetPermissionsHandler } from './handlers/get-permissions.handler';

export const DealerTypeQueryHandlers = [
  GetDealerTypeHandler,
  ListDealerTypesHandler,
  GetPermissionsHandler,
];
