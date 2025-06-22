import { Injectable } from '@nestjs/common';

import {
  TemplateEnum,
  TemplatePayloadMap,
  templateFunctionMap,
} from '../helpers/template-generator';
import { MailProvider } from '../interface';
import { MailFactoryService } from './mail-factory.service';

@Injectable()
export class MailSenderService {
  constructor(private readonly mailFactoryService: MailFactoryService) {}

  async send(
    provider: MailProvider,
    payload: any,
  ): Promise<{ success: boolean; provider: MailProvider }> {
    const mailer = this.mailFactoryService.getProvider(provider);
    await mailer.sendMail(payload);

    return {
      success: true,
      provider,
    };
  }

  // Generic-safe template mail sender
  async sendMailTemplate<T extends TemplateEnum>(options: {
    templateName: T;
    payload: TemplatePayloadMap[T];
    to: string;
    subject: string;
    provider: MailProvider;
  }): Promise<{ success: boolean; provider: MailProvider }> {
    const { templateName, payload, to, subject, provider } = options;

    const generateHtml = templateFunctionMap[templateName];
    const html = generateHtml(payload);

    const mailer = this.mailFactoryService.getProvider(provider);
    await mailer.sendMail({ to, subject, html });

    return {
      success: true,
      provider,
    };
  }
}
