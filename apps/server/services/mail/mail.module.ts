import { MailService } from './mail.service';
import { MailProviderFactory } from './providers';
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  providers: [MailService, MailProviderFactory],
  exports: [MailService],
})
export class MailModule {}
