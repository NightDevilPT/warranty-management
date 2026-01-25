# Warranty Management System (WMS)

A multi-tenant, configurable warranty management platform built with modern web technologies and a monorepo architecture.

## 🎯 Overview

The Warranty Management System (WMS) streamlines warranty operations for manufacturers, retailers, and service providers with:

- **Multi-tenancy** with isolated company portals
- **Dynamic form schemas** for products, claims, and registrations
- **Custom warranty templates** with validation rules
- **Hierarchical partner management** (dealers, retailers, service centers)
- **Role-based access control** with company-defined permission sets

## 📁 Project Structure

```
warranty-management/
├── apps/
│   ├── admin/                 # Platform admin interface (SYSTEM_ADMIN)
│   ├── server/                # Backend API & business logic (NestJS + Prisma)
│   ├── company/              # Company management portal
│   └── consumer/             # End-customer self-service portal
├── packages/
│   ├── ui/                   # Shared UI components (shadcn/ui + custom)
│   ├── eslint-config/        # Shared ESLint configuration
│   └── typescript-config/    # Shared TypeScript configuration
├── docs/
│   └── Warranty-Management-System-Specification.md
└── package.json              # Root package.json with Turborepo scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm 10.4.1+
- CockroachDB
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd warranty-management-system

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
pnpm prisma:generate

# Start development servers
pnpm dev
```

### Development Commands

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `pnpm dev`             | Start all apps in development mode        |
| `pnpm build`           | Build all apps for production             |
| `pnpm lint`            | Run ESLint on all apps                    |
| `pnpm format`          | Format code with Prettier                 |
| `pnpm docker:dev`      | Start development environment with Docker |
| `pnpm prisma:generate` | Generate Prisma client                    |

### Running Specific Apps

```bash
# Run individual apps
cd apps/admin && pnpm dev
cd apps/company && pnpm dev
cd apps/consumer && pnpm dev
cd apps/server && pnpm dev

# Or using Turbo
pnpm --filter admin dev
pnpm --filter server dev
```

## 🏗️ Architecture

### **Portal Structure**

| Portal       | Path                   | Target Users  | Framework |
| ------------ | ---------------------- | ------------- | --------- |
| **Admin**    | `/admin/*`             | SYSTEM_ADMIN  | Next.js   |
| **Company**  | `/{companySlug}/app/*` | COMPANY Users | Next.js   |
| **Consumer** | `/{companySlug}/app/*` | CONSUMER      | Next.js   |
| **Server**   | `/api/*`               | All portals   | NestJS    |

### **Core Services**

- **Authentication**: JWT with refresh token rotation
- **Database**: CockroachDB with Prisma ORM
- **File Storage**: Cloud-based storage for attachments
- **Email**: Transactional email service
- **Caching**: Redis for session and data caching

## 📦 Packages

### **Shared UI (`packages/ui`)**

- Reusable React components built with shadcn/ui
- Design tokens and theme configuration
- Form components with validation
- Layout components for all portals

### **Configurations**

- `@workspace/eslint-config`: ESLint rules for TypeScript/React
- `@workspace/typescript-config`: TypeScript configurations

## 🛠️ Development

### Adding Dependencies

```bash
# Add to specific app
pnpm --filter admin add <package-name>

# Add to all apps
pnpm -r add <package-name>

# Add dev dependency to root
pnpm add -D <package-name>
```

### Database Management

```bash
# Generate Prisma client (after schema changes)
pnpm prisma:generate

# Run migrations (from server app)
cd apps/server
pnpm prisma:migrate dev

# View database
pnpm prisma studio
```

### Docker Development

```bash
# Start all services (CockroachDB, Redis, etc.)
pnpm docker:dev

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Environment Setup

Create a `.env` file in the root with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:26257/warranty_db"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user"
SMTP_PASS="pass"

# Storage
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket"
```

## 🧪 Testing

```bash
# Run tests for all apps
pnpm test

# Run tests for specific app
pnpm --filter admin test
pnpm --filter server test

# Run tests in watch mode
pnpm --filter admin test:watch
```

## 📚 Documentation

- **[System Specification](./docs/overview.md)** - Complete system requirements and flows
- **[API Documentation](./docs/api.md)** - Backend API reference
- **[Deployment Guide](./docs/deployment.md)** - Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/<feature-name>`)
3. Commit your changes (`git commit -m 'Add <feature name>'`)
4. Push to the branch (`git push origin feature/<feature name>`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test-related changes
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentation**: [System Specification](./docs/Warranty-Management-System-Specification.md)
