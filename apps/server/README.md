# Scripts Explanation

### **Core NestJS Scripts**

* **`build`** → Compiles the project (`nest build`) into JavaScript under `dist/`.
* **`start`** → Starts the NestJS server in normal mode.
* **`dev`** → Starts the server in **watch mode** (auto-restarts on file changes).
* **`start:debug`** → Runs the server in **debug + watch mode** for debugging with tools like Chrome DevTools.
* **`start:prod`** → Runs the compiled `dist/main.js` (production mode).

---

### **Code Quality & Formatting**

* **`format`** → Formats code using **Prettier** across `src/` and `test/`.
* **`lint`** → Runs **ESLint** on all `.ts` files inside `src, apps, libs, test` and applies auto-fixes.

---

### **Testing with Jest**

* **`test`** → Runs all Jest unit tests.
* **`test:watch`** → Runs tests in **watch mode** (reruns on code changes).
* **`test:cov`** → Runs tests and generates a **coverage report**.
* **`test:debug`** → Runs Jest in **debug mode** with Node inspector for step debugging.
* **`test:e2e`** → Runs **end-to-end tests** with config from `test/jest-e2e.json`.

---

### **Prisma (Database Management)**

* **`prisma:generate`** → Generates Prisma Client based on `schema.prisma`.
* **`prisma:dev:migrate`** → Applies and creates new migrations for **dev environment**.
* **`prisma:db:push`** → Pushes schema changes to the database **without creating migrations**.
* **`prisma:db:seed`** → Runs seeding script (`prisma/seed.ts`) to populate initial data.
* **`prisma:migrate:deploy`** → Deploys migrations in production.
* **`prisma:studio`** → Opens **Prisma Studio** (UI to view/edit database).
* **`prisma:dev:reset`** → Resets database, re-applies migrations, and re-seeds data.
* **`prisma:dev:init`** → Initializes Prisma setup (`prisma init`).
* **`prisma:format`** → Formats the `schema.prisma` file.
* **`prisma:validate`** → Validates schema for correctness.

---

# Prisma Seeding

Inside `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

This tells Prisma to run `prisma/seed.ts` for populating initial data when executing `prisma db seed`.

---

# Steps to Run the Backend

### **Set up the database with Prisma**

If you’re using **Prisma ORM**, you need to prepare the database first.

* Generate Prisma client:

```bash
npm run prisma:generate
```

* Run database migrations (for dev environment):

```bash
npm run prisma:dev:migrate
```

* (Optional) Push schema directly to DB without migrations:

```bash
npm run prisma:db:push
```

* (Optional) Seed the database:

```bash
npm run prisma:db:seed
```

* (Optional) Open Prisma Studio to view data:

```bash
npm run prisma:studio
```
