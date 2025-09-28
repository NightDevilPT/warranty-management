# Use official Node.js 20 image as base
FROM node:20-slim

# Install PNPM globally
RUN npm install -g pnpm@10.4.1

# Set working directory to the monorepo root
WORKDIR /app

# Copy root package.json, pnpm-lock.yaml, and turbo.json
COPY package.json pnpm-lock.yaml turbo.json ./

# Copy the server app directory
COPY apps/server ./apps/server

# Copy shared workspace packages (if any)
COPY packages ./packages

# Install all dependencies, including devDependencies
RUN pnpm install --frozen-lockfile

# Change working directory to the server app
WORKDIR /app/apps/server

# Install NestJS CLI globally for better watch mode
RUN npm install -g @nestjs/cli
RUN npm install -g nodemon

# Install prisma as dev dependency
RUN pnpm add -D prisma

# Generate Prisma client (if schema exists)
RUN if [ -f "./prisma/schema.prisma" ]; then pnpm exec prisma generate; fi

# Expose the port NestJS runs on
EXPOSE 3000

# Use nodemon for better file watching in Docker
CMD ["nodemon", "--watch", "src", "--ext", "ts", "--exec", "pnpm", "run", "dev"]