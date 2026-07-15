import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadCommandHandlers } from './commands';

@Module({
  imports: [...CommonModules],
  controllers: [UploadController],
  providers: [UploadService, ...UploadCommandHandlers],
})
export class UploadModule {}
