# Warranty Management System - Frontend Developer Rule Book v4.0

---

## Table of Contents

1. Project Overview and Architecture
2. Monorepo Directory Structures
3. Available UI Components Catalog
4. Portal Routing and API Prefixes
5. Folder Standards and Component Co-location Rules
6. State and Context Standards
7. API Client and Request Rules
8. UX and Loading States Rules
9. Breadcrumb System
10. File Upload System
11. Generic File Templates - AI Scaffolding Boilerplate
12. Import Hierarchy and Sorting Rules
13. Developer PR Checklist

---

## 1. Project Overview and Architecture

Tech Stack: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + shadcn/ui

Workspaces: Monorepo with three portals (admin, company, consumer) sharing a unified library @workspace/ui

State Management: Scoped React Context Providers injected via route layout files

Validation: Zod schemas for all form inputs

Notifications: Sonner toast for all write operation feedback

Breadcrumbs: Dynamic breadcrumb system with path-to-name mapping via BreadcrumbProvider in @workspace/ui/context/breadcrumb-context

---

## 2. Monorepo Directory Structures

### 2.1 Workspace Structure

```
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
│       │   ├── components/     # shadcn/ui base primitives (27+ components)
│       │   ├── shared/         # Shared business components (10+ components)
│       │   ├── hooks/          # Shared hooks (use-mobile)
│       │   ├── lib/            # Shared clients (apiClient, utils with debounce)
│       │   ├── context/        # Shared contexts (theme-context, breadcrumb-context)
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

Every Next.js app in apps/portal/ must implement this structure:

```
apps/<portal>/
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── (protected)/
│   │   ├── layout.tsx              # Protected shell layout (with SidebarLayout)
│   │   └── dashboard/
│   │       └── <feature>/
│   │           ├── layout.tsx      # Feature layout wrapping its context + metadata
│   │           └── page.tsx        # Lean page wrapper (no UI logic)
│   │       └── <feature>/
│   │           └── [<entity>Id]/   # Detail page with dynamic segment
│   │               ├── layout.tsx  # Layout with metadata
│   │               └── page.tsx    # Detail page
│   └── auth/
│       ├── layout.tsx              # Auth shell layout (centered)
│       └── login/
│           └── page.tsx            # Renders login page component
├── components/
│   ├── pages/
│   │   └── <feature>-page/         # List page component
│   │       ├── index.tsx           # Entry file for page layout
│   │       └── _components/        # Private feature components
│   │           ├── page-skeleton.tsx
│   │           ├── page-empty.tsx
│   │           ├── <feature>-form-dialog.tsx  # Single form for create & edit
│   │           ├── delete-dialog.tsx
│   │           └── invite-dialog.tsx          # If applicable
│   │   └── <feature>-detail-page/  # Detail page component
│   │       ├── index.tsx
│   │       └── _components/
│   │           ├── page-skeleton.tsx
│   │           ├── <feature>-header.tsx
│   │           ├── <feature>-info.tsx
│   │           ├── <feature>-stats.tsx
│   │           └── <feature>-hierarchy.tsx    # If applicable
│   └── context/
│       └── <feature>-context.tsx   # Feature-specific context only
├── lib/
│   └── <feature>/                  # API integration, validation, types
│       ├── index.ts                # API client functions
│       ├── types.ts                # TypeScript interfaces
│       └── validation.ts           # Zod schemas
└── routes/
    └── index.ts                    # Sidebar items configuration
