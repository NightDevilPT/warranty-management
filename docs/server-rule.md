You're absolutely right! Here's the clean, concise Rule Book without function implementations - just types, signatures, folder structure, and usage patterns.

---

# 🚀 Warranty Management System - Backend Developer Rule Book

---

## 1. Folder Structure (Complete)

```text
src/
├── services/                              # Global Services
│   └── index.ts                           # Exports CommonModules array
│
├── modules/
│   └── <feature-name>/
│       ├── commands/
│       │   ├── handlers/
│       │   │   ├── create-<feature>.handler.ts
│       │   │   ├── update-<feature>.handler.ts
│       │   │   └── upload-<file-type>.handler.ts    # Only if file upload
│       │   ├── impl/
│       │   │   ├── create-<feature>.command.ts
│       │   │   ├── update-<feature>.command.ts
│       │   │   └── upload-<file-type>.command.ts    # Only if file upload
│       │   └── index.ts                             # Export all command handlers array
│       ├── queries/
│       │   ├── handlers/
│       │   │   ├── get-<feature>.handler.ts
│       │   │   └── list-<features>.handler.ts
│       │   ├── impl/
│       │   │   ├── get-<feature>.query.ts
│       │   │   └── list-<features>.query.ts
│       │   └── index.ts                             # Export all query handlers array
│       ├── dto/
│       │   ├── create-<feature>.dto.ts
│       │   ├── update-<feature>.dto.ts
│       │   ├── <feature>-response.dto.ts
│       │   └── upload-<file-type>.dto.ts            # Only if file upload
│       ├── <feature>.service.ts                     # Service Facade
│       ├── <feature>.controller.ts                  # HTTP Controller
│       └── <feature>.module.ts                      # Module Configuration
```

---

## 2. Global Services - Signatures & Usage

### 2.1 PrismaService

**Import:** `import { PrismaService } from 'services/prisma/prisma.service';`
**Injection:** `private readonly prisma: PrismaService`
**Module:** `@Global()` - NO need to import in feature modules

```typescript
// Available Prisma methods (all standard Prisma ORM methods)
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
**All methods throw exceptions, return type is `never`**

```typescript
errorService.badRequest(message: string): never                          // 400
errorService.unauthorized(message: string): never                        // 401
errorService.forbidden(message: string): never                           // 403
errorService.notFound(message: string): never                            // 404
errorService.conflict(message: string): never                            // 409
errorService.unprocessableEntity(message: string): never                 // 422
errorService.internalServerError(message: string): never                 // 500
```

### 2.3 LoggerService

**Import:** `import { LoggerService } from 'services/logger/logger.service';`
**Injection:** `private readonly logger: LoggerService`

```typescript
// Setup (REQUIRED in every handler constructor)
logger.setContext(ClassName.name): void

// Logging methods
logger.log(message: string, context?: string, meta?: Record<string, any>): void
logger.warn(message: string, context?: string, meta?: Record<string, any>): void
logger.error(message: string, trace?: string, context?: string, meta?: Record<string, any>): void
logger.debug(message: string, context?: string, meta?: Record<string, any>): void
```

### 2.4 FileService

**Import:** `import { FileService } from 'services/files/file.service';`
**Injection:** `private readonly fileService: FileService`

```typescript
// Upload single file
fileService.uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFile>

// Upload multiple files
fileService.uploadFiles(files: Express.Multer.File[], folder?: string): Promise<UploadedFile[]>

// Get download URL
fileService.getDownloadUrl(key: string): Promise<string>

// Delete file
fileService.deleteFile(key: string): Promise<void>

// UploadedFile type
interface UploadedFile {
  key: string;          // "profiles/123-abc.jpg"
  url: string;          // Download URL
  fileName: string;     // Generated unique name
  originalName: string; // Original file name
  mimeType: string;     // "image/jpeg"
  size: number;         // Bytes
}
```

**Standard folders:** `'profiles'`, `'products'`, `'documents'`, `'claims'`

### 2.5 MailService

**Import:** `import { MailService } from 'services/mail/mail.service';`
**Injection:** `private readonly mailService: MailService`

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

## 3. Response Patterns (ONLY 3 Allowed)

### Pattern 1: Raw Data

```typescript
// Return object
return user;
return UserResponseDto.fromEntity(user);

