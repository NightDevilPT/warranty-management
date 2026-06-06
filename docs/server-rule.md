# NestJS CQRS Backend Developer Rule Book

This document defines the strict coding standards, directory structures, global service usages, and API response contracts for the Warranty Management System (WMS) backend.

All developers **must** adhere to these guidelines when creating new APIs to maintain consistency, observability, and stability.

---

## 1. Directory Structure Standard

Every new feature must be isolated in its own module inside `src/modules/` following the strict CQRS pattern.

```text
src/modules/<feature-name>/
├── commands/                  # Write operations (Create, Update, Delete)
│   ├── impl/                  # Command class definitions (.command.ts)
│   └── handlers/              # Command execution logic (.handler.ts)
├── queries/                   # Read operations (Get, List)
│   ├── impl/                  # Query class definitions (.query.ts)
│   └── handlers/              # Query execution logic (.handler.ts)
├── dto/                       # Request payload validation classes
├── <feature>.service.ts       # Service Facade (dispatches commands/queries)
├── <feature>.controller.ts    # HTTP Controller (receives requests)
└── <feature>.module.ts        # Module configuration

```

---

## 2. Global Services Reference Guide

To enforce uniform logging, error handling, database access, and integrations, **never use native Node.js or raw NestJS equivalents**. Always inject and use the custom global services defined in `src/common/`.

### 2.1 Database Access (`PrismaService`)

**Rule:** NEVER instantiate a raw `new PrismaClient()`. ALWAYS inject our custom, globally scoped `PrismaService`.

Because our `PrismaModule` is decorated with `@Global()`, you **do not** need to import `PrismaModule` into your feature modules' `imports` array. You simply inject `PrismaService` directly into your handlers or services. Our custom service cleanly handles database connection lifecycles (`OnModuleInit` and `OnModuleDestroy`), preventing memory leaks and connection pool exhaustion.

**Injection & Usage:**

```typescript
constructor(private readonly prisma: PrismaService) {}

// Inside a Command or Query Handler
const user = await this.prisma.user.findUnique({
  where: { email: command.email }
});

```

### 2.2 Error Handling (`ErrorService`)

**Rule:** NEVER throw raw NestJS exceptions (e.g., `new BadRequestException()`). ALWAYS inject and use the `ErrorService`. All errors thrown via `ErrorService` are automatically caught by the global `ExceptionInterceptor` and formatted properly for the client.

**Injection:**

```typescript
constructor(private readonly errorService: ErrorService) {}

```

**Available Methods:**
All methods accept the following optional parameters:

- `message?` (string): The error message sent to the client.
- `options?` (ErrorOptions): `{ description?: string; cause?: Error }` for internal debugging.

| Method                  | HTTP Status | Use Case                              | Example                                                                                |
| ----------------------- | ----------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `badRequest()`          | 400         | Invalid inputs or malformed requests. | `throw this.errorService.badRequest('Invalid email format');`                          |
| `unauthorized()`        | 401         | Missing or invalid auth token.        | `throw this.errorService.unauthorized('Token expired');`                               |
| `forbidden()`           | 403         | Authenticated, lacks permissions.     | `throw this.errorService.forbidden('Missing CAN_CREATE_PRODUCT role');`                |
| `notFound()`            | 404         | Resource does not exist in DB.        | `throw this.errorService.notFound('User not found');`                                  |
| `conflict()`            | 409         | Resource exists or state conflict.    | `throw this.errorService.conflict('Email already in use');`                            |
| `unprocessableEntity()` | 422         | Semantic errors in payload data.      | `throw this.errorService.unprocessableEntity('Start date before end date');`           |
| `internalServerError()` | 500         | Unexpected system failures.           | `throw this.errorService.internalServerError('DB connection failed', { cause: err });` |

### 2.3 Logging (`LoggerService`)

**Rule:** NEVER use `console.log` or `console.error`. ALWAYS inject and use `LoggerService`. Always set the context in the constructor so logs indicate exactly which class generated them.

**Injection & Setup:**

```typescript
constructor(private readonly logger: LoggerService) {
  this.logger.setContext(MyHandler.name);
}

```

**Available Methods:**

- `meta?` (LogMetadata): An optional object for extra data `{ userId: 123 }`.

| Method             | Parameters                                                                | Use Case                                                          |
| ------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `log()` / `info()` | `(message: string, context?: string, meta?: LogMetadata)`                 | Standard operational events.                                      |
| `warn()`           | `(message: string, context?: string, meta?: LogMetadata)`                 | Unexpected behavior that isn't a hard failure.                    |
| `error()`          | `(message: string, trace?: string, context?: string, meta?: LogMetadata)` | Critical failures and caught exceptions. Always pass stack trace. |
| `debug()`          | `(message: string, context?: string, meta?: LogMetadata)`                 | Verbose data for local development/troubleshooting.               |

### 2.4 Email Service (`MailService`)

**Rule:** Use `MailService` for all outbound emails. It uses a Factory pattern, meaning we can switch from Gmail to AWS SES without changing business logic.

**Available Methods:**

