# 🚀 Warranty Management System - Backend Developer Rule Book v6.0

## Complete & Final Version - AI-Ready

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure & Import Paths](#2-folder-structure--import-paths)
3. [Portal-Based Module Organization](#3-portal-based-module-organization)
4. [Shared Module Architecture](#4-shared-module-architecture)
5. [Portal Implementation Decision Flow](#5-portal-implementation-decision-flow)
6. [Global Services - Complete API](#6-global-services---complete-api)
7. [Guards & Decorators](#7-guards--decorators)
8. [Interceptors](#8-interceptors)
9. [Complete Request Lifecycle](#9-complete-request-lifecycle)
10. [Response Patterns](#10-response-patterns)
11. [Complete File Templates](#11-complete-file-templates)
12. [Organization-Scoped Operations](#12-organization-scoped-operations)
13. [Soft Delete Operations](#13-soft-delete-operations)
14. [Multi-Tenant Data Isolation](#14-multi-tenant-data-isolation)
15. [Anti-Patterns](#15-anti-patterns)
16. [Quick Checklist](#16-quick-checklist)
17. [Error Response Standards](#17-error-response-standards)
18. [Current Implementation Reference](#18-current-implementation-reference)

---

## 1. Project Overview

**Project:** Warranty Management System (WMS)
**Backend:** NestJS + CQRS + Prisma + PostgreSQL
**Authentication:** JWT via httpOnly cookies (access + refresh tokens)
**Multi-tenancy:** Organization-scoped via `orgId` + `orgHash`
**Soft Delete:** All major entities use `deletedAt` pattern

### Key Design Decisions

- `User` = Global identity (email only)
- `UserAccess` = Per-organization account (profile, password, role, permissions)
- Admin has `orgId` linked to system organization (slug: `system`)
- Company/Consumer login requires `orgHash` to identify organization
- `orgHash` is used for URL routing (not `slug`)
- Controller paths do NOT include `api/` prefix (global prefix in main.ts)
- Tokens returned in response body, ResponseInterceptor extracts to cookies
- **Shared modules** for business logic reused across portals

---

## 2. Folder Structure & Import Paths

```text
src/
├── services/                              # Global Services (@Global modules)
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── jwt/
│   │   ├── jwt.service.ts
│   │   └── jwt.module.ts
│   ├── errors/
│   │   ├── error.service.ts
│   │   └── error.module.ts
│   ├── logger/
│   │   ├── logger.service.ts
│   │   └── logger.module.ts
│   ├── files/
│   │   ├── file.service.ts
│   │   └── file.module.ts
│   ├── mail/
│   │   ├── mail.service.ts
│   │   ├── mail.module.ts
│   │   ├── contants/
│   │   │   └── email-styles.constants.ts
│   │   └── providers/
│   │       ├── index.ts
│   │       └── gmail/
│   │           └── gmail.provider.ts
│   └── index.ts                           # Exports CommonModules array
│
├── middleware/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── tenant.guard.ts
│   │   └── roles.guard.ts
│   └── interceptors/
│       ├── response.interceptor.ts
│       └── exception.interceptor.ts
│
├── decorators/
│   ├── public.decorator.ts
│   ├── roles.decorator.ts
│   └── required-feature.decorator.ts
│
├── config/
│   ├── configuration.ts
│   └── swagger.config.ts
│
├── interface/
│   └── api.interface.ts
│
└── modules/
    ├── shared/        # ← NEW: Shared business logic (NO controllers)
    │   ├── brands/
    │   ├── categories/
    │   └── dealer-types/
    ├── auth/          # auth/*
    ├── admin/         # admin/* (controllers only, imports shared)
    ├── company/       # :orgHash/* (controllers only, imports shared)
    ├── consumer/      # :orgHash/consumer/* (controllers only, imports shared)
    └── files/         # files/*
```

### Import Path Standards

| Import Type                 | Path Pattern                        | Example                                        |
| --------------------------- | ----------------------------------- | ---------------------------------------------- |
| **Global Services**         | `services/<service-name>/<file>`    | `services/prisma/prisma.service`               |
| **Middleware/Guards**       | `middleware/guards/<file>`          | `middleware/guards/jwt-auth.guard`             |
| **Middleware/Interceptors** | `middleware/interceptors/<file>`    | `middleware/interceptors/response.interceptor` |
| **Decorators**              | `decorators/<file>`                 | `decorators/roles.decorator`                   |
| **Shared Modules**          | `modules/shared/<feature>/<file>`   | `modules/shared/brands/brands.service`         |
| **Portal Modules**          | `modules/<portal>/<feature>/<file>` | `modules/admin/brands/brands.controller`       |
| **Prisma Generated**        | `generated/prisma/<path>`           | `generated/prisma/enums`                       |
| **Config**                  | `config/<file>`                     | `config/swagger.config`                        |
| **Interface**               | `interface/<file>`                  | `interface/api.interface`                      |

> ⚠️ **CRITICAL**: All imports use paths relative to `src/`. Do NOT include `src/` prefix.

---

## 3. Portal-Based Module Organization

### 3.1 Feature Module Internal Structure

```text
# For PORTAL-SPECIFIC features (only used by one portal):
modules/<portal>/<feature-name>/
├── commands/
│   ├── handlers/
│   │   ├── create-<feature>.handler.ts
│   │   ├── update-<feature>.handler.ts
│   │   └── delete-<feature>.handler.ts
│   ├── impl/
│   │   ├── create-<feature>.command.ts
│   │   ├── update-<feature>.command.ts
│   │   └── delete-<feature>.command.ts
│   └── index.ts
├── queries/
│   ├── handlers/
│   │   ├── get-<feature>.handler.ts
│   │   └── list-<features>.handler.ts
│   ├── impl/
│   │   ├── get-<feature>.query.ts
│   │   └── list-<features>.query.ts
│   └── index.ts
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   └── <feature>-response.dto.ts
├── <feature>.service.ts
├── <feature>.controller.ts
└── <feature>.module.ts

# For SHARED features (used by multiple portals):
modules/shared/<feature-name>/
├── commands/           # Same structure as above
├── queries/            # Same structure as above
├── dto/                # Same structure as above
├── <feature>.service.ts
└── <feature>.module.ts  # NO controller, exports service
```

### 3.2 Portal Definitions

| Portal       | API Prefix          | Guard Requirements         | orgId Source                                          | Example                            |
| ------------ | ------------------- | -------------------------- | ----------------------------------------------------- | ---------------------------------- |
| **auth**     | `auth`              | Mixed                      | N/A                                                   | `POST auth/:portalType/send-otp`   |
| **admin**    | `admin`             | JwtAuthGuard + TenantGuard | `@Param('orgId')` for CUD, `@Query('orgId')` for list | `GET admin/brands?orgId=xxx`       |
| **company**  | `:orgHash`          | JwtAuthGuard + TenantGuard | `req.user.orgId` (set by TenantGuard)                 | `POST a3f2b8c1/brands`             |
| **consumer** | `:orgHash/consumer` | JwtAuthGuard + TenantGuard | `req.user.orgId` (set by TenantGuard)                 | `GET a3f2b8c1/consumer/warranties` |
| **files**    | `files`             | JwtAuthGuard only          | Optional                                              | `POST files/upload`                |

### 3.3 Feature Name Mapping

| Portal       | Features                                                                            |
| ------------ | ----------------------------------------------------------------------------------- |
| **auth**     | `otp`, `profile`                                                                    |
| **admin**    | `organizations`, `features`, `org-features`, `brands`, `categories`, `dealer-types` |
| **company**  | `organizations`, `branches`, `dealer-types`, `users`, `categories`, `brands`        |
| **consumer** | `auth`, `profile`, `warranties`, `registrations`, `brands`, `categories`            |
| **files**    | `upload`                                                                            |
| **shared**   | `brands`, `categories`, `dealer-types` (business logic reused across portals)       |

---

## 4. Shared Module Architecture

### 4.1 When to Use Shared Modules

A feature should be created as a **shared module** when:

- The same CRUD operations are needed by 2 or more portals
- The business logic (validation, creation, queries) is identical across portals
- Only the **route path**, **guard requirements**, and **data scoping** differ per portal

### 4.2 Shared Module Rules

| Rule                         | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| **Location**                 | `src/modules/shared/<feature-name>/`                    |
| **NO Controller**            | Shared modules do NOT have controllers                  |
| **Exports Service**          | Only the service is exported from the module            |
| **Imports CommonModules**    | Same as any other module                                |
| **Portal modules import it** | Admin/Company/Consumer modules import the shared module |

### 4.3 Shared Module Structure

```text
modules/shared/<feature-name>/
├── commands/
│   ├── handlers/
│   │   ├── create-<feature>.handler.ts
│   │   ├── update-<feature>.handler.ts
│   │   └── delete-<feature>.handler.ts
│   ├── impl/
│   │   ├── create-<feature>.command.ts
│   │   ├── update-<feature>.command.ts
│   │   └── delete-<feature>.command.ts
│   └── index.ts
├── queries/
│   ├── handlers/
│   │   ├── get-<feature>.handler.ts
│   │   └── list-<features>.handler.ts
│   ├── impl/
│   │   ├── get-<feature>.query.ts
│   │   └── list-<features>.query.ts
│   └── index.ts
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   └── <feature>-response.dto.ts
├── <feature>.service.ts    # Facade calling CommandBus/QueryBus
└── <feature>.module.ts     # NO controller, exports service
```

### 4.4 Shared Module Template

```typescript
// modules/shared/<feature>/<feature>.module.ts
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { <Feature>Service } from './<feature>.service';
import { <Feature>CommandHandlers } from './commands';
import { <Feature>QueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  providers: [<Feature>Service, ...<Feature>CommandHandlers, ...<Feature>QueryHandlers],
  exports: [<Feature>Service],
})
export class <Feature>Module {}
```

### 4.5 Portal Module Using Shared Module

```typescript
// modules/admin/<feature>/<feature>.module.ts
import { Module } from '@nestjs/common';
import { <Feature>Module } from 'modules/shared/<feature>/<feature>.module';
import { Admin<Feature>Controller } from './<feature>.controller';

@Module({
  imports: [<Feature>Module],
  controllers: [Admin<Feature>Controller],
})
export class Admin<Feature>Module {}

// modules/company/<feature>/<feature>.module.ts
import { Module } from '@nestjs/common';
import { <Feature>Module } from 'modules/shared/<feature>/<feature>.module';
import { Company<Feature>Controller } from './<feature>.controller';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [<Feature>Module],
  controllers: [Company<Feature>Controller],
  providers: [RolesGuard],
})
export class Company<Feature>Module {}

// modules/consumer/<feature>/<feature>.module.ts
import { Module } from '@nestjs/common';
import { <Feature>Module } from 'modules/shared/<feature>/<feature>.module';
import { Consumer<Feature>Controller } from './<feature>.controller';

@Module({
  imports: [<Feature>Module],
  controllers: [Consumer<Feature>Controller],
})
export class Consumer<Feature>Module {}
```

### 4.6 orgId Handling in Shared Services

```typescript
// Shared service - orgId is optional for admin, required for company/consumer
async findAll(
  orgId?: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
) {
  return this.queryBus.execute(
    new ListBrandsQuery(orgId, page, limit, search, status),
  );
}
```

### 4.7 orgId in List Query Handler

```typescript
// Handler - only add orgId filter if provided
const where: any = {};
if (orgId) {
  where.orgId = orgId;
}
// Admin calls without orgId → sees ALL records
// Company calls with req.user.orgId → sees only their org's records
```

### 4.8 Data Isolation Per Portal

| Portal       | GET List orgId             | Behavior                                              |
| ------------ | -------------------------- | ----------------------------------------------------- |
| **Admin**    | Optional `@Query('orgId')` | No orgId → ALL records. With orgId → filtered         |
| **Company**  | Always `req.user.orgId`    | Only their organization's records                     |
| **Consumer** | Always `req.user.orgId`    | Only their organization's records (often active only) |

---

## 5. Portal Implementation Decision Flow

### 5.1 Decision Tree for AI/Developers

When asked to create a new feature, follow this flow:

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Is this feature needed by MULTIPLE portals?         │
│         (admin + company, or company + consumer, etc.)      │
└─────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │ YES                   │ NO
        ▼                       ▼
┌───────────────────┐   ┌───────────────────────────┐
│ STEP 2: Create    │   │ STEP 2: Create portal-    │
│ SHARED module at: │   │ specific module at:       │
│ modules/shared/   │   │ modules/<portal>/         │
│ <feature-name>/   │   │ <feature-name>/           │
│                   │   │ (with controller included) │
│ - Commands        │   └───────────────────────────┘
│ - Queries         │
│ - DTOs            │
│ - Service         │
│ - Module          │
│ (NO controller)   │
└───────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: For EACH portal that needs this feature:            │
│         Create portal controller + module at:               │
│         modules/<portal>/<feature-name>/                    │
│         - <feature>.controller.ts (portal-specific routes)  │
│         - <feature>.module.ts (imports shared module)       │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Portal-Specific Controller Rules

#### Admin Portal Controller

```typescript
@Controller('admin/brands')  // NO :orgId at controller level
// orgId from @Param('orgId') in method path for CUD operations
// orgId from @Query('orgId') (optional) for GET list

@Post('organizations/:orgId')       // orgId required for create
@Get()                               // orgId optional query param
@Get('organizations/:orgId/:id')     // orgId required for get by id
@Patch('organizations/:orgId/:id')   // orgId required for update
@Delete('organizations/:orgId/:id')  // orgId required for delete
```

#### Company Portal Controller

```typescript
@Controller(':orgHash/brands')  // orgHash from URL, resolved by TenantGuard
// orgId ALWAYS from req.user.orgId (set by TenantGuard)

@Post()       // orgId = req.user.orgId
@Get()        // orgId = req.user.orgId (always scoped)
@Get(':id')   // orgId = req.user.orgId
@Patch(':id') // orgId = req.user.orgId
@Delete(':id')// orgId = req.user.orgId
```

#### Consumer Portal Controller

```typescript
@Controller(':orgHash/consumer/brands')
// Read-only typically, always scoped to req.user.orgId
// Often forces status='active' filter

@Get()       // orgId = req.user.orgId, status = 'active'
@Get(':id')  // orgId = req.user.orgId
```

### 5.3 API Endpoint Comparison

| Operation     | Admin                                          | Company                      | Consumer                           |
| ------------- | ---------------------------------------------- | ---------------------------- | ---------------------------------- |
| **List**      | `GET admin/brands?orgId=opt`                   | `GET :orgHash/brands`        | `GET :orgHash/consumer/brands`     |
| **Get by ID** | `GET admin/brands/organizations/:orgId/:id`    | `GET :orgHash/brands/:id`    | `GET :orgHash/consumer/brands/:id` |
| **Create**    | `POST admin/brands/organizations/:orgId`       | `POST :orgHash/brands`       | ❌ Not allowed                     |
| **Update**    | `PATCH admin/brands/organizations/:orgId/:id`  | `PATCH :orgHash/brands/:id`  | ❌ Not allowed                     |
| **Delete**    | `DELETE admin/brands/organizations/:orgId/:id` | `DELETE :orgHash/brands/:id` | ❌ Not allowed                     |

### 5.4 Guard & Decorator Requirements Per Portal

| Portal       | JwtAuthGuard | TenantGuard | RolesGuard |  @Roles  | @RequiredFeature |
| ------------ | :----------: | :---------: | :--------: | :------: | :--------------: |
| **Admin**    |      ✅      |     ✅      |     ❌     |    ❌    |        ❌        |
| **Company**  |      ✅      |     ✅      |  ✅ (CUD)  | Required |     Required     |
| **Consumer** |      ✅      |     ✅      |     ❌     |    ❌    |        ❌        |

---

## 6. Global Services - Complete API

> **CRITICAL: All services are @Global() - NEVER import their modules. Just inject the service directly.**

### 6.1 PrismaService

```typescript
import { PrismaService } from 'services/prisma/prisma.service';

// Inject in constructor
constructor(private readonly prisma: PrismaService) {}

// Available Methods:
prisma.user.findUnique(args)
prisma.user.findFirst(args)
prisma.user.findMany(args)
prisma.user.create(args)
prisma.user.update(args)
prisma.user.upsert(args)
prisma.user.count(args)
prisma.user.delete(args)  // ⚠️ NEVER use - always soft delete

prisma.userAccess.findUnique(args)
prisma.userAccess.findFirst(args)
prisma.userAccess.findMany(args)
prisma.userAccess.create(args)
prisma.userAccess.update(args)
prisma.userAccess.upsert(args)
prisma.userAccess.count(args)

prisma.organization.findUnique(args)
prisma.organization.findFirst(args)
prisma.organization.findMany(args)
prisma.organization.create(args)
prisma.organization.update(args)
prisma.organization.upsert(args)
prisma.organization.count(args)

prisma.brand.findUnique / findFirst / findMany / create / update / upsert / count
prisma.category.findUnique / findFirst / findMany / create / update / upsert / count
prisma.dealerType.findUnique / findFirst / findMany / create / update / upsert / count
prisma.feature.findUnique / findFirst / findMany / create / update / upsert / count
prisma.featureAccess.findUnique / findFirst / findMany / create / update / upsert / count
prisma.formSchema.findUnique / findFirst / findMany / create / update / upsert / count
prisma.formData.findUnique / findFirst / findMany / create / update / upsert / count
prisma.warrantyTemplate.findUnique / findFirst / findMany / create / update / upsert / count
prisma.warranty.findUnique / findFirst / findMany / create / update / upsert / count
prisma.otpVerification.findUnique / findFirst / findMany / create / update / upsert / count

// Transaction support
prisma.$transaction([prisma.user.create(...), prisma.userAccess.create(...)])
prisma.$transaction(async (tx) => {
  const user = await tx.user.create(...);
  const access = await tx.userAccess.create(...);
  return { user, access };
})

// ⚠️ GOLDEN RULES:
// 1. Every query MUST include orgId + deletedAt: null
// 2. NEVER use .delete() - always use .update() with deletedAt
// 3. For admin-only queries where orgId is system org, still filter by orgId
```

### 6.2 ErrorService

```typescript
import { ErrorService } from 'services/errors/error.service';

// Inject in constructor
constructor(private readonly errorService: ErrorService) {}

// Methods (all throw immediately, return type is 'never'):
errorService.badRequest(message: string, options?: ErrorOptions)       // 400
errorService.unauthorized(message: string, options?: ErrorOptions)     // 401
errorService.forbidden(message: string, options?: ErrorOptions)        // 403
errorService.notFound(message: string, options?: ErrorOptions)         // 404
errorService.conflict(message: string, options?: ErrorOptions)         // 409
errorService.unprocessableEntity(message: string, options?: ErrorOptions) // 422
errorService.internalServerError(message: string, options?: ErrorOptions) // 500
errorService.serviceUnavailable(message: string, options?: ErrorOptions)  // 503
errorService.payloadTooLarge(message: string, options?: ErrorOptions)     // 413
errorService.notImplemented(message: string, options?: ErrorOptions)      // 501
errorService.gatewayTimeout(message: string, options?: ErrorOptions)      // 504

// ErrorOptions interface:
interface ErrorOptions {
  description?: string;  // Additional error details for logs
  cause?: Error;         // Original error for stack trace
}

// Usage examples:
throw this.errorService.notFound('Organization not found');
throw this.errorService.unauthorized('Invalid or expired OTP');
throw this.errorService.conflict('Phone number already in use');
throw this.errorService.internalServerError('Failed to create brand', { cause: error });
```

### 6.3 LoggerService

```typescript
import { LoggerService } from 'services/logger/logger.service';

// Inject in constructor
constructor(private readonly logger: LoggerService) {
  // ⚠️ ALWAYS set context in constructor
  this.logger.setContext(ClassName.name);
}

// Methods:
logger.log(message: string, context?: string, meta?: Record<string, any>): void
logger.warn(message: string, context?: string, meta?: Record<string, any>): void
logger.error(message: string, trace?: string, context?: string, meta?: Record<string, any>): void
logger.debug(message: string, context?: string, meta?: Record<string, any>): void

// Usage examples:
this.logger.log('OTP sent successfully', undefined, { email, portalType, otp });
this.logger.warn('Feature access denied', undefined, { userId, requiredFeature });
this.logger.error('Failed to create brand', error.stack, undefined, { orgId, name });
this.logger.debug('Tenant check passed', undefined, { userId, orgId, role });

// ⚠️ NEVER use console.log() or console.error() - always use logger
```

### 6.4 JwtService

```typescript
import { JwtService } from 'services/jwt/jwt.service';

// Inject in constructor
constructor(private readonly jwtService: JwtService) {}

// Key Interfaces:
interface JwtPayload {
  sub: string;           // UserAccess ID (primary subject)
  userId?: string;       // User ID (global identity)
  email?: string;
  phoneNumber?: string;
  orgId?: string;
  orgHash?: string;
  orgSlug?: string;
  portalType?: string;
  role: string;
  permissions?: string[];
  fullName?: string;
  profile?: string | null;
  type?: 'access' | 'refresh';
}

interface TokenPair {
  accessToken: string;    // 15 minutes expiry
  refreshToken: string;   // 7 days expiry
}

// Methods:
jwtService.generateTokenPair(payload: JwtPayload): Promise<TokenPair>
  // Generates both access and refresh tokens
  // Access token contains full payload including permissions
  // Refresh token contains minimal payload (sub, userId, type)

jwtService.generateAccessToken(payload: JwtPayload): Promise<string>
  // Generates only access token (15 min expiry)

jwtService.generateRefreshToken(payload: JwtPayload): Promise<string>
  // Generates only refresh token (7 day expiry)

jwtService.verifyAccessToken(token: string): Promise<JwtPayload>
  // Verifies and decodes access token
  // Throws if expired or invalid

jwtService.verifyRefreshToken(token: string): Promise<JwtPayload>
  // Verifies and decodes refresh token
  // Throws if expired or invalid

jwtService.decodeToken(token: string): JwtPayload | null
  // Decodes token without verification (for reading payload)
  // Returns null if token is malformed

// ⚠️ CRITICAL: Access tokens contain permissions, refresh tokens do NOT
// After token refresh, permissions array will be empty - must re-fetch from DB
// Always pass UserAccess ID as 'sub' field
```

### 6.5 FileService

```typescript
import { FileService } from 'services/files/file.service';

// Inject in constructor
constructor(private readonly fileService: FileService) {}

// Interfaces:
interface UploadedFile {
  key: string;          // S3 path: "profiles/1234567890-abc123.jpg"
  url: string;          // Presigned URL (or direct URL for local dev)
  fileName: string;     // Generated unique filename
  originalName: string; // Original uploaded filename
  mimeType: string;     // MIME type
  size: number;         // File size in bytes
}

// Methods:
fileService.uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFile>
  // Uploads a single file to S3
  // folder: 'profiles' | 'organizations' | 'brands' | 'categories' | 'uploads'
  // Default folder: 'uploads'

fileService.uploadFiles(files: Express.Multer.File[], folder?: string): Promise<UploadedFile[]>
  // Uploads multiple files to S3

fileService.getDownloadUrl(key: string): Promise<string>
  // Generates a presigned URL for downloading/viewing a file

fileService.deleteFile(key: string): Promise<void>
  // Deletes a file from S3 by its key

// Standard folders: 'profiles', 'organizations', 'brands', 'categories', 'uploads'

// ⚠️ CRITICAL: When replacing files (e.g., profile picture), delete old file BEFORE uploading new
// Example:
if (userAccess.profile) {
  const oldKey = userAccess.profile.split('/').pop();
  if (oldKey) await this.fileService.deleteFile(`profiles/${oldKey}`);
}
const uploaded = await this.fileService.uploadFile(file, 'profiles');
```

### 6.6 MailService

```typescript
import { MailService } from 'services/mail/mail.service';
import { EMAIL_STYLES } from 'services/mail/contants/email-styles.constants';

// Inject in constructor
constructor(private readonly mailService: MailService) {}

// Interfaces:
interface SendMailOptions {
  to: string;           // Recipient email
  subject: string;      // Email subject
  html?: string;        // HTML body (use EMAIL_STYLES for styling)
  text?: string;        // Plain text body (fallback)
  from?: string;        // Sender email (optional, uses default)
  cc?: string;          // CC recipients
  bcc?: string;         // BCC recipients
  attachments?: any[];  // File attachments
}

// Methods:
mailService.sendMail(options: SendMailOptions): Promise<any>
  // Sends email using configured provider (Gmail, SMTP, etc.)

mailService.setProvider(providerType: MailProviderEnum): void
  // Switches email provider at runtime

// Usage example:
await this.mailService.sendMail({
  to: email,
  subject: 'Your OTP for Login',
  html: `<div style="${EMAIL_STYLES.container}">
           <p>Your OTP is: <strong>${otp}</strong></p>
           <p>Expires in 10 minutes.</p>
         </div>`,
});

// ⚠️ In development (NODE_ENV !== 'production'), skip email sending and return OTP in response
```

### 6.7 CommonModules

```typescript
// File: src/services/index.ts

import { CqrsModule } from '@nestjs/cqrs';
import { ErrorModule } from './errors/error.module';
import { LoggerModule } from './logger/logger.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { FileModule } from './files/file.module';
import { JwtModule } from './jwt/jwt.module';

export const CommonModules = [
  CqrsModule,      // CQRS command/query bus
  LoggerModule,     // Winston logger
  ErrorModule,      // HTTP error service
  MailModule,       // Email service
  PrismaModule,     // Database ORM
  FileModule,       // S3 file upload/download
  JwtModule,        // JWT token generation/verification
];

// Usage in EVERY module:
@Module({
  imports: [...CommonModules],
  controllers: [<Feature>Controller],
  providers: [<Feature>Service, ...<Feature>CommandHandlers, ...<Feature>QueryHandlers],
})
export class <Feature>Module {}
```

---

## 7. Guards & Decorators

### 7.1 Guard Overview

| Guard            | Scope        | Registration           | Purpose                                                             |
| ---------------- | ------------ | ---------------------- | ------------------------------------------------------------------- |
| **JwtAuthGuard** | Global       | APP_GUARD in AppModule | Extracts JWT from cookies, verifies, refreshes, attaches `req.user` |
| **TenantGuard**  | Global       | APP_GUARD in AppModule | Resolves org from `orgHash`, validates UserAccess, checks features  |
| **RolesGuard**   | Per-endpoint | @UseGuards(RolesGuard) | Checks `req.user.role` against @Roles() decorator                   |

### 7.2 App Module (Global Guard Registration)

```typescript
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "middleware/guards/jwt-auth.guard";
import { TenantGuard } from "middleware/guards/tenant.guard";

@Module({
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
})
export class AppModule {}
```

### 7.3 JwtAuthGuard - Complete Behavior

```typescript
// File: src/middleware/guards/jwt-auth.guard.ts

// What it does:
// 1. Extracts accessToken and refreshToken from cookies
// 2. If accessToken is valid → verifies and attaches req.user
// 3. If accessToken expired but refreshToken valid → generates new token pair, sets cookies, attaches req.user
// 4. If both expired → clears cookies, throws 401
// 5. For logout requests → minimal user attachment, always allows

// req.user structure after JwtAuthGuard:
request.user = {
  id: payload.sub, // UserAccess ID
  email: payload.email,
  phoneNumber: payload.phoneNumber,
  role: payload.role,
  orgId: payload.orgId,
  orgSlug: payload.orgSlug,
  portalType: payload.portalType,
  permissions: payload.permissions || [],
};
```

### 7.4 TenantGuard - Complete Behavior

```typescript
// File: src/middleware/guards/tenant.guard.ts

// Step 0: Skip for @Public() routes
// Step 1: Skip org resolution for auth routes and file routes
// Step 2: ADMIN users bypass all checks
// Step 3: Extract orgHash from URL params → Find organization by hash
// Step 4: Validate org exists and isActive
// Step 5: Find UserAccess (userId + orgId + portalType)
// Step 6: Verify portal type matches route (company vs consumer)
// Step 7: Attach resolved org context to req.user
// Step 8: COMPANY_SUPER_ADMIN bypasses feature checks
// Step 9: Check @RequiredFeature() if present

// Route path detection:
const routePath = request.route?.path || "";
const isAuthRoute = routePath.startsWith("/api/auth");
```

### 7.5 RolesGuard - Complete Behavior

```typescript
// File: src/middleware/guards/roles.guard.ts

// What it does:
// 1. Reads @Roles() decorator metadata
// 2. Compares req.user.role against required roles
// 3. Throws 403 if role doesn't match

// Must be used with @UseGuards(RolesGuard) on the endpoint
```

### 7.6 Decorators

```typescript
// @Public() - Bypass all guards
import { SetMetadata } from "@nestjs/common";
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// @Roles() - Require specific roles
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// @RequiredFeature() - Require specific permission
import { SetMetadata } from "@nestjs/common";
export const REQUIRED_FEATURE_KEY = "requiredFeature";
export const RequiredFeature = (feature: string) =>
  SetMetadata(REQUIRED_FEATURE_KEY, feature);
```

### 7.7 Combined Usage

```typescript
// PUBLIC - No guards
@Public()
@Post(':portalType/send-otp')

// PROTECTED - Guards on controller
@Controller('auth/me')
@UseGuards(JwtAuthGuard, TenantGuard)

// SIMPLE LOGIC - No CQRS needed (logout)
@Post('logout')
async logout(@Req() req, @Res({ passthrough: true }) res) {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  return { message: 'Logged out successfully' };
}

// ROLE PROTECTED
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_SUPER_ADMIN)

// FEATURE PROTECTED
@RequiredFeature('BRAND_CREATE')

// ROLE + FEATURE
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_STAFF, UserRole.COMPANY_SUPER_ADMIN)
@RequiredFeature('BRAND_CREATE')
```

### 7.8 Permission Check Rules

| User Type           | Tenant Check              | Feature Check               |
| ------------------- | ------------------------- | --------------------------- |
| ADMIN               | Bypassed                  | Bypassed                    |
| COMPANY_SUPER_ADMIN | Org + UserAccess verified | Bypassed                    |
| COMPANY_STAFF       | Org + UserAccess verified | Checked if @RequiredFeature |
| COMPANY_PARTNER     | Org + UserAccess verified | Checked if @RequiredFeature |
| CONSUMER            | Org + UserAccess verified | Checked if @RequiredFeature |

---

## 8. Interceptors

### 8.1 ResponseInterceptor (Success)

```typescript
// File: src/middleware/interceptors/response.interceptor.ts

// What it does:
// 1. Wraps all successful responses in standard format
// 2. Extracts accessToken/refreshToken from response body → sets httpOnly cookies
// 3. Removes tokens from response body (prevents token leakage)
// 4. Adds timing and request metadata
// 5. Auto-generates success messages based on HTTP method

// Standard Response Format:
{
  "success": true,
  "data": <your-response-data>,
  "message": "Request processed successfully",  // Auto-generated
  "statusCode": 200,
  "meta": {
    "timings": {
      "processingTime": "123 ms",
      "serverTime": "12/7/2026, 10:30:00 am",
      "requestReceived": "12/7/2026, 10:30:00 am",
      "responseSent": "12/7/2026, 10:30:00 am"
    },
    "request": {
      "path": "/auth/me",
      "method": "GET",
      "ip": "::1",
      "userAgent": "Mozilla/5.0..."
    }
  }
}

// Auto-Success Messages:
// GET    → "Request processed successfully"
// POST   → "Resource created successfully"
// PUT    → "Resource updated successfully"
// PATCH  → "Resource updated successfully"
// DELETE → "Resource deleted successfully"

// Token Extraction (happens automatically):
// If handler returns { accessToken, refreshToken, ...user, ...org }
// → Interceptor extracts tokens to cookies
// → Response body only contains { user, org, ... }
```

### 8.2 ExceptionInterceptor (Error)

```typescript
// File: src/middleware/interceptors/exception.interceptor.ts

// What it does:
// 1. Catches ALL unhandled exceptions
// 2. Wraps errors in standard format
// 3. Logs every error with stack trace via LoggerService
// 4. Unknown errors → 500 "Internal server error"

// Error Response Format:
{
  "success": false,
  "data": null,
  "message": "Error message from exception",
  "statusCode": 400,
  "meta": {
    "timings": { ... },
    "request": { ... }
  }
}
```

---

## 9. Complete Request Lifecycle

### 9.1 Admin Request Lifecycle

```
GET /admin/brands?orgId=xxx-xxx-xxx
Headers: Cookie: accessToken=xxx

┌─────────────────────────────────────────────────────────────┐
│ 1. ExceptionInterceptor wraps entire request                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. JwtAuthGuard                                            │
│    • Extract accessToken from cookie                        │
│    • Verify JWT → { sub, email, role, orgId, permissions } │
│    • Attach: req.user = { id, email, role, perms }         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TenantGuard                                             │
│    • Route is /api/admin → ADMIN user                       │
│    • Bypasses all checks (admin sees everything)            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Controller → @Query('orgId') is optional                 │
│    → Calls brandsService.findAll(orgId, page, limit, ...)   │
│    → If orgId provided → filters by that org                │
│    → If orgId not provided → returns ALL brands             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ResponseInterceptor wraps success response               │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Company Request Lifecycle

```
POST /a3f2b8c1/brands
Headers: Cookie: accessToken=xxx; refreshToken=yyy
Body: { name: "Samsung", description: "Electronics" }

┌─────────────────────────────────────────────────────────────┐
│ 1. ExceptionInterceptor wraps entire request                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. JwtAuthGuard                                            │
│    • Extract accessToken from cookie                        │
│    • Verify JWT → { sub, email, role, orgId, permissions } │
│    • Attach: req.user = { id, email, role, orgId, perms }  │
│    • If expired, try refresh token                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TenantGuard                                             │
│    • Check @Public() → No → Continue                        │
│    • Check route → Not auth/file → Continue                 │
│    • Check role → COMPANY_STAFF → Continue                  │
│    • Extract orgHash "a3f2b8c1" from URL                    │
│    • Find Organization by hash (must be active)             │
│    • Find UserAccess (userId + orgId + portalType)          │
│    • Validate UserAccess is active                          │
│    • Attach full org context to req.user                    │
│    • Check @RequiredFeature → verify permissions            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RolesGuard (if @UseGuards(RolesGuard) present)          │
│    • Check req.user.role against @Roles()                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Controller → Service → CQRS Handler → Prisma            │
│    • orgId = req.user.orgId (ALWAYS scoped)                 │
│    • Handler checks duplicate slug (only active records)    │
│    • Creates brand with orgId, createdBy, updatedBy         │
│    • Returns BrandResponseDto.fromEntity(brand)             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. ResponseInterceptor wraps success response               │
│    • Adds metadata (timings, request info)                  │
│    • Extracts tokens to cookies if present                  │
│    • Removes tokens from response body                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Response Patterns

### 10.1 Three Allowed Return Patterns from Handlers

```typescript
// PATTERN 1: Return DTO directly (most common)
return BrandResponseDto.fromEntity(brand);
// ResponseInterceptor wraps it automatically

// PATTERN 2: Return with custom message
return {
  data: BrandResponseDto.fromEntity(brand),
  message: "Brand created successfully",
};

// PATTERN 3: Return paginated
return {
  items: BrandResponseDto.fromEntities(brands),
  meta: {
    page: 1,
    limit: 10,
    total: 50,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
  },
};
```

### 10.2 Token Handling

```typescript
// ✅ CORRECT - Return tokens in response body (interceptor extracts to cookies)
return {
  accessToken: tokenPair.accessToken,
  refreshToken: tokenPair.refreshToken,
  user: { id, email, fullName, role, profile },
  org: { id, name, hash },
  portalType,
  permissions,
};

// ❌ WRONG - Never manually set cookies in handlers
res.cookie('accessToken', token, { httpOnly: true, ... });
```

### 10.3 What You Return vs What Client Gets

```typescript
// HANDLER RETURNS:
return ProfileResponseDto.fromEntity({ id, email, fullName, ... });

// CLIENT RECEIVES (after ResponseInterceptor):
{
  success: true,
  data: { id, email, fullName, ... },
  message: "Request processed successfully",
  statusCode: 200,
  meta: { timings: {...}, request: {...} }
}

// NEVER manually wrap with success/statusCode - interceptors do this!
```

---

## 11. Complete File Templates

### 11.1 Create DTO

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class Create<Feature>Dto {
  @ApiProperty({ description: 'Name', example: 'Example Name' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Optional description' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;
}
```

### 11.2 Update DTO

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class Update<Feature>Dto {
  @ApiPropertyOptional({ description: 'Name', example: 'Updated Name' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;
}
```

### 11.3 Response DTO

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class <Feature>ResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Name' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): <Feature>ResponseDto {
    return plainToInstance(<Feature>ResponseDto, entity, { excludeExtraneousValues: true });
  }

  static fromEntities(entities: any[]): <Feature>ResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
```

### 11.4 Create Command

```typescript
import { Create<Feature>Dto } from '../../dto/create-<feature>.dto';

export class Create<Feature>Command {
  constructor(
    public readonly dto: Create<Feature>Dto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
```

### 11.5 Update Command

```typescript
import { Update<Feature>Dto } from '../../dto/update-<feature>.dto';

export class Update<Feature>Command {
  constructor(
    public readonly id: string,
    public readonly dto: Update<Feature>Dto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
```

### 11.6 Delete Command

```typescript
export class Delete<Feature>Command {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
```

### 11.7 Create Command Handler

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Create<Feature>Command } from '../impl/create-<feature>.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { <Feature>ResponseDto } from '../../dto/<feature>-response.dto';

@CommandHandler(Create<Feature>Command)
export class Create<Feature>Handler implements ICommandHandler<Create<Feature>Command> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(Create<Feature>Handler.name);
  }

  async execute(command: Create<Feature>Command): Promise<<Feature>ResponseDto> {
    const { dto, orgId, userId } = command;

    try {
      // Check for duplicates among active records
      const existing = await this.prisma.<model>.findFirst({
        where: {
          orgId,
          slug: dto.name.toLowerCase().replace(/\s+/g, '-'),
          deletedAt: null,
        },
      });

      if (existing) {
        throw this.errorService.conflict('<Feature> with this name already exists');
      }

      const result = await this.prisma.<model>.create({
        data: {
          orgId,
          name: dto.name,
          slug: dto.name.toLowerCase().replace(/\s+/g, '-'),
          description: dto.description,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('Created <feature>', undefined, { id: result.id, orgId });
      return <Feature>ResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create <feature>', error.stack);
      throw this.errorService.internalServerError('Failed to create <feature>');
    }
  }
}
```

### 11.8 Update Command Handler

```typescript
@CommandHandler(Update<Feature>Command)
export class Update<Feature>Handler implements ICommandHandler<Update<Feature>Command> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(Update<Feature>Handler.name);
  }

  async execute(command: Update<Feature>Command): Promise<<Feature>ResponseDto> {
    const { id, dto, orgId, userId } = command;

    try {
      const existing = await this.prisma.<model>.findFirst({
        where: { id, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('<Feature> not found');
      }

      const updateData: any = { updatedBy: userId };
      if (dto.name !== undefined) {
        updateData.name = dto.name;
        updateData.slug = dto.name.toLowerCase().replace(/\s+/g, '-');
      }
      if (dto.description !== undefined) updateData.description = dto.description;

      const result = await this.prisma.<model>.update({
        where: { id },
        data: updateData,
      });

      this.logger.log('Updated <feature>', undefined, { id, orgId });
      return <Feature>ResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to update <feature>', error.stack);
      throw this.errorService.internalServerError('Failed to update <feature>');
    }
  }
}
```

### 11.9 Delete Command Handler

```typescript
@CommandHandler(Delete<Feature>Command)
export class Delete<Feature>Handler implements ICommandHandler<Delete<Feature>Command> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(Delete<Feature>Handler.name);
  }

  async execute(command: Delete<Feature>Command): Promise<void> {
    const { id, orgId, userId } = command;

    try {
      const existing = await this.prisma.<model>.findFirst({
        where: { id, orgId, deletedAt: null },
      });

      if (!existing) {
        throw this.errorService.notFound('<Feature> not found');
      }

      // SOFT DELETE - NEVER hard delete
      await this.prisma.<model>.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
          isActive: false,
        },
      });

      this.logger.log('Soft deleted <feature>', undefined, { id, orgId });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete <feature>', error.stack);
      throw this.errorService.internalServerError('Failed to delete <feature>');
    }
  }
}
```

### 11.10 Commands Index

```typescript
import { Create<Feature>Handler } from './handlers/create-<feature>.handler';
import { Update<Feature>Handler } from './handlers/update-<feature>.handler';
import { Delete<Feature>Handler } from './handlers/delete-<feature>.handler';

export const <Feature>CommandHandlers = [
  Create<Feature>Handler,
  Update<Feature>Handler,
  Delete<Feature>Handler,
];
```

### 11.11 Get Query

```typescript
export class Get<Feature>Query {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
  ) {}
}
```

### 11.12 List Query (with optional orgId for admin)

```typescript
export class List<Features>Query {
  constructor(
    public readonly orgId?: string,    // Optional for admin, required for company/consumer
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly status?: string,
  ) {}
}
```

### 11.13 Get Query Handler

```typescript
@QueryHandler(Get<Feature>Query)
export class Get<Feature>Handler implements IQueryHandler<Get<Feature>Query> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(Get<Feature>Handler.name);
  }

  async execute(query: Get<Feature>Query): Promise<<Feature>ResponseDto> {
    const { id, orgId } = query;

    try {
      const result = await this.prisma.<model>.findFirst({
        where: { id, orgId, deletedAt: null },
      });

      if (!result) {
        throw this.errorService.notFound('<Feature> not found');
      }

      return <Feature>ResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to get <feature>', error.stack);
      throw this.errorService.internalServerError('Failed to get <feature>');
    }
  }
}
```

### 11.14 List Query Handler (with optional orgId)

```typescript
@QueryHandler(List<Features>Query)
export class List<Features>Handler implements IQueryHandler<List<Features>Query> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(List<Features>Handler.name);
  }

  async execute(query: List<Features>Query) {
    const { orgId, page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = {};

      // Only filter by orgId if provided (admin can skip this)
      if (orgId) {
        where.orgId = orgId;
      }

      // Status filter
      if (status === 'active') {
        where.isActive = true;
        where.deletedAt = null;
      } else if (status === 'inactive') {
        where.isActive = false;
        where.deletedAt = null;
      } else if (status === 'deleted') {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }

      // Search
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.<model>.findMany({
          where, skip, take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.<model>.count({ where }),
      ]);

      return {
        items: <Feature>ResponseDto.fromEntities(items),
        meta: {
          page, limit, total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to list <features>', error.stack);
      throw this.errorService.internalServerError('Failed to list <features>');
    }
  }
}
```

### 11.15 Queries Index

```typescript
import { Get<Feature>Handler } from './handlers/get-<feature>.handler';
import { List<Features>Handler } from './handlers/list-<features>.handler';

export const <Feature>QueryHandlers = [Get<Feature>Handler, List<Features>Handler];
```

### 11.16 Shared Service Facade (with optional orgId for findAll)

```typescript
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Create<Feature>Dto } from './dto/create-<feature>.dto';
import { Update<Feature>Dto } from './dto/update-<feature>.dto';
import { <Feature>ResponseDto } from './dto/<feature>-response.dto';
import { Create<Feature>Command } from './commands/impl/create-<feature>.command';
import { Update<Feature>Command } from './commands/impl/update-<feature>.command';
import { Delete<Feature>Command } from './commands/impl/delete-<feature>.command';
import { Get<Feature>Query } from './queries/impl/get-<feature>.query';
import { List<Features>Query } from './queries/impl/list-<features>.query';

@Injectable()
export class <Feature>Service {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: Create<Feature>Dto, orgId: string, userId: string): Promise<<Feature>ResponseDto> {
    return this.commandBus.execute(new Create<Feature>Command(dto, orgId, userId));
  }

  // orgId is OPTIONAL - admin may not pass it, company/consumer always do
  async findAll(orgId?: string, page: number = 1, limit: number = 10, search?: string, status?: string) {
    return this.queryBus.execute(new List<Features>Query(orgId, page, limit, search, status));
  }

  async findById(id: string, orgId: string): Promise<<Feature>ResponseDto> {
    return this.queryBus.execute(new Get<Feature>Query(id, orgId));
  }

  async update(id: string, dto: Update<Feature>Dto, orgId: string, userId: string): Promise<<Feature>ResponseDto> {
    return this.commandBus.execute(new Update<Feature>Command(id, dto, orgId, userId));
  }

  async remove(id: string, orgId: string, userId: string): Promise<void> {
    return this.commandBus.execute(new Delete<Feature>Command(id, orgId, userId));
  }
}
```

### 11.17 Admin Controller Template

```typescript
import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { <Feature>Service } from 'modules/shared/<feature>/<feature>.service';
import { Create<Feature>Dto } from 'modules/shared/<feature>/dto/create-<feature>.dto';
import { Update<Feature>Dto } from 'modules/shared/<feature>/dto/update-<feature>.dto';
import { <Feature>ResponseDto, <Feature>DetailDto } from 'modules/shared/<feature>/dto/<feature>-response.dto';

@ApiTags('Admin - <Features>')
@Controller('admin/<features>')
@UseGuards(JwtAuthGuard, TenantGuard)
export class Admin<Feature>Controller {
  constructor(private readonly service: <Feature>Service) {}

  @Post('organizations/:orgId')
  @ApiOperation({ summary: 'Create a <feature>' })
  @ApiBody({ type: Create<Feature>Dto })
  @ApiResponse({ status: 201, description: 'Created', type: <Feature>ResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'Already exists' })
  async create(@Param('orgId') orgId: string, @Body() dto: Create<Feature>Dto, @Req() req: any) {
    return this.service.create(dto, orgId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List <features> (all or filtered by orgId)' })
  @ApiQuery({ name: 'orgId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'deleted'] })
  @ApiResponse({ status: 200, description: 'List retrieved' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async findAll(
    @Query('orgId') orgId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(orgId, page, limit, search, status);
  }

  @Get('organizations/:orgId/:id')
  @ApiOperation({ summary: 'Get <feature> by ID' })
  @ApiResponse({ status: 200, description: 'Retrieved', type: <Feature>DetailDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.service.findById(id, orgId);
  }

  @Patch('organizations/:orgId/:id')
  @ApiOperation({ summary: 'Update <feature>' })
  @ApiBody({ type: Update<Feature>Dto })
  @ApiResponse({ status: 200, description: 'Updated', type: <Feature>ResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Already exists' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() dto: Update<Feature>Dto, @Req() req: any) {
    return this.service.update(id, dto, orgId, req.user.id);
  }

  @Delete('organizations/:orgId/:id')
  @ApiOperation({ summary: 'Delete <feature>' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, orgId, req.user.id);
  }
}
```

### 11.18 Company Controller Template

```typescript
import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { RequiredFeature } from 'decorators/required-feature.decorator';
import { UserRole } from 'generated/prisma/enums';
import { <Feature>Service } from 'modules/shared/<feature>/<feature>.service';
import { Create<Feature>Dto } from 'modules/shared/<feature>/dto/create-<feature>.dto';
import { Update<Feature>Dto } from 'modules/shared/<feature>/dto/update-<feature>.dto';
import { <Feature>ResponseDto, <Feature>DetailDto } from 'modules/shared/<feature>/dto/<feature>-response.dto';

@ApiTags('Company - <Features>')
@Controller(':orgHash/<features>')
@UseGuards(JwtAuthGuard, TenantGuard)
export class Company<Feature>Controller {
  constructor(private readonly service: <Feature>Service) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF)
  @RequiredFeature('<FEATURE>_CREATE')
  @ApiOperation({ summary: 'Create a <feature>' })
  @ApiBody({ type: Create<Feature>Dto })
  @ApiResponse({ status: 201, description: 'Created', type: <Feature>ResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Already exists' })
  async create(@Body() dto: Create<Feature>Dto, @Req() req: any) {
    return this.service.create(dto, req.user.orgId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List <features>' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'deleted'] })
  @ApiResponse({ status: 200, description: 'List retrieved' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Organization context required' })
  async findAll(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string, @Query('status') status?: string) {
    return this.service.findAll(req.user.orgId, page, limit, search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get <feature> by ID' })
  @ApiResponse({ status: 200, description: 'Retrieved', type: <Feature>DetailDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.service.findById(id, req.user.orgId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Update <feature>' })
  @ApiBody({ type: Update<Feature>Dto })
  @ApiResponse({ status: 200, description: 'Updated', type: <Feature>ResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Already exists' })
  async update(@Param('id') id: string, @Body() dto: Update<Feature>Dto, @Req() req: any) {
    return this.service.update(id, dto, req.user.orgId, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete <feature>' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.orgId, req.user.id);
  }
}
```

### 11.19 Consumer Controller Template

```typescript
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { <Feature>Service } from 'modules/shared/<feature>/<feature>.service';
import { <Feature>DetailDto } from 'modules/shared/<feature>/dto/<feature>-response.dto';

@ApiTags('Consumer - <Features>')
@Controller(':orgHash/consumer/<features>')
@UseGuards(JwtAuthGuard, TenantGuard)
export class Consumer<Feature>Controller {
  constructor(private readonly service: <Feature>Service) {}

  @Get()
  @ApiOperation({ summary: 'List active <features>' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List retrieved' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Organization context required' })
  async findAll(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    return this.service.findAll(req.user.orgId, page, limit, search, 'active');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get <feature> by ID' })
  @ApiResponse({ status: 200, description: 'Retrieved', type: <Feature>DetailDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.service.findById(id, req.user.orgId);
  }
}
```

### 11.20 Module Templates

```typescript
// Admin Module
import { Module } from '@nestjs/common';
import { <Feature>Module } from 'modules/shared/<feature>/<feature>.module';
import { Admin<Feature>Controller } from './<feature>.controller';

@Module({
  imports: [<Feature>Module],
  controllers: [Admin<Feature>Controller],
})
export class Admin<Feature>Module {}

// Company Module
import { Module } from '@nestjs/common';
import { <Feature>Module } from 'modules/shared/<feature>/<feature>.module';
import { Company<Feature>Controller } from './<feature>.controller';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [<Feature>Module],
  controllers: [Company<Feature>Controller],
  providers: [RolesGuard],
})
export class Company<Feature>Module {}

// Consumer Module
import { Module } from '@nestjs/common';
import { <Feature>Module } from 'modules/shared/<feature>/<feature>.module';
import { Consumer<Feature>Controller } from './<feature>.controller';

@Module({
  imports: [<Feature>Module],
  controllers: [Consumer<Feature>Controller],
})
export class Consumer<Feature>Module {}
```

---

## 12. Organization-Scoped Operations

```typescript
// ✅ CORRECT - Always filter by orgId + deletedAt
const items = await this.prisma.brand.findMany({
  where: { orgId, deletedAt: null },
});

const item = await this.prisma.brand.findFirst({
  where: { id, orgId, deletedAt: null },
});

// ❌ WRONG - Missing orgId filter
const items = await this.prisma.brand.findMany({
  where: { deletedAt: null },
});

// ❌ WRONG - Hard delete
await this.prisma.brand.delete({ where: { id } });
```

---

## 13. Soft Delete Operations

```typescript
// ✅ CORRECT - Soft delete pattern
await this.prisma.<model>.update({
  where: { id },
  data: {
    deletedAt: new Date(),
    deletedBy: userId,
    isActive: false,
  },
});

// ✅ CORRECT - Duplicate check only among active records
const existing = await this.prisma.<model>.findFirst({
  where: { orgId, slug: newSlug, deletedAt: null },
});
```

---

## 14. Multi-Tenant Data Isolation

```typescript
// Consumer - sees only own data
const data = await this.prisma.formData.findMany({
  where: { orgId, createdBy: consumerUserId, deletedAt: null },
});

// Staff - sees all org data
const data = await this.prisma.formData.findMany({
  where: { orgId, deletedAt: null },
});

// Admin - sees all platform data (no orgId filter, but still deletedAt)
const data = await this.prisma.organization.findMany({
  where: { deletedAt: null },
});
```

---

## 15. Anti-Patterns (NEVER)

| ❌ Wrong                                   | ✅ Correct                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `new PrismaClient()`                       | `this.prisma` (inject PrismaService)                                                                       |
| `throw new BadRequestException()`          | `this.errorService.badRequest('message')`                                                                  |
| `console.log()` / `console.error()`        | `this.logger.log()` / `this.logger.error()`                                                                |
| Raw S3/AWS SDK calls                       | `this.fileService.uploadFile()`                                                                            |
| `return { success: true, data: ... }`      | `return data` (interceptors wrap it)                                                                       |
| DB queries in controller/service           | Only in CQRS handlers                                                                                      |
| Missing `this.logger.setContext()`         | Always set in constructor of every class                                                                   |
| Empty `catch (e) {}`                       | `if (error.status) throw error;` + `this.logger.error()` + `throw this.errorService.internalServerError()` |
| Query without `orgId` filter               | Always include `orgId` in where clause (except admin list all)                                             |
| Query without `deletedAt: null`            | Always exclude soft-deleted records                                                                        |
| Hard delete with `prisma.delete()`         | Use `prisma.update()` to set `deletedAt`                                                                   |
| Injecting feature services cross-module    | Use QueryBus or CommandBus                                                                                 |
| File upload without old file deletion      | Delete old file before uploading new                                                                       |
| Importing `PrismaModule`/`JwtModule` etc.  | They are `@Global()`, just inject the service                                                              |
| Creating duplicate User for existing email | Check User table first, reuse existing record                                                              |
| `res.cookie()` in handler                  | Return tokens in response body, interceptor sets cookies                                                   |
| `@Controller('api/...')`                   | `@Controller('...')` (global prefix handles `api/`)                                                        |
| CQRS for simple logic (logout)             | Keep in controller                                                                                         |
| Using `slug` for org URL resolution        | Use `orgHash`                                                                                              |
| `req.user.userId` for profile              | `req.user.id` (UserAccess ID from JWT `sub`)                                                               |
| `process.env.*` in handlers                | Use `ConfigService` (except in PrismaService)                                                              |
| Missing `@ApiResponse` for errors          | Document ALL possible error responses                                                                      |
| Duplicating shared logic per portal        | Create shared module at `modules/shared/` and import in each portal                                        |
| Using `src/` prefix in imports             | Use paths without `src/` prefix                                                                            |

---

## 16. Quick Checklist

- [ ] **Decision**: Is feature shared? → `modules/shared/` else `modules/<portal>/`
- [ ] Shared module has NO controller, exports service only
- [ ] Portal module imports shared module, adds controller
- [ ] Shared service `findAll()` accepts optional `orgId`
- [ ] List handler only filters by `orgId` if provided
- [ ] Admin controller: `@Controller('admin/<features>')` (NO `:orgId`)
- [ ] Admin controller: `orgId` as `@Param('orgId')` for CUD, `@Query('orgId')` for list
- [ ] Company/Consumer controller: `@Controller(':orgHash/...')`
- [ ] Company/Consumer controller: `orgId` always from `req.user.orgId`
- [ ] Company CUD endpoints: `@UseGuards(RolesGuard)` + `@Roles()` + `@RequiredFeature()`
- [ ] Admin endpoints: NO role/feature decorators (admin bypasses all)
- [ ] Consumer: Read-only typically, forces `status='active'` where applicable
- [ ] Module folder: `src/modules/<portal>/<feature-name>/`
- [ ] Sub-folders: `commands/handlers/`, `commands/impl/`, `queries/handlers/`, `queries/impl/`, `dto/`
- [ ] `commands/index.ts` exports `CommandHandlers` array
- [ ] `queries/index.ts` exports `QueryHandlers` array
- [ ] Command class includes `orgId` and `userId` in constructor
- [ ] Query class includes `orgId` for organization-scoped queries
- [ ] Handler injects: `PrismaService`, `LoggerService`, `ErrorService` (minimum)
- [ ] Handler sets context: `this.logger.setContext(ClassName.name)` in constructor
- [ ] All queries include `orgId` AND `deletedAt: null`
- [ ] Create records with `orgId`, `createdBy`, `updatedBy`
- [ ] Soft delete uses `update` with `deletedAt`, `deletedBy`, `isActive: false`
- [ ] Duplicate checks include `deletedAt: null`
- [ ] Error handling: `if (error.status) throw error;` else log + throw 500
- [ ] Handler returns Pattern 1, 2, or 3 (NOT wrapped with success/statusCode)
- [ ] DTOs use `class-validator` + Swagger decorators
- [ ] Response DTO has `@Exclude()`, `@Expose()`, `fromEntity()`, `fromEntities()`
- [ ] Response DTO includes `orgId` field
- [ ] Service Facade only calls `commandBus.execute()` / `queryBus.execute()`
- [ ] Service Facade passes `orgId` to commands/queries
- [ ] Controller only calls Service Facade methods
- [ ] Controller extracts `orgId` and `userId` from `req.user`
- [ ] Auth public endpoints: `@Public()`
- [ ] Every endpoint has `@ApiResponse` for ALL error statuses
- [ ] Feature-protected: `@RequiredFeature('FEATURE_CODE')`
- [ ] Role-protected: `@UseGuards(RolesGuard)` + `@Roles()`
- [ ] Module imports `CommonModules` from `services`
- [ ] Module provides `RolesGuard`
- [ ] AppModule registers `JwtAuthGuard` and `TenantGuard` as `APP_GUARD`
- [ ] Controller path does NOT include `api/` prefix
- [ ] Org resolution uses `orgHash` not `slug`

---

## 17. Error Response Standards

### 17.1 Rule

**Every handler MUST throw errors using ErrorService. Every controller MUST document ALL possible error responses with @ApiResponse.**

### 17.2 Error Response Format

```json
{
  "success": false,
  "data": null,
  "message": "Error message from handler",
  "statusCode": 400,
  "meta": {
    "timings": {
      "processingTime": "15 ms",
      "serverTime": "...",
      "requestReceived": "...",
      "responseSent": "..."
    },
    "request": {
      "path": "/auth/me",
      "method": "GET",
      "ip": "::1",
      "userAgent": "..."
    }
  }
}
```

### 17.3 Error Method → HTTP Status Mapping

| Error Method            | HTTP Status | When to Use                                                     |
| ----------------------- | ----------- | --------------------------------------------------------------- |
| `badRequest()`          | 400         | Validation failed, missing required fields, invalid format      |
| `unauthorized()`        | 401         | Invalid/expired token, wrong OTP, wrong password                |
| `forbidden()`           | 403         | No access to org, insufficient permissions, account deactivated |
| `notFound()`            | 404         | Resource/User/Organization/UserAccess not found                 |
| `conflict()`            | 409         | Duplicate name/slug/phone/email                                 |
| `payloadTooLarge()`     | 413         | File too large                                                  |
| `internalServerError()` | 500         | Unexpected errors, database failures, external service failures |

### 17.4 Handler Error Pattern (Mandatory)

```typescript
async execute(command: SomeCommand): Promise<SomeResponseDto> {
  try {
    // Business logic here
    // ...
    return SomeResponseDto.fromEntity(result);
  } catch (error) {
    if (error.status) throw error;  // Re-throw known ErrorService errors
    this.logger.error('Failed to do something', error.stack);
    throw this.errorService.internalServerError('Failed to do something');
  }
}
```

### 17.5 Standard Error Messages Reference

**Authentication (401):**

- `'Authentication required. Please login.'` - No token present
- `'Session expired. Please login again.'` - Refresh token expired
- `'Invalid or expired OTP'` - Wrong/expired/already used OTP
- `'Current password is incorrect'` - Wrong current password

**Authorization (403):**

- `'Account is deactivated'` - UserAccess.isActive = false
- `'Organization context is required'` - No orgHash in URL for non-admin
- `'You do not have access to organization \'X\''` - UserAccess not found for org
- `'Invalid portal access. Expected X access.'` - Wrong portal type
- `'You do not have the required permission: X'` - Feature check failed

**Not Found (404):**

- `'Organization not found'` - Invalid orgHash or deleted
- `'No account found with this email'` - User not found
- `'No {portalType} access found for this organization'` - UserAccess not found
- `'Profile not found'` - UserAccess not found for profile endpoint
- `'System organization not found'` - System org missing (admin login)

**Conflict (409):**

- `'<Feature> with this name already exists'` - Duplicate name
- `'Phone number already in use'` - Duplicate phone in same org

**Bad Request (400):**

- `'Organization hash is required'` - Missing orgHash for company/consumer
- `'New password must be at least 8 characters'` - Validation failed
- `'No password set for this account'` - OTP-only user trying to change password
- `'File is required'` - No file uploaded

**Internal Server Error (500):**

- `'Failed to send OTP'`
- `'Failed to verify OTP'`
- `'Failed to get profile'`
- `'Failed to update profile'`
- `'Failed to change password'`
- `'Failed to upload profile picture'`
- `'Failed to create <feature>'`
- `'Failed to update <feature>'`
- `'Failed to delete <feature>'`

### 17.6 Controller Swagger Documentation Rule

Every endpoint MUST document ALL possible error responses:

```typescript
@Get()
@ApiOperation({ summary: 'Get current profile' })
@ApiResponse({ status: 200, description: 'Profile retrieved', type: ProfileResponseDto })
@ApiResponse({ status: 401, description: 'Authentication required or session expired' })
@ApiResponse({ status: 404, description: 'Profile not found' })
async getProfile(@Req() req: any): Promise<ProfileResponseDto> {
  return this.profileService.getProfile(req.user.id, req.user.orgId);
}
```

---

## 18. Current Implementation Reference

### 18.1 Prisma Models

```
User, UserAccess, Organization, Brand, Category, DealerType,
Feature, FeatureAccess, FormSchema, FormData, WarrantyTemplate,
Warranty, OtpVerification
```

### 18.2 Enums

```
UserRole: ADMIN, COMPANY_SUPER_ADMIN, COMPANY_STAFF, COMPANY_PARTNER, CONSUMER
OrganizationType: ROOT, BRANCH
OtpType: LOGIN, PASSWORD_RESET, VERIFY_EMAIL, VERIFY_PHONE
FeatureStatus: COMING_SOON, ENABLED, DISABLED
```

### 18.3 Database Conventions

- All primary keys: UUID via `@default(dbgenerated("gen_random_uuid()")) @db.Uuid`
- All timestamps: `@db.Timestamptz`
- Soft delete fields: `deletedAt DateTime? @db.Timestamptz`, `deletedBy String? @db.Uuid`
- Audit fields: `createdBy String? @db.Uuid`, `updatedBy String? @db.Uuid`
- Unique constraints with partial indexes for non-deleted records
- Indexes on `orgId`, `deletedAt`, and frequently queried fields

### 18.4 Seed Data

- System organization: `{ slug: 'system', hash: 'admin01', type: 'ROOT' }`
- Admin user: `{ email: 'admin@warranty.com', password: 'Admin@123' }`
- Admin UserAccess: `{ portalType: 'admin', role: 'ADMIN', orgId: <system-org-id> }`

---

**End of Rule Book v6.0 - AI-Ready**
