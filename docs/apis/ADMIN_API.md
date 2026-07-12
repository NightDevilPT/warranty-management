# Admin Portal API - Complete Development Guide

## Token Payload Reference

```typescript
req.user = {
  id: string;           // UserAccess ID → use as userId for createdBy/updatedBy
  email: string;        // User email
  role: string;         // 'ADMIN'
  orgId: string;        // System organization ID
  orgHash: string;      // System organization hash
  portalType: string;   // 'admin'
  permissions: string[];// Empty for admin (full access bypass)
};
```

---

## Phase 1: Organization Management

| #   | Endpoint                                             | Method | Request Body                                           | Query Params                        | From Token                  | From URL | Response                                                          | Errors   |
| --- | ---------------------------------------------------- | ------ | ------------------------------------------------------ | ----------------------------------- | --------------------------- | -------- | ----------------------------------------------------------------- | -------- |
| 1   | `/api/admin/organizations`                           | POST   | `{ name*, companyName*, slug*, type, logo? }`          | -                                   | `id` → createdBy, updatedBy | -        | OrganizationResponseDto                                           | 400, 409 |
| 2   | `/api/admin/organizations`                           | GET    | -                                                      | `page, limit, search, type, status` | -                           | -        | Paginated Organizations                                           | 401      |
| 3   | `/api/admin/organizations/:orgId`                    | GET    | -                                                      | -                                   | -                           | `orgId`  | OrganizationDetailDto (with hierarchy + stats)                    | 404      |
| 4   | `/api/admin/organizations/:orgId`                    | PATCH  | `{ name?, companyName?, slug?, logo? }`                | -                                   | `id` → updatedBy            | `orgId`  | OrganizationResponseDto                                           | 404, 409 |
| 5   | `/api/admin/organizations/:orgId/status`             | PATCH  | `{ action*: "activate"\|"deactivate"\|"soft-delete" }` | -                                   | `id` → updatedBy/deletedBy  | `orgId`  | `{ id, status, isActive, message }`                               | 404, 400 |
| 6   | `/api/admin/organizations/:orgId/invite-super-admin` | POST   | `{ email*, firstName*, lastName*, phoneNumber? }`      | -                                   | `id` → createdBy            | `orgId`  | `{ userId, userAccessId, email, fullName, role, invitationSent }` | 404, 409 |

**Business Logic for #6:**

- Find or Create User by email
- Create UserAccess with `role: COMPANY_SUPER_ADMIN`, `portalType: "company"`
- Send invitation email (skip in dev)

---

## Phase 2: Feature Management

| #   | Endpoint                                | Method | Request Body                                                   | Query Params                            | From Token                  | From URL    | Response                                                | Errors   |
| --- | --------------------------------------- | ------ | -------------------------------------------------------------- | --------------------------------------- | --------------------------- | ----------- | ------------------------------------------------------- | -------- |
| 7   | `/api/admin/features`                   | POST   | `{ name*, code*, description?, icon?, parentId?, sortOrder? }` | -                                       | `id` → createdBy, updatedBy | -           | FeatureResponseDto                                      | 400, 409 |
| 8   | `/api/admin/features/tree`              | GET    | -                                                              | -                                       | -                           | -           | `{ items: NestedFeatureTree[] }`                        | 401      |
| 9   | `/api/admin/features`                   | GET    | -                                                              | `page, limit, search, status, parentId` | -                           | -           | Paginated Features                                      | 401      |
| 10  | `/api/admin/features/:featureId`        | GET    | -                                                              | -                                       | -                           | `featureId` | FeatureDetailDto (with children, parent, assignedCount) | 404      |
| 11  | `/api/admin/features/:featureId`        | PATCH  | `{ name?, code?, description?, icon?, parentId?, sortOrder? }` | -                                       | `id` → updatedBy            | `featureId` | FeatureResponseDto                                      | 404, 409 |
| 12  | `/api/admin/features/:featureId/status` | PATCH  | `{ status*: "ENABLED"\|"DISABLED"\|"COMING_SOON" }`            | -                                       | `id` → updatedBy            | `featureId` | FeatureResponseDto                                      | 404, 400 |

---

## Phase 3: Brand Management

