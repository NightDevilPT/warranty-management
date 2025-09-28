export enum EmailTemplatesEnum {
  WELCOME = 'WELCOME',
}

export enum MailProviderEnum {
  GMAIL = 'GMAIL',
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
}

export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<any>;
  verifyConnection?(): Promise<boolean>;
}

export interface TemplatePayload {
  template: EmailTemplatesEnum;
  data: any;
}

export interface EmailTemplate {
  getSubject(payload: any): string;
  getHtml(payload: any): string;
  getText?(payload: any): string;
}
