import { Injectable } from '@nestjs/common';
import { GmailProvider } from './gmail/gmail.provider';
import { MailProvider, MailProviderEnum } from 'interface/email.interface';


@Injectable()
export class MailProviderFactory {
  createProvider(providerType: MailProviderEnum): MailProvider {
    switch (providerType) {
      case MailProviderEnum.GMAIL:
        return new GmailProvider();
      default:
        throw new Error(`Unsupported mail provider: ${providerType}`);
    }
  }
}
