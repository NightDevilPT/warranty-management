import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { CqrsModule } from '@nestjs/cqrs';
import { DealerTypeQueryHandlers } from './queries';
import { DealerTypeCommandHandlers } from './commands';
import { DealerTypeService } from './dealer-types.service';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { DealerTypeController } from './dealer-types.controller';

@Module({
  imports: [CqrsModule, ...CommonModules],
  controllers: [DealerTypeController],
  providers: [
    DealerTypeService,
    RolesGuard,
    ...DealerTypeCommandHandlers,
    ...DealerTypeQueryHandlers,
  ],
  exports: [DealerTypeService],
})
export class DealerTypeModule {}
