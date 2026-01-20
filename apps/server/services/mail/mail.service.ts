import {
  MailProviderEnum,
  SendMailOptions,
} from 'interface/email.interface';
import { Injectable } from '@nestjs/common';
import { MailProviderFactory } from './providers';

@Injectable()
export class MailService {
  private provider;

  constructor(
    private readonly providerFactory: MailProviderFactory,
  ) {
    // Use default provider or specify one
    this.provider = this.providerFactory.createProvider(MailProviderEnum.GMAIL);
  }

  setProvider(providerType: MailProviderEnum): void {
    this.provider = this.providerFactory.createProvider(providerType);
  }

  async sendMail(options: SendMailOptions): Promise<any> {
    return this.provider.sendMail(options);
  }
}
