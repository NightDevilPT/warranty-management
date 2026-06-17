// src/modules/branch/branch.module.ts
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchCommandHandlers } from './commands';
import { BranchQueryHandlers } from './queries';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [...CommonModules],
  controllers: [BranchController],
  providers: [
    BranchService,
    RolesGuard,
    ...BranchCommandHandlers,
    ...BranchQueryHandlers,
  ],
})
export class BranchModule {}
