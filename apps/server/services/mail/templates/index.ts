import { Injectable } from '@nestjs/common';
import { EmailTemplate, EmailTemplatesEnum } from 'interface/email.interface';

@Injectable()
export class TemplateFactory {
  private readonly templates: Map<EmailTemplatesEnum, EmailTemplate> =
    new Map();

  constructor() {
    this.registerTemplates();
  }

  private registerTemplates(): void {
    // this.templates.set(EmailTemplatesEnum.WELCOME, new WelcomeTemplate());
  }

  private getTemplate(template: EmailTemplatesEnum): EmailTemplate {
    const templateInstance = this.templates.get(template);

    if (!templateInstance) {
      throw new Error(`Template ${template} not found`);
    }

    return templateInstance;
  }

  createEmailContent(
    template: EmailTemplatesEnum,
    data: any,
  ): { subject: string; html: string; text?: string } {
    const templateInstance = this.getTemplate(template);

    return {
      subject: templateInstance.getSubject(data),
      html: templateInstance.getHtml(data),
      text: templateInstance.getText?.(data),
    };
  }
}