```

---

## 3. Available UI Components Catalog

CRITICAL: Always reference this catalog before building any UI. These components are already implemented and must be reused.

### 3.1 Common UI Primitives (@workspace/ui/components/)

1. Accordion - @workspace/ui/components/accordion
2. Avatar - @workspace/ui/components/avatar
3. Badge - @workspace/ui/components/badge
4. Breadcrumb - @workspace/ui/components/breadcrumb
5. Button - @workspace/ui/components/button
6. Calendar - @workspace/ui/components/calendar
7. Card - @workspace/ui/components/card
8. Chart - @workspace/ui/components/chart
9. Collapsible - @workspace/ui/components/collapsible
10. Command - @workspace/ui/components/command
11. ContextMenu - @workspace/ui/components/context-menu
12. Dialog - @workspace/ui/components/dialog
13. DropdownMenu - @workspace/ui/components/dropdown-menu
14. HoverCard - @workspace/ui/components/hover-card
15. Input - @workspace/ui/components/input
16. InputOTP - @workspace/ui/components/input-otp
17. Label - @workspace/ui/components/label
18. Pagination - @workspace/ui/components/pagination
19. Popover - @workspace/ui/components/popover
20. ScrollArea - @workspace/ui/components/scroll-area
21. Select - @workspace/ui/components/select
22. Separator - @workspace/ui/components/separator
23. Sheet - @workspace/ui/components/sheet
24. Sidebar - @workspace/ui/components/sidebar
25. Skeleton - @workspace/ui/components/skeleton
26. Sonner - @workspace/ui/components/sonner
27. Table - @workspace/ui/components/table
28. Textarea - @workspace/ui/components/textarea
29. Tooltip - @workspace/ui/components/tooltip

### 3.2 Shared Business Components (@workspace/ui/shared/)

1. AuthCard - @workspace/ui/shared/auth/auth-card
2. DataTable - @workspace/ui/shared/data-table/data-table
3. FileUpload - @workspace/ui/shared/file-upload
4. HeaderLogo - @workspace/ui/shared/header-logo/header-logo
5. HeaderSection - @workspace/ui/shared/header-section/header-section
6. LanguageSwitch - @workspace/ui/shared/language-switch
7. RouteBreadcrumb - @workspace/ui/shared/route-breadcrumb/route-breadcrumb
8. SidebarLayout - @workspace/ui/shared/sidebar-layout/sidebar-layout
9. ThemeToggle - @workspace/ui/shared/theme-toggle/theme-toggle

### 3.3 Shared Contexts (@workspace/ui/context/)

1. ThemeContext - @workspace/ui/context/theme-context
2. BreadcrumbContext - @workspace/ui/context/breadcrumb-context

### 3.4 Shared Hooks and Utilities

1. apiClient - @workspace/ui/lib/api-client
2. cn/utils - @workspace/ui/lib/utils (includes debounce helper)
3. useMobile - @workspace/ui/hooks/use-mobile
4. IApiResponse - @workspace/ui/types/api.types

### 3.5 SidebarLayout Sub-Components

1. NavMain - @workspace/ui/shared/sidebar-layout/nav-main/nav-main

---

## 4. Portal Routing and API Prefixes

| Portal   | Directory     | Route Path Prefix                       | API Endpoint Prefix | Auth Context Path                   |
| -------- | ------------- | --------------------------------------- | ------------------- | ----------------------------------- |
| Admin    | apps/admin    | / (e.g., /dashboard)                    | /admin              | components/context/auth-context.tsx |
| Company  | apps/company  | /[orgHash] (e.g., /[orgHash]/dashboard) | /:orgHash           | components/context/auth-context.tsx |
| Consumer | apps/consumer | /[orgHash] (e.g., /[orgHash]/dashboard) | /:orgHash/consumer  | components/context/auth-context.tsx |

---

## 5. Folder Standards and Component Co-location Rules

### Rule 5.1: The lib/feature Standard

Every feature module folder contains:

index.ts: Pure async functions hitting API endpoints via apiClient. Never contains React state or rendering code.

validation.ts: Holds all Zod schemas (createSchema, updateSchema) enforcing validation. Form interfaces are inferred directly from these schemas.

types.ts: TypeScript interface definitions for API payloads, output data models, inputs, and pagination contracts.

### Rule 5.2: The components/context Standard

React Context providers in components/context/feature-context.tsx containing state and orchestration logic:

Must integrate the API triggers, types, and validation schemas directly from the lib/feature folder.

Holds state for fetching, mutations, active items, current page, filters, etc.

Extends clean React hook wrappers (e.g. useFeatures()) for consumers.

Should include getItemById(id) to find items from already-fetched array without API call.

Should include getDetailById(id) to fetch full detail from API through context.

Standard state keys: items, fetchLoading, actionLoading, page, limit, total, totalPages, search.

Optional filter states: typeFilter, statusFilter.

### Rule 5.3: The components/pages Standard

List Page (components/pages/feature-page/):

- index.tsx: Orchestrated layout (Search, filters, table states, dialogs)
- \_components/: Private files (page-skeleton.tsx, page-empty.tsx, feature-form-dialog.tsx, delete-dialog.tsx, invite-dialog.tsx)

Detail Page (components/pages/feature-detail-page/):

- index.tsx: Detail page with header, info, stats, hierarchy sections
- \_components/: Private files (page-skeleton.tsx, feature-header.tsx, feature-info.tsx, feature-stats.tsx, feature-hierarchy.tsx)

Single Form Rule: Dynamic form components must serve both Create and Edit operations. Use conditional logic based on props (editData or initialData) to avoid duplication.

Components inside \_components/ cannot be imported outside that specific page directory.

### Rule 5.4: Shared Component Co-location Rules

Primitive Elements: Pure library elements (Radix wrappers, base shadcn) must reside inside packages/ui/src/components/. NEVER duplicate in portal directories.

Shared UI Blocks: Business components used across 2+ portals must reside inside packages/ui/src/shared/. Check before building new components.

Feature UI Blocks: Elements used only on a single feature page must be saved inside apps/portal/components/pages/feature-page/\_components/.

Shared Contexts: Contexts used across portals (theme, breadcrumb) must reside inside packages/ui/src/context/.

---

## 6. State and Context Standards

### Rule 6.1: Simple Pages

Fetch data directly within components using the apiClient instance. Do NOT construct a React context for single-fetch pages.

### Rule 6.2: Complex Pages

Pages with list pagination, search queries, or CRUD operations MUST use a context provider in components/context/feature-context.tsx.

### Rule 6.3: Standard State Keys

| State Key     | Type    | Purpose                                    |
| ------------- | ------- | ------------------------------------------ |
| items         | T[]     | Data payload array                         |
| fetchLoading  | boolean | Loading flag for GET/list operations       |
| actionLoading | boolean | Loading flag for POST/PATCH/DELETE actions |
| page          | number  | Current page index (starts at 1)           |
| limit         | number  | Items per page                             |
| total         | number  | Total item count                           |
| totalPages    | number  | Calculated total pages                     |
| search        | string  | Search query string                        |

### Rule 6.4: Additional Context Methods

getItemById(id): Finds item from already-fetched items array without API call. Used for quick lookups.

getDetailById(id): Fetches full entity detail from API through context. Returns detail or null on failure.

### Rule 6.5: Filter States (Optional)

| State Key    | Type   | Purpose             |
| ------------ | ------ | ------------------- |
| typeFilter   | string | Type filter value   |
| statusFilter | string | Status filter value |

### Rule 6.6: Debounce Pattern

Search/filter changes must use debounce from @workspace/ui/lib/utils to avoid excessive API calls. Default delay: 300ms.

```
import { debounce } from "@workspace/ui/lib/utils";

