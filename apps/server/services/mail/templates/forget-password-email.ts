import { TemplateEnum, TemplatePayloadMap } from "../helpers/template-generator";

export const forgotPasswordTemplate = (
  payload: TemplatePayloadMap[TemplateEnum.FORGET_PASSWORD]
): string => {
  const { username, url } = payload;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #333;
          }

          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          }

          .header {
            background-color: #0046d4;
            padding: 20px;
            text-align: center;
            color: #ffffff;
          }

          .header h1 {
            margin: 0;
            font-size: 22px;
          }

          .body {
            padding: 30px 20px;
            text-align: left;
          }

          .body p {
            font-size: 16px;
            line-height: 1.6;
            margin: 12px 0;
          }

          .button-container {
            text-align: center;
            margin: 30px 0;
          }

          .button {
            background-color: #0046d4;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 5px;
            display: inline-block;
            font-weight: 500;
            font-size: 16px;
          }

          .footer {
            background-color: #f0f2f5;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #777;
          }

          .note {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }

          @media (max-width: 600px) {
            .body {
              padding: 20px 15px;
            }
            .button {
              padding: 10px 20px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="body">
            <p>Hi ${username},</p>
            <p>We received a request to reset the password for your account. Click the button below to set a new password.</p>

            <div class="button-container">
              <a href="${url}" style="color:white;" class="button">Reset Password</a>
            </div>

            <p class="note">This password reset link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>Need help? Contact our support team if you have any questions.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Jobify. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
};