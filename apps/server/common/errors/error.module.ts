// src/common/errors/error.module.ts
import { Module, Global } from '@nestjs/common';
import { ErrorService } from './error.service';

@Global()
@Module({
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}
