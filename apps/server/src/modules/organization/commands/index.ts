import { CreateOrganizationHandler } from './handlers/create-organization.handler';
import { UpdateOrganizationHandler } from './handlers/update-organization.handler';
import { UploadLogoHandler } from './handlers/upload-logo.handler';

export const OrganizationCommandHandlers = [
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
  UploadLogoHandler,
];
