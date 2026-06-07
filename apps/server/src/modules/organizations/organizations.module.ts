// src/modules/organization/organization.module.ts
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { OrganizationCommandHandlers } from './commands';
import { OrganizationQueryHandlers } from './queries';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { OrganizationController } from './organizations.controller';
import { OrganizationService } from './organizations.service';

@Module({
  imports: [...CommonModules],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    RolesGuard,
    ...OrganizationCommandHandlers,
    ...OrganizationQueryHandlers,
  ],
})
export class OrganizationModule {}
