import { CreateOrganizationHandler } from './handlers/create-organization.handler';
import { UpdateOrganizationHandler } from './handlers/update-organization.handler';
import { UpdateOrganizationStatusHandler } from './handlers/update-organization-status.handler';
import { InviteSuperAdminHandler } from './handlers/invite-super-admin.handler';
import { UploadOrganizationLogoHandler } from './handlers/upload-organization-logo.handler';

export const OrganizationCommandHandlers = [
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
  UpdateOrganizationStatusHandler,
  InviteSuperAdminHandler,
  UploadOrganizationLogoHandler,
];