const debouncedFetchRef = useRef(
  debounce(async (params) => {
    // fetch logic here
  }, 300)
);
```

---

## 7. API Client and Request Rules

### Rule 7.1: Single Request Tool

ALL HTTP calls MUST use apiClient from @workspace/ui/lib/api-client. Never use raw fetch, axios, or any other HTTP library.

### Rule 7.2: Direct Integration

Do NOT write intermediate service class adapters or wrapper classes. Trigger API functions directly in components or contexts.

### Rule 7.3: Parameter Cleaning

Empty values ("", null, undefined) are automatically stripped from request parameters by apiClient.

### Rule 7.4: Response Structure

All API responses follow the standardized IApiResponse interface:

```
IApiResponse<T> {
  success: boolean;
  data: T;
  meta?: IApiPaginationMeta;
  message?: string;
  statusCode: number;
}
```

### Rule 7.5: Cookie-Based JWT Security

The backend ResponseInterceptor automatically handles token management.

Access and Refresh tokens are stored as Secure, HTTP-Only cookies (accessToken and refreshToken).

Rule: Frontend must never manually store, read, or pass JWT tokens in localStorage, sessionStorage, or custom headers.

Rule: apiClient executes with { credentials: "include" } for automatic cookie forwarding.

### Rule 7.6: Backend Interceptor Pagination Convention

List queries return items array directly in data payload.

Pagination controls are in meta parameter.

Rule: Page queries return Promise<IApiResponse<T[]>> and consume pagination stats from response.meta.

---

## 8. UX and Loading States Rules

### Rule 8.1: Fetch Skeletons

Display PageSkeleton during list operations, searching, and pagination when fetchLoading === true. Use Skeleton from @workspace/ui/components/skeleton.

### Rule 8.2: Action Spinners

Display Loader2 with animate-spin class inside action/submit buttons when actionLoading === true.

### Rule 8.3: Data Visibility

NEVER clear, hide, or reset the main data table or content list while a write operation is running. Existing data must remain visible.

### Rule 8.4: Search Reset

Any modification to the search query string MUST immediately reset the page index state to 1.

### Rule 8.5: Filter Reset

Any modification to typeFilter or statusFilter MUST immediately reset the page index state to 1.

### Rule 8.6: Limit Change Reset

Any modification to limit MUST immediately reset the page index state to 1.

### Rule 8.7: Feedback Toasts

Trigger sonner success/error notifications (toast.success() / toast.error()) upon completion of ALL write actions (create, update, delete).

---

## 9. Breadcrumb System

### Rule 9.1: Breadcrumb Provider Location

The BreadcrumbProvider is defined in packages/ui/src/context/breadcrumb-context.tsx and wraps the entire application in the RootProvider.

### Rule 9.2: Breadcrumb Context API

```
import { useBreadcrumb } from "@workspace/ui/context/breadcrumb-context";

