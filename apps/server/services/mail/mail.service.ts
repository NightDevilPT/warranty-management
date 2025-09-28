import {
  EmailTemplatesEnum,
  MailProviderEnum,
  SendMailOptions,
} from 'interface/email.interface';
import { Injectable } from '@nestjs/common';
import { TemplateFactory } from './templates';
import { MailProviderFactory } from './providers';

@Injectable()
export class MailService {
  private provider;

  constructor(
    private readonly templateFactory: TemplateFactory,
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

  private async sendTemplateMail(
    to: string | string[],
    template: EmailTemplatesEnum,
    data: any,
    options: Partial<SendMailOptions> = {},
  ): Promise<any> {
    const content = this.templateFactory.createEmailContent(template, data);

    const mailOptions: SendMailOptions = {
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
      ...options,
    };

    return this.sendMail(mailOptions);
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
    verificationUrl?: string,
  ): Promise<any> {
    return this.sendTemplateMail(to, EmailTemplatesEnum.WELCOME, {
      name,
      verificationUrl,
    });
  }

  async verifyConnection(): Promise<boolean> {
    if (this.provider.verifyConnection) {
      return this.provider.verifyConnection();
    }
    return true;
  }
}
