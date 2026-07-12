import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileCommandHandlers } from './commands';
import { ProfileQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ...ProfileCommandHandlers,
    ...ProfileQueryHandlers,
  ],
})
export class ProfileModule {}