useBreadcrumb() returns:
- pathMap: Record<string, string> - Current path-to-name mappings
- setPathName(path: string, name: string): void - Set a label for a path
- removePathName(path: string): void - Remove a label when navigating away
```

### Rule 9.3: Setting Breadcrumb Labels in Detail Pages

When a detail page loads data, it MUST call setPathName with the full URL path and entity name:

```
const { setPathName, removePathName } = useBreadcrumb();

useEffect(() => {
  // After data loads
  setPathName(`/dashboard/organizations/${organizationId}`, organization.name);

  return () => {
    removePathName(`/dashboard/organizations/${organizationId}`);
  };
}, [organizationId]);
```

### Rule 9.4: Breadcrumb Resolution Order

The RouteBreadcrumb component resolves labels in this priority:

1. Check breadcrumb pathMap (set by detail pages via setPathName)
2. Check SEGMENT_LABELS overrides (static mapping for known paths)
3. If UUID segment, use parent segment label
4. Default: capitalize and replace hyphens

### Rule 9.5: Standard Segment Labels

```
const SEGMENT_LABELS = {
  dashboard: "Dashboard",
  organizations: "Organizations",
  features: "Features",
  brands: "Brands",
  categories: "Categories",
  users: "Users",
  "dealer-types": "Dealer Types",
  settings: "Settings",
  profile: "Profile",
};
```

---

## 10. File Upload System

### Rule 10.1: File Upload Lib Location

Each portal has lib/file-upload/ with:

- index.ts: uploadFile, uploadFiles, uploadFileWithValidation, uploadImage
- types.ts: UploadedFile, SingleFileUploadResponse, MultipleFilesUploadResponse
- validation.ts: fileSchema, imageSchema, validateFile, validateImage

### Rule 10.2: File Upload Component Location

The shared FileUpload component is at @workspace/ui/shared/file-upload.

### Rule 10.3: File Upload Component Features

- Single file upload (default) or multiple file upload (multiple prop)
- Dropzone variant (default) or button variant
- Drag and drop support
- Image preview for image files
- File type icon for non-image files
- Size validation with error message
- Custom accept types and max size
- Remove button with callback

### Rule 10.4: File Upload Props

```
interface FileUploadProps {
  onUpload: (file: File) => Promise<UploadedFileInfo | null>;
  onRemove?: (file: UploadedFileInfo) => void;
  value?: UploadedFileInfo | null | UploadedFileInfo[];
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
  variant?: "dropzone" | "button";
  dropzoneText?: string;
  dropzoneSubText?: string;
  supportedFormats?: string;
  showSizeHint?: boolean;
}
```

### Rule 10.5: Upload Flow

1. User selects or drops file
2. Component validates size against maxSize
3. Component calls onUpload(file) prop
4. Parent handler calls uploadFileWithValidation(file, { folder }) from lib/file-upload
5. API uploads file and returns publicUrl
6. Parent sets the URL in form state via setLogo(publicUrl)

### Rule 10.6: Logo Handling in Forms

When editing existing data with a logo, create a placeholder UploadedFileInfo:

```
setLogoFile({
  key: "",
  url: editData.logo,
  publicUrl: editData.logo,
  fileName: "",
  originalName: "",
  mimeType: "image/*",
  size: 0,
});
```

When removing a logo, call setLogo("") and setLogoFile(null).

---

Here's the corrected Section 11 with proper template placeholders and formatting:

---

## 11. Generic File Templates (AI Scaffolding Boilerplate)

Use these templates to construct features. Replace `<feature>` and `<Feature>` placeholders with the target domain name (e.g., `brand`, `Brand` or `organization`, `Organization`).

### 11.1 Feature API Client (`lib/<feature>/index.ts`)

```typescript
import { apiClient } from "@workspace/ui/lib/api-client";
import type { IApiResponse } from "@workspace/ui/types/api.types";
import type {
  <Feature>,
  <Feature>Detail,
  Create<Feature>Input,
  Update<Feature>Input,
} from "./types";

