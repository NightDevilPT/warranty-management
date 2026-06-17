// src/modules/org-user/org-user.module.ts
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { OrgUserController } from './org-user.controller';
import { OrgUserService } from './org-user.service';
import { OrgUserCommandHandlers } from './commands';
import { OrgUserQueryHandlers } from './queries';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [...CommonModules],
  controllers: [OrgUserController],
  providers: [
    OrgUserService,
    RolesGuard,
    ...OrgUserCommandHandlers,
    ...OrgUserQueryHandlers,
  ],
})
export class OrgUserModule {}
