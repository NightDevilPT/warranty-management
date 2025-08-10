// src/modules/organization/commands/index.ts
import { CreateOrganizationHandler } from './handler/create-organization.command.handler';
import { UpdateOrganizationHandler } from './handler/update-organization.command.handler';

export const OrganizationCommandHandlers = [
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
];
