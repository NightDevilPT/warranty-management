# Admin Portal API - Complete Development Guide ✅

## Token Payload Reference

```typescript
req.user = {
  id: string;           // UserAccess ID → use as userId for createdBy/updatedBy/deletedBy
  email: string;        // User email
  role: string;         // 'ADMIN'
  orgId: string;        // System organization ID
  orgHash: string;      // System organization hash
  portalType: string;   // 'admin'
  permissions: string[];// Empty for admin (full access bypass)
};
```

---

## Phase 1: Organization Management ✅ DONE

**Controller:** `src/modules/admin/organizations/organizations.controller.ts`
**Base Path:** `/api/admin/organizations`

| #   | Endpoint                                             | Method | Request Body                                           | Query Params                        | From Token                  | From URL | Response                                      | Errors        | Status  |
| --- | ---------------------------------------------------- | ------ | ------------------------------------------------------ | ----------------------------------- | --------------------------- | -------- | --------------------------------------------- | ------------- | ------- |
| 1   | `/api/admin/organizations`                           | POST   | `{ name*, companyName*, slug*, type?, logo? }`         | -                                   | `id` → createdBy, updatedBy | -        | OrganizationResponseDto                       | 400, 409      | ✅ DONE |
| 2   | `/api/admin/organizations`                           | GET    | -                                                      | `page, limit, search, type, status` | -                           | -        | Paginated Organizations (excludes system org) | 401           | ✅ DONE |
| 3   | `/api/admin/organizations/:orgId`                    | GET    | -                                                      | -                                   | -                           | `orgId`  | OrganizationDetailDto (hierarchy + stats)     | 404           | ✅ DONE |
| 4   | `/api/admin/organizations/:orgId`                    | PATCH  | `{ name?, companyName?, slug?, logo? }`                | -                                   | `id` → updatedBy            | `orgId`  | OrganizationResponseDto                       | 404, 409      | ✅ DONE |
| 5   | `/api/admin/organizations/:orgId/status`             | PATCH  | `{ action*: "activate"\|"deactivate"\|"soft-delete" }` | -                                   | `id` → updatedBy/deletedBy  | `orgId`  | StatusResponseDto                             | 404, 400      | ✅ DONE |
| 6   | `/api/admin/organizations/:orgId/invite-super-admin` | POST   | `{ email*, firstName*, lastName*, phoneNumber? }`      | -                                   | `id` → createdBy            | `orgId`  | InviteSuperAdminResponseDto                   | 404, 409      | ✅ DONE |
| 7   | `/api/admin/organizations/:orgId/logo`               | POST   | multipart `file`                                       | -                                   | `id` → updatedBy            | `orgId`  | OrganizationResponseDto                       | 404, 400, 413 | ✅ DONE |

---

## Phase 2: Feature Management ✅ DONE

**Controller:** `src/modules/admin/features/features.controller.ts`
**Base Path:** `/api/admin/features`

| #   | Endpoint                                | Method | Request Body                                                   | Query Params                            | From Token                  | From URL    | Response                                           | Errors   | Status  |
| --- | --------------------------------------- | ------ | -------------------------------------------------------------- | --------------------------------------- | --------------------------- | ----------- | -------------------------------------------------- | -------- | ------- |
| 8   | `/api/admin/features`                   | POST   | `{ name*, code*, description?, icon?, parentId?, sortOrder? }` | -                                       | `id` → createdBy, updatedBy | -           | FeatureResponseDto                                 | 400, 409 | ✅ DONE |
| 9   | `/api/admin/features/tree`              | GET    | -                                                              | -                                       | -                           | -           | FeatureTreeResponseDto                             | 401      | ✅ DONE |
| 10  | `/api/admin/features`                   | GET    | -                                                              | `page, limit, search, status, parentId` | -                           | -           | Paginated Features                                 | 401      | ✅ DONE |
| 11  | `/api/admin/features/:featureId`        | GET    | -                                                              | -                                       | -                           | `featureId` | FeatureDetailDto (children, parent, assignedCount) | 404      | ✅ DONE |
| 12  | `/api/admin/features/:featureId`        | PATCH  | `{ name?, description?, icon?, parentId?, sortOrder? }`        | -                                       | `id` → updatedBy            | `featureId` | FeatureResponseDto                                 | 404, 409 | ✅ DONE |
| 13  | `/api/admin/features/:featureId/status` | PATCH  | `{ status*: "ENABLED"\|"DISABLED"\|"COMING_SOON" }`            | -                                       | `id` → updatedBy            | `featureId` | FeatureResponseDto                                 | 404, 400 | ✅ DONE |

