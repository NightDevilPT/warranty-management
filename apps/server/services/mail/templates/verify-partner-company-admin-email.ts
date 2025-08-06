import {
  TemplateEnum,
  TemplatePayloadMap,
} from '../helpers/template-generator';

export const verifyCompanyAdminAndPartnerEmailTemplate = (
  payload: TemplatePayloadMap[TemplateEnum.VERIFY_COMPANY_EMAIL],
): string => {
  const { username, url } = payload;

  return `
	  <!DOCTYPE html>
  <html lang="en">
	<head>
	  <meta charset="UTF-8" />
	  <meta name="viewport" content="width=device-width, initial-scale=1" />
	  <title>Verify Your Email - Warranty Management</title>
	  <style>
		body {
		  margin: 0;
		  padding: 0;
		  background-color: #f4f6f9;
		  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		  color: #333333;
		}
		.email-wrapper {
		  width: 100%;
		  background-color: #f4f6f9;
		  padding: 30px 10px;
		}
		.email-content {
		  max-width: 600px;
		  margin: 0 auto;
		  background-color: #ffffff;
		  border-radius: 8px;
		  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		  overflow: hidden;
		}
		.email-header {
		  background-color: #003078;
		  padding: 25px 40px;
		  text-align: center;
		  color: #ffffff;
		}
		.email-header h1 {
		  margin: 0;
		  font-weight: 600;
		  font-size: 24px;
		  letter-spacing: 0.5px;
		}
		.email-body {
		  padding: 30px 40px;
		  font-size: 16px;
		  line-height: 1.6;
		}
		.email-body p {
		  margin-bottom: 18px;
		}
		.button-container {
		  text-align: center;
		  margin: 30px 0;
		}
		.btn {
		  background-color: #0070d2;
		  color: #ffffff !important;
		  padding: 14px 28px;
		  text-decoration: none;
		  border-radius: 6px;
		  font-weight: 600;
		  font-size: 16px;
		  display: inline-block;
		  transition: background-color 0.2s ease-in-out;
		}
		.btn:hover {
		  background-color: #005bb5;
		}
		.email-footer {
		  background-color: #f0f2f5;
		  text-align: center;
		  padding: 20px 40px;
		  font-size: 12px;
		  color: #888888;
		}
		@media only screen and (max-width: 480px) {
		  .email-content {
			width: 100% !important;
			border-radius: 0 !important;
			box-shadow: none !important;
		  }
		  .email-header, .email-body, .email-footer {
			padding-left: 20px !important;
			padding-right: 20px !important;
		  }
		  .btn {
			padding: 12px 20px !important;
			font-size: 15px !important;
		  }
		}
	  </style>
	</head>
	<body>
	  <div class="email-wrapper" role="main" aria-label="Verify your email">
		<div class="email-content" role="document">
		  <div class="email-header">
			<h1>Verify Your Email</h1>
		  </div>
		  <div class="email-body">
			<p>Dear <strong>${username}</strong>,</p>
			<p>Welcome to the Warranty Management System. To complete your Partner or Company admin account setup and ensure secure access, please verify your email address by clicking the button below:</p>
			<div class="button-container">
			  <a href="${url}" class="btn" target="_blank" rel="noopener noreferrer" aria-label="Verify your email for Warranty Management">
				Verify Email Address
			  </a>
			</div>
			<p>Thank you for joining us!</p>
		  </div>
		  <div class="email-footer" aria-label="Email Footer">
			&copy; ${new Date().getFullYear()} Warranty Management System. All rights reserved.<br />
			<small>If you have any questions, please contact <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></small>
		  </div>
		</div>
	  </div>
	</body>
  </html>
  
	`;
};
