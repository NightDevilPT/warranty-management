import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationCommandHandlers } from './commands';
import { OrganizationQueryHandlers } from './queries';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [...CommonModules],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    JwtAuthGuard,
    RolesGuard,
    ...OrganizationCommandHandlers,
    ...OrganizationQueryHandlers,
  ],
})
export class OrganizationModule {}