// List with pagination and filters
export function get<Feature>s(
  filters?: Record<string, string | number | boolean | undefined>
): Promise<IApiResponse<<Feature>[]>> {
  return apiClient.get("/<portal-prefix>/<feature>s", filters);
}

// Get single detail
export function get<Feature>(
  id: string
): Promise<IApiResponse<<Feature>Detail>> {
  return apiClient.get(`/<portal-prefix>/<feature>s/${id}`);
}

// Create
export function create<Feature>(
  data: Create<Feature>Input
): Promise<IApiResponse<<Feature>>> {
  return apiClient.post("/<portal-prefix>/<feature>s", data);
}

// Update
export function update<Feature>(
  id: string,
  data: Update<Feature>Input
): Promise<IApiResponse<<Feature>>> {
  return apiClient.patch(`/<portal-prefix>/<feature>s/${id}`, data);
}

// Delete or status change
export function delete<Feature>(
  id: string
): Promise<IApiResponse<null>> {
  return apiClient.delete(`/<portal-prefix>/<feature>s/${id}`);
}
```

### 11.2 Feature Types (`lib/<feature>/types.ts`)

```typescript
export interface <Feature> {
  id: string;
  name: string;
  // Add feature-specific fields here
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface <Feature>Detail extends <Feature> {
  // Add detail-specific fields here (stats, relations, etc.)
}

export interface Create<Feature>Input {
  name: string;
  // Add required create fields here
}

export interface Update<Feature>Input {
  name?: string;
  // Add optional update fields here
}
```

### 11.3 Feature Validation (`lib/<feature>/validation.ts`)

```typescript
import { z } from "zod";

export const create<Feature>Schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  // Add more validation fields here
});

export const update<Feature>Schema = create<Feature>Schema.partial();

export type Create<Feature>FormData = z.infer<typeof create<Feature>Schema>;
export type Update<Feature>FormData = z.infer<typeof update<Feature>Schema>;
```

### 11.4 Feature Context (`components/context/<feature>-context.tsx`)

```typescript
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { toast } from "sonner";

import { debounce } from "@workspace/ui/lib/utils";

import * as api from "@/lib/<feature>";
import type {
  <Feature>,
  <Feature>Detail,
  Create<Feature>Input,
  Update<Feature>Input,
} from "@/lib/<feature>/types";