- `sendMail(options: SendMailOptions): Promise<any>`
- **Options Interface:** `{ to: string | string[], subject: string, html?: string, text?: string, from?: string, cc?: string[], bcc?: string[], attachments?: any[] }`

---

## 3. API Response Formatting Standard

We utilize a global `ResponseInterceptor` and `ExceptionInterceptor` to enforce a strict contract for all API responses. The final response sent to the client will **always** follow the `IApiResponse<T>` interface:

```typescript
{
  "data": T | null,
  "success": boolean,
  "message": string,
  "statusCode": number,
  "meta": {
    "timings": { "processingTime": "...", "serverTime": "...", "requestReceived": "...", "responseSent": "..." },
    "request": { "path": "...", "method": "...", "ip": "...", "userAgent": "..." },
    "page": number,  // Optional (for pagination)
    "limit": number, // Optional
    "total": number  // Optional
  }
}

```

### How to format returns in your Controllers/Handlers:

Because the `ResponseInterceptor` automatically wraps your output, **you do NOT need to manually construct the `IApiResponse` object in your code**.

#### Scenario 1: Standard Response (Single Object or Array)

Simply return the raw data. The interceptor will wrap it in `data`, set `success: true`, and generate an automated message based on the HTTP Method (e.g., POST = "Resource created successfully").

**What you return:**

```typescript
return await this.prisma.user.findUnique({ where: { id } });
```

#### Scenario 2: Custom Success Message

If you want to override the default HTTP method message, wrap your return object with `data` and `message`.

**What you return:**

```typescript
return {
  data: updatedUser,
  message: "User profile updated successfully!",
};
```

#### Scenario 3: Paginated Data (Listings)

When returning lists, return an object containing `items` and `meta`. The interceptor will map `items` to `data` and merge your pagination info into the root `meta` object alongside the timings.

**What you return:**

```typescript
return {
  items: userArray,
  meta: { page: 1, limit: 10, total: 50 },
};
```

---

## 4. The API Creation Workflow (Step-by-Step)

When adding a new API endpoint, follow this exact flow:

**Step 1: Define the DTO (`feature.dto.ts`)**
Define strict validation rules using `class-validator` to ensure the controller catches bad data.

**Step 2: Create the Command/Query (`impl/feature.command.ts`)**
Create a simple class that holds the validated data. _No logic goes here._

**Step 3: Create the Handler (`handlers/feature.handler.ts`)**

1. Implement `ICommandHandler` (or `IQueryHandler`).
2. Inject `PrismaService`, `LoggerService`, and `ErrorService`.
3. Set the logger context inside the constructor.
4. Write your business logic using `this.prisma` and **return the raw data** (or `{ items, meta }` for pagination).
5. Add the handler to the array in `handlers/index.ts`.

**Step 4: Update the Service Facade (`feature.service.ts`)**
Create a method that accepts the DTO and dispatches the new Command to the `CommandBus` (or `QueryBus`).

**Step 5: Update the Controller (`feature.controller.ts`)**
Create the HTTP route (e.g., `@Post()`). Apply necessary Guards. Call the Service Facade. Let the Interceptor handle the response formatting.

---

## 5. Strict Anti-Patterns (Do NOT Do This)

- ❌ **Manually wrapping responses:** Do not write `return { success: true, data: result, statusCode: 200 }` in your controllers. The interceptor does this automatically. Just return the `result`.
- ❌ **Raw Prisma Instantiation:** Never write `new PrismaClient()`. This creates memory leaks. Always use the injected `PrismaService`.
- ❌ **Fat Controllers/Services:** Controllers and Service Facades should never contain database queries (`this.prisma.user.find(...)`). They only receive requests and dispatch to the Command/Query buses.
- ❌ **Missing Logger Context:** Calling `this.logger.error('Failed')` without setting the context in the constructor makes debugging impossible.
- ❌ **Swallowing Errors:** Never write an empty catch block `catch (e) { }`. Always log the error stack trace using `LoggerService` and throw an appropriate `ErrorService` exception.
- ❌ **Cross-Module Database Calls:** If the `OrdersModule` needs user data, it should query the DB directly via its own handlers, OR trigger a Query on the `QueryBus`. Do not inject `UsersService` into `OrdersService`.

---

## 6. Pull Request / Development Checklist

Before submitting a Pull Request for a new API, verify the following:

- [ ] Created module folder (`src/modules/feature_name`).
- [ ] Separated logic strictly into `commands/` and `queries/`.
- [ ] Created strict DTOs for payload validation.
- [ ] **Verified API returns raw data or `{ items, meta }` to allow the `ResponseInterceptor` to format the final JSON.**
- [ ] **Verified database calls are strictly using the injected `PrismaService` (No `new PrismaClient()`).**
- [ ] **Verified `PrismaModule` was NOT imported into the feature module (it is already `@Global()`).**
- [ ] Replaced all generic `throw new HttpException` / `BadRequestException` with `this.errorService`.
- [ ] Replaced all `console.log` with `this.logger`.
- [ ] Controller only calls the Service Facade; Service Facade only calls the `CommandBus`/`QueryBus`.
