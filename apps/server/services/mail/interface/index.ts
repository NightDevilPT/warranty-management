// src/common/enums/mail-provider.enum.ts
export enum MailProvider {
  GMAIL = 'gmail',
  RESEND = 'resend',
}

// src/common/interfaces/mail.interface.ts
export interface MailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface MailServiceInterface {
  sendMail(payload: MailPayload): Promise<void>;
}
