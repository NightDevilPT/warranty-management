# 🚀 Warranty Management System - Frontend Developer Rule Book v3.1

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Monorepo Directory Structures](#2-monorepo-directory-structures)
3. [Available UI Components Catalog](#3-available-ui-components-catalog)
4. [Portal Routing & API Prefixes](#4-portal-routing--api-prefixes)
5. [Folder Standards & Component Co-location Rules](#5-folder-standards--component-co-location-rules)
6. [State & Context Standards](#6-state--context-standards)
7. [API Client & Request Rules](#7-api-client--request-rules)
8. [UX & Loading States Rules](#8-ux--loading-states-rules)
9. [Generic File Templates (AI Scaffolding Boilerplate)](#9-generic-file-templates-ai-scaffolding-boilerplate)
   - [9.1 Feature API Client (`lib/<feature>/index.ts`)](#91-feature-api-client-libfeatureindexts)
   - [9.2 Feature Types (`lib/<feature>/types.ts`)](#92-feature-types-libfeaturetypests)
   - [9.3 Feature Validation (`lib/<feature>/validation.ts`)](#93-feature-validation-libfeaturevalidationts)
   - [9.4 Feature Context (`components/context/<feature>-context.tsx`)](#94-feature-context-componentscontextfeature-contexttsx)
   - [9.5 Feature Routing Layout (`app/.../<feature>/layout.tsx`)](#95-feature-routing-layout-appfeaturelayouttsx)
   - [9.6 Feature Routing Page (`app/.../<feature>/page.tsx`)](#96-feature-routing-page-appfeaturepagetsx)
   - [9.7 Feature Component Entry (`components/pages/<feature>-page/index.tsx`)](#97-feature-component-entry-componentspagesfeature-pageindextsx)
10. [Import Hierarchy & Sorting Rules](#10-import-hierarchy--sorting-rules)
11. [Developer PR Checklist](#11-developer-pr-checklist)

---

## 1. Project Overview & Architecture

- **Tech Stack**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Workspaces**: Monorepo with three portals (`admin`, `company`, `consumer`) sharing a unified library `@workspace/ui`
- **State Management**: Scoped React Context Providers injected via route layout files
- **Validation**: Zod schemas for all form inputs
- **Notifications**: Sonner toast for all write operation feedback

---

## 2. Monorepo Directory Structures

### 2.1 Workspace Structure

```text
warranty-management/
├── apps/
│   ├── admin/                  # Admin Portal (Port 4001)
│   ├── company/                # Company Portal (Port 4002)
│   └── consumer/               # Consumer Portal (Port 4003)
├── packages/
│   ├── eslint-config/          # Shared ESLint configurations
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── react-internal.js
│   │   └── README.md
│   ├── typescript-config/      # Shared TypeScript configurations
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── react-library.json
│   │   └── README.md
│   └── ui/                     # Shared Package (@workspace/ui)
│       ├── src/
│       │   ├── components/     # shadcn/ui base primitives (26 components)
│       │   ├── shared/         # Shared business components (8 components)
│       │   ├── hooks/          # Shared hooks (use-mobile)
│       │   ├── lib/            # Shared clients (apiClient, utils)
│       │   ├── context/        # Shared contexts (theme-context)
│       │   ├── styles/         # Global CSS (globals.css)
│       │   ├── types/          # API types (api.types.ts)
│       │   └── i18n/           # Internationalization
│       │       ├── index.ts
│       │       └── locales/
│       │           └── en.json
│       ├── components.json
│       ├── package.json
│       ├── tsconfig.json
│       └── postcss.config.mjs
└── docs/
    └── rules/                  # Rules files (frontend-rule.md, server-rule.md)
```

### 2.2 Portal Directory Structure

Every Next.js app in `apps/<portal>/` must implement this structure:

```text
apps/<portal>/
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── (protected)/
│   │   ├── layout.tsx              # Protected shell layout (with SidebarLayout)
│   │   └── dashboard/
│   │       └── <feature>/
│   │           ├── layout.tsx      # Feature layout wrapping its context
│   │           └── page.tsx        # Lean page wrapper (no UI logic)
│   └── auth/
│       ├── layout.tsx              # Auth shell layout (centered)
│       └── login/
│           └── page.tsx            # Renders login page component
├── components/
│   ├── pages/
│   │   └── <feature>-page/         # Component containing page UI orchestration
│   │       ├── index.tsx           # Entry file for page layout
│   │       └── _components/        # Private feature components
│   │           ├── page-skeleton.tsx
│   │           ├── page-empty.tsx
│   │           └── <feature>-form-dialog.tsx # Dynamic dialog form for both edit & create
│   └── context/
│       ├── auth-context.tsx        # Portal-specific auth provider
│       └── <feature>-context.tsx   # Feature-specific context (complex pages)
├── lib/
│   └── <feature>/                  # API integration, validation schemas, types
│       ├── index.ts                # API client functions
│       ├── types.ts                # TypeScript interfaces
│       └── validation.ts           # Zod schemas
└── routes/
    └── index.ts                    # Sidebar items configuration
```

---

## 3. Available UI Components Catalog

> **CRITICAL**: Always reference this catalog before building any UI. These components are already implemented and must be reused.

### 3.1 Common UI Primitives (`@workspace/ui/components/`)

These are the base shadcn/ui components available across all portals:

| #   | Component        | Import Path                              | Primary Use Case                                |
| --- | ---------------- | ---------------------------------------- | ----------------------------------------------- |
| 1   | **Badge**        | `@workspace/ui/components/badge`         | Status indicators, labels, counters             |
| 2   | **Breadcrumb**   | `@workspace/ui/components/breadcrumb`    | Navigation hierarchy trails                     |
| 3   | **Button**       | `@workspace/ui/components/button`        | All clickable actions, submissions              |
| 4   | **Calendar**     | `@workspace/ui/components/calendar`      | Date picker, date range selection               |
| 5   | **Card**         | `@workspace/ui/components/card`          | Content containers with header/footer           |
| 6   | **Chart**        | `@workspace/ui/components/chart`         | Data visualization (recharts wrapper)           |
| 7   | **Collapsible**  | `@workspace/ui/components/collapsible`   | Expandable/collapsible sections                 |
| 8   | **Command**      | `@workspace/ui/components/command`       | Command palette, searchable menus               |
| 9   | **ContextMenu**  | `@workspace/ui/components/context-menu`  | Right-click contextual menus                    |
| 10  | **Dialog**       | `@workspace/ui/components/dialog`        | Modal windows, confirmations                    |
| 11  | **DropdownMenu** | `@workspace/ui/components/dropdown-menu` | Dropdown selection menus                        |
| 12  | **HoverCard**    | `@workspace/ui/components/hover-card`    | Preview cards on hover                          |
| 13  | **Input**        | `@workspace/ui/components/input`         | Single-line text input fields                   |
| 14  | **InputOTP**     | `@workspace/ui/components/input-otp`     | OTP/verification code input (6 slots)           |
| 15  | **Label**        | `@workspace/ui/components/label`         | Form input labels                               |
| 16  | **Pagination**   | `@workspace/ui/components/pagination`    | Data table page navigation                      |
| 17  | **Popover**      | `@workspace/ui/components/popover`       | Floating content panels                         |
| 18  | **ScrollArea**   | `@workspace/ui/components/scroll-area`   | Custom scrollable containers                    |
| 19  | **Select**       | `@workspace/ui/components/select`        | Native-style dropdown selects                   |
| 20  | **Separator**    | `@workspace/ui/components/separator`     | Visual content dividers                         |
| 21  | **Sheet**        | `@workspace/ui/components/sheet`         | Slide-out side panels                           |
| 22  | **Sidebar**      | `@workspace/ui/components/sidebar`       | Collapsible app sidebar                         |
| 23  | **Skeleton**     | `@workspace/ui/components/skeleton`      | Loading placeholder blocks                      |
| 24  | **Sonner**       | `@workspace/ui/components/sonner`        | Toast notification system                       |
| 25  | **Table**        | `@workspace/ui/components/table`         | Data table structure (thead, tbody, tr, th, td) |
| 26  | **Textarea**     | `@workspace/ui/components/textarea`      | Multi-line text input                           |
| 27  | **Tooltip**      | `@workspace/ui/components/tooltip`       | Hover tooltip hints                             |

### 3.2 Shared Business Components (`@workspace/ui/shared/`)

These are pre-built business components reused across 2+ portals:

| #   | Component           | Import Path                                              | Purpose                                                 |
| --- | ------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| 1   | **AuthCard**        | `@workspace/ui/shared/auth/auth-card`                    | Authentication card layout wrapper                      |
| 2   | **DataTable**       | `@workspace/ui/shared/data-table/data-table`             | Reusable data table with sorting, filtering, pagination |
| 3   | **HeaderLogo**      | `@workspace/ui/shared/header-logo/header-logo`           | Application logo in header/navbar                       |
| 4   | **HeaderSection**   | `@workspace/ui/shared/header-section/header-section`     | Page header with title, subtitle, and action buttons    |
| 5   | **LanguageSwitch**  | `@workspace/ui/shared/language-switch`                   | i18n language toggle switcher                           |
| 6   | **RouteBreadcrumb** | `@workspace/ui/shared/route-breadcrumb/route-breadcrumb` | Auto-generated breadcrumbs from route                   |
| 7   | **SidebarLayout**   | `@workspace/ui/shared/sidebar-layout/sidebar-layout`     | Full app shell with sidebar + content area              |
| 8   | **ThemeToggle**     | `@workspace/ui/shared/theme-toggle/theme-toggle`         | Dark/Light/System theme toggle                          |

### 3.3 Shared Hooks & Utilities

| #   | Export           | Import Path                           | Purpose                                               |
| --- | ---------------- | ------------------------------------- | ----------------------------------------------------- |
| 1   | **apiClient**    | `@workspace/ui/lib/api-client`        | Centralized HTTP client (use ONLY this for API calls) |
| 2   | **cn / utils**   | `@workspace/ui/lib/utils`             | Tailwind CSS class merging utility                    |
| 3   | **useMobile**    | `@workspace/ui/hooks/use-mobile`      | Responsive mobile breakpoint detection                |
| 4   | **ThemeContext** | `@workspace/ui/context/theme-context` | Application theme state management                    |
| 5   | **IApiResponse** | `@workspace/ui/types/api.types`       | Standard API response type interface                  |

### 3.4 Sub-Components of Shared Modules

#### SidebarLayout Sub-Components

| Component   | Import Path                                             |
| ----------- | ------------------------------------------------------- |
| **NavMain** | `@workspace/ui/shared/sidebar-layout/nav-main/nav-main` |

---

## 4. Portal Routing & API Prefixes

Portals must adhere to the route prefixes and backend API paths specified in this table:

| Portal       | Directory       | Route Path Prefix                           | API Endpoint Prefix  | Auth Context Path                     |
| :----------- | :-------------- | :------------------------------------------ | :------------------- | :------------------------------------ |
| **Admin**    | `apps/admin`    | `/` (e.g., `/dashboard`)                    | `/admin`             | `components/context/auth-context.tsx` |
| **Company**  | `apps/company`  | `/[orgHash]` (e.g., `/[orgHash]/dashboard`) | `/:orgHash`          | `components/context/auth-context.tsx` |
| **Consumer** | `apps/consumer` | `/[orgHash]` (e.g., `/[orgHash]/dashboard`) | `/:orgHash/consumer` | `components/context/auth-context.tsx` |

---

## 5. Folder Standards & Component Co-location Rules

- **Rule 5.1: The `lib/<feature>` Standard**
  Every feature module folder contains the network and validation layer structure:
  - **`index.ts`**: Pure async function triggers hitting API endpoints via `apiClient`. Never contains React state or rendering code.
  - **`validation.ts`**: Holds all Zod schemas (e.g. `createSchema`, `updateSchema`) enforcing validation. Form interfaces are inferred directly from these schemas.
  - **`types.ts`**: Houses TypeScript interface definitions describing API payloads, output data models, inputs, and pagination contracts.

- **Rule 5.2: The `components/context` Standard**
  Defines React Context providers containing the state variables and core orchestration logic for the module:
  - Must integrate the API triggers, types, and validation schemas directly from the `lib/<feature>` folder.
  - Holds state for fetching, mutations, active items, current page, filters, etc.
  - Extends clean React hook wrappers (e.g. `use<Feature>s()`) for consumers.

- **Rule 5.3: The `components/pages` Standard**
  Handles the physical layout architecture of standard modules:
  - **`index.tsx`**: Orchestrated layout assembly (Search input, action buttons, table states). Subscribes to context hook values and is used inside the app layout and page routers.
  - **`_components/`**: Houses files that are strictly local to the parent page view.
    - Components inside `_components/` cannot be imported outside this specific page directory.
    - Include files like `<feature>-form-dialog.tsx`, `page-skeleton.tsx` (for skeleton layouts), `page-empty.tsx`, etc.
    - **Single Form Rule**: Dynamic form components (e.g. `organization-form-dialog.tsx`) must serve both **Create** and **Edit** operations. Define conditional logic inside the form based on props (such as an optional `initialData` or `editId` object) to avoid duplicating layouts.

- **Rule 5.4: Shared Component Co-location Rules**
  - **Primitive Elements**: Pure library elements (e.g., Radix wrappers, base shadcn elements) must reside inside `packages/ui/src/components/`. NEVER duplicate these in portal directories.
  - **Shared UI Blocks**: Business layouts and elements used across 2+ portals must reside inside `packages/ui/src/shared/`. Before building any new component, CHECK if it should be shared.
  - **Feature UI Blocks**: Elements used only on a single feature page (e.g., a specific table row, item card, or dialog) must be saved inside `apps/<portal>/components/pages/<feature>-page/_components/`.

---

## 6. State & Context Standards

- **Rule 6.1: Simple Pages** — Fetch data directly within components using the `apiClient` instance. Do NOT construct a React context for single-fetch pages.

- **Rule 6.2: Complex Pages** — Pages containing list pagination, search queries, or CRUD operations MUST use a context provider in `components/context/<feature>-context.tsx`.

- **Rule 6.3: Standard State Keys** — All feature contexts must implement and export these standard properties:

| State Key       | Type      | Purpose                                    |
| --------------- | --------- | ------------------------------------------ |
| `items`         | `T[]`     | Data payload array                         |
| `fetchLoading`  | `boolean` | Loading flag for GET/list operations       |
| `actionLoading` | `boolean` | Loading flag for POST/PATCH/DELETE actions |
| `page`          | `number`  | Current page index (starts at 1)           |
| `limit`         | `number`  | Items per page                             |
| `total`         | `number`  | Total item count                           |
| `totalPages`    | `number`  | Calculated total pages                     |
| `search`        | `string`  | Search query string                        |

---

## 7. API Client & Request Rules

- **Rule 7.1: Single Request Tool** — ALL HTTP calls MUST use `apiClient` from `@workspace/ui/lib/api-client`. Never use raw `fetch`, `axios`, or any other HTTP library.

- **Rule 7.2: Direct Integration** — Do NOT write intermediate service class adapters or wrapper classes. Trigger API functions directly in components or contexts.

- **Rule 7.3: Parameter Cleaning** — Empty values (`""`, `null`, `undefined`) are automatically stripped from request parameters by `apiClient`. No manual cleanup needed.

- **Rule 7.4: Response Structure** — All API responses follow the standardized `IApiResponse<T>` interface:

  ```typescript
  export interface IApiResponse<T> {
    success: boolean;
    data: T;
    meta?: IApiPaginationMeta;
    message?: string;
    statusCode: number;
  }
  ```

- **Rule 7.5: Cookie-Based JWT Security**
  - The backend (`ResponseInterceptor`) automatically handles token management.
  - Access and Refresh tokens are stripped from the response payload, and stored as Secure, HTTP-Only cookies (`accessToken` and `refreshToken`).
  - **Rule**: The frontend **must never** manually store, read, or pass JWT tokens in localStorage, sessionStorage, or custom header wrappers.
  - **Rule**: Ensure the `apiClient` executes with `{ credentials: "include" }` so that session cookies are forwarded automatically.

- **Rule 7.6: Backend Interceptor Pagination Convention**
  - For queries returning lists, the backend interceptor extracts the list arrays and places them directly inside the top-level `data` payload parameter.
  - The pagination controls are flattened and placed inside the top-level `meta` parameter of type `IApiPaginationMeta`.
  - **Rule**: Page queries must trigger clients returning `Promise<IApiResponse<T[]>>` (direct array data) and consume the pagination stats using `response.meta` values.

---

## 8. UX & Loading States Rules

- **Rule 8.1: Fetch Skeletons** — Display a full page skeleton (`<PageSkeleton />`) during list operations, searching, and pagination by checking `fetchLoading === true`. Use the `Skeleton` component from `@workspace/ui/components/skeleton`.

- **Rule 8.2: Action Spinners** — Display `<Loader2 className="animate-spin" />` loader icons inside action/submit buttons during CRUD operations by checking `actionLoading === true`.

- **Rule 8.3: Data Visibility** — NEVER clear, hide, or reset the main data table or content list while a write operation (create/update/delete) is running. Existing data must remain visible.

- **Rule 8.4: Search Reset** — Any modification to the search query string MUST immediately reset the page index state to `1`.

- **Rule 8.5: Feedback Toasts** — Trigger `sonner` success/error notifications (`toast.success()` / `toast.error()`) upon completion of ALL write actions (create, update, delete).

---

## 9. Generic File Templates (AI Scaffolding Boilerplate)

Use these templates to construct features. Replace `<feature>` and `<Feature>` placeholders (e.g., `brand`, `Brand` or `organization`, `Organization`) with the target domain name.

### 9.1 Feature API Client (`lib/<feature>/index.ts`)

```typescript
import { apiClient } from "@workspace/ui/lib/api-client";
import type { IApiResponse } from "@workspace/ui/types/api.types";
import type {
  <Feature>,
  Create<Feature>Input,
  Update<Feature>Input
} from "./types";

// Returns direct array because backend interceptor extracts items array into `data`
export function get<Feature>s(params?: Record<string, any>): Promise<IApiResponse<<Feature>[]>> {
  return apiClient.get("/<portal-prefix>/<feature>s", params);
}

export function create<Feature>(data: Create<Feature>Input): Promise<IApiResponse<<Feature>>> {
  return apiClient.post("/<portal-prefix>/<feature>s", data);
}

export function update<Feature>(id: string, data: Update<Feature>Input): Promise<IApiResponse<<Feature>>> {
  return apiClient.patch("/<portal-prefix>/<feature>s/" + id, data);
}

export function delete<Feature>(id: string): Promise<IApiResponse<null>> {
  return apiClient.delete("/<portal-prefix>/<feature>s/" + id);
}
```

### 9.2 Feature Types (`lib/<feature>/types.ts`)

```typescript
export interface <Feature> {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Create<Feature>Input {
  name: string;
}

export interface Update<Feature>Input {
  name?: string;
}
```

### 9.3 Feature Validation (`lib/<feature>/validation.ts`)

```typescript
import { z } from "zod";

export const create<Feature>Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const update<Feature>Schema = create<Feature>Schema.partial();

export type Create<Feature>FormData = z.infer<typeof create<Feature>Schema>;
export type Update<Feature>FormData = z.infer<typeof update<Feature>Schema>;
```

### 9.4 Feature Context (`components/context/<feature>-context.tsx`)

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode
} from "react";
import { toast } from "sonner";
import * as api from "@/lib/<feature>";
import type { <Feature>, Create<Feature>Input, Update<Feature>Input } from "@/lib/<feature>/types";

interface <Feature>sContextType {
  items: <Feature>[];
  fetchLoading: boolean;
  actionLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  fetchItems: () => Promise<void>;
  createItem: (data: Create<Feature>Input) => Promise<boolean>;
  updateItem: (id: string, data: Update<Feature>Input) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  setSearch: (query: string) => void;
  setPage: (page: number) => void;
}

const <Feature>sContext = createContext<<Feature>sContextType | null>(null);

export function <Feature>sProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<<Feature>[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearchState] = useState("");

  const fetchItems = useCallback(async () => {
    setFetchLoading(true);
    try {
      const res = await api.get<Feature>s({ page, limit, search });
      if (res.success && res.data) {
        // Direct array payload as structured by response.interceptor
        setItems(res.data);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 0);
        }
      } else {
        toast.error(res.message || "Failed to load <feature>s");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setFetchLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const setSearch = useCallback((query: string) => {
    setSearchState(query);
    setPage(1);
  }, []);

  const createItem = async (data: Create<Feature>Input): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.create<Feature>(data);
      if (res.success) {
        toast.success("<Feature> created successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to create <feature>");
      return false;
    } catch {
      toast.error("Failed to execute action");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateItem = async (id: string, data: Update<Feature>Input): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.update<Feature>(id, data);
      if (res.success) {
        toast.success("<Feature> updated successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to update <feature>");
      return false;
    } catch {
      toast.error("Failed to execute action");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.delete<Feature>(id);
      if (res.success) {
        toast.success("<Feature> deleted successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to delete <feature>");
      return false;
    } catch {
      toast.error("Failed to execute action");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <<Feature>sContext.Provider
      value={{
        items,
        fetchLoading,
        actionLoading,
        page,
        limit,
        total,
        totalPages,
        search,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
        setSearch,
        setPage,
      }}
    >
      {children}
    </<Feature>sContext.Provider>
  );
}

export function use<Feature>s() {
  const context = useContext(<Feature>sContext);
  if (!context) throw new Error("use<Feature>s must be used within an <Feature>sProvider");
  return context;
}
```

### 9.5 Feature Routing Layout (`app/.../<feature>/layout.tsx`)

```tsx
import { <Feature>sProvider } from "@/components/context/<feature>-context";

export default function <Feature>sLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <<Feature>sProvider>{children}</<Feature>sProvider>;
}
```

### 9.6 Feature Routing Page (`app/.../<feature>/page.tsx`)

```tsx
import { <Feature>sPage } from "@/components/pages/<feature>-page";

export default function Page() {
  return <<Feature>sPage />;
}
```

### 9.7 Feature Component Entry (`components/pages/<feature>-page/index.tsx`)

```tsx
"use client";

import { useState } from "react";
import { use<Feature>s } from "@/components/context/<feature>-context";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { PageSkeleton } from "./_components/page-skeleton";
import { PageEmpty } from "./_components/page-empty";
import { DataTable } from "./_components/data-table";
import { CreateDialog } from "./_components/create-dialog";
import { Plus, Search } from "lucide-react";

export function <Feature>sPage() {
  const { items, fetchLoading, search, setSearch } = use<Feature>s();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold"><Feature>s</h1>
          <p className="text-sm text-muted-foreground">Manage your <feature>s</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add <Feature>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search <feature>s..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      {fetchLoading ? (
        <PageSkeleton />
      ) : items.length === 0 ? (
        <PageEmpty />
      ) : (
        <DataTable />
      )}

      <CreateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
```

---

## 10. Import Hierarchy & Sorting Rules

Imports in ALL files must strictly follow this grouping order with blank line separators:

```typescript
// 1. React/Next.js dependencies
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party packages (lucide-react, zod, sonner, etc.)
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// 3. Shared Workspace Packages (@workspace/ui)
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { apiClient } from "@workspace/ui/lib/api-client";
import { AuthCard } from "@workspace/ui/shared/auth/auth-card";

// 4. Portal-specific Modules (@/)
import { useAuth } from "@/components/context/auth-context";
import * as api from "@/lib/<feature>";

// 5. Local Components (./_components)
import { DataTable } from "./_components/data-table";
import { CreateDialog } from "./_components/create-dialog";
```

---

## 11. Developer PR Checklist

Before submitting a Pull Request, verify ALL of the following:

- [ ] **Lean Pages**: `page.tsx` files contain only imports and a single component render. No UI structure, state, or logic.
- [ ] **Shared Components**: Any component used across 2+ portals is refactored into `packages/ui/src/shared/`.
- [ ] **Primitive Usage**: No duplicate shadcn components in portal directories. All primitives imported from `@workspace/ui/components/`.
- [ ] **Layout Wrapping**: Feature context providers are properly injected via `layout.tsx` files.
- [ ] **API Client Only**: No raw `fetch`, `axios`, or other HTTP libraries used anywhere.
- [ ] **Zod Validation**: All form inputs have corresponding Zod schema validation configured.
- [ ] **Loading States**: `fetchLoading` triggers page skeletons; `actionLoading` triggers inline button spinners.
- [ ] **Data Persistence**: Table/list data remains visible during all CRUD operations.
- [ ] **Search Pagination**: Changing search query resets page index to `1`.
- [ ] **Toast Feedback**: All write actions (create/update/delete) trigger `sonner` success/error toasts.
- [ ] **Import Order**: Imports sorted per Section 10 hierarchy. No relative package pathways used for shared code.
- [ ] **Feature Co-location**: Feature-specific components correctly placed in `_components/` directory.
- [ ] **No Service Classes**: API calls triggered directly, no intermediate adapters or service wrappers.
- [ ] **Single Form Reuse**: A single form component (e.g. `organization-form-dialog.tsx`) is designed dynamically to handle both Edit and Create states to avoid duplication.
- [ ] **Cookie Auth Security**: JWT tokens are NOT stored in localStorage or parsed; the frontend relies entirely on automatic HTTP-Only cookie transportation.
- [ ] **Response Pagination Mapping**: List components fetch data expecting `response.data` to be a direct array of elements, while pagination details are extracted from `response.meta`.

---

**End of Frontend Developer Rule Book v3.1**