---

## Phase 3: Brand Management ✅ DONE

**Controller:** `src/modules/admin/brands/brands.controller.ts`
**Base Path:** `/api/admin/organizations/:orgId/brands`

| #   | Endpoint                                     | Method | Request Body                                          | Query Params                  | From Token                  | From URL      | Response                      | Errors        | Status  |
| --- | -------------------------------------------- | ------ | ----------------------------------------------------- | ----------------------------- | --------------------------- | ------------- | ----------------------------- | ------------- | ------- |
| 14  | `/api/admin/organizations/:orgId/brands`     | POST   | `{ name*, description?, logo?, website? }`            | -                             | `id` → createdBy, updatedBy | `orgId`       | BrandResponseDto              | 400, 409, 404 | ✅ DONE |
| 15  | `/api/admin/organizations/:orgId/brands`     | GET    | -                                                     | `page, limit, search, status` | -                           | `orgId`       | Paginated Brands              | 404           | ✅ DONE |
| 16  | `/api/admin/organizations/:orgId/brands/:id` | GET    | -                                                     | -                             | -                           | `orgId`, `id` | BrandDetailDto (productCount) | 404           | ✅ DONE |
| 17  | `/api/admin/organizations/:orgId/brands/:id` | PATCH  | `{ name?, description?, logo?, website?, isActive? }` | -                             | `id` → updatedBy            | `orgId`, `id` | BrandResponseDto              | 404, 409      | ✅ DONE |
| 18  | `/api/admin/organizations/:orgId/brands/:id` | DELETE | -                                                     | -                             | `id` → deletedBy            | `orgId`, `id` | void                          | 404           | ✅ DONE |

---

## Phase 4: Category Management ✅ DONE

**Controller:** `src/modules/admin/categories/categories.controller.ts`
**Base Path:** `/api/admin/organizations/:orgId/categories`

| #   | Endpoint                                          | Method | Request Body                                             | Query Params                            | From Token                  | From URL      | Response                                         | Errors        | Status  |
| --- | ------------------------------------------------- | ------ | -------------------------------------------------------- | --------------------------------------- | --------------------------- | ------------- | ------------------------------------------------ | ------------- | ------- |
| 19  | `/api/admin/organizations/:orgId/categories`      | POST   | `{ name*, description?, image?, parentId?, sortOrder? }` | -                                       | `id` → createdBy, updatedBy | `orgId`       | CategoryResponseDto                              | 400, 409, 404 | ✅ DONE |
| 20  | `/api/admin/organizations/:orgId/categories/tree` | GET    | -                                                        | -                                       | -                           | `orgId`       | CategoryTreeResponseDto                          | 404           | ✅ DONE |
| 21  | `/api/admin/organizations/:orgId/categories`      | GET    | -                                                        | `page, limit, search, status, parentId` | -                           | `orgId`       | Paginated Categories                             | 404           | ✅ DONE |
| 22  | `/api/admin/organizations/:orgId/categories/:id`  | GET    | -                                                        | -                                       | -                           | `orgId`, `id` | CategoryDetailDto (parent, children, breadcrumb) | 404           | ✅ DONE |
| 23  | `/api/admin/organizations/:orgId/categories/:id`  | PATCH  | `{ name?, description?, image?, parentId?, sortOrder? }` | -                                       | `id` → updatedBy            | `orgId`, `id` | CategoryResponseDto                              | 404, 409      | ✅ DONE |
| 24  | `/api/admin/organizations/:orgId/categories/:id`  | DELETE | -                                                        | -                                       | `id` → deletedBy            | `orgId`, `id` | void                                             | 404           | ✅ DONE |

---

## Phase 5: Dealer Type Management ✅ DONE

**Controller:** `src/modules/admin/dealer-types/dealer-types.controller.ts`
**Base Path:** `/api/admin/organizations/:orgId/dealer-types`

