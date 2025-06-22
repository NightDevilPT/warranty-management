import { TemplateEnum, TemplatePayloadMap } from "../helpers/template-generator";

export const verifyEmailTemplate = (
  payload: TemplatePayloadMap[TemplateEnum.VERIFY_EMAIL]
): string => {
  const { username, url } = payload;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
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
            <h1>Verify Your Email</h1>
          </div>
          <div class="body">
            <p>Hi ${username},</p>
            <p>Thank you for signing up with us! To get started, please verify your email address by clicking the button below.</p>

            <div class="button-container">
              <a href="${url}" style="color:white;" class="button">Verify Email</a>
            </div>

            <p>If you didn’t create an account, you can safely ignore this email.</p>
            <p>We're glad to have you onboard.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Jobify. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
};
