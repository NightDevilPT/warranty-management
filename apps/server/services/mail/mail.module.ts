// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailFactoryService } from './services/mail-factory.service';
import { MailSenderService } from './services/mail-sender.service';
import { GmailService } from './services/gmail-service/index.service';

@Module({
  providers: [GmailService, MailFactoryService, MailSenderService],
  exports: [MailFactoryService, MailSenderService],
})
export class MailModule {}