| #   | Endpoint                                                       | Method | Request Body                            | Query Params                       | From Token                  | From URL      | Response                                                     | Errors        | Status  |
| --- | -------------------------------------------------------------- | ------ | --------------------------------------- | ---------------------------------- | --------------------------- | ------------- | ------------------------------------------------------------ | ------------- | ------- |
| 25  | `/api/admin/organizations/:orgId/dealer-types`                 | POST   | `{ name*, partnerType*, description? }` | -                                  | `id` → createdBy, updatedBy | `orgId`       | DealerTypeResponseDto                                        | 400, 409, 404 | ✅ DONE |
| 26  | `/api/admin/organizations/:orgId/dealer-types`                 | GET    | -                                       | `page, limit, search, partnerType` | -                           | `orgId`       | Paginated DealerTypes (featuresCount, usersCount)            | 404           | ✅ DONE |
| 27  | `/api/admin/organizations/:orgId/dealer-types/:id`             | GET    | -                                       | -                                  | -                           | `orgId`, `id` | DealerTypeDetailDto (features grouped by module, users list) | 404           | ✅ DONE |
| 28  | `/api/admin/organizations/:orgId/dealer-types/:id`             | PATCH  | `{ name?, description?, partnerType? }` | -                                  | `id` → updatedBy            | `orgId`, `id` | DealerTypeResponseDto                                        | 404, 409      | ✅ DONE |
| 29  | `/api/admin/organizations/:orgId/dealer-types/:id`             | DELETE | -                                       | -                                  | `id` → deletedBy            | `orgId`, `id` | void                                                         | 404           | ✅ DONE |
| 30  | `/api/admin/organizations/:orgId/dealer-types/:id/permissions` | GET    | -                                       | -                                  | -                           | `orgId`, `id` | PermissionsResponseDto (grouped by module)                   | 404           | ✅ DONE |
| 31  | `/api/admin/organizations/:orgId/dealer-types/:id/permissions` | PUT    | `{ featureIds*: string[] }`             | -                                  | `id` → updatedBy            | `orgId`, `id` | UpdatePermissionsResponseDto                                 | 404, 400      | ✅ DONE |

---

## Phase 6: User Management ✅ DONE

**Controller:** `src/modules/admin/users/users.controller.ts`
**Base Path:** `/api/admin/organizations/:orgId/users`

| #   | Endpoint                                                | Method | Request Body                                                                          | Query Params                                                   | From Token       | From URL      | Response                                          | Errors        | Status  |
| --- | ------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------- | ------------- | ------------------------------------------------- | ------------- | ------- |
| 32  | `/api/admin/organizations/:orgId/users`                 | POST   | `{ email*, firstName*, lastName*, role*, partnerType*, dealerTypeId?, phoneNumber? }` | -                                                              | `id` → createdBy | `orgId`       | InviteUserResponseDto                             | 400, 409, 404 | ✅ DONE |
| 33  | `/api/admin/organizations/:orgId/users`                 | GET    | -                                                                                     | `page, limit, search, role, dealerTypeId, partnerType, status` | -                | `orgId`       | Paginated Users                                   | 404           | ✅ DONE |
| 34  | `/api/admin/organizations/:orgId/users/:id`             | GET    | -                                                                                     | -                                                              | -                | `orgId`, `id` | UserDetailDto (dealerType, effective permissions) | 404           | ✅ DONE |
| 35  | `/api/admin/organizations/:orgId/users/:id`             | PATCH  | `{ role?, partnerType?, dealerTypeId?, isActive? }`                                   | -                                                              | `id` → updatedBy | `orgId`, `id` | UserResponseDto                                   | 404, 400      | ✅ DONE |
| 36  | `/api/admin/organizations/:orgId/users/:id`             | DELETE | -                                                                                     | -                                                              | `id` → deletedBy | `orgId`, `id` | void                                              | 404           | ✅ DONE |
| 37  | `/api/admin/organizations/:orgId/users/:id/permissions` | GET    | -                                                                                     | -                                                              | -                | `orgId`, `id` | UserPermissionsResponseDto                        | 404           | ✅ DONE |
| 38  | `/api/admin/organizations/:orgId/users/:id/dealer-type` | PATCH  | `{ dealerTypeId* }`                                                                   | -                                                              | `id` → updatedBy | `orgId`, `id` | ChangeDealerTypeResponseDto                       | 404, 400      | ✅ DONE |

---

