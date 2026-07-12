# WMS Frontend Developer Rule Book v1.0

---

## 1. Project Structure

```
warranty-management/
├── apps/
│   ├── admin/              # Admin Portal (Next.js)
│   ├── company/            # Company Portal (Next.js)
│   └── consumer/           # Consumer Portal (Next.js)
├── packages/
│   └── ui/                 # Shared UI Package
│       └── src/
│           ├── components/     # shadcn/ui components
│           ├── shared/         # Shared business components (2+ portals)
│           ├── hooks/          # Shared hooks
│           ├── lib/            # API client + utils
│           ├── types/          # Shared types (cross-portal only)
│           ├── styles/         # Global CSS
│           ├── context/        # Shared contexts (theme)
│           └── i18n/           # Internationalization
└── docs/
```

---

## 2. Portal Route Architecture

| Portal   | Route Pattern        | Example                                            |
| -------- | -------------------- | -------------------------------------------------- |
| Admin    | `/<route>`           | `/login`, `/dashboard`, `/dashboard/organizations` |
| Company  | `/[orgHash]/<route>` | `/[orgHash]/login`, `/[orgHash]/dashboard`         |
| Consumer | `/[orgHash]/<route>` | `/[orgHash]/login`, `/[orgHash]/dashboard`         |

---

## 3. Portal-Specific Structure

```
apps/<portal>/
├── app/
│   ├── (protected)/
│   │   ├── layout.tsx              # Protected shell (sidebar)
│   │   └── dashboard/
│   │       ├── layout.tsx          # Wraps DashboardProvider
│   │       ├── page.tsx
│   │       └── organizations/
│   │           ├── layout.tsx      # Wraps OrganizationsProvider
│   │           └── page.tsx
│   ├── auth/
│   │   ├── layout.tsx              # Auth shell (centered, no sidebar)
│   │   └── login/
│   │       └── page.tsx
│   └── layout.tsx                  # Root (AuthProvider + Toaster)
├── components/
│   └── pages/
│       └── <feature>-page/
│           ├── index.tsx
│           └── _components/
├── context/
│   ├── auth-context.tsx
│   ├── organizations-context.tsx
│   └── ...
├── types/
│   └── index.ts
├── routes/
│   └── index.ts
```

---

## 4. Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── AuthProvider
├── Toaster
│
├── Auth Layout (app/auth/layout.tsx)
│   └── Centered content, no sidebar
│       └── Login Page
│
└── Protected Layout (app/(protected)/layout.tsx)
    └── SidebarLayout
        │
        ├── Dashboard Layout (app/(protected)/dashboard/layout.tsx)
        │   └── DashboardProvider
        │       └── Dashboard Page
        │
        └── Organizations Layout (app/(protected)/dashboard/organizations/layout.tsx)
            └── OrganizationsProvider
                └── Organizations Page
```

---

## 5. Layout Rules

| Layout Level    | File                                             | Responsibility                       |
| --------------- | ------------------------------------------------ | ------------------------------------ |
| Root            | `app/layout.tsx`                                 | AuthProvider + Toaster (global)      |
| Auth Shell      | `app/auth/layout.tsx`                            | Centered layout, no sidebar          |
| Protected Shell | `app/(protected)/layout.tsx`                     | SidebarLayout with navigation        |
| Feature         | `app/(protected)/dashboard/<feature>/layout.tsx` | Wraps page with its context provider |

**Rule:** Each feature page that needs a context gets its own `layout.tsx` that wraps the context provider. The `page.tsx` only renders the page component.

---

## 6. Route & Layout Pattern

### Simple Page (no context)

```
dashboard/
├── page.tsx              # Renders DashboardPage directly
```

### Complex Page (needs context)

```
dashboard/organizations/
├── layout.tsx            # Wraps OrganizationsProvider
└── page.tsx              # Renders OrganizationsPage
```

### layout.tsx (wraps context)

```tsx
import { OrganizationsProvider } from "@/context/organizations-context";

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrganizationsProvider>{children}</OrganizationsProvider>;
}
```

### page.tsx (renders component)

```tsx
import { OrganizationsPage } from "@/components/pages/organizations-page";

export default function Organizations() {
  return <OrganizationsPage />;
}
```

---

## 7. Component Location Rules

| Component Type      | Location                                                     | Example                                                         |
| ------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| shadcn/ui           | `packages/ui/src/components/`                                | Button, Card, Table, Input, Dialog, Badge, Skeleton, Pagination |
| Shared (2+ portals) | `packages/ui/src/shared/`                                    | AuthCard, SearchBar, SidebarLayout                              |
| Feature-specific    | `apps/<portal>/components/pages/<feature>-page/_components/` | PageSkeleton, PageEmpty, DataTable, CreateDialog                |

---

## 8. `_components` Structure

```
components/pages/<feature>-page/
├── index.tsx                # Composes _components + shared components
└── _components/             # Feature-specific UI only
    ├── page-skeleton.tsx
    ├── page-empty.tsx
    ├── data-table.tsx
    ├── create-dialog.tsx
    ├── edit-dialog.tsx
    └── delete-dialog.tsx