// Return array
return users;
return UserResponseDto.fromEntities(users);
```

**Response:** `{ data: ..., success: true, message: "Resource created successfully", statusCode: 201, meta: {...} }`

### Pattern 2: Custom Message

```typescript
return {
  data: result,
  message: "Custom message here",
};
```

**Response:** `{ data: ..., success: true, message: "Custom message here", statusCode: 200, meta: {...} }`

### Pattern 3: Paginated

```typescript
return {
  items: userArray,
  meta: { page: 1, limit: 10, total: 50 },
};
```

**Response:** `{ data: [...], success: true, message: "...", statusCode: 200, meta: { page: 1, limit: 10, total: 50, ...timings } }`

---

## 4. File Templates (Type Signatures Only)

### 4.1 Module (`<feature>.module.ts`)

```typescript
@Module({
  imports: [...CommonModules],
  controllers: [<Feature>Controller],
  providers: [
    <Feature>Service,
    ...<Feature>CommandHandlers,
    ...<Feature>QueryHandlers,
  ],
})
export class <Feature>Module {}
```

### 4.2 Commands Index (`commands/index.ts`)

```typescript
import { Handler1 } from './handlers/handler1';
import { Handler2 } from './handlers/handler2';

export const <Feature>CommandHandlers = [Handler1, Handler2];
```

### 4.3 Command (`commands/impl/<action>.command.ts`)

```typescript
export class <Action>Command {
  constructor(public readonly dto: <Action>Dto) {}
}

// For file upload
export class Upload<FileType>Command {
  constructor(
    public readonly resourceId: string,
    public readonly file: Express.Multer.File,
  ) {}
}
```

### 4.4 Command Handler (`commands/handlers/<action>.handler.ts`)

```typescript
@CommandHandler(<Action>Command)
export class <Action>Handler implements ICommandHandler<<Action>Command> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly fileService?: FileService, // Only if file upload
  ) {
    this.logger.setContext(<Action>Handler.name); // REQUIRED
  }

  async execute(command: <Action>Command): Promise<<Feature>ResponseDto> {
    this.logger.log('Executing <Action>Command', undefined, { /* meta */ });

    try {
      // 1. Validations (throw this.errorService.xxx() if fails)
      // 2. Business logic
      // 3. Database operations (this.prisma.<model>.xxx())
      // 4. File operations (this.fileService.xxx()) if needed

      this.logger.log('<Action> successful', undefined, { id: result.id });

      // Return Pattern 1
      return <Feature>ResponseDto.fromEntity(result);

      // OR Pattern 2 for file uploads
      return {
        data: { fileUrl: uploadedFile.url },
        message: 'File uploaded successfully',
      };

    } catch (error) {
      if (error.status) throw error; // Re-throw HTTP exceptions
      this.logger.error('Failed to <action>', error.stack);
      throw this.errorService.internalServerError('Failed to <action>');
    }
  }

  // Only for file upload handlers
  private extractKeyFromUrl(url: string): string | null { /* ... */ }
}
```

### 4.5 Query Handler (`queries/handlers/<action>.handler.ts`)

```typescript
@QueryHandler(<Action>Query)
export class <Action>Handler implements IQueryHandler<<Action>Query> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(<Action>Handler.name);
  }

  async execute(query: <Action>Query): Promise<<Feature>ResponseDto | PaginatedResult> {
    this.logger.log('Executing <Action>Query', undefined, { /* meta */ });

    try {
      // Single item
      const result = await this.prisma.<model>.findUnique({ where: { id: query.id } });
      if (!result) throw this.errorService.notFound('<Feature> not found');
      return <Feature>ResponseDto.fromEntity(result); // Pattern 1

      // OR Paginated
      const [items, total] = await Promise.all([...]);
      return { items: <Feature>ResponseDto.fromEntities(items), meta: { page, limit, total } }; // Pattern 3

    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to <action>', error.stack);
      throw this.errorService.internalServerError('Failed to <action>');
    }
  }
}
```

### 4.6 Create DTO (`dto/create-<feature>.dto.ts`)

```typescript
export class Create<Feature>Dto {
  @ApiProperty({ description: '...', example: '...', type: String })
  @IsNotEmpty({ message: '...' })
  @IsString()
  @Type(() => String)
  fieldName: string;

  @ApiPropertyOptional({ description: '...', example: '...', type: String })
  @IsOptional()
  @IsString()
  @Type(() => String)
  optionalField?: string;
}
```

### 4.7 Response DTO (`dto/<feature>-response.dto.ts`)

```typescript
@Exclude()
export class <Feature>ResponseDto {
  @ApiProperty({ description: '...', example: '...' })
  @Expose()
  id: string;

