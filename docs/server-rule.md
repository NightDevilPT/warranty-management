# 🚀 Warranty Management System - Backend Developer Rule Book

## Complete & Final Version with All Changes

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Portal-Based Module Organization](#2-portal-based-module-organization)
3. [Global Services](#3-global-services---signatures--usage)
4. [Guards & Decorators](#4-guards--decorators---signatures--usage)
5. [Middleware Execution Flow](#5-middleware-execution-flow)
6. [Response Patterns](#6-response-patterns-only-3-allowed)
7. [Complete File Templates](#7-complete-file-templates)
8. [Organization-Scoped Operations](#8-organization-scoped-operations)
9. [Soft Delete Operations](#9-soft-delete-operations)
10. [Multi-Tenant Data Isolation](#10-multi-tenant-data-isolation)
11. [Anti-Patterns](#11-anti-patterns-never)
12. [Quick Checklist](#12-quick-checklist)

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
│   │   └── mail.module.ts
│   └── index.ts                           # Exports CommonModules array
│
├── middleware/
│   └── guards/
│       ├── jwt-auth.guard.ts              # Extract & verify JWT, attach user to request
│       ├── tenant.guard.ts               # Validate org access + feature permissions
│       └── roles.guard.ts                # Check user role matches @Roles() decorator
│
├── decorators/
│   ├── public.decorator.ts               # @Public() - bypass all guards
│   ├── roles.decorator.ts                # @Roles() - require specific roles
│   ├── required-feature.decorator.ts     # @RequiredFeature() - require specific permission
│   ├── current-user.decorator.ts         # @CurrentUser() - extract user from request
│   └── current-org.decorator.ts          # @CurrentOrgId() / @CurrentOrgSlug()
│
├── config/
│   ├── configuration.ts
│   └── swagger.config.ts
│
├── interface/
│   └── api.interface.ts
│
├── modules/
│   ├── auth/                              # Public Auth APIs (api/auth)
│   │   └── <feature-name>/
│   │       ├── commands/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── queries/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── dto/
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.controller.ts
│   │       └── <feature>.module.ts
│   │
│   ├── admin/                             # Admin Portal APIs (api/admin)
│   │   └── <feature-name>/
│   │       ├── commands/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── queries/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── dto/
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.controller.ts
│   │       └── <feature>.module.ts
│   │
│   ├── company/                           # Company Portal APIs (api/:slug)
│   │   └── <feature-name>/
│   │       ├── commands/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── queries/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── dto/
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.controller.ts
│   │       └── <feature>.module.ts
│   │
│   ├── consumer/                          # Consumer Portal APIs (api/:slug/consumer)
│   │   └── <feature-name>/
│   │       ├── commands/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── queries/
│   │       │   ├── handlers/
│   │       │   ├── impl/
│   │       │   └── index.ts
│   │       ├── dto/
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.controller.ts
│   │       └── <feature>.module.ts
│   │
│   └── files/                             # Shared File APIs (api/files)
│       └── <feature-name>/
│           ├── commands/
│           │   ├── handlers/
│           │   ├── impl/
│           │   └── index.ts
│           ├── queries/
│           │   ├── handlers/
│           │   ├── impl/
│           │   └── index.ts
│           ├── dto/
│           ├── <feature>.service.ts
│           ├── <feature>.controller.ts
│           └── <feature>.module.ts
```

---

## 2. Portal-Based Module Organization

### Feature Name Mapping

| Portal       | Feature Names                                                                | API Prefix           | Controller Prefix |
| ------------ | ---------------------------------------------------------------------------- | -------------------- | ----------------- |
| **auth**     | `otp`, `profile`                                                             | `api/auth`           | `auth`            |
| **admin**    | `organizations`, `features`, `org-features`                                  | `api/admin`          | `admin`           |
| **company**  | `organizations`, `branches`, `dealer-types`, `users`, `categories`, `brands` | `api/:slug`          | `company`         |
| **consumer** | `auth`, `profile`                                                            | `api/:slug/consumer` | `consumer`        |
| **files**    | `upload`                                                                     | `api/files`          | `files`           |

---

## 3. Global Services - Signatures & Usage

### 3.1 PrismaService

**Import:** `import { PrismaService } from 'services/prisma/prisma.service';`
**Injection:** `private readonly prisma: PrismaService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
prisma.<model>.findUnique(args)
prisma.<model>.findFirst(args)
prisma.<model>.findMany(args)
prisma.<model>.create(args)
prisma.<model>.update(args)
prisma.<model>.count(args)
prisma.<model>.upsert(args)
prisma.$transaction([...])

// IMPORTANT: Always include orgId + deletedAt: null in where clauses
```

### 3.2 ErrorService

**Import:** `import { ErrorService } from 'services/errors/error.service';`
**Injection:** `private readonly errorService: ErrorService`
**Module:** `@Global()`

```typescript
errorService.badRequest(message?, options?): never              // 400
errorService.unauthorized(message?, options?): never            // 401
errorService.forbidden(message?, options?): never               // 403
errorService.notFound(message?, options?): never                // 404
errorService.conflict(message?, options?): never                // 409
errorService.internalServerError(message?, options?): never     // 500
```

### 3.3 LoggerService

**Import:** `import { LoggerService } from 'services/logger/logger.service';`
**Injection:** `private readonly logger: LoggerService`
**Module:** `@Global()`

```typescript
logger.setContext(ClassName.name): void
logger.log(message, context?, meta?): void
logger.warn(message, context?, meta?): void
logger.error(message, trace?, context?, meta?): void
logger.debug(message, context?, meta?): void
```

### 3.4 JwtService

**Import:** `import { JwtService } from 'services/jwt/jwt.service';`
**Injection:** `private readonly jwtService: JwtService`
**Module:** `@Global()`

```typescript
interface JwtPayload {
  sub: string;           // userId
  email?: string;
  phoneNumber?: string;
  orgId?: string;
  orgSlug?: string;
  portalType?: string;
  role: string;
  permissions?: string[];  // Feature codes for current org
  type?: 'access' | 'refresh';
}

jwtService.generateTokenPair(payload): Promise<TokenPair>
jwtService.verifyAccessToken(token): Promise<JwtPayload>
jwtService.verifyRefreshToken(token): Promise<JwtPayload>
jwtService.decodeToken(token): JwtPayload | null
```

**Why permissions in JWT?** Permissions are embedded in the access token to avoid database queries on every request. The token is short-lived (15 min), so permission changes propagate quickly when the token expires and is refreshed.

### 3.5 FileService

**Import:** `import { FileService } from 'services/files/file.service';`
**Injection:** `private readonly fileService: FileService`
**Module:** `@Global()`

```typescript
fileService.uploadFile(file, folder?): Promise<UploadedFile>
fileService.deleteFile(key): Promise<void>

// Standard folders: 'profiles', 'organizations', 'brands', 'categories'
```

### 3.6 MailService

**Import:** `import { MailService } from 'services/mail/mail.service';`
**Injection:** `private readonly mailService: MailService`
**Module:** `@Global()`

```typescript
mailService.sendMail(options): Promise<any>
```

---

## 4. Guards & Decorators - Signatures & Usage

### 4.1 Guard Overview

| Guard            | Type         | What It Does                                                                        |
| ---------------- | ------------ | ----------------------------------------------------------------------------------- |
| **JwtAuthGuard** | Global       | Extracts JWT from cookies, verifies, attaches user to request                       |
| **TenantGuard**  | Global       | Validates org from URL slug, checks UserAccess, checks @RequiredFeature permissions |
| **RolesGuard**   | Per-endpoint | Checks user role matches @Roles() decorator                                         |

### 4.2 Decorator Overview

| Decorator                          | Purpose                                        |
| ---------------------------------- | ---------------------------------------------- |
| `@Public()`                        | Bypass all guards (for login, signup routes)   |
| `@Roles(...)`                      | Require specific roles to access endpoint      |
| `@RequiredFeature('FEATURE_CODE')` | Require specific permission to access endpoint |
| `@CurrentUser()`                   | Extract user object from request               |
| `@CurrentUser('id')`               | Extract specific field from user               |
| `@CurrentOrgId()`                  | Extract orgId from request                     |
| `@CurrentOrgSlug()`                | Extract orgSlug from request                   |

### 4.3 Permission Check Rules

| User Type               | Tenant Check              | Feature Check                    |
| ----------------------- | ------------------------- | -------------------------------- |
| **ADMIN**               | Bypassed (full access)    | Bypassed                         |
| **COMPANY_SUPER_ADMIN** | Org + UserAccess verified | Bypassed (full org access)       |
| **COMPANY_STAFF**       | Org + UserAccess verified | Checked if @RequiredFeature used |
| **COMPANY_PARTNER**     | Org + UserAccess verified | Checked if @RequiredFeature used |
| **CONSUMER**            | Org + UserAccess verified | Checked if @RequiredFeature used |

---

## 5. Middleware Execution Flow

```
Incoming Request: POST /api/acme-electronics/brands

┌─────────────────────────────────────────────────────────────────┐
│ GUARD 1: JwtAuthGuard (Global)                                 │
├─────────────────────────────────────────────────────────────────┤
│ • Extracts JWT from cookies (accessToken)                      │
│ • If expired, tries refreshToken and issues new tokens         │
│ • Decodes payload: userId, role, permissions, orgId            │
│ • Attaches user object to request                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ GUARD 2: TenantGuard (Global)                                  │
├─────────────────────────────────────────────────────────────────┤
│ • Skips for @Public() routes                                   │
│ • ADMIN: Full access, bypasses all checks                      │
│ • Auth/File routes: Only JWT needed                            │
│ • Extracts :slug from URL → finds Organization                 │
│ • Checks org exists, isActive, not deleted                     │
│ • Checks UserAccess: userId + orgId + portalType + deletedAt   │
│ • COMPANY_SUPER_ADMIN: Full org access, skips feature check    │
│ • Others: Checks @RequiredFeature if decorator is used         │
│ • Attaches resolved orgId, orgSlug, role to request            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ GUARD 3: RolesGuard (Per-endpoint, only if @Roles() used)      │
├─────────────────────────────────────────────────────────────────┤
│ • ADMIN: Bypassed (full access)                                │
│ • Reads @Roles() decorator for required roles                  │
│ • Checks if user.role is in allowed roles                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ CONTROLLER HANDLER                                             │
│ • orgId from TenantGuard, userId from JWT                      │
│ • All checks passed, executes business logic                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Response Patterns (ONLY 3 Allowed)

### Pattern 1: Raw Data

```typescript
return user;
return UserResponseDto.fromEntity(user);
```

### Pattern 2: Custom Message

```typescript
return { data: result, message: "Custom message here" };
```

### Pattern 3: Paginated

```typescript
return { items: items, meta: { page: 1, limit: 10, total: 50 } };
```

---

## 7. Complete File Templates

### 7.1 Create DTO (`dto/create-<feature>.dto.ts`)

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

### 7.2 Update DTO (`dto/update-<feature>.dto.ts`)

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

### 7.3 Response DTO (`dto/<feature>-response.dto.ts`)

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

### 7.4 Create Command (`commands/impl/create-<feature>.command.ts`)

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

### 7.5 Delete Command (`commands/impl/delete-<feature>.command.ts`)

```typescript
export class Delete<Feature>Command {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
```

### 7.6 Create Command Handler (`commands/handlers/create-<feature>.handler.ts`)

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

      return <Feature>ResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create <feature>', error.stack);
      throw this.errorService.internalServerError('Failed to create <feature>');
    }
  }
}
```

### 7.7 Delete Command Handler (`commands/handlers/delete-<feature>.handler.ts`)

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

      await this.prisma.<model>.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
          isActive: false,
        },
      });
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to delete <feature>', error.stack);
      throw this.errorService.internalServerError('Failed to delete <feature>');
    }
  }
}
```

### 7.8 Commands Index (`commands/index.ts`)

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

### 7.9 Get Query (`queries/impl/get-<feature>.query.ts`)

```typescript
export class Get<Feature>Query {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
  ) {}
}
```

### 7.10 List Query (`queries/impl/list-<features>.query.ts`)

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

### 7.11 Get Query Handler (`queries/handlers/get-<feature>.handler.ts`)

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

### 7.12 List Query Handler (`queries/handlers/list-<features>.handler.ts`)

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

### 7.13 Queries Index (`queries/index.ts`)

```typescript
import { Get<Feature>Handler } from './handlers/get-<feature>.handler';
import { List<Features>Handler } from './handlers/list-<features>.handler';

export const <Feature>QueryHandlers = [
  Get<Feature>Handler,
  List<Features>Handler,
];
```

### 7.14 Service Facade (`<feature>.service.ts`)

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

### 7.15 Company Portal Controller (`<feature>.controller.ts`)

```typescript
import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { <Feature>Service } from './<feature>.service';
import { Create<Feature>Dto } from './dto/create-<feature>.dto';
import { Update<Feature>Dto } from './dto/update-<feature>.dto';
import { <Feature>ResponseDto } from './dto/<feature>-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { TenantGuard } from 'middleware/guards/tenant.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { RequiredFeature } from 'decorators/required-feature.decorator';
import { CurrentUser } from 'decorators/current-user.decorator';
import { CurrentOrgId } from 'decorators/current-org.decorator';
import { UserRole } from 'generated/prisma/enums';

@ApiTags('<Features>')
@Controller('api/:slug/<features>')
@UseGuards(JwtAuthGuard, TenantGuard)
export class <Feature>Controller {
  constructor(private readonly service: <Feature>Service) {}

  @Get()
  @ApiOperation({ summary: 'List <features>' })
  async findAll(
    @CurrentOrgId() orgId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(orgId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get <feature> by ID' })
  async findById(@Param('id') id: string, @CurrentOrgId() orgId: string) {
    return this.service.findById(id, orgId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN, UserRole.COMPANY_STAFF)
  @RequiredFeature('BRAND_CREATE')
  @ApiOperation({ summary: 'Create <feature>' })
  async create(
    @Body() dto: Create<Feature>Dto,
    @CurrentOrgId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, orgId, userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Update <feature>' })
  async update(
    @Param('id') id: string,
    @Body() dto: Update<Feature>Dto,
    @CurrentOrgId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, orgId, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete <feature> (soft delete)' })
  async remove(
    @Param('id') id: string,
    @CurrentOrgId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.remove(id, orgId, userId);
  }
}
```

### 7.16 Module (`<feature>.module.ts`)

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

### 7.17 App Module (Global Guard Registration)

```typescript
// src/app.module.ts
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

---

## 8. Organization-Scoped Operations

### Golden Rule: Every query MUST filter by orgId + deletedAt

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
```

---

## 9. Soft Delete Operations

```typescript
// ✅ CORRECT - Soft delete
await this.prisma.<model>.update({
  where: { id },
  data: { deletedAt: new Date(), deletedBy: userId, isActive: false },
});

// ❌ WRONG - Hard delete
await this.prisma.<model>.delete({ where: { id } });

// Duplicate check - only among active records
const existing = await this.prisma.<model>.findFirst({
  where: { orgId, slug: newSlug, deletedAt: null },
});
```

---

## 10. Multi-Tenant Data Isolation

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

## 11. Anti-Patterns (NEVER)

| ❌ Wrong                                      | ✅ Correct                                    |
| --------------------------------------------- | --------------------------------------------- |
| `new PrismaClient()`                          | `this.prisma`                                 |
| `throw new BadRequestException()`             | `this.errorService.badRequest()`              |
| `console.log()` / `console.error()`           | `this.logger.log()` / `this.logger.error()`   |
| Raw S3/AWS SDK calls                          | `this.fileService.uploadFile()`               |
| `return { success: true, data: ... }`         | `return data` (Pattern 1)                     |
| DB queries in controller/service              | Only in CQRS handlers                         |
| Missing `this.logger.setContext()`            | Always set in constructor                     |
| Empty `catch (e) {}`                          | Log + throw error                             |
| Query without `orgId` filter                  | Always include `orgId` in where clause        |
| Query without `deletedAt: null`               | Always exclude soft-deleted records           |
| Hard delete with `prisma.delete()`            | Use `prisma.update()` to set `deletedAt`      |
| Injecting feature services cross-module       | Use QueryBus or CommandBus                    |
| File upload without old file deletion         | Delete old file before uploading new          |
| Importing `PrismaModule` / `JwtModule` / etc. | They are `@Global()`, just inject service     |
| Creating duplicate User for existing email    | Check User table first, reuse existing record |
| Company portal route without TenantGuard      | Always validate org from slug                 |

---

## 12. Quick Checklist

- [ ] Module folder created under correct portal (`auth/`, `admin/`, `company/`, `consumer/`, `files/`)
- [ ] Feature folder created with `commands/`, `queries/`, `dto/`
- [ ] `commands/index.ts` and `queries/index.ts` export handler arrays
- [ ] Command class includes `orgId` and `userId` in constructor
- [ ] Query class includes `orgId` for organization-scoped queries
- [ ] Command Handler creates records with `orgId`, `createdBy`, `updatedBy`
- [ ] Query Handler filters by `orgId` AND `deletedAt: null`
- [ ] All find queries include `orgId` in where clause
- [ ] Soft delete uses `update` to set `deletedAt` and `deletedBy`
- [ ] Duplicate checks include `deletedAt: null`
- [ ] DTOs use `class-validator` + Swagger decorators
- [ ] Response DTO has `@Exclude()`, `@Expose()`, `fromEntity()`, `fromEntities()`
- [ ] Response DTO includes `orgId` field
- [ ] Handler injects: `PrismaService`, `LoggerService`, `ErrorService`
- [ ] Handler sets logger context: `this.logger.setContext(ClassName.name)`
- [ ] Handler returns Pattern 1, 2, or 3
- [ ] Service Facade only calls `commandBus.execute()` / `queryBus.execute()`
- [ ] Service Facade passes `orgId` to commands and queries
- [ ] Controller only calls Service Facade methods
- [ ] Company portal controllers use `@Controller('api/:slug/...')` with `JwtAuthGuard` + `TenantGuard`
- [ ] Admin portal controllers use `@Controller('api/admin/...')` with `JwtAuthGuard` + `TenantGuard` + `@Roles(ADMIN)`
- [ ] Consumer portal controllers use `@Controller('api/:slug/consumer/...')` with `JwtAuthGuard` + `TenantGuard`
- [ ] Feature-protected endpoints use `@RequiredFeature('FEATURE_CODE')`
- [ ] Role-protected endpoints use `@Roles()` + `RolesGuard`
- [ ] Controller uses `@CurrentOrgId()` and `@CurrentUser('id')` to get context
- [ ] Module imports `CommonModules` from `services`
- [ ] Module provides `RolesGuard`
- [ ] AppModule registers `JwtAuthGuard` and `TenantGuard` as global guards
- [ ] Error handling: `if (error.status) throw error;` else throw 500