| #   | Endpoint                                     | Method | Request Body                                          | Query Params                  | From Token                  | From URL      | Response                           | Errors        |
| --- | -------------------------------------------- | ------ | ----------------------------------------------------- | ----------------------------- | --------------------------- | ------------- | ---------------------------------- | ------------- |
| 13  | `/api/admin/organizations/:orgId/brands`     | POST   | `{ name*, description?, logo?, website? }`            | -                             | `id` → createdBy, updatedBy | `orgId`       | BrandResponseDto                   | 400, 409, 404 |
| 14  | `/api/admin/organizations/:orgId/brands`     | GET    | -                                                     | `page, limit, search, status` | -                           | `orgId`       | Paginated Brands                   | 404           |
| 15  | `/api/admin/organizations/:orgId/brands/:id` | GET    | -                                                     | -                             | -                           | `orgId`, `id` | BrandDetailDto (with productCount) | 404           |
| 16  | `/api/admin/organizations/:orgId/brands/:id` | PATCH  | `{ name?, description?, logo?, website?, isActive? }` | -                             | `id` → updatedBy            | `orgId`, `id` | BrandResponseDto                   | 404, 409      |
| 17  | `/api/admin/organizations/:orgId/brands/:id` | DELETE | -                                                     | -                             | `id` → deletedBy            | `orgId`, `id` | `void`                             | 404           |

**Soft Delete Logic:** Sets `deletedAt`, `deletedBy`, `isActive: false`. Slug becomes reusable.

---

## Phase 4: Category Management

| #   | Endpoint                                          | Method | Request Body                                             | Query Params                            | From Token                  | From URL      | Response                                                            | Errors        |
| --- | ------------------------------------------------- | ------ | -------------------------------------------------------- | --------------------------------------- | --------------------------- | ------------- | ------------------------------------------------------------------- | ------------- |
| 18  | `/api/admin/organizations/:orgId/categories`      | POST   | `{ name*, description?, image?, parentId?, sortOrder? }` | -                                       | `id` → createdBy, updatedBy | `orgId`       | CategoryResponseDto                                                 | 400, 409, 404 |
| 19  | `/api/admin/organizations/:orgId/categories/tree` | GET    | -                                                        | -                                       | -                           | `orgId`       | `{ items: NestedCategoryTree[] }`                                   | 404           |
| 20  | `/api/admin/organizations/:orgId/categories`      | GET    | -                                                        | `page, limit, search, status, parentId` | -                           | `orgId`       | Paginated Categories                                                | 404           |
| 21  | `/api/admin/organizations/:orgId/categories/:id`  | GET    | -                                                        | -                                       | -                           | `orgId`, `id` | CategoryDetailDto (with parent, children, breadcrumb, productCount) | 404           |
| 22  | `/api/admin/organizations/:orgId/categories/:id`  | PATCH  | `{ name?, description?, image?, parentId?, sortOrder? }` | -                                       | `id` → updatedBy            | `orgId`, `id` | CategoryResponseDto                                                 | 404, 409      |
| 23  | `/api/admin/organizations/:orgId/categories/:id`  | DELETE | -                                                        | -                                       | `id` → deletedBy            | `orgId`, `id` | `void`                                                              | 404           |

**Soft Delete Logic:** Children become root-level (parentId = null). Products unaffected.

---

## Phase 5: Dealer Type Management

| #   | Endpoint                                                       | Method | Request Body                                                    | Query Params                       | From Token                  | From URL      | Response                                                          | Errors        |
| --- | -------------------------------------------------------------- | ------ | --------------------------------------------------------------- | ---------------------------------- | --------------------------- | ------------- | ----------------------------------------------------------------- | ------------- |
| 24  | `/api/admin/organizations/:orgId/dealer-types`                 | POST   | `{ name*, partnerType*: "INTERNAL"\|"EXTERNAL", description? }` | -                                  | `id` → createdBy, updatedBy | `orgId`       | DealerTypeResponseDto                                             | 400, 409, 404 |
| 25  | `/api/admin/organizations/:orgId/dealer-types`                 | GET    | -                                                               | `page, limit, search, partnerType` | -                           | `orgId`       | Paginated DealerTypes (with featuresCount, usersCount)            | 404           |
| 26  | `/api/admin/organizations/:orgId/dealer-types/:id`             | GET    | -                                                               | -                                  | -                           | `orgId`, `id` | DealerTypeDetailDto (with features grouped by module, users list) | 404           |
| 27  | `/api/admin/organizations/:orgId/dealer-types/:id`             | PATCH  | `{ name?, description?, partnerType? }`                         | -                                  | `id` → updatedBy            | `orgId`, `id` | DealerTypeResponseDto                                             | 404, 409, 400 |
| 28  | `/api/admin/organizations/:orgId/dealer-types/:id`             | DELETE | -                                                               | -                                  | `id` → deletedBy            | `orgId`, `id` | `void`                                                            | 404           |
| 29  | `/api/admin/organizations/:orgId/dealer-types/:id/permissions` | GET    | -                                                               | -                                  | -                           | `orgId`, `id` | `{ features: GroupedByModule[] }`                                 | 404           |
| 30  | `/api/admin/organizations/:orgId/dealer-types/:id/permissions` | PUT    | `{ featureIds*: string[] }`                                     | -                                  | `id` → updatedBy            | `orgId`, `id` | `{ message, assignedCount }`                                      | 404, 400      |

