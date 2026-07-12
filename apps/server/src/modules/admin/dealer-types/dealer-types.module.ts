import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { DealerTypesController } from './dealer-types.controller';
import { DealerTypesService } from './dealer-types.service';
import { DealerTypeCommandHandlers } from './commands';
import { DealerTypeQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [DealerTypesController],
  providers: [
    DealerTypesService,
    ...DealerTypeCommandHandlers,
    ...DealerTypeQueryHandlers,
  ],
})
export class DealerTypesModule {}
