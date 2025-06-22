// src/mail/services/gmail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailPayload, MailServiceInterface } from '../../interface';

@Injectable()
export class GmailService implements MailServiceInterface {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  async sendMail(payload: MailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.DEFAULT_FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  }
}