**Business Logic for #30:** Only ENABLED features allowed. Replaces entire set. Users get updated permissions on next login.

---

## Phase 6: User Management

| #   | Endpoint                                                | Method | Request Body                                                                          | Query Params                                                   | From Token       | From URL      | Response                                                                      | Errors        |
| --- | ------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------- | ------------- | ----------------------------------------------------------------------------- | ------------- |
| 31  | `/api/admin/organizations/:orgId/users`                 | POST   | `{ email*, firstName*, lastName*, role*, partnerType*, dealerTypeId?, phoneNumber? }` | -                                                              | `id` → createdBy | `orgId`       | `{ userId, userAccessId, email, fullName, role, dealerType, invitationSent }` | 400, 409, 404 |
| 32  | `/api/admin/organizations/:orgId/users`                 | GET    | -                                                                                     | `page, limit, search, role, dealerTypeId, partnerType, status` | -                | `orgId`       | Paginated Users (with role, dealerType, lastActive)                           | 404           |
| 33  | `/api/admin/organizations/:orgId/users/:id`             | GET    | -                                                                                     | -                                                              | -                | `orgId`, `id` | UserDetailDto (UserAccess with dealerType, effective permissions)             | 404           |
| 34  | `/api/admin/organizations/:orgId/users/:id`             | PATCH  | `{ role?, partnerType?, dealerTypeId?, isActive? }`                                   | -                                                              | `id` → updatedBy | `orgId`, `id` | UserAccessResponseDto                                                         | 404, 400      |
| 35  | `/api/admin/organizations/:orgId/users/:id`             | DELETE | -                                                                                     | -                                                              | `id` → deletedBy | `orgId`, `id` | `void`                                                                        | 404           |
| 36  | `/api/admin/organizations/:orgId/users/:id/permissions` | GET    | -                                                                                     | -                                                              | -                | `orgId`, `id` | `{ permissions: GroupedByModule[] \| "FULL_ACCESS" }`                         | 404           |
| 37  | `/api/admin/organizations/:orgId/users/:id/dealer-type` | PATCH  | `{ dealerTypeId* }`                                                                   | -                                                              | `id` → updatedBy | `orgId`, `id` | `{ message, previousDealerType, newDealerType }`                              | 404, 400      |

**Business Logic for #31:**

- Find or Create User by email
- Create UserAccess with specified role, partnerType, dealerTypeId
- If `partnerType: EXTERNAL` → creates branch organization
- Send invitation email (skip in dev)

**Business Logic for #34:** Cannot change `partnerType` if users are assigned to this role.

---

## Error Response Reference

| Status | Common Messages                                                                                                                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 400    | `"Organization hash is required"`, `"Validation failed"`, `"Invalid status value"`                                                                                                                                                                                             |
| 401    | `"Authentication required"`, `"Session expired"`                                                                                                                                                                                                                               |
| 403    | `"Account is deactivated"`, `"Insufficient permissions"`                                                                                                                                                                                                                       |
| 404    | `"Organization not found"`, `"Feature not found"`, `"Brand not found"`, `"Category not found"`, `"DealerType not found"`, `"User not found"`                                                                                                                                   |
| 409    | `"Organization with this slug already exists"`, `"Feature with this code already exists"`, `"Brand with this name already exists"`, `"Category with this slug already exists"`, `"DealerType with this name already exists"`, `"User already has access to this organization"` |
| 500    | `"Failed to create/update/delete <resource>"`                                                                                                                                                                                                                                  |

---

## Summary

| Phase     | Module       | APIs   | Depends On                |
| --------- | ------------ | ------ | ------------------------- |
| 1         | Organization | 6      | None                      |
| 2         | Feature      | 6      | None                      |
| 3         | Brand        | 5      | Organization              |
| 4         | Category     | 6      | Organization              |
| 5         | DealerType   | 7      | Organization + Feature    |
| 6         | User         | 7      | Organization + DealerType |
| **Total** |              | **37** |                           |
