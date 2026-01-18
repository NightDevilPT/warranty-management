import { MailService } from './mail.service';
import { TemplateFactory } from './templates';
import { MailProviderFactory } from './providers';
import { Module, Global } from '@nestjs/common';
import { EmailBuilder } from './email-builder/email-builder.service';

@Global()
@Module({
  providers: [MailService, TemplateFactory, MailProviderFactory, EmailBuilder],
  exports: [MailService, EmailBuilder],
})
export class MailModule {}