```

---

## 9. Context Decision Rule

| Page Complexity                       | Approach                                                         |
| ------------------------------------- | ---------------------------------------------------------------- |
| Simple (1 GET call, no CRUD)          | `apiClient` directly in page component, no layout wrapper needed |
| Complex (CRUD + pagination + filters) | Separate context, wrapped in feature `layout.tsx`                |

---

## 10. API Layer Rules

- **Use `apiClient` from `@workspace/ui/lib/api-client` directly**
- **No wrapper API service files**
- **No `fetch()` or axios** - only `apiClient`
- Query params: `undefined`, `null`, `""` are auto-stripped

---

## 11. Loading State Rules

| Load Type     | State Variable  | UI Behavior                                                |
| ------------- | --------------- | ---------------------------------------------------------- |
| List Fetch    | `fetchLoading`  | Full page skeleton on initial load, page change, or search |
| Action (CRUD) | `actionLoading` | Button spinner only, table data remains visible            |

**Critical Rule:** During create/update/delete, table data **must remain visible**. Only the action button shows loading.

---

## 12. Context State Standard

| State           | Type      | Purpose                |
| --------------- | --------- | ---------------------- |
| `items`         | `T[]`     | List data              |
| `fetchLoading`  | `boolean` | Page skeleton trigger  |
| `actionLoading` | `boolean` | Button spinner trigger |
| `page`          | `number`  | Current page           |
| `limit`         | `number`  | Items per page         |
| `total`         | `number`  | Total items            |
| `totalPages`    | `number`  | Total pages            |
| `search`        | `string`  | Search query           |

| Function               | API Call | Loading Used    | On Success                   |
| ---------------------- | -------- | --------------- | ---------------------------- |
| `fetchItems()`         | GET list | `fetchLoading`  | Update state                 |
| `createItem(data)`     | POST     | `actionLoading` | Toast + silent refresh       |
| `updateItem(id, data)` | PATCH    | `actionLoading` | Toast + silent refresh       |
| `deleteItem(id)`       | DELETE   | `actionLoading` | Toast + silent refresh       |
| `setSearch(value)`     | -        | -               | Set search + reset page to 1 |

---

## 13. Auth Context (Portal-Specific)

| Portal   | Context Path                             | PORTAL_TYPE  | Login Redirect     | Dashboard Redirect     |
| -------- | ---------------------------------------- | ------------ | ------------------ | ---------------------- |
| Admin    | `apps/admin/context/auth-context.tsx`    | `"admin"`    | `/login`           | `/dashboard`           |
| Company  | `apps/company/context/auth-context.tsx`  | `"company"`  | `/[orgHash]/login` | `/[orgHash]/dashboard` |
| Consumer | `apps/consumer/context/auth-context.tsx` | `"consumer"` | `/[orgHash]/login` | `/[orgHash]/dashboard` |

**Responsibilities:** Auth state, route protection, login/logout/profile.

---

## 14. Import Rules

```typescript
// ✅ shadcn
import { Button } from "@workspace/ui/components/button";

// ✅ Shared
import { SearchBar } from "@workspace/ui/shared/search-bar";
import { useApi } from "@workspace/ui/hooks/use-api";
import { apiClient } from "@workspace/ui/lib/api-client";

// ✅ Portal-specific
import { useAuth } from "@/context/auth-context";
import { useOrganizations } from "@/context/organizations-context";
import type { Organization } from "@/types";

// ✅ Same page _components
import { PageSkeleton } from "./_components/page-skeleton";

// ❌ Cross-portal, relative package, or other page _components
```

---

## 15. Quick Checklist

- [ ] Auth context in every portal
- [ ] Feature context for CRUD + pagination pages
- [ ] Feature `layout.tsx` wraps context provider
- [ ] Feature `page.tsx` only renders page component
- [ ] `_components/` for feature-specific UI
- [ ] Shared components in `packages/ui/src/shared/`
- [ ] `fetchLoading` → page skeleton
- [ ] `actionLoading` → button spinner, table stays visible
- [ ] Search resets page to 1
- [ ] Toast on success/error
- [ ] Types: portal-specific in `@/types`, shared in `@workspace/ui/types`

---

**End of Frontend Rule Book v1.0**