interface <Feature>sContextType {
  items: <Feature>[];
  fetchLoading: boolean;
  actionLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  fetchItems: () => void;
  getItemById: (id: string) => <Feature> | undefined;
  getDetailById: (id: string) => Promise<<Feature>Detail | null>;
  createItem: (data: Create<Feature>Input) => Promise<boolean>;
  updateItem: (id: string, data: Update<Feature>Input) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  setSearch: (query: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const <Feature>sContext = createContext<<Feature>sContextType | null>(null);

export function <Feature>sProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<<Feature>[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearchState] = useState("");

  const debouncedFetchRef = useRef(
    debounce(
      async (params: {
        page: number;
        limit: number;
        search: string;
      }) => {
        setFetchLoading(true);
        try {
          const filters: Record<
            string,
            string | number | boolean | undefined
          > = {
            page: params.page,
            limit: params.limit,
          };

          if (params.search) filters.search = params.search;

          const res = await api.get<Feature>s(filters);

          if (res.success && res.data) {
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
      },
      300
    )
  );

  const fetchItems = useCallback(() => {
    debouncedFetchRef.current({ page, limit, search });
  }, [page, limit, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getItemById = useCallback(
    (id: string): <Feature> | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  const getDetailById = useCallback(
    async (id: string): Promise<<Feature>Detail | null> => {
      try {
        const res = await api.get<Feature>(id);
        if (res.success && res.data) {
          return res.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const setSearch = useCallback((query: string) => {
    setSearchState(query);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
  }, []);

  const createItem = async (
    data: Create<Feature>Input
  ): Promise<boolean> => {
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

  const updateItem = async (
    id: string,
    data: Update<Feature>Input
  ): Promise<boolean> => {
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
        getItemById,
        getDetailById,
        createItem,
        updateItem,
        deleteItem,
        setSearch,
        setPage,
        setLimit,
      }}
    >
      {children}
    </<Feature>sContext.Provider>
  );
}

export function use<Feature>s() {
  const context = useContext(<Feature>sContext);
  if (!context)
    throw new Error(
      "use<Feature>s must be used within an <Feature>sProvider"
    );
  return context;
}
```

### 11.5 Feature Routing Layout (`app/(protected)/dashboard/<feature>/layout.tsx`)

```typescript
import type { Metadata } from "next";

import { <Feature>sProvider } from "@/components/context/<feature>-context";

export const metadata: Metadata = {
  title: "<Feature>s",
  description: "Manage <feature>s description here",
};

export default function <Feature>sLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <<Feature>sProvider>{children}</<Feature>sProvider>;
}
```

### 11.6 Feature Routing Page (`app/(protected)/dashboard/<feature>/page.tsx`)

```typescript
import { <Feature>sPage } from "@/components/pages/<feature>-page";

export default function Page() {
  return <<Feature>sPage />;
}
```

### 11.7 Feature List Page Component (`components/pages/<feature>-page/index.tsx`)

```typescript
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { DataTable } from "@workspace/ui/shared/data-table/data-table";

import { use<Feature>s } from "@/components/context/<feature>-context";
import type { <Feature> } from "@/lib/<feature>/types";

import { PageSkeleton } from "./_components/page-skeleton";
import { PageEmpty } from "./_components/page-empty";
import { <Feature>FormDialog } from "./_components/<feature>-form-dialog";
import { DeleteDialog } from "./_components/delete-dialog";

export function <Feature>sPage() {
  const router = useRouter();
  const {
    items,
    fetchLoading,
    search,
    page,
    totalPages,
    total,
    limit,
    setSearch,
    setPage,
    setLimit,
    deleteItem,
  } = use<Feature>s();

  const [createOpen, setCreateOpen] = useState(false);
  const [editData, setEditData] = useState<<Feature> | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<<Feature> | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleRowClick = useCallback(
    (item: <Feature>) => {
      router.push(`/dashboard/<feature>s/${item.id}`);
    },
    [router]
  );

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (item: <Feature>) => (
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (item: <Feature>) =>
        item.isActive ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: <Feature>) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setEditData(item);
                setEditOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setDeleteData(item);
                setDeleteOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold"><Feature>s</h1>
          <p className="text-sm text-muted-foreground">
            Manage your <feature>s
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add <Feature>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search <feature>s..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {fetchLoading && items.length === 0 ? (
        <PageSkeleton />
      ) : items.length === 0 && !search ? (
        <PageEmpty onCreateNew={() => setCreateOpen(true)} />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={fetchLoading}
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onRowClick={handleRowClick}
        />
      )}

      <<Feature>FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <<Feature>FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editData={editData}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        item={deleteData}
        onDelete={deleteItem}
      />
    </div>
  );
}
```

### 11.8 Feature Detail Page Component (`components/pages/<feature>-detail-page/index.tsx`)

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { useBreadcrumb } from "@workspace/ui/context/breadcrumb-context";

import { use<Feature>s } from "@/components/context/<feature>-context";
import type { <Feature>Detail } from "@/lib/<feature>/types";

import { PageSkeleton } from "./_components/page-skeleton";
import { <Feature>Header } from "./_components/<feature>-header";
import { <Feature>Info } from "./_components/<feature>-info";
import { <Feature>Stats } from "./_components/<feature>-stats";

interface <Feature>DetailPageProps {
  <feature>Id: string;
}

export function <Feature>DetailPage({
  <feature>Id,
}: <Feature>DetailPageProps) {
  const router = useRouter();
  const { getDetailById } = use<Feature>s();
  const { setPathName, removePathName } = useBreadcrumb();
  const [data, setData] = useState<<Feature>Detail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getDetailById(<feature>Id);
      if (result) {
        setData(result);
        setPathName(
          `/dashboard/<feature>s/${<feature>Id}`,
          result.name
        );
      }
      setLoading(false);
    };

    fetchData();

    return () => {
      removePathName(`/dashboard/<feature>s/${<feature>Id}`);
    };
  }, [<feature>Id, getDetailById, setPathName, removePathName]);

  if (loading || !data) return <PageSkeleton />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/<feature>s")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      </div>

      <<Feature>Header data={data} />
      <<Feature>Info data={data} />
      <<Feature>Stats data={data} />
    </div>
  );
}
```

### 11.9 Detail Page Layout (`app/(protected)/dashboard/<feature>/[<feature>Id]/layout.tsx`)

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "<Feature> Details",
  description: "View <feature> details and information",
};

export default function <Feature>DetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

### 11.10 Detail Page Route (`app/(protected)/dashboard/<feature>/[<feature>Id]/page.tsx`)

```typescript
import { <Feature>DetailPage } from "@/components/pages/<feature>-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ <feature>Id: string }>;
}) {
  const { <feature>Id } = await params;

  return <<Feature>DetailPage <feature>Id={<feature>Id} />;
}
```

---

## 12. Import Hierarchy and Sorting Rules

Imports in ALL files must strictly follow this grouping order with blank line separators between each group:

### Group 1: React/Next.js dependencies

```typescript
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
```

### Group 2: Third-party packages (lucide-react, zod, sonner, etc.)

```typescript
import {
  Plus,
  Loader2,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
```

### Group 3: Shared Workspace Packages (@workspace/ui) - Components first, then shared, then context, then lib

```typescript
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Textarea } from "@workspace/ui/components/textarea";

import { DataTable } from "@workspace/ui/shared/data-table/data-table";
import { FileUpload } from "@workspace/ui/shared/file-upload";
import type { UploadedFileInfo } from "@workspace/ui/shared/file-upload";

import { useBreadcrumb } from "@workspace/ui/context/breadcrumb-context";

import { apiClient } from "@workspace/ui/lib/api-client";
import { cn } from "@workspace/ui/lib/utils";
import { debounce } from "@workspace/ui/lib/utils";
import type { IApiResponse } from "@workspace/ui/types/api.types";
```

### Group 4: Portal-specific Modules (@/) - Contexts first, then lib APIs, then types

```typescript
import { useOrganizations } from "@/components/context/organization-context";
import { useFeatures } from "@/components/context/feature-context";

import * as api from "@/lib/organization";
import * as fileApi from "@/lib/file-upload";
import { uploadFileWithValidation } from "@/lib/file-upload";

import type {
  Organization,
  OrganizationDetail,
  OrganizationType,
} from "@/lib/organization/types";
import type { Feature, FeatureStatus } from "@/lib/feature/types";
```

### Group 5: Local Components (./\_components)

```typescript
import { PageSkeleton } from "./_components/page-skeleton";
import { PageEmpty } from "./_components/page-empty";
import { OrganizationFormDialog } from "./_components/organization-form-dialog";
import { DeleteDialog } from "./_components/delete-dialog";
import { InviteSuperAdminDialog } from "./_components/invite-super-admin-dialog";
```

### Rules Summary

1. Each group MUST be separated by exactly one blank line
2. Within each group, imports should be alphabetically sorted
3. Type imports use `import type` syntax and come after regular imports within their group
4. Never use relative paths for shared code outside the current directory
5. Local imports (./\_components) always come last

---

## 13. Developer PR Checklist

Before submitting a Pull Request, verify ALL of the following:

### Pages and Routing

- [ ] Lean Pages: page.tsx files contain only imports and a single component render. No UI structure, state, or logic.
- [ ] Layout Wrapping: Feature context providers are properly injected via layout.tsx files.
- [ ] Layout Metadata: All layout.tsx files include proper Metadata export with title and description using template pattern from parent layout.
- [ ] Detail Routes: Detail pages use [entityId] dynamic segments and extract params via Promise.

### Components

- [ ] Shared Components: Any component used across 2+ portals is refactored into packages/ui/src/shared/.
- [ ] Primitive Usage: No duplicate shadcn components in portal directories. All primitives imported from @workspace/ui/components/.
- [ ] Feature Co-location: Feature-specific components correctly placed in \_components/ directory. Cannot be imported outside that directory.
- [ ] Single Form Reuse: A single form component handles both Edit and Create states via props (editData/initialData).

### State and Context

- [ ] Context Location: Feature contexts in components/context/, shared contexts (theme, breadcrumb) in packages/ui/src/context/.
- [ ] Context Methods: Context includes getItemById() for array lookup and getDetailById() for API fetch.
- [ ] Standard State Keys: items, fetchLoading, actionLoading, page, limit, total, totalPages, search present.
- [ ] Debounce Pattern: Search and filter changes use debounce from @workspace/ui/lib/utils with 300ms delay.

### API and Data

- [ ] API Client Only: No raw fetch, axios, or other HTTP libraries used anywhere.
- [ ] No Service Classes: API calls triggered directly from context or components, no intermediate adapters.
- [ ] Response Pagination Mapping: List components expect response.data as direct array, pagination from response.meta.
- [ ] Cookie Auth Security: JWT tokens are NOT stored in localStorage; frontend relies on HTTP-Only cookie transportation.

### Forms and Validation

- [ ] Zod Validation: All form inputs have corresponding Zod schema validation configured.
- [ ] Error Display: Form validation errors shown inline below each field using text-destructive styling.

### UX and Loading

- [ ] Loading States: fetchLoading triggers page skeletons via Skeleton component; actionLoading triggers Loader2 spinner in buttons.
- [ ] Data Persistence: Table/list data remains visible during all CRUD operations. Never clear data during writes.
- [ ] Search Pagination: Changing search query resets page index to 1.
- [ ] Filter Reset: Changing typeFilter, statusFilter, or any filter resets page index to 1.
- [ ] Limit Reset: Changing limit resets page index to 1.
- [ ] Toast Feedback: All write actions (create/update/delete) trigger sonner success/error toasts.

### Breadcrumbs

- [ ] Breadcrumb Provider: BreadcrumbProvider wraps app in RootProvider (from packages/ui/src/context/).
- [ ] Detail Page Labels: Detail pages call setPathName() when data loads to replace UUID with entity name.
- [ ] Cleanup: Detail pages call removePathName() in useEffect cleanup to prevent stale labels.

### Code Quality

- [ ] Import Order: Imports sorted per Section 12 hierarchy with blank line separators between groups.
- [ ] Color Standards: Use only shadcn/Tailwind CSS variables (text-primary, text-muted-foreground, bg-muted, bg-card, etc.), no hardcoded hex colors.
- [ ] Type Safety: No use of `any` type unless absolutely necessary. Proper TypeScript interfaces for all data.
- [ ] Event Propagation: Dropdown menu actions call e.stopPropagation() to prevent row click conflicts.

### File Structure

- [ ] lib/feature/ contains: index.ts, types.ts, validation.ts
- [ ] components/context/ contains: feature-context.tsx
- [ ] components/pages/feature-page/ contains: index.tsx and \_components/ folder
- [ ] app/(protected)/dashboard/feature/ contains: layout.tsx and page.tsx

---

**End of Frontend Developer Rule Book v4.0**
