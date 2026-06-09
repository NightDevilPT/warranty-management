Here's the complete updated Rule Book with all missing templates (Query class, Command class, DTOs, Service, Controller):

---

# 🚀 Warranty Management System - Backend Developer Rule Book

---

## 1. Folder Structure (Complete)

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
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── interceptors/
│       ├── response.interceptor.ts
│       └── exception.interceptor.ts
│
├── decorators/
│   └── roles.decorator.ts
│
├── config/
│   ├── configuration.ts
│   └── swagger.config.ts
│
├── interface/
│   └── api.interface.ts
│
├── modules/
│   └── <feature-name>/
│       ├── commands/
│       │   ├── handlers/
│       │   │   ├── create-<feature>.handler.ts
│       │   │   ├── update-<feature>.handler.ts
│       │   │   └── upload-<file-type>.handler.ts
│       │   ├── impl/
│       │   │   ├── create-<feature>.command.ts
│       │   │   ├── update-<feature>.command.ts
│       │   │   └── upload-<file-type>.command.ts
│       │   └── index.ts
│       ├── queries/
│       │   ├── handlers/
│       │   │   ├── get-<feature>.handler.ts
│       │   │   └── list-<features>.handler.ts
│       │   ├── impl/
│       │   │   ├── get-<feature>.query.ts
│       │   │   └── list-<features>.query.ts
│       │   └── index.ts
│       ├── dto/
│       │   ├── create-<feature>.dto.ts
│       │   ├── update-<feature>.dto.ts
│       │   ├── <feature>-response.dto.ts
│       │   └── upload-<file-type>.dto.ts
│       ├── <feature>.service.ts
│       ├── <feature>.controller.ts
│       └── <feature>.module.ts
```

---

## 2. Global Services - Signatures & Usage

### 2.1 PrismaService

**Import:** `import { PrismaService } from 'services/prisma/prisma.service';`
**Injection:** `private readonly prisma: PrismaService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
prisma.<model>.findUnique(args): <Model> | null
prisma.<model>.findFirst(args): <Model> | null
prisma.<model>.findMany(args): <Model>[]
prisma.<model>.create(args): <Model>
prisma.<model>.update(args): <Model>
prisma.<model>.delete(args): <Model>
prisma.<model>.count(args): number
prisma.<model>.upsert(args): <Model>
prisma.$transaction([...]): any[]
```

### 2.2 ErrorService

**Import:** `import { ErrorService } from 'services/errors/error.service';`
**Injection:** `private readonly errorService: ErrorService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
interface ErrorOptions {
  description?: string;
  cause?: Error;
}

errorService.badRequest(message?: string, options?: ErrorOptions): never              // 400
errorService.unauthorized(message?: string, options?: ErrorOptions): never            // 401
errorService.forbidden(message?: string, options?: ErrorOptions): never               // 403
errorService.notFound(message?: string, options?: ErrorOptions): never                // 404
errorService.conflict(message?: string, options?: ErrorOptions): never                // 409
errorService.unprocessableEntity(message?: string, options?: ErrorOptions): never     // 422
errorService.internalServerError(message?: string, options?: ErrorOptions): never     // 500
errorService.serviceUnavailable(message?: string, options?: ErrorOptions): never      // 503
errorService.gatewayTimeout(message?: string, options?: ErrorOptions): never          // 504
errorService.payloadTooLarge(message?: string, options?: ErrorOptions): never         // 413
errorService.notImplemented(message?: string, options?: ErrorOptions): never          // 501
```

### 2.3 LoggerService

**Import:** `import { LoggerService } from 'services/logger/logger.service';`
**Injection:** `private readonly logger: LoggerService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
logger.setContext(ClassName.name): void
logger.log(message: string, context?: string, meta?: Record<string, any>): void
logger.info(message: string, context?: string, meta?: Record<string, any>): void
logger.warn(message: string, context?: string, meta?: Record<string, any>): void
logger.error(message: string, trace?: string, context?: string, meta?: Record<string, any>): void
logger.debug(message: string, context?: string, meta?: Record<string, any>): void
logger.verbose(message: string, context?: string, meta?: Record<string, any>): void
```

### 2.4 JwtService

**Import:** `import { JwtService } from 'services/jwt/jwt.service';`
**Injection:** `private readonly jwtService: JwtService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
interface JwtPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  type?: 'access' | 'refresh';
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