  @ApiProperty({ description: '...', example: '...' })
  @Expose()
  fieldName: string;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): <Feature>ResponseDto
  static fromEntities(entities: any[]): <Feature>ResponseDto[]
}
```

**Note:** `fromEntity` uses `plainToInstance(ResponseDto, entity, { excludeExtraneousValues: true })`

### 4.8 File Upload DTO (`dto/upload-<file-type>.dto.ts`)

```typescript
export class Upload<FileType>Dto {
  @ApiProperty({
    description: 'File (jpg, png, webp - max 5MB)',
    type: 'string',
    format: 'binary',
    required: true,
  })
  file: Express.Multer.File;
}
```

### 4.9 Service Facade (`<feature>.service.ts`)

```typescript
@Injectable()
export class <Feature>Service {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // Commands
  async create(dto: CreateDto): Promise<ResponseDto>
  async update(id: string, dto: UpdateDto): Promise<ResponseDto>
  async uploadFile(id: string, file: Express.Multer.File): Promise<{ data: {...}, message: string }>

  // Queries
  async findById(id: string): Promise<ResponseDto>
  async findAll(page: number, limit: number): Promise<{ items: ResponseDto[], meta: {...} }>
}
```

### 4.10 Controller (`<feature>.controller.ts`)

```typescript
@ApiTags('<Features>')
@Controller('<features>')
export class <Feature>Controller {
  constructor(private readonly service: <Feature>Service) {}

  // JSON endpoints
  @Post()
  @ApiOperation({ summary: 'Create' })
  @ApiResponse({ status: 201, description: 'Created', type: ResponseDto })
  @ApiConsumes('application/json')
  @ApiBody({ type: CreateDto })
  async create(@Body() dto: CreateDto): Promise<ResponseDto>

  @Patch(':id')
  @ApiOperation({ summary: 'Update' })
  @ApiParam({ name: 'id', description: 'ID' })
  @ApiResponse({ status: 200, description: 'Updated', type: ResponseDto })
  @ApiConsumes('application/json')
  @ApiBody({ type: UpdateDto })
  async update(@Param('id') id: string, @Body() dto: UpdateDto): Promise<ResponseDto>

  // File upload endpoint
  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiParam({ name: 'id', description: 'ID' })
  @ApiResponse({ status: 200, description: 'File URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File (jpg, png, webp - max 5MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new BadRequestException('Invalid file type'), false);
      }
      callback(null, true);
    },
  }))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File)
}
```

---

## 5. Anti-Patterns (NEVER)

| ❌ Wrong                                    | ✅ Correct                                                        |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `new PrismaClient()`                        | `this.prisma`                                                     |
| `throw new BadRequestException()`           | `this.errorService.badRequest()`                                  |
| `console.log()` / `console.error()`         | `this.logger.log()` / `this.logger.error()`                       |
| Raw S3/AWS SDK calls                        | `this.fileService.uploadFile()`                                   |
| `return { success: true, data: ... }`       | `return data` (Pattern 1)                                         |
| `return { fileUrl: '...', message: '...' }` | `return { data: { fileUrl: '...' }, message: '...' }` (Pattern 2) |
| DB queries in controller/service            | Only in handlers                                                  |
| Missing `this.logger.setContext()`          | Always set in constructor                                         |
| Empty `catch (e) {}`                        | Log + throw error                                                 |
| Injecting feature services cross-module     | Use QueryBus or direct DB queries                                 |
| File upload without old file deletion       | Delete old file before uploading new                              |
| Importing `PrismaModule` / `FileModule`     | They are `@Global()`, just inject service                         |

---

## 6. Quick Checklist

- [ ] Module folder created with `commands/`, `queries/`, `dto/`
- [ ] `commands/index.ts` and `queries/index.ts` export handler arrays
- [ ] Command/Query classes in `impl/`, handlers in `handlers/`
- [ ] DTOs use `class-validator` + Swagger decorators
- [ ] Response DTO has `@Exclude()`, `@Expose()`, `fromEntity()`, `fromEntities()`
- [ ] Handler injects: `PrismaService`, `LoggerService`, `ErrorService` (+ `FileService` if needed)
- [ ] Handler sets logger context: `this.logger.setContext(ClassName.name)`
- [ ] Handler returns Pattern 1, 2, or 3
- [ ] Service Facade only calls `commandBus.execute()` / `queryBus.execute()`
- [ ] Controller only calls Service Facade methods
- [ ] Module imports `CommonModules` from `services`
- [ ] File upload uses `@UseInterceptors(FileInterceptor())` with validation
- [ ] Error handling: `if (error.status) throw error;` else throw 500
