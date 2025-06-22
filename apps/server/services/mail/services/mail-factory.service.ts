// src/mail/mail-factory.service.ts
import { Injectable } from '@nestjs/common';
import { GmailService } from './gmail-service/index.service';
import { MailProvider, MailServiceInterface } from '../interface';

@Injectable()
export class MailFactoryService {
  constructor(
    private readonly gmailService: GmailService,
  ) {}

  getProvider(provider: MailProvider): MailServiceInterface {
    switch (provider) {
      case MailProvider.GMAIL:
        return this.gmailService;
      default:
        throw new Error(`Unsupported mail provider: ${provider}`);
    }
  }
}