jwtService.generateTokenPair(payload: JwtPayload): Promise<TokenPair>
jwtService.generateAccessToken(payload: JwtPayload): Promise<string>
jwtService.generateRefreshToken(payload: JwtPayload): Promise<string>
jwtService.verifyAccessToken(token: string): Promise<JwtPayload>
jwtService.verifyRefreshToken(token: string): Promise<JwtPayload>
jwtService.decodeToken(token: string): JwtPayload | null
jwtService.refreshTokenPair(refreshToken: string): Promise<TokenPair>
```

### 2.5 FileService

**Import:** `import { FileService } from 'services/files/file.service';`
**Injection:** `private readonly fileService: FileService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
interface UploadedFile {
  key: string;
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

fileService.uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFile>
fileService.uploadFiles(files: Express.Multer.File[], folder?: string): Promise<UploadedFile[]>
fileService.getDownloadUrl(key: string): Promise<string>
fileService.deleteFile(key: string): Promise<void>
```

**Standard folders:** `'profiles'`, `'products'`, `'documents'`, `'claims'`, `'organizations'`, `'brands'`, `'categories'`

### 2.6 MailService

**Import:** `import { MailService } from 'services/mail/mail.service';`
**Injection:** `private readonly mailService: MailService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
mailService.sendMail(options: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  cc?: string[]
  bcc?: string[]
  attachments?: any[]
}): Promise<any>
```

---

## 3. Guards - Signatures & Usage

### 3.1 JwtAuthGuard

```typescript
@UseGuards(JwtAuthGuard)
async endpoint(@Req() req: any) {
  const userId = req.user?.id;
  const userRole = req.user?.role;
}
```

### 3.2 RolesGuard

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async adminEndpoint() {}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COMPANY_SUPER_ADMIN)
async multiRoleEndpoint() {}
```

---

## 4. Response Patterns (ONLY 3 Allowed)

### Pattern 1: Raw Data

```typescript
return user;
return UserResponseDto.fromEntity(user);
```

**Response:** `{ data: ..., success: true, message: "Resource created successfully", statusCode: 201, meta: {...} }`

### Pattern 2: Custom Message

```typescript
return { data: result, message: "Custom message here" };
```

**Response:** `{ data: ..., success: true, message: "Custom message here", statusCode: 200, meta: {...} }`

### Pattern 3: Paginated

```typescript
return { items: items, meta: { page: 1, limit: 10, total: 50 } };
```

**Response:** `{ data: [...], success: true, message: "...", statusCode: 200, meta: { page, limit, total, ...timings } }`

---

## 5. Complete File Templates

### 5.1 Create DTO (`dto/create-<feature>.dto.ts`)

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

### 5.2 Update DTO (`dto/update-<feature>.dto.ts`)

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

### 5.3 Response DTO (`dto/<feature>-response.dto.ts`)

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class <Feature>ResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Name', example: 'Example' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  description?: string;

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

### 5.4 Command (`commands/impl/create-<feature>.command.ts`)

```typescript
import { Create<Feature>Dto } from '../../dto/create-<feature>.dto';

export class Create<Feature>Command {
  constructor(
    public readonly dto: Create<Feature>Dto,
    public readonly userId: string,
  ) {}
}
```

### 5.5 Command Handler (`commands/handlers/create-<feature>.handler.ts`)

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
    const { dto, userId } = command;
    this.logger.log('Executing Create<Feature>Command', undefined, { name: dto.name });

    try {
      // 1. Validations
      const existing = await this.prisma.<model>.findUnique({
        where: { slug: dto.name.toLowerCase() },
      });

      if (existing) {
        throw this.errorService.conflict('<Feature> already exists');
      }

      // 2. Create
      const result = await this.prisma.<model>.create({
        data: {
          name: dto.name,
          description: dto.description,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      this.logger.log('<Feature> created successfully', undefined, { id: result.id });
      return <Feature>ResponseDto.fromEntity(result);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to create <feature>', error.stack);
      throw this.errorService.internalServerError('Failed to create <feature>');
    }
  }
}
```

### 5.6 Commands Index (`commands/index.ts`)

```typescript
import { Create<Feature>Handler } from './handlers/create-<feature>.handler';
import { Update<Feature>Handler } from './handlers/update-<feature>.handler';

export const <Feature>CommandHandlers = [
  Create<Feature>Handler,
  Update<Feature>Handler,
];
```

### 5.7 Query (`queries/impl/get-<feature>.query.ts`)

```typescript
export class Get<Feature>Query {
  constructor(public readonly id: string) {}
}
```

### 5.8 List Query (`queries/impl/list-<features>.query.ts`)

```typescript
export class List<Features>Query {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
  ) {}
}
```

### 5.9 Query Handler (`queries/handlers/get-<feature>.handler.ts`)

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
    this.logger.log('Executing Get<Feature>Query', undefined, { id: query.id });

    try {
      const result = await this.prisma.<model>.findUnique({
        where: { id: query.id },
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

### 5.10 List Query Handler (`queries/handlers/list-<features>.handler.ts`)

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
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    this.logger.log('Executing List<Features>Query', undefined, { page, limit, search });

    try {
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.<model>.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.<model>.count({ where }),
      ]);

      return {
        items: <Feature>ResponseDto.fromEntities(items),
        meta: {
          page,
          limit,
          total,
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

### 5.11 Queries Index (`queries/index.ts`)

```typescript
import { Get<Feature>Handler } from './handlers/get-<feature>.handler';
import { List<Features>Handler } from './handlers/list-<features>.handler';

