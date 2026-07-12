import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationCommandHandlers } from './commands';
import { OrganizationQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    ...OrganizationCommandHandlers,
    ...OrganizationQueryHandlers,
  ],
})
export class OrganizationsModule {}
