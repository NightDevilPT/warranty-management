// apps/server/services/file/file.module.ts

import { Module, Global, OnModuleInit } from '@nestjs/common';
import { FileService } from './file.service';

@Global()
@Module({
  providers: [FileService],
  exports: [FileService],
})
export class FileModule implements OnModuleInit {
  constructor(private readonly fileService: FileService) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.fileService.ensureBucketExists();
    }
  }
}
