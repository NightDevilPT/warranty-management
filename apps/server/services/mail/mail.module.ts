import { MailService } from './mail.service';
import { TemplateFactory } from './templates';
import { MailProviderFactory } from './providers';
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  providers: [MailService, TemplateFactory, MailProviderFactory],
  exports: [MailService],
})
export class MailModule {}
