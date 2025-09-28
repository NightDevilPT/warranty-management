# Warranty Management System - Admin Flow

## Table of Contents

1.  [Overview](#overview)
2.  [Core Concepts: Roles vs. Permissions](#core-concepts-roles-vs-permissions)
3.  [Key Features](#key-features)
    - [Dynamic Forms](#dynamic-forms)
    - [Dynamic Warranty Templates](#dynamic-warranty-templates)
    - [Dynamic Personas & Permissions](#dynamic-personas--permissions)
    - [Custom Email Templates](#custom-email-templates)
4.  [System Admin Flow](#system-admin-flow)
    - [Company Onboarding Process](#company-onboarding-process)
5.  [User & Partner Invitation Flow](#user--partner-invitation-flow)

---

## Overview

The Warranty Management System is a platform that enables companies to manage their warranty processes through a fully customizable portal. Companies can define their specific requirements for product registration, claims, user roles, and dynamic forms.

The onboarding process begins with our Admin team gathering the company's requirements. Using the admin portal, we then configure the company's organization, settings, and initial user accounts. Once setup is complete, the company's designated Super Admin gains full control to further customize and manage their portal, partners, and consumers.

## Core Concepts: Roles vs. Permissions

- **Roles** define a user's **type and position** within the organization. A role identifies **who the user is**.
  _Example:_

    ```typescript
    enum ROLES {
    	ADMIN,
    	COMPANY_ADMIN,
    	COMPANY_PARTNER,
    	CONSUMER,
    }
    ```

- **Permissions** define the specific **actions a user can perform** within the system. Permissions control **what the user can do**.
  _Example:_
    ```json
    {
    	"MANAGE": {
    		"CAN_ADD_PRODUCT": true,
    		"CAN_ADD_CATEGORY": true,
    		"CAN_ADD_CUSTOMER": true,
    		"CAN_ADD_PARTNER": false
    	},
    	"CAN_DO_REGISTRATION": false,
    	"CAN_INITIATE_CLAIMS": true
    }
    ```

## Key Features

### Dynamic Forms

- Generate custom forms tailored to a company's specific data collection needs.
- Supported form types include:
    - Product Form
    - Warranty Registration Form
    - Claim Form
    - Issues Form
    - Categories Form
    - Fault Form
    - Brand Form
    - ...and more as required.

### Dynamic Warranty Templates

- Companies can define multiple warranty types, and the system dynamically generates the corresponding templates.
- When a company adds a product, the relevant warranty template becomes available for partners or admins to attach.
- During consumer registration, selecting a product automatically attaches its associated warranty.
- Templates support custom terms, conditions, and rules that are validated upon registration.

### Dynamic Personas & Permissions

- Companies can create **custom personas** (e.g., Dealer, Installer, Retailer, Repairer) to represent different partner types.
- Company admins can assign granular permissions (e.g., `CAN_DO_REGISTRATION`, `CAN_DO_CLAIMS`, `CAN_INVITE_PARTNER`) to these personas.
- Only the Company Super Admin has full CRUD rights for managing personas and permissions.
- When inviting a new partner, the admin selects a persona to assign, which automatically grants the associated permissions upon signup.

### Custom Email Templates

- Company Super Admins can create and customize email templates for system events.
- Supported events include: `REGISTRATION_CREATED`, `CLAIM_CREATED`, `CLAIM_UPDATED`, `REGISTRATION_UPDATED`, etc.
- Each template supports dynamic variables for the subject, HTML content, and body.

## System Admin Flow

The platform has a single, overarching **System Admin** role with full control over the entire application. This account can be managed or terminated even while the server is running.

The System Admin is responsible for onboarding new companies based on their gathered requirements.

### Company Onboarding Process

1.  **Organization Creation**
    The Admin creates the company's organization, providing details such as:
    `[firstname, lastname, username, orgName, phone, address, email, info: {logo, currency, etc}]`

2.  **Schema Setup**
    The Admin creates the initial set of dynamic form schemas required by the company, such as:
    - Claim
    - Category
    - Brand
    - Product
    - Registration
    - Customer

3.  **Warranty Template Setup**
    The Admin defines the company's warranty templates, configuring:
    - `warrantyType`
    - Validation `rules`
    - `info` (e.g., label, description)
    - `terms` (e.g., label, description)

4.  **Super Admin Invitation**
    The System Admin assigns a user as the **Company Super Admin**. The system automatically sends this user an email invitation to sign up, set their password, and verify their account.

5.  **Super Admin Handover**
    Once the Company Super Admin completes signup, they gain full administrative control over their company's portal, including the ability to manage products, partners, and further customize all settings.

## User & Partner Invitation Flow

The process for adding new users (both Super Admins and Partners) is streamlined:

1.  **Invitation:** An Admin or Super Admin adds a user with details (name, email, organization).
2.  **Email Trigger:**
    - A **Company Super Admin** receives an onboarding email to sign up and verify their account.
    - A **Company Partner** receives an invitation email to join the organization.
3.  **Account & Org Setup:** During signup, the system:
    - Creates the user's account.
    - For partners, it creates a new child organization with default settings.
    - Links the new organization to the parent company by setting its `rootOrgId`.
4.  **Permission Granting:** The user is automatically assigned the permissions associated with the role and persona they were invited under.

**NOTE:** When we add a user, we create one organization for this user and connect the two to each other. The same user can have multiple organizations, allowing the user to maintain relationships with multiple organizations. For example: `user -> {rootOrgId, orgId, role: ROLE[]}[]`

## Common Modules

### File: `apps\server\services\errors\error.module.ts`

```ts
import { Module, Global } from "@nestjs/common";
import { ErrorService } from "./error.service";

@Global()
@Module({
	providers: [ErrorService],
	exports: [ErrorService],
})
export class ErrorModule {}
```

### File: `apps\server\services\errors\error.service.ts`

```ts
import { Injectable } from "@nestjs/common";
import {
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	NotFoundException,
	ConflictException,
	InternalServerErrorException,
	ServiceUnavailableException,
	GatewayTimeoutException,
	PayloadTooLargeException,
	NotImplementedException,
	UnprocessableEntityException,
} from "@nestjs/common";

export interface ErrorOptions {
	description?: string;
	cause?: Error;
}

@Injectable()
export class ErrorService {
	badRequest(message?: string, options?: ErrorOptions): BadRequestException {
		return new BadRequestException(message, options);
	}

	unauthorized(
		message?: string,
		options?: ErrorOptions
	): UnauthorizedException {
		return new UnauthorizedException(message, options);
	}

	forbidden(message?: string, options?: ErrorOptions): ForbiddenException {
		return new ForbiddenException(message, options);
	}

	notFound(message?: string, options?: ErrorOptions): NotFoundException {
		return new NotFoundException(message, options);
	}

	conflict(message?: string, options?: ErrorOptions): ConflictException {
		return new ConflictException(message, options);
	}

	unprocessableEntity(
		message?: string,
		options?: ErrorOptions
	): UnprocessableEntityException {
		return new UnprocessableEntityException(message, options);
	}

	internalServerError(
		message?: string,
		options?: ErrorOptions
	): InternalServerErrorException {
		return new InternalServerErrorException(message, options);
	}

	serviceUnavailable(
		message?: string,
		options?: ErrorOptions
	): ServiceUnavailableException {
		return new ServiceUnavailableException(message, options);
	}

	gatewayTimeout(
		message?: string,
		options?: ErrorOptions
	): GatewayTimeoutException {
		return new GatewayTimeoutException(message, options);
	}

	payloadTooLarge(
		message?: string,
		options?: ErrorOptions
	): PayloadTooLargeException {
		return new PayloadTooLargeException(message, options);
	}

	notImplemented(
		message?: string,
		options?: ErrorOptions
	): NotImplementedException {
		return new NotImplementedException(message, options);
	}
}
```

### File: `apps\server\services\logger\logger.module.ts`

```ts
import { Module, Global } from "@nestjs/common";
import { LoggerService } from "./logger.service";

@Global()
@Module({
	providers: [LoggerService],
	exports: [LoggerService],
})
export class LoggerModule {}
```

### File: `apps\server\services\logger\logger.service.ts`

```ts
import { Injectable } from "@nestjs/common";
import { createLogger, format, transports, Logger } from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

export enum LogLevel {
	ERROR = "error",
	WARN = "warn",
	INFO = "info",
	DEBUG = "debug",
	VERBOSE = "verbose",
}

export interface LogMetadata {
	[key: string]: any;
}

@Injectable()
export class LoggerService {
	private logger: Logger;
	private context?: string;

	constructor() {
		this.initializeLogger();
	}

	private initializeLogger() {
		const consoleFormat = format.combine(
			format.colorize(),
			format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			format.printf(({ timestamp, level, message, context, trace }) => {
				return `${timestamp} [${context || "App"}] ${level}: ${message}${trace ? `\n${trace}` : ""}`;
			})
		);

		const fileFormat = format.combine(
			format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			format.json()
		);

		this.logger = createLogger({
			level: process.env.LOG_LEVEL || "info",
			format: format.combine(
				format.errors({ stack: true }),
				format.timestamp(),
				format.json()
			),
			defaultMeta: { service: "nestjs-app" },
			transports: [
				new transports.Console({ format: consoleFormat }),
				new DailyRotateFile({
					filename: "logs/error-%DATE%.log",
					datePattern: "YYYY-MM-DD",
					level: "error",
					format: fileFormat,
					maxSize: "20m",
					maxFiles: "14d",
				}),
				new DailyRotateFile({
					filename: "logs/combined-%DATE%.log",
					datePattern: "YYYY-MM-DD",
					format: fileFormat,
					maxSize: "20m",
					maxFiles: "14d",
				}),
			],
		});
	}

	setContext(context: string) {
		this.context = context;
	}

	error(
		message: string,
		trace?: string,
		context?: string,
		meta?: LogMetadata
	) {
		this.logger.error({
			message,
			context: context || this.context,
			trace,
			...meta,
		});
	}

	warn(message: string, context?: string, meta?: LogMetadata) {
		this.logger.warn({
			message,
			context: context || this.context,
			...meta,
		});
	}

	log(message: string, context?: string, meta?: LogMetadata) {
		this.logger.info({
			message,
			context: context || this.context,
			...meta,
		});
	}

	info(message: string, context?: string, meta?: LogMetadata) {
		this.logger.info({
			message,
			context: context || this.context,
			...meta,
		});
	}

	debug(message: string, context?: string, meta?: LogMetadata) {
		this.logger.debug({
			message,
			context: context || this.context,
			...meta,
		});
	}

	verbose(message: string, context?: string, meta?: LogMetadata) {
		this.logger.verbose({
			message,
			context: context || this.context,
			...meta,
		});
	}

	createChildLogger(context: string): LoggerService {
		const childLogger = new LoggerService();
		childLogger.setContext(context);
		return childLogger;
	}
}
```

### File: `apps\server\services\prisma\prisma-service.service.ts`

```ts
// src/prisma/prisma.service.ts
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor(private configService: ConfigService) {
		super({
			datasources: {
				db: {
					url: configService.get<string>("databaseUrl"), // This is the key fix
				},
			},
			log: ["query", "info", "warn", "error"],
		});
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
```

### File: `apps\server\services\prisma\prisma.module.ts`

```ts
// src/prisma/prisma.module.ts
import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma-service.service";

@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
```

### File: `apps\server\services\mail\contants\email-styles.constants.ts`

```ts
export const EMAIL_STYLES = `
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #f5f7fa;
    margin: 0;
    padding: 20px;
  }
  
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e5e9;
  }
  
  .email-header {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    padding: 40px 30px;
    text-align: center;
  }
  
  .email-header h1 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .email-header .subtitle {
    font-size: 16px;
    opacity: 0.9;
    font-weight: 300;
  }
  
  .email-content {
    padding: 40px 30px;
  }
  
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
  }
  
  .message {
    font-size: 16px;
    color: #4b5563;
    margin-bottom: 25px;
  }
  
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    padding: 12px 30px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin: 15px 0;
    border: none;
    cursor: pointer;
  }
  
  .button-secondary {
    background: linear-gradient(135deg, #6b7280, #4b5563);
  }
  
  .info-box {
    background: #f8fafc;
    border-left: 4px solid #2563eb;
    padding: 20px;
    margin: 25px 0;
    border-radius: 4px;
  }
  
  .info-box h3 {
    color: #1e40af;
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin: 25px 0;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .feature-icon {
    color: #2563eb;
    font-size: 18px;
  }
  
  .footer {
    background: #f8fafc;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  
  .footer-text {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .contact-info {
    color: #4b5563;
    font-size: 14px;
    margin: 5px 0;
  }
  
  .warranty-details {
    background: #fff7ed;
    border: 1px solid #fdba74;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }
  
  .warranty-details h3 {
    color: #ea580c;
    margin-bottom: 15px;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #fed7aa;
  }
  
  .detail-label {
    font-weight: 600;
    color: #7c2d12;
  }
  
  .detail-value {
    color: #ea580c;
  }
  
  @media (max-width: 600px) {
    body {
      padding: 10px;
    }
    
    .email-content {
      padding: 30px 20px;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    .email-header {
      padding: 30px 20px;
    }
    
    .email-header h1 {
      font-size: 24px;
    }
  }
</style>
`;

export const EMAIL_HEADER = (title: string, subtitle?: string) => `
<div class="email-header">
  <h1>${title}</h1>
  ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
</div>
`;

export const EMAIL_FOOTER = `
<div class="footer">
  <p class="footer-text">WarrantyPro - Professional Warranty Management System</p>
  <p class="contact-info">📧 support@warrantypro.com | 📞 +1 (555) 123-4567</p>
  <p class="contact-info">📍 123 Business Ave, Suite 100, City, State 12345</p>
  <p class="footer-text">If you have any questions, please contact our support team.</p>
</div>
`;

export const EMAIL_BUTTON = (
	text: string,
	url: string,
	secondary: boolean = false
) => `
<a href="${url}" class="button ${secondary ? "button-secondary" : ""}" 
   target="_blank" style="text-decoration: none; color: white;">
  ${text}
</a>
`;

export const INFO_BOX = (title: string, content: string) => `
<div class="info-box">
  <h3>${title}</h3>
  <p>${content}</p>
</div>
`;
```

### File: `apps\server\services\mail\providers\gmail\gmail.provider.ts`

```ts
import * as nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";
import { MailProvider, SendMailOptions } from "interface/email.interface";

@Injectable()
export class GmailProvider implements MailProvider {
	private transporter: nodemailer.Transporter;

	constructor() {
		// Use createTransport instead of createTransporter
		this.transporter = nodemailer.createTransport({
			service: "gmail",
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

			console.log("Email sent successfully:", result.messageId);
			return result;
		} catch (error) {
			console.error("Gmail provider error:", error);
			throw new Error(`Gmail provider error: ${error.message}`);
		}
	}

	async verifyConnection(): Promise<boolean> {
		try {
			await this.transporter.verify();
			console.log("Gmail connection verified");
			return true;
		} catch (error) {
			console.error("Gmail connection failed:", error);
			return false;
		}
	}
}
```

### File: `apps\server\services\mail\providers\index.ts`

```ts
import { Injectable } from "@nestjs/common";
import { GmailProvider } from "./gmail/gmail.provider";
import { MailProvider, MailProviderEnum } from "interface/email.interface";

@Injectable()
export class MailProviderFactory {
	createProvider(providerType: MailProviderEnum): MailProvider {
		switch (providerType) {
			case MailProviderEnum.GMAIL:
				return new GmailProvider();
			default:
				throw new Error(`Unsupported mail provider: ${providerType}`);
		}
	}
}
```

### File: `apps\server\services\mail\templates\welcome-mail\welcome.template.ts`

```ts
import {
	EMAIL_STYLES,
	EMAIL_HEADER,
	EMAIL_BUTTON,
	EMAIL_FOOTER,
} from "services/mail/contants/email-styles.constants";
import { EmailTemplate } from "interface/email.interface";

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
        ${EMAIL_HEADER("Welcome to WarrantyPro!", "Your warranty management solution")}
        
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
                ${EMAIL_BUTTON("Verify Your Email", verificationUrl)}
                <p class="message" style="margin-top: 10px;">
                    Please verify your email address to activate your account.
                </p>
            </div>
            `
					: ""
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
```

### File: `apps\server\services\mail\templates\index.ts`

```ts
import { Injectable } from "@nestjs/common";
import { WelcomeTemplate } from "./welcome-mail/welcome.template";
import { EmailTemplate, EmailTemplatesEnum } from "interface/email.interface";

@Injectable()
export class TemplateFactory {
	private readonly templates: Map<EmailTemplatesEnum, EmailTemplate> =
		new Map();

	constructor() {
		this.registerTemplates();
	}

	private registerTemplates(): void {
		this.templates.set(EmailTemplatesEnum.WELCOME, new WelcomeTemplate());
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
		data: any
	): { subject: string; html: string; text?: string } {
		const templateInstance = this.getTemplate(template);

		return {
			subject: templateInstance.getSubject(data),
			html: templateInstance.getHtml(data),
			text: templateInstance.getText?.(data),
		};
	}
}
```

### File: `apps\server\services\mail\mail.service.ts`

```ts
import {
	EmailTemplatesEnum,
	MailProviderEnum,
	SendMailOptions,
} from "interface/email.interface";
import { Injectable } from "@nestjs/common";
import { TemplateFactory } from "./templates";
import { MailProviderFactory } from "./providers";

@Injectable()
export class MailService {
	private provider;

	constructor(
		private readonly templateFactory: TemplateFactory,
		private readonly providerFactory: MailProviderFactory
	) {
		// Use default provider or specify one
		this.provider = this.providerFactory.createProvider(
			MailProviderEnum.GMAIL
		);
	}

	setProvider(providerType: MailProviderEnum): void {
		this.provider = this.providerFactory.createProvider(providerType);
	}

	async sendMail(options: SendMailOptions): Promise<any> {
		return this.provider.sendMail(options);
	}

	private async sendTemplateMail(
		to: string | string[],
		template: EmailTemplatesEnum,
		data: any,
		options: Partial<SendMailOptions> = {}
	): Promise<any> {
		const content = this.templateFactory.createEmailContent(template, data);

		const mailOptions: SendMailOptions = {
			to,
			subject: content.subject,
			html: content.html,
			text: content.text,
			...options,
		};

		return this.sendMail(mailOptions);
	}

	async sendWelcomeEmail(
		to: string,
		name: string,
		verificationUrl?: string
	): Promise<any> {
		return this.sendTemplateMail(to, EmailTemplatesEnum.WELCOME, {
			name,
			verificationUrl,
		});
	}

	async verifyConnection(): Promise<boolean> {
		if (this.provider.verifyConnection) {
			return this.provider.verifyConnection();
		}
		return true;
	}
}
```

### File: `apps\server\services\mail\mail.module.ts`

```ts
import { MailService } from "./mail.service";
import { TemplateFactory } from "./templates";
import { MailProviderFactory } from "./providers";
import { Module, Global } from "@nestjs/common";

@Global()
@Module({
	providers: [MailService, TemplateFactory, MailProviderFactory],
	exports: [MailService],
})
export class MailModule {}
```

### File: `apps\server\services\index.ts`

```ts
import { CqrsModule } from "@nestjs/cqrs";
import { ErrorModule } from "./errors/error.module";
import { LoggerModule } from "./logger/logger.module";
import { MailModule } from "./mail/mail.module";
import { PrismaModule } from "./prisma/prisma.module";

export const CommonModules = [
	CqrsModule,
	LoggerModule,
	ErrorModule,
	MailModule,
	PrismaModule,
];
```

---

## Middleware code we using for All routes

### File: `apps/server/interface/api.interface.ts`

```ts
export interface IApiTimingMeta {
	processingTime: string;
	serverTime: string;
	requestReceived: string;
	responseSent: string;
}

export interface IApiRequestMeta {
	path: string;
	method: string;
	ip?: string;
	userAgent?: string;
}

export interface IApiPaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
	timings?: IApiTimingMeta;
	request?: IApiRequestMeta;
}

export interface IApiResponse<T> {
	data: T;
	meta?: IApiPaginationMeta;
	message?: string;
	success: boolean;
	statusCode: number;
}
```

### File: `apps/server/middleware/interceptors/response.interceptor.ts`

```ts
// response.interceptor.ts
import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { IApiPaginationMeta, IApiResponse } from "interface/api.interface";

@Injectable()
export class ResponseInterceptor<T>
	implements NestInterceptor<T, IApiResponse<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<IApiResponse<T>> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest();
		const response = httpContext.getResponse();

		// Record various timing points
		const startTime = process.hrtime();
		const startTimestamp = Date.now();

		return next.handle().pipe(
			map((data) => {
				const endTime = process.hrtime(startTime);
				const processingTimeMs =
					endTime[0] * 1000 + endTime[1] / 1000000;
				const timestamp = new Date().toLocaleString();

				const statusCode = this.getStatusCode(context, data);
				const message = this.getMessage(
					context,
					data?.message,
					statusCode
				);

				// Create metadata object
				const metadata = this.createMetadata(
					request,
					startTimestamp,
					processingTimeMs
				);

				// If data is already formatted with our structure, enhance it
				if (this.isAlreadyFormatted(data)) {
					return {
						...data,
						statusCode: data.statusCode || statusCode,
						message: data.message || message,
						meta: {
							...data.meta,
							...metadata,
						},
					};
				}

				// Extract data and meta based on common patterns
				const responseData = this.extractData(data);
				const existingMeta = this.extractMeta(data);

				return {
					data: responseData,
					meta: {
						...existingMeta,
						...metadata,
					},
					success: this.isSuccess(statusCode),
					message: message,
					statusCode: statusCode,
				};
			})
		);
	}

	private createMetadata(
		request: any,
		startTimestamp: number,
		processingTimeMs: number
	) {
		const timestamp = new Date().toLocaleString();

		return {
			timings: {
				processingTime: `${Math.round(processingTimeMs)} ms`,
				serverTime: timestamp,
				requestReceived: new Date(startTimestamp).toISOString(),
				responseSent: new Date().toISOString(),
			},
			request: {
				path: request.url,
				method: request.method,
				ip: this.getClientIp(request),
				userAgent: request.headers["user-agent"],
			},
		};
	}

	private getClientIp(request: any): string {
		return (
			request.ip ||
			request.connection?.remoteAddress ||
			request.socket?.remoteAddress ||
			request.connection?.socket?.remoteAddress ||
			"unknown"
		);
	}

	private isAlreadyFormatted(data: any): boolean {
		return (
			data &&
			typeof data === "object" &&
			"success" in data &&
			"data" in data
		);
	}

	private extractData(data: any): any {
		if (!data) return data;

		// Handle paginated responses
		if (data.items && Array.isArray(data.items)) {
			return data.items;
		}

		// Handle data property
		if (data.data !== undefined) {
			return data.data;
		}

		return data;
	}

	private extractMeta(data: any): IApiPaginationMeta | undefined {
		if (!data?.meta) return undefined;

		return this.transformPaginationMeta(data.meta);
	}

	private transformPaginationMeta(meta: any): IApiPaginationMeta {
		return {
			page: meta.page || meta.currentPage || 1,
			limit: meta.limit || meta.perPage || meta.take || 10,
			total: meta.total || meta.totalItems || 0,
			totalPages:
				meta.totalPages ||
				Math.ceil((meta.total || 0) / (meta.limit || 10)),
			hasNext: meta.hasNext || meta.hasNextPage || false,
			hasPrev: meta.hasPrev || meta.hasPreviousPage || false,
		};
	}

	private getStatusCode(context: ExecutionContext, data: any): number {
		const response = context.switchToHttp().getResponse();
		return data?.statusCode || response.statusCode || 200;
	}

	private isSuccess(statusCode: number): boolean {
		return statusCode >= 200 && statusCode < 300;
	}

	private getMessage(
		context: ExecutionContext,
		existingMessage?: string,
		statusCode?: number
	): string | undefined {
		if (existingMessage) {
			return existingMessage;
		}

		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		const finalStatusCode = statusCode || response.statusCode;

		if (this.isSuccess(finalStatusCode)) {
			return this.getSuccessMessage(request.method);
		}

		return undefined;
	}

	private getSuccessMessage(httpMethod: string): string {
		const messages: { [key: string]: string } = {
			GET: "Request processed successfully",
			POST: "Resource created successfully",
			PUT: "Resource updated successfully",
			PATCH: "Resource updated successfully",
			DELETE: "Resource deleted successfully",
		};

		return messages[httpMethod] || "Operation completed successfully";
	}
}
```

## Database Entities we are using with Prisma

### File : `apps\server\prisma\schema\organization.prisma`

```prisma

model Organization {
  id        String        @id @default(cuid())
  orgName   String
  email     String
  password  String
  phone     String
  isActive  Boolean       @default(true)

  // Flexible info object
  info      Json?         // Structure: { logo: String, currency: String, ... }

  // Relations
  userId    String        // Reference to User who owns/administers this org
  owner     User          @relation("OrganizationOwner", fields: [userId], references: [id], onDelete: Cascade)
  memberships Membership[]            // All memberships for this organization
  settings  Setting?                  // Organization settings

  // Metadata
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@map("organizations")
}


model Membership {
  id        String   @id @default(cuid())
  userId    String
  orgId     String
  rootOrgId String   // Reference to root organization
  roles     ROLES[]  // Array of roles for this user in this organization
  permissions Json // Object of Permission which will helps to assign a permission to the user to do a specific actions

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, orgId])
  @@map("memberships")
}
```

### File : `apps\server\prisma\schema\setting.prisma`

```prisma
model Setting {
  id        String   @id @default(cuid())
  orgId     String   @unique // Scoped to organization (one-to-one)

  // Preferences
  theme     THEME    @default(LIGHT)
  language  LANGUAGE @default(EN)
  color     COLOR    @default(DEFAULT)

  // Relations
  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("settings")
}
```

### File: `apps\server\prisma\schema\user.prisma`

```prisma
model User {
  id           String       @id @default(cuid())
  firstname    String
  lastname     String
  username     String       @unique
  email        String       @unique
  password     String
  otp          Int?
  otpExpired   Int?         // Unix timestamp
  isVerified   Boolean      @default(false)

  // Relations
  memberships  Membership[]
  ownedOrgs    Organization[] @relation("OrganizationOwner")

  // Metadata
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@map("users")
}
```

### File: `apps\server\prisma\schema.prisma`

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ------------------[ Core ENUM Start ]------------------- //
enum ROLES {
  ADMIN
  COMPANY_ADMIN
  COMPANY_PARTNER
  CONSUMER
}

enum THEME {
  DARK
  LIGHT
}

enum LANGUAGE {
  EN
  ES
  FR
  DE
  // Add more as needed
}

enum COLOR {
  RED
  ROSE
  DEFAULT
  VIOLET
  BLUE
  YELLOW
  GREEN
}
// ------------------[ Core ENUM End ]------------------- //
```

---

I am a full-stack developer developing a **warranty management system** organized as a **monorepo** using **Turborepo** and **pnpm** as the package manager.

For the **backend**, I am using **NestJS** and have implemented several **shared services** (e.g., error handling and logging) that are reused across multiple NestJS applications.

The relevant code files are provided above. Key points to note:

- **PrismaService**: Handles database CRUD operations.
- **LoggerService**: Facilitates logging for issue tracking, debugging, and monitoring task status.
- **ErrorService**: Provides methods to throw errors with custom messages for specific error types.
- **MailService**: Manages email delivery to clients.
- **ResponseInterceptor**: Ensures a standardized API response format, encapsulating returned data in a `data` field and including a `meta` field when applicable.
- Store this code in memory for future development tasks.
- Retain the provided **shared service code**, as it will be reused throughout the project.

In the backend, we implement the **CQRS pattern** for CRUD operations. The flow is as follows:

**Controller** -> **Service** -> **Execute (Command/Query)** -> **Trigger (Query/Command) Handler** -> **Return Response** (and optionally trigger another event for background tasks).

**Example**: When a user hits the Create User API, the flow is:
`UserController.createUser` -> `UserService.createUser` -> Triggers `CommandBus.execute(new CreateUserCommand(createUserDto))` -> Handled by `CreateUserCommandHandler`, which may trigger an additional command or event, such as `SendMailCommand` or `SendMailEvent`, to send a verification email.