export const <Feature>QueryHandlers = [
  Get<Feature>Handler,
  List<Features>Handler,
];
```

### 5.12 Service Facade (`<feature>.service.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Create<Feature>Dto } from './dto/create-<feature>.dto';
import { Update<Feature>Dto } from './dto/update-<feature>.dto';
import { <Feature>ResponseDto } from './dto/<feature>-response.dto';
import { Create<Feature>Command } from './commands/impl/create-<feature>.command';
import { Get<Feature>Query } from './queries/impl/get-<feature>.query';
import { List<Features>Query } from './queries/impl/list-<features>.query';

@Injectable()
export class <Feature>Service {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: Create<Feature>Dto, userId: string): Promise<<Feature>ResponseDto> {
    return this.commandBus.execute(new Create<Feature>Command(dto, userId));
  }

  async findById(id: string): Promise<<Feature>ResponseDto> {
    return this.queryBus.execute(new Get<Feature>Query(id));
  }

  async findAll(page: number, limit: number, search?: string) {
    return this.queryBus.execute(new List<Features>Query(page, limit, search));
  }
}
```

### 5.13 Controller (`<feature>.controller.ts`)

```typescript
import {
  Controller, Post, Get, Patch, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { <Feature>Service } from './<feature>.service';
import { Create<Feature>Dto } from './dto/create-<feature>.dto';
import { Update<Feature>Dto } from './dto/update-<feature>.dto';
import { <Feature>ResponseDto } from './dto/<feature>-response.dto';
import { JwtAuthGuard } from 'services/jwt/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@ApiTags('<Features>')
@Controller('<prefix>/<features>')
export class <Feature>Controller {
  constructor(private readonly service: <Feature>Service) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create <feature>' })
  @ApiResponse({ status: 201, description: 'Created', type: <Feature>ResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiConsumes('application/json')
  @ApiBody({ type: Create<Feature>Dto })
  async create(@Body() dto: Create<Feature>Dto, @Req() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List <features>' })
  @ApiResponse({ status: 200, description: 'Listed' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(page, limit, search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get <feature> by ID' })
  @ApiParam({ name: 'id', description: '<Feature> ID' })
  @ApiResponse({ status: 200, description: 'Found', type: <Feature>ResponseDto })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update <feature>' })
  @ApiParam({ name: 'id', description: '<Feature> ID' })
  @ApiResponse({ status: 200, description: 'Updated', type: <Feature>ResponseDto })
  @ApiConsumes('application/json')
  @ApiBody({ type: Update<Feature>Dto })
  async update(
    @Param('id') id: string,
    @Body() dto: Update<Feature>Dto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user?.id);
  }
}
```

### 5.14 Module (`<feature>.module.ts`)

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

## 6. Anti-Patterns (NEVER)

| ❌ Wrong                                                                               | ✅ Correct                                  |
| -------------------------------------------------------------------------------------- | ------------------------------------------- |
| `new PrismaClient()`                                                                   | `this.prisma`                               |
| `throw new BadRequestException()`                                                      | `this.errorService.badRequest()`            |
| `console.log()` / `console.error()`                                                    | `this.logger.log()` / `this.logger.error()` |
| Raw S3/AWS SDK calls                                                                   | `this.fileService.uploadFile()`             |
| `return { success: true, data: ... }`                                                  | `return data` (Pattern 1)                   |
| DB queries in controller/service                                                       | Only in handlers                            |
| Missing `this.logger.setContext()`                                                     | Always set in constructor                   |
| Empty `catch (e) {}`                                                                   | Log + throw error                           |
| Injecting feature services cross-module                                                | Use QueryBus or direct DB queries           |
| File upload without old file deletion                                                  | Delete old file before uploading new        |
| Importing `PrismaModule` / `JwtModule` / `FileModule` / `ErrorModule` / `LoggerModule` | They are `@Global()`, just inject service   |

---

## 7. Quick Checklist

- [ ] Module folder created with `commands/`, `queries/`, `dto/`
- [ ] `commands/index.ts` and `queries/index.ts` export handler arrays
- [ ] Command class in `impl/`, Command Handler in `handlers/`
- [ ] Query class in `impl/`, Query Handler in `handlers/`
- [ ] DTOs use `class-validator` + Swagger decorators
- [ ] Response DTO has `@Exclude()`, `@Expose()`, `fromEntity()`, `fromEntities()`
- [ ] Handler injects: `PrismaService`, `LoggerService`, `ErrorService`
- [ ] Handler sets logger context: `this.logger.setContext(ClassName.name)`
- [ ] Handler returns Pattern 1, 2, or 3
- [ ] Service Facade only calls `commandBus.execute()` / `queryBus.execute()`
- [ ] Controller only calls Service Facade methods
- [ ] Controller uses `@UseGuards(JwtAuthGuard)` for protected routes
- [ ] Controller uses `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()` for role-based access
- [ ] Module imports `CommonModules` from `services`
- [ ] Error handling: `if (error.status) throw error;` else throw 500
