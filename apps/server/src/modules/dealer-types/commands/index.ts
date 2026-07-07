import { CreateDealerTypeHandler } from './handlers/create-dealer-type.handler';
import { UpdateDealerTypeHandler } from './handlers/update-dealer-type.handler';
import { DeleteDealerTypeHandler } from './handlers/delete-dealer-type.handler';

export const DealerTypeCommandHandlers = [
  CreateDealerTypeHandler,
  UpdateDealerTypeHandler,
  DeleteDealerTypeHandler,
];
