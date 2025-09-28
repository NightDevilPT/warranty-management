import {
  EMAIL_STYLES,
  EMAIL_HEADER,
  EMAIL_BUTTON,
  EMAIL_FOOTER,
} from 'services/mail/contants/email-styles.constants';
import { EmailTemplate } from 'interface/email.interface';

export class WelcomeTemplate implements EmailTemplate {
  getSubject(payload: any): string {
    return `Welcome to WarrantyPro, ${payload.name}!`;
  }

  getHtml(payload: any): string {
    const { name, verificationUrl } = payload;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to WarrantyPro</title>
    ${EMAIL_STYLES}
</head>
<body>
    <div class="email-container">
        ${EMAIL_HEADER('Welcome to WarrantyPro!', 'Your warranty management solution')}
        
        <div class="email-content">
            <p class="greeting">Hello ${name},</p>
            
            <p class="message">
                Welcome to WarrantyPro! Your account has been successfully created. 
                Start managing your warranties efficiently with our platform.
            </p>
            
            ${
              verificationUrl
                ? `
            <div style="text-align: center; margin: 20px 0;">
                ${EMAIL_BUTTON('Verify Your Email', verificationUrl)}
                <p class="message" style="margin-top: 10px;">
                    Please verify your email address to activate your account.
                </p>
            </div>
            `
                : ''
            }
        </div>
        
        ${EMAIL_FOOTER}
    </div>
</body>
</html>
    `;
  }

  getText(payload: any): string {
    const { name, verificationUrl } = payload;

    let text = `Welcome to WarrantyPro!\n\n`;
    text += `Hello ${name},\n\n`;
    text += `Welcome to WarrantyPro! Your account has been successfully created.\n\n`;

    if (verificationUrl) {
      text += `Please verify your email address: ${verificationUrl}\n\n`;
    }

    text += `Start managing your warranties efficiently with our platform.\n\n`;
    text += `Best regards,\n`;
    text += `WarrantyPro Team`;

    return text;
  }
}
