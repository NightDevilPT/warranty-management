import { GetOrganizationHandler } from './handlers/get-organization.handler';
import { ListOrganizationsHandler } from './handlers/list-organizations.handler';

export const OrganizationQueryHandlers = [
  GetOrganizationHandler,
  ListOrganizationsHandler,
];
