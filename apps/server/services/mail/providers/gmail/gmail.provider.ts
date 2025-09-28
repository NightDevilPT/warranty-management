import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { MailProvider, SendMailOptions } from 'interface/email.interface';

@Injectable()
export class GmailProvider implements MailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Use createTransport instead of createTransporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password for Gmail
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<any> {
    try {
      const result = await this.transporter.sendMail({
        from: options.from || process.env.GMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      });

      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Gmail provider error:', error);
      throw new Error(`Gmail provider error: ${error.message}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Gmail connection verified');
      return true;
    } catch (error) {
      console.error('Gmail connection failed:', error);
      return false;
    }
  }
}