## Phase 7: Dashboard ✅ DONE

**Controller:** `src/modules/admin/dashboard/dashboard.controller.ts`
**Base Path:** `/api/admin/dashboard`

| #   | Endpoint               | Method | Description                                                | Response             | Errors | Status  |
| --- | ---------------------- | ------ | ---------------------------------------------------------- | -------------------- | ------ | ------- |
| 39  | `/api/admin/dashboard` | GET    | Platform overview stats, charts data, recent organizations | DashboardResponseDto | 401    | ✅ DONE |

**Response:**

```json
{
  "stats": {
    "totalOrganizations": 12,
    "activeOrganizations": 10,
    "totalUsers": 156,
    "totalBrands": 89,
    "totalCategories": 45,
    "totalDealerTypes": 28
  },
  "organizationsByType": [
    { "label": "ROOT", "count": 8 },
    { "label": "BRANCH", "count": 4 }
  ],
  "organizationsByStatus": [
    { "label": "Active", "count": 10 },
    { "label": "Inactive", "count": 1 },
    { "label": "Deleted", "count": 1 }
  ],
  "recentOrganizations": [
    {
      "id": "uuid",
      "name": "TechServe India",
      "slug": "techserve",
      "type": "ROOT",
      "isActive": true,
      "createdAt": "2024-01-12T00:00:00Z"
    }
  ]
}
```

---

## Summary

| Phase     | Module       | APIs   | Dependencies              | Status      |
| --------- | ------------ | ------ | ------------------------- | ----------- |
| 1         | Organization | 7      | None                      | ✅ DONE     |
| 2         | Feature      | 6      | None                      | ✅ DONE     |
| 3         | Brand        | 5      | Organization              | ✅ DONE     |
| 4         | Category     | 6      | Organization              | ✅ DONE     |
| 5         | DealerType   | 7      | Organization + Feature    | ✅ DONE     |
| 6         | User         | 7      | Organization + DealerType | ✅ DONE     |
| 7         | Dashboard    | 1      | All above                 | ✅ DONE     |
| **Total** |              | **39** |                           | ✅ ALL DONE |

---

## Folder Structure

```
src/modules/admin/
├── index.ts
├── dashboard/
│   ├── queries/handlers/ (1 handler)
│   ├── queries/impl/ (1 query)
│   ├── dto/ (1 DTO)
│   ├── dashboard.service.ts
│   ├── dashboard.controller.ts
│   └── dashboard.module.ts
├── organizations/
│   ├── commands/handlers/ (5 handlers)
│   ├── queries/handlers/ (2 handlers)
│   ├── dto/ (4 DTOs)
│   ├── organizations.service.ts
│   ├── organizations.controller.ts
│   └── organizations.module.ts
├── features/
│   ├── commands/handlers/ (3 handlers)
│   ├── queries/handlers/ (3 handlers)
│   ├── dto/ (4 DTOs)
│   ├── features.service.ts
│   ├── features.controller.ts
│   └── features.module.ts
├── brands/
│   ├── commands/handlers/ (3 handlers)
│   ├── queries/handlers/ (2 handlers)
│   ├── dto/ (3 DTOs)
│   ├── brands.service.ts
│   ├── brands.controller.ts
│   └── brands.module.ts
├── categories/
│   ├── commands/handlers/ (3 handlers)
│   ├── queries/handlers/ (3 handlers)
│   ├── dto/ (3 DTOs)
│   ├── categories.service.ts
│   ├── categories.controller.ts
│   └── categories.module.ts
├── dealer-types/
│   ├── commands/handlers/ (4 handlers)
│   ├── queries/handlers/ (3 handlers)
│   ├── dto/ (4 DTOs)
│   ├── dealer-types.service.ts
│   ├── dealer-types.controller.ts
│   └── dealer-types.module.ts
└── users/
    ├── commands/handlers/ (4 handlers)
    ├── queries/handlers/ (3 handlers)
    ├── dto/ (4 DTOs)
    ├── users.service.ts
    ├── users.controller.ts
    └── users.module.ts
```

---

## Status Badge Legend

| Badge   | Meaning                      |
| ------- | ---------------------------- |
| ✅ DONE | Fully implemented and tested |
| 🚧 WIP  | Currently in progress        |
| ⏳ TODO | Not yet implemented          |
