# 🚀 Warranty Management System - Backend Developer Rule Book

## Complete & Final Version v3.0

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Portal-Based Module Organization](#2-portal-based-module-organization)
3. [Global Services](#3-global-services)
4. [Guards & Decorators](#4-guards--decorators)
5. [Interceptors](#5-interceptors)
6. [Complete Request Lifecycle](#6-complete-request-lifecycle)
7. [Response Patterns](#7-response-patterns)
8. [Complete File Templates](#8-complete-file-templates)
9. [Organization-Scoped Operations](#9-organization-scoped-operations)
10. [Soft Delete Operations](#10-soft-delete-operations)
11. [Multi-Tenant Data Isolation](#11-multi-tenant-data-isolation)
12. [Anti-Patterns](#12-anti-patterns-never)
13. [Quick Checklist](#13-quick-checklist)

---

## 1. Folder Structure

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
    ├── auth/          # api/auth/*
    ├── admin/         # api/admin/*
    ├── company/       # api/:slug/*
    ├── consumer/      # api/:slug/consumer/*
    └── files/         # api/files/*
```

---

## 2. Portal-Based Module Organization

### 2.1 Feature Module Internal Structure

Every feature follows this EXACT structure:

```text
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
```

### 2.2 Portal Definitions

| Portal       | API Prefix           | Guard Requirements         | Example                            |
| ------------ | -------------------- | -------------------------- | ---------------------------------- |
| **auth**     | `api/auth`           | @Public() (no guards run)  | `POST api/auth/otp/send`           |
| **admin**    | `api/admin`          | JwtAuthGuard + TenantGuard | `GET api/admin/features`           |
| **company**  | `api/:slug`          | JwtAuthGuard + TenantGuard | `POST api/acme/brands`             |
| **consumer** | `api/:slug/consumer` | JwtAuthGuard + TenantGuard | `GET api/acme/consumer/warranties` |
| **files**    | `api/files`          | JwtAuthGuard only          | `POST api/files/upload`            |

### 2.3 Feature Name Mapping

| Portal       | Features                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| **auth**     | `otp`, `profile`                                                             |
| **admin**    | `organizations`, `features`, `org-features`                                  |
| **company**  | `organizations`, `branches`, `dealer-types`, `users`, `categories`, `brands` |
| **consumer** | `auth`, `profile`, `warranties`, `registrations`                             |
| **files**    | `upload`                                                                     |

---

## 3. Global Services

> **CRITICAL: All services are @Global() - NEVER import their modules. Just inject the service.**

### 3.1 PrismaService

```typescript
import { PrismaService } from 'services/prisma/prisma.service';

// Inject
constructor(private readonly prisma: PrismaService) {}

// Methods
prisma.<model>.findUnique(args)
prisma.<model>.findFirst(args)
prisma.<model>.findMany(args)
prisma.<model>.create(args)
prisma.<model>.update(args)
prisma.<model>.count(args)
prisma.<model>.upsert(args)
prisma.$transaction([...])
prisma.$transaction(async (tx) => { ... })

// ⚠️ GOLDEN RULE: Every query MUST include orgId + deletedAt: null
```

### 3.2 ErrorService

```typescript
import { ErrorService } from 'services/errors/error.service';

// Inject
constructor(private readonly errorService: ErrorService) {}

// Methods (all throw immediately with never return type)
errorService.badRequest(message?, options?)              // 400
errorService.unauthorized(message?, options?)            // 401
errorService.forbidden(message?, options?)               // 403
errorService.notFound(message?, options?)                // 404
errorService.conflict(message?, options?)                // 409
errorService.unprocessableEntity(message?, options?)     // 422
errorService.internalServerError(message?, options?)     // 500
errorService.serviceUnavailable(message?, options?)      // 503
errorService.payloadTooLarge(message?, options?)         // 413
errorService.notImplemented(message?, options?)          // 501
errorService.gatewayTimeout(message?, options?)          // 504

// ErrorOptions
interface ErrorOptions {
  description?: string;
  cause?: Error;
}
```

### 3.3 LoggerService

```typescript
import { LoggerService } from 'services/logger/logger.service';

// Inject
constructor(private readonly logger: LoggerService) {}

// ⚠️ ALWAYS set context in constructor
this.logger.setContext(ClassName.name);

// Methods
logger.log(message, context?, meta?): void
logger.warn(message, context?, meta?): void
logger.error(message, trace?, context?, meta?): void
logger.debug(message, context?, meta?): void
```

### 3.4 JwtService

```typescript
import { JwtService } from 'services/jwt/jwt.service';

// Inject
constructor(private readonly jwtService: JwtService) {}

// Key Interfaces
interface JwtPayload {
  sub: string;           // userId
  email?: string;
  phoneNumber?: string;
  orgId?: string;
  orgSlug?: string;
  portalType?: string;
  role: string;
  permissions?: string[];  // Embedded in access token to avoid DB queries
  type?: 'access' | 'refresh';
}

interface TokenPair {
  accessToken: string;    // 15 minutes expiry
  refreshToken: string;   // 7 days expiry
}

// Methods
jwtService.generateTokenPair(payload: JwtPayload): Promise<TokenPair>
jwtService.generateAccessToken(payload: JwtPayload): Promise<string>
jwtService.generateRefreshToken(payload: JwtPayload): Promise<string>
jwtService.verifyAccessToken(token: string): Promise<JwtPayload>
jwtService.verifyRefreshToken(token: string): Promise<JwtPayload>
jwtService.decodeToken(token: string): JwtPayload | null
jwtService.refreshTokenPair(refreshToken: string): Promise<{ payload, tokens }>

// ⚠️ CRITICAL: Access tokens contain permissions, refresh tokens do NOT
// After refresh, TenantGuard re-resolves org context, but permissions will be empty
// Must re-fetch permissions from DB on refresh
```

### 3.5 FileService

```typescript
import { FileService } from 'services/files/file.service';

// Inject
constructor(private readonly fileService: FileService) {}

// Methods
fileService.uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFile>
fileService.uploadFiles(files: Express.Multer.File[], folder?: string): Promise<UploadedFile[]>
fileService.getDownloadUrl(key: string): Promise<string>
fileService.deleteFile(key: string): Promise<void>

// UploadedFile Interface
interface UploadedFile {
  key: string;          // S3 path: "brands/1234567890-abc123.jpg"
  url: string;          // Presigned URL (or direct URL for local dev)
  fileName: string;     // Generated unique filename
  originalName: string;
  mimeType: string;
  size: number;
}

// Standard folders: 'profiles', 'organizations', 'brands', 'categories', 'uploads'

// ⚠️ CRITICAL: When replacing files, delete old file BEFORE uploading new
```

### 3.6 MailService

```typescript
import { MailService } from 'services/mail/mail.service';
import { EMAIL_STYLES } from 'services/mail/contants/email-styles.constants';

// Inject
constructor(private readonly mailService: MailService) {}

// Methods
mailService.sendMail(options: SendMailOptions): Promise<any>
mailService.setProvider(providerType: MailProviderEnum): void

// SendMailOptions
interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  attachments?: any[];
}

// Use EMAIL_STYLES constant in HTML emails for consistent styling
```

### 3.7 CommonModules

```typescript
// Always import in feature modules
import { CommonModules } from 'services';

// CommonModules = [CqrsModule, LoggerModule, ErrorModule, MailModule, PrismaModule, FileModule, JwtModule]

// Usage in module:
@Module({
  imports: [...CommonModules],
  // ...
})
```

---

## 4. Guards & Decorators

### 4.1 Guard Overview

| Guard            | Scope        | Registration           | What It Does                                                  |
| ---------------- | ------------ | ---------------------- | ------------------------------------------------------------- |
| **JwtAuthGuard** | Global       | APP_GUARD in AppModule | Extracts JWT from cookies, verifies, refreshes, attaches user |
| **TenantGuard**  | Global       | APP_GUARD in AppModule | Validates org from slug, checks UserAccess, checks features   |
| **RolesGuard**   | Per-endpoint | @UseGuards(RolesGuard) | Checks user.role against @Roles() decorator                   |

### 4.2 App Module (Global Guard Registration)

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

### 4.3 Decorators

| Decorator                  | Metadata Key           | Checked By  | Purpose                                  |
| -------------------------- | ---------------------- | ----------- | ---------------------------------------- |
| `@Public()`                | `IS_PUBLIC_KEY`        | TenantGuard | Bypass all guards (login, signup routes) |
| `@Roles(role1, role2)`     | `ROLES_KEY`            | RolesGuard  | Require specific UserRole(s)             |
| `@RequiredFeature('CODE')` | `REQUIRED_FEATURE_KEY` | TenantGuard | Require specific permission in JWT       |

### 4.4 Combined Usage Examples

```typescript
// PUBLIC - No guards run
@Public()
@Post('login')
async login() {}

// AUTHENTICATED ONLY - JWT + Tenant
@Get('profile')
async getProfile() {}

// ROLE PROTECTED - Must add RolesGuard explicitly!
@Post()
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_SUPER_ADMIN)
async create() {}

// FEATURE PROTECTED - Checked by TenantGuard
@Get()
@RequiredFeature('BRAND_VIEW')
async findAll() {}

// ROLE + FEATURE PROTECTED
@Post()
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_STAFF, UserRole.COMPANY_SUPER_ADMIN)
@RequiredFeature('BRAND_CREATE')
async create() {}
```

### 4.5 Permission Check Rules

| User Type               | Tenant Check              | Feature Check                    |
| ----------------------- | ------------------------- | -------------------------------- |
| **ADMIN**               | Bypassed (full access)    | Bypassed                         |
| **COMPANY_SUPER_ADMIN** | Org + UserAccess verified | Bypassed (full org access)       |
| **COMPANY_STAFF**       | Org + UserAccess verified | Checked if @RequiredFeature used |
| **COMPANY_PARTNER**     | Org + UserAccess verified | Checked if @RequiredFeature used |
| **CONSUMER**            | Org + UserAccess verified | Checked if @RequiredFeature used |

---

## 5. Interceptors

### 5.1 ResponseInterceptor (Success)

Automatically wraps ALL success responses:

```typescript
// Standard Response Format:
{
  success: true,
  data: <your-data>,
  message: "Resource created successfully",  // Auto-generated by HTTP method
  statusCode: 200,
  meta: {
    timings: {
      processingTime: "123 ms",
      serverTime: "2024-06-15 10:30:00 AM",
      requestReceived: "2024-06-15 10:30:00 AM",
      responseSent: "2024-06-15 10:30:00 AM"
    },
    request: {
      path: "/api/acme/brands",
      method: "GET",
      ip: "127.0.0.1",
      userAgent: "Mozilla/5.0..."
    }
  }
}

// Auto-Success Messages:
GET    → "Request processed successfully"
POST   → "Resource created successfully"
PUT    → "Resource updated successfully"
PATCH  → "Resource updated successfully"
DELETE → "Resource deleted successfully"

// ⚠️ If response has accessToken/refreshToken, interceptor extracts them to cookies
// and removes from response body (prevents token leakage)
```

### 5.2 ExceptionInterceptor (Error)

Automatically wraps ALL errors:

```typescript
// Error Response Format:
{
  success: false,
  data: null,
  message: "Error message here",
  statusCode: 400,
  meta: {
    timings: { ... },
    request: { ... }
  }
}

// Logs every error with stack trace via LoggerService
// Unknown errors → 500 "Internal server error"
```

---

## 6. Complete Request Lifecycle

```
POST /api/acme-electronics/brands
Body: { name: "Samsung", description: "Electronics" }

┌─────────────────────────────────────────────────────────────────┐
│ 1. ExceptionInterceptor wraps entire request                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. JwtAuthGuard                                                │
│    • Extract accessToken from cookie                            │
│    • Verify JWT → { sub:"user123", role:"COMPANY_STAFF",        │
│                     permissions:["BRAND_CREATE","BRAND_VIEW"] } │
│    • Attach: request.user = { id, role, permissions }          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. TenantGuard                                                 │
│    • Not @Public() → Continue                                   │
│    • Not admin/auth/file route → Continue                       │
│    • User is COMPANY_STAFF → Continue                           │
│    • Extract slug "acme-electronics" → Find org                 │
│    • Check org exists + isActive                                │
│    • Find UserAccess (userId + orgId + portalType)              │
│    • Attach: request.user.orgId = "org456"                      │
│    • Overwrite: request.user.role = userAccess.role             │
│    • @RequiredFeature('BRAND_CREATE') → Check permissions → ✅   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. RolesGuard (if @UseGuards(RolesGuard) present)              │
│    • @Roles(COMPANY_SUPER_ADMIN, COMPANY_STAFF)                 │
│    • user.role = "COMPANY_STAFF" → ✅                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Controller → Service → CQRS Handler → Prisma                │
│    • Check duplicate slug among active records                  │
│    • Create brand with orgId, createdBy, updatedBy              │
│    • Return BrandResponseDto.fromEntity(brand)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. ResponseInterceptor wraps success response                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Response Patterns

### 7.1 Three Allowed Return Patterns from Handlers

```typescript
// PATTERN 1: Return entity/DTO directly
return BrandResponseDto.fromEntity(brand);
// Interceptor wraps with auto-message: "Resource created successfully"

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

### 7.2 What You Return vs What Client Gets

```typescript
// YOU RETURN (Handler)
return brand;

// CLIENT RECEIVES (After ResponseInterceptor)
{
  success: true,
  data: { id: "...", name: "...", ... },
  message: "Request processed successfully",
  statusCode: 200,
  meta: { timings: {...}, request: {...} }
}

// NEVER manually wrap with success/statusCode - interceptors do this!
```

---

## 8. Complete File Templates

### 8.1 Create DTO (`dto/create-<feature>.dto.ts`)

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

### 8.2 Update DTO (`dto/update-<feature>.dto.ts`)

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

### 8.3 Response DTO (`dto/<feature>-response.dto.ts`)

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
    return plainToInstance(<Feature>ResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): <Feature>ResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
```

### 8.4 Create Command (`commands/impl/create-<feature>.command.ts`)

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

### 8.5 Update Command (`commands/impl/update-<feature>.command.ts`)

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

### 8.6 Delete Command (`commands/impl/delete-<feature>.command.ts`)

```typescript
export class Delete<Feature>Command {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
```

### 8.7 Create Command Handler (`commands/handlers/create-<feature>.handler.ts`)

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
      this.logger.error('Failed to create <feature>', error.stack, undefined, { orgId });
      throw this.errorService.internalServerError('Failed to create <feature>');
    }
  }
}
```

### 8.8 Delete Command Handler (`commands/handlers/delete-<feature>.handler.ts`)

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Delete<Feature>Command } from '../impl/delete-<feature>.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';

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

      // Soft delete - NEVER hard delete
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
      this.logger.error('Failed to delete <feature>', error.stack, undefined, { id, orgId });
      throw this.errorService.internalServerError('Failed to delete <feature>');
    }
  }
}
```

### 8.9 Commands Index (`commands/index.ts`)

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

### 8.10 Get Query (`queries/impl/get-<feature>.query.ts`)

```typescript
export class Get<Feature>Query {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
  ) {}
}
```

### 8.11 List Query (`queries/impl/list-<features>.query.ts`)

```typescript
export class List<Features>Query {
  constructor(
    public readonly orgId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
  ) {}
}
```

### 8.12 Get Query Handler (`queries/handlers/get-<feature>.handler.ts`)

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Get<Feature>Query } from '../impl/get-<feature>.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { <Feature>ResponseDto } from '../../dto/<feature>-response.dto';

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

### 8.13 List Query Handler (`queries/handlers/list-<features>.handler.ts`)

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { List<Features>Query } from '../impl/list-<features>.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { <Feature>ResponseDto } from '../../dto/<feature>-response.dto';

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
    const { orgId, page, limit, search } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = { orgId, deletedAt: null };

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

### 8.14 Queries Index (`queries/index.ts`)

```typescript
import { Get<Feature>Handler } from './handlers/get-<feature>.handler';
import { List<Features>Handler } from './handlers/list-<features>.handler';

export const <Feature>QueryHandlers = [
  Get<Feature>Handler,
  List<Features>Handler,
];
```

### 8.15 Service Facade (`<feature>.service.ts`)

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

  async update(id: string, dto: Update<Feature>Dto, orgId: string, userId: string): Promise<<Feature>ResponseDto> {
    return this.commandBus.execute(new Update<Feature>Command(id, dto, orgId, userId));
  }

  async remove(id: string, orgId: string, userId: string): Promise<void> {
    return this.commandBus.execute(new Delete<Feature>Command(id, orgId, userId));
  }

  async findById(id: string, orgId: string): Promise<<Feature>ResponseDto> {
    return this.queryBus.execute(new Get<Feature>Query(id, orgId));
  }

  async findAll(orgId: string, page: number, limit: number, search?: string) {
    return this.queryBus.execute(new List<Features>Query(orgId, page, limit, search));
  }
}
```

### 8.16 Company Portal Controller (`<feature>.controller.ts`)

```typescript
import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { <Feature>Service } from './<feature>.service';
import { Create<Feature>Dto } from './dto/create-<feature>.dto';
import { Update<Feature>Dto } from './dto/update-<feature>.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { RequiredFeature } from 'decorators/required-feature.decorator';
import { UserRole } from 'generated/prisma/enums';

@ApiTags('<Features>')
@Controller('api/:slug/<features>')
@UseGuards(JwtAuthGuard, TenantGuard)
export class <Feature>Controller {
  constructor(private readonly service: <Feature>Service) {}

  @Get()
  @ApiOperation({ summary: 'List <features>' })
  async findAll(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(req.user.orgId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get <feature> by ID' })
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.service.findById(id, req.user.orgId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF)
  @RequiredFeature('BRAND_CREATE')
  @ApiOperation({ summary: 'Create <feature>' })
  async create(@Body() dto: Create<Feature>Dto, @Req() req: any) {
    return this.service.create(dto, req.user.orgId, req.user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Update <feature>' })
  async update(@Param('id') id: string, @Body() dto: Update<Feature>Dto, @Req() req: any) {
    return this.service.update(id, dto, req.user.orgId, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete <feature> (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.orgId, req.user.id);
  }
}
```

### 8.17 Module (`<feature>.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { <Feature>Controller } from './<feature>.controller';
import { <Feature>Service } from './<feature>.service';
import { <Feature>CommandHandlers } from './commands';
import { <Feature>QueryHandlers } from './queries';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [...CommonModules],
  controllers: [<Feature>Controller],
  providers: [
    <Feature>Service,
    RolesGuard,
    ...<Feature>CommandHandlers,
    ...<Feature>QueryHandlers,
  ],
})
export class <Feature>Module {}
```

---

## 9. Organization-Scoped Operations

### Golden Rule: Every query MUST filter by orgId + deletedAt: null

```typescript
// ✅ CORRECT
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

## 10. Soft Delete Operations

```typescript
// ✅ CORRECT - Soft delete
await this.prisma.<model>.update({
  where: { id },
  data: {
    deletedAt: new Date(),
    deletedBy: userId,
    isActive: false,
  },
});

// ✅ CORRECT - Duplicate check (only among active records)
const existing = await this.prisma.<model>.findFirst({
  where: { orgId, slug: newSlug, deletedAt: null },
});
```

---

## 11. Multi-Tenant Data Isolation

```typescript
// Consumer - sees only own data
const data = await this.prisma.formData.findMany({
  where: { orgId, createdBy: consumerUserId, deletedAt: null },
});

// Staff - sees all org data
const data = await this.prisma.formData.findMany({
  where: { orgId, deletedAt: null },
});
```

---

## 12. Anti-Patterns (NEVER)

| ❌ Wrong                                          | ✅ Correct                                    |
| ------------------------------------------------- | --------------------------------------------- |
| `new PrismaClient()`                              | `this.prisma`                                 |
| `throw new BadRequestException()`                 | `this.errorService.badRequest()`              |
| `console.log()` / `console.error()`               | `this.logger.log()` / `this.logger.error()`   |
| Raw S3/AWS SDK calls                              | `this.fileService.uploadFile()`               |
| `return { success: true, data: ... }`             | `return data` (interceptors wrap it)          |
| DB queries in controller/service                  | Only in CQRS handlers                         |
| Missing `this.logger.setContext()`                | Always set in constructor                     |
| Empty `catch (e) {}`                              | Log + throw via errorService                  |
| Query without `orgId` filter                      | Always include `orgId` in where clause        |
| Query without `deletedAt: null`                   | Always exclude soft-deleted records           |
| Hard delete with `prisma.delete()`                | Use `prisma.update()` to set `deletedAt`      |
| Injecting feature services cross-module           | Use QueryBus or CommandBus                    |
| File upload without old file deletion             | Delete old file before uploading new          |
| Importing `PrismaModule`/`JwtModule` etc.         | They are `@Global()`, just inject service     |
| Creating duplicate User for existing email        | Check User table first, reuse existing record |
| Returning tokens in response body                 | Let ResponseInterceptor extract to cookies    |
| Using `@Roles()` without `@UseGuards(RolesGuard)` | Always use both together                      |
| `process.env.*` in handlers                       | Use `ConfigService` (except in PrismaService) |

---

## 13. Quick Checklist

- [ ] Module folder: `src/modules/<portal>/<feature-name>/`
- [ ] Sub-folders: `commands/handlers/`, `commands/impl/`, `queries/handlers/`, `queries/impl/`, `dto/`
- [ ] `commands/index.ts` exports `CommandHandlers` array
- [ ] `queries/index.ts` exports `QueryHandlers` array
- [ ] Command class includes `orgId` and `userId` in constructor
- [ ] Query class includes `orgId` for organization-scoped queries
- [ ] Handler injects: `PrismaService`, `LoggerService`, `ErrorService`
- [ ] Handler sets context: `this.logger.setContext(ClassName.name)`
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
- [ ] Company/Consumer controllers use `@Controller('api/:slug/...')` with `JwtAuthGuard` + `TenantGuard`
- [ ] Admin controllers use `@Controller('api/admin/...')` with `JwtAuthGuard` + `TenantGuard`
- [ ] Auth controllers use `@Public()` on all endpoints
- [ ] Feature-protected endpoints use `@RequiredFeature('FEATURE_CODE')`
- [ ] Role-protected endpoints use `@UseGuards(RolesGuard)` + `@Roles()`
- [ ] Module imports `CommonModules` from `services`
- [ ] Module provides `RolesGuard`
- [ ] AppModule registers `JwtAuthGuard` and `TenantGuard` as `APP_GUARD`

---

**End of Rule Book v3.0**
