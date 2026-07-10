# Complete Warranty Management System (WMS) API Documentation

---

## Database Tables Overview

| #   | Table              | Purpose                                                   | Scope            | Soft Delete             |
| --- | ------------------ | --------------------------------------------------------- | ---------------- | ----------------------- |
| 1   | `User`             | Global user accounts (one email = one account forever)    | Global           | Yes (deletedAt)         |
| 2   | `UserAccess`       | User ↔ Organization membership + role + dealerType       | Per Organization | Yes (deletedAt)         |
| 3   | `Organization`     | Companies/tenants with hierarchy (ROOT/BRANCH)            | Global           | Yes (deletedAt)         |
| 4   | `DealerType`       | Company-defined role templates (INTERNAL/EXTERNAL)        | Per Organization | Yes (deletedAt)         |
| 5   | `Feature`          | Feature/module hierarchy tree (global permissions)        | Global           | No (system config)      |
| 6   | `FeatureAccess`    | Features assigned to DealerTypes per organization         | Per Organization | No (tied to DealerType) |
| 7   | `Category`         | Product categories (hierarchical, org-scoped)             | Per Organization | Yes (deletedAt)         |
| 8   | `Brand`            | Product brands/manufacturers (org-scoped)                 | Per Organization | Yes (deletedAt)         |
| 9   | `FormSchema`       | Dynamic form blueprints (ADMIN only, org-scoped)          | Per Organization | Yes (deletedAt)         |
| 10  | `FormData`         | Form submissions (Products, Parts, Registrations, Claims) | Per Organization | Yes (deletedAt)         |
| 11  | `WarrantyTemplate` | Warranty rules engine (ADMIN only, org-scoped)            | Per Organization | Yes (deletedAt)         |
| 12  | `Warranty`         | Customer warranties with immutable snapshots              | Per Organization | Yes (deletedAt)         |
| 13  | `OtpVerification`  | OTP codes for passwordless authentication                 | Global           | No (temporary data)     |

### Important: All Business Data is Organization-Scoped

Categories, Brands, FormSchemas, WarrantyTemplates, FormData, and Warranties are all scoped to a specific organization via `orgId`. There are no global categories or brands. Each organization manages its own completely independent set of business data. Uniqueness constraints (like slug or name) are enforced per organization, not globally.

---

## Authentication & Authorization

### Login Methods

- **OTP-based login**: Primary method. OTP sent via email or phone. No password required initially.
- **Email/password login**: Alternative method for users who set a password.

### JWT Token Structure

- **Access Token**: Contains userId, orgId, orgSlug, portalType, role, permissions. Short-lived (1 hour).
- **Refresh Token**: Long-lived token for obtaining new access tokens without re-authentication.

### ADMIN Organization Access

ADMIN can view any organization's data in read-only mode by switching their organization context. When ADMIN switches to an organization, they get read-only access to that organization's data for support and audit purposes. ADMIN cannot modify organization-scoped data directly through Company Portal endpoints.

### Portal-Based URL Patterns

| Portal              | Base Path             | Tenant Context           | Who Uses It                                         |
| ------------------- | --------------------- | ------------------------ | --------------------------------------------------- |
| **Public Auth**     | `/api/auth`           | Global                   | All users (login, signup)                           |
| **Admin Portal**    | `/api/admin`          | Global (no tenant)       | ADMIN only                                          |
| **Company Portal**  | `/api/:slug`          | Organization slug in URL | COMPANY_SUPER_ADMIN, COMPANY_STAFF, COMPANY_PARTNER |
| **Consumer Portal** | `/api/:slug/consumer` | Organization slug in URL | CONSUMER                                            |
| **Shared Services** | `/api/files`          | Global                   | All Authenticated                                   |

---

## SECTION 1: Public APIs (Authentication)

**Base Path**: `/api/auth`
**Description**: OTP-based and password-based authentication. No JWT required for login/signup endpoints.

| #   | Endpoint               | Method | Description                                                                                                                                                    | Auth | Allowed Roles               | Status  |
| --- | ---------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------- | ------- |
| 1   | `/api/auth/send-otp`   | POST   | Request OTP via email or phone for login, signup, or verification                                                                                              | No   | Public                      | ⏳ TODO |
| 2   | `/api/auth/verify-otp` | POST   | Verify OTP and receive JWT tokens (access + refresh). Returns all available organization profiles for the user                                                 | No   | Public                      | ⏳ TODO |
| 3   | `/api/auth/login`      | POST   | Email/password login alternative. Returns JWT tokens and available profiles                                                                                    | No   | Public                      | ⏳ TODO |
| 4   | `/api/auth/refresh`    | POST   | Refresh expired access token using a valid refresh token                                                                                                       | No   | Public (with refresh token) | ⏳ TODO |
| 5   | `/api/auth/logout`     | POST   | Logout, invalidate current session, clear tokens                                                                                                               | Yes  | All Authenticated           | ⏳ TODO |
| 6   | `/api/auth/me`         | GET    | Get current user profile with all available organization profiles for switching                                                                                | Yes  | All Authenticated           | ⏳ TODO |
| 7   | `/api/auth/me`         | PATCH  | Update current user profile (name, email, phone, profile picture)                                                                                              | Yes  | All Authenticated           | ⏳ TODO |
| 8   | `/api/auth/switch-org` | POST   | Switch active organization context. Body: `{ orgId, portalType }`. Returns new JWT with the selected context. ADMIN can switch to any org for read-only access | Yes  | All Authenticated           | ⏳ TODO |

---

## SECTION 2: Admin Portal APIs

**Base Path**: `/api/admin`
**Description**: Platform-level administration. All endpoints require ADMIN role.

### 2.1 Organization Management (Company Onboarding)

| #   | Endpoint                                             | Method | Description                                                                                                                          | Auth | Allowed Roles | Status  |
| --- | ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------------- | ------- |
| 9   | `/api/admin/organizations`                           | POST   | Create a ROOT organization and onboard a new company. The slug must be unique across all non-deleted organizations                   | Yes  | ADMIN         | ⏳ TODO |
| 10  | `/api/admin/organizations`                           | GET    | List all organizations with search by name/slug, filter by type (ROOT/BRANCH) and status, and pagination                             | Yes  | ADMIN         | ⏳ TODO |
| 11  | `/api/admin/organizations/:orgId`                    | GET    | Get organization details including hierarchy (root, parent, children, branches)                                                      | Yes  | ADMIN         | ⏳ TODO |
| 12  | `/api/admin/organizations/:orgId`                    | PATCH  | Update organization details (name, slug, company name, logo)                                                                         | Yes  | ADMIN         | ⏳ TODO |
| 13  | `/api/admin/organizations/:orgId/status`             | PATCH  | Enable, disable, or suspend organization (soft delete - sets deletedAt). Slug becomes available for reuse                            | Yes  | ADMIN         | ⏳ TODO |
| 14  | `/api/admin/organizations/:orgId/invite-super-admin` | POST   | Invite COMPANY_SUPER_ADMIN for the organization. Creates User record if new, always creates UserAccess with role COMPANY_SUPER_ADMIN | Yes  | ADMIN         | ⏳ TODO |

### 2.2 Feature Management (Global Permission Tree)

| #   | Endpoint                                | Method | Description                                                                             | Auth | Allowed Roles | Status  |
| --- | --------------------------------------- | ------ | --------------------------------------------------------------------------------------- | ---- | ------------- | ------- |
| 15  | `/api/admin/features`                   | POST   | Create a new feature/module in the global permission tree. Code must be unique globally | Yes  | ADMIN         | ⏳ TODO |
| 16  | `/api/admin/features/tree`              | GET    | Get the complete feature tree hierarchy (all modules with nested children)              | Yes  | ADMIN         | ⏳ TODO |
| 17  | `/api/admin/features`                   | GET    | List features with search by name/code, filter by status, and pagination                | Yes  | ADMIN         | ⏳ TODO |
| 18  | `/api/admin/features/:featureId`        | GET    | Get feature by ID with its children and parent                                          | Yes  | ADMIN         | ⏳ TODO |
| 19  | `/api/admin/features/:featureId`        | PATCH  | Update feature details (name, code, icon, description, parent, sort order)              | Yes  | ADMIN         | ⏳ TODO |
| 20  | `/api/admin/features/:featureId/status` | PATCH  | Update feature status (ENABLED, DISABLED, COMING_SOON)                                  | Yes  | ADMIN         | ⏳ TODO |

### 2.3 Organization Feature Enablement

| #   | Endpoint                                              | Method | Description                                                                                                          | Auth | Allowed Roles | Status  |
| --- | ----------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- | ---- | ------------- | ------- |
| 21  | `/api/admin/organizations/:orgId/features`            | GET    | Get all features with their enablement status for the organization. Shows which features the company can access      | Yes  | ADMIN         | ⏳ TODO |
| 22  | `/api/admin/organizations/:orgId/features`            | PUT    | Bulk update which features are enabled for the organization. This sets the permission ceiling for the entire company | Yes  | ADMIN         | ⏳ TODO |
| 23  | `/api/admin/organizations/:orgId/features/:featureId` | PATCH  | Enable or disable a single feature for the organization                                                              | Yes  | ADMIN         | ⏳ TODO |

### 2.4 Organization Data Viewing (Read-Only Access)

ADMIN can view any organization's business data for support and audit purposes. These endpoints provide read-only access.

| #   | Endpoint                                                     | Method | Description                                                                     | Auth | Allowed Roles | Status  |
| --- | ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------- | ---- | ------------- | ------- |
| 24  | `/api/admin/organizations/:orgId/categories`                 | GET    | List all categories for the organization with tree view, search, and pagination | Yes  | ADMIN         | ⏳ TODO |
| 25  | `/api/admin/organizations/:orgId/categories/:categoryId`     | GET    | Get category by ID with children and parent                                     | Yes  | ADMIN         | ⏳ TODO |
| 26  | `/api/admin/organizations/:orgId/brands`                     | GET    | List all brands for the organization with search and pagination                 | Yes  | ADMIN         | ⏳ TODO |
| 27  | `/api/admin/organizations/:orgId/brands/:brandId`            | GET    | Get brand by ID                                                                 | Yes  | ADMIN         | ⏳ TODO |
| 28  | `/api/admin/organizations/:orgId/users`                      | GET    | List all users in the organization with search, filter, and pagination          | Yes  | ADMIN         | ⏳ TODO |
| 29  | `/api/admin/organizations/:orgId/users/:userId`              | GET    | Get user details within the organization context                                | Yes  | ADMIN         | ⏳ TODO |
| 30  | `/api/admin/organizations/:orgId/dealer-types`               | GET    | List all DealerTypes in the organization                                        | Yes  | ADMIN         | ⏳ TODO |
| 31  | `/api/admin/organizations/:orgId/dealer-types/:dealerTypeId` | GET    | Get DealerType details with assigned features                                   | Yes  | ADMIN         | ⏳ TODO |

---

## SECTION 3: Company Portal APIs

**Base Path**: `/api/:slug`
**Description**: Tenant-specific operations. The `:slug` parameter identifies the organization. All endpoints require JWT with matching orgId and appropriate role.

### 3.1 Organization & Branch Management

| #   | Endpoint                               | Method | Description                                                                                                                         | Auth | Allowed Roles                                       | Status  |
| --- | -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------- | ------- |
| 32  | `/api/:slug/organization`              | GET    | Get current organization details including type, hierarchy info, and status                                                         | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF, COMPANY_PARTNER | ⏳ TODO |
| 33  | `/api/:slug/organization`              | PATCH  | Update organization settings (name, logo, company name)                                                                             | Yes  | COMPANY_SUPER_ADMIN                                 | ⏳ TODO |
| 34  | `/api/:slug/hierarchy`                 | GET    | Get full organization tree starting from root down to all branches                                                                  | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF                  | ⏳ TODO |
| 35  | `/api/:slug/branches`                  | POST   | Create a child branch organization. Used when adding External partners. Body includes partner company name, slug, and admin details | Yes  | COMPANY_SUPER_ADMIN                                 | ⏳ TODO |
| 36  | `/api/:slug/branches`                  | GET    | List all immediate child branches under this organization                                                                           | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF                  | ⏳ TODO |
| 37  | `/api/:slug/branches/:branchId`        | GET    | Get branch details including its own children                                                                                       | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF                  | ⏳ TODO |
| 38  | `/api/:slug/branches/:branchId`        | PATCH  | Update branch details (name, slug, logo)                                                                                            | Yes  | COMPANY_SUPER_ADMIN                                 | ⏳ TODO |
| 39  | `/api/:slug/branches/:branchId/status` | PATCH  | Enable or disable a branch (soft delete - sets deletedAt)                                                                           | Yes  | COMPANY_SUPER_ADMIN                                 | ⏳ TODO |

### 3.2 DealerType Management (Role Templates)

| #   | Endpoint                                            | Method | Description                                                                                                                             | Auth | Allowed Roles                      | Status  |
| --- | --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------- | ------- |
| 40  | `/api/:slug/dealer-types`                           | POST   | Create a new DealerType. Body includes name, partnerType (INTERNAL/EXTERNAL), and description. Features are assigned in a separate call | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 41  | `/api/:slug/dealer-types`                           | GET    | List all active DealerTypes in the organization with their feature counts                                                               | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 42  | `/api/:slug/dealer-types/:dealerTypeId`             | GET    | Get DealerType details with all assigned features and user count                                                                        | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 43  | `/api/:slug/dealer-types/:dealerTypeId`             | PATCH  | Update DealerType (name, description, partnerType). Cannot change partnerType if users are assigned                                     | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 44  | `/api/:slug/dealer-types/:dealerTypeId/permissions` | GET    | Get features currently assigned to this DealerType with module grouping                                                                 | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 45  | `/api/:slug/dealer-types/:dealerTypeId/permissions` | PUT    | Update features assigned to this DealerType. Only features the admin has access to are shown as available. Replaces entire feature set  | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 46  | `/api/:slug/dealer-types/:dealerTypeId`             | DELETE | Soft delete a DealerType (sets deletedAt). Existing users keep their permissions. DealerType name becomes available for reuse           | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |

### 3.3 User & Partner Management

| #   | Endpoint                                 | Method | Description                                                                                                                                                                                                                                         | Auth | Allowed Roles                      | Status  |
| --- | ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------- | ------- |
| 47  | `/api/:slug/users`                       | POST   | Invite a new user to the organization. Body includes email, name, role, partnerType, and dealerTypeId. If partnerType is EXTERNAL, a branch organization is created automatically. If user already exists on platform, existing User record is used | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 48  | `/api/:slug/users`                       | GET    | List all users in the organization with search by name/email, filter by role and dealerType, and pagination. Includes pending invitations                                                                                                           | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 49  | `/api/:slug/users/:userId`               | GET    | Get user details within this organization context including their UserAccess info, DealerType, and effective permissions                                                                                                                            | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 50  | `/api/:slug/users/:userId`               | PATCH  | Update user role, DealerType, or partnerType within the organization. Cannot change partnerType if it would affect the organization structure                                                                                                       | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 51  | `/api/:slug/users/:userId/permissions`   | GET    | Get effective permissions for a user in this organization. Resolved from their DealerType or full access for Company Super Admin                                                                                                                    | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 52  | `/api/:slug/users/:userId/dealer-type`   | PATCH  | Change a user's assigned DealerType. New permissions take effect on next token refresh or login                                                                                                                                                     | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 53  | `/api/:slug/users/:userId`               | DELETE | Remove user from organization (soft delete UserAccess - sets deletedAt). User can be re-added later. Historical data preserved                                                                                                                      | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 54  | `/api/:slug/users/:userId/resend-invite` | POST   | Resend invitation email to a user who hasn't accepted yet                                                                                                                                                                                           | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |
| 55  | `/api/:slug/me/permissions`              | GET    | Get current user's effective permissions in this organization with module grouping                                                                                                                                                                  | Yes  | All Authenticated                  | ⏳ TODO |

### 3.4 Category Management (Organization-Scoped)

| #   | Endpoint                            | Method | Description                                                                                                                        | Auth | Allowed Roles                      | Status  |
| --- | ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------- | ------- |
| 56  | `/api/:slug/categories`             | POST   | Create a new category for the organization. Body includes name, slug (unique per org), description, image, parentId, and sortOrder | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 57  | `/api/:slug/categories/tree`        | GET    | Get complete category tree hierarchy for the organization. Returns nested structure from root to leaves                            | Yes  | All Authenticated                  | ⏳ TODO |
| 58  | `/api/:slug/categories`             | GET    | List categories with search by name/slug, filter by parent, and pagination. Flat list or tree view options                         | Yes  | All Authenticated                  | ⏳ TODO |
| 59  | `/api/:slug/categories/:categoryId` | GET    | Get category by ID with its children, parent, and full path in the hierarchy                                                       | Yes  | All Authenticated                  | ⏳ TODO |
| 60  | `/api/:slug/categories/:categoryId` | PATCH  | Update category details (name, slug, description, parent, sortOrder). Moving a category updates the hierarchy                      | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 61  | `/api/:slug/categories/:categoryId` | DELETE | Soft delete a category (sets deletedAt). Slug becomes available for reuse. Child categories are not automatically deleted          | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |

### 3.5 Brand Management (Organization-Scoped)

| #   | Endpoint                     | Method | Description                                                                                                                    | Auth | Allowed Roles                      | Status  |
| --- | ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ---- | ---------------------------------- | ------- |
| 62  | `/api/:slug/brands`          | POST   | Create a new brand for the organization. Body includes name, slug (unique per org), description, logo URL, and website         | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 63  | `/api/:slug/brands`          | GET    | List brands with search by name/slug and pagination. Can filter by active status                                               | Yes  | All Authenticated                  | ⏳ TODO |
| 64  | `/api/:slug/brands/:brandId` | GET    | Get brand by ID with product count                                                                                             | Yes  | All Authenticated                  | ⏳ TODO |
| 65  | `/api/:slug/brands/:brandId` | PATCH  | Update brand details (name, slug, description, logo, website, isActive)                                                        | Yes  | COMPANY_SUPER_ADMIN, COMPANY_STAFF | ⏳ TODO |
| 66  | `/api/:slug/brands/:brandId` | DELETE | Soft delete a brand (sets deletedAt). Slug becomes available for reuse. Existing products referencing this brand remain intact | Yes  | COMPANY_SUPER_ADMIN                | ⏳ TODO |

---

## SECTION 4: Consumer Portal APIs

**Base Path**: `/api/:slug/consumer`
**Description**: End-customer self-service. Authentication is via OTP. Consumers only see their own data.

### 4.1 Consumer Authentication

| #   | Endpoint                              | Method | Description                                                                                                                                                                                  | Auth | Allowed Roles | Status  |
| --- | ------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------- | ------- |
| 67  | `/api/:slug/consumer/auth/send-otp`   | POST   | Request OTP for consumer login or signup. If user with this email does not exist, creates a new User record. If UserAccess for this user+org+CONSUMER portal does not exist, auto-creates it | No   | Public        | ⏳ TODO |
| 68  | `/api/:slug/consumer/auth/verify-otp` | POST   | Verify OTP and get JWT for consumer access to this company's consumer portal. JWT contains orgId scoped to this company                                                                      | No   | Public        | ⏳ TODO |

### 4.2 Consumer Profile

| #   | Endpoint                 | Method | Description                                                   | Auth | Allowed Roles | Status  |
| --- | ------------------------ | ------ | ------------------------------------------------------------- | ---- | ------------- | ------- |
| 69  | `/api/:slug/consumer/me` | GET    | Get consumer profile (name, email, phone, profile picture)    | Yes  | CONSUMER      | ⏳ TODO |
| 70  | `/api/:slug/consumer/me` | PATCH  | Update consumer profile (name, email, phone, profile picture) | Yes  | CONSUMER      | ⏳ TODO |

---

## SECTION 5: Shared Services

**Base Path**: `/api/files`
**Description**: Shared file upload and management used across all portals.

| #   | Endpoint            | Method | Description                                                                                                                                      | Auth | Allowed Roles              | Status  |
| --- | ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | -------------------------- | ------- |
| 71  | `/api/files/upload` | POST   | Upload a file to storage. Body is multipart form data. Returns the file URL and key for use in other APIs (logos, attachments, profile pictures) | Yes  | All Authenticated          | ⏳ TODO |
| 72  | `/api/files/:key`   | DELETE | Delete a file from storage by its key. Only the uploader or an admin can delete                                                                  | Yes  | ADMIN, COMPANY_SUPER_ADMIN | ⏳ TODO |

---

## Summary by Section

| Section   | Portal   | Modules                                            | APIs   | Status         |
| --------- | -------- | -------------------------------------------------- | ------ | -------------- |
| 1         | Public   | Authentication                                     | 8      | ⏳ 8 TODO      |
| 2         | Admin    | Organization, Features, Org Features, Data Viewing | 23     | ⏳ 23 TODO     |
| 3         | Company  | Org & Branch, DealerType, Users, Category, Brand   | 35     | ⏳ 35 TODO     |
| 4         | Consumer | Auth, Profile                                      | 4      | ⏳ 4 TODO      |
| 5         | Shared   | File Services                                      | 2      | ⏳ 2 TODO      |
| **TOTAL** |          |                                                    | **72** | **⏳ 72 TODO** |

---

## Future Phases (Post-POC)

The following modules are planned for future implementation after the initial POC is validated:

| Phase            | Section                                   | APIs    | Description                                                                     |
| ---------------- | ----------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| **Future 1**     | Admin - Form Schema Management            | ~7      | Create and manage form schemas per organization (Core Configuration)            |
| **Future 2**     | Admin - Warranty Template Management      | ~7      | Create and manage warranty templates with validation rules (Core Configuration) |
| **Future 3**     | Company - Form Schema & Template Viewing  | ~3      | Read-only schema and template viewing for company users                         |
| **Future 4**     | Company - Product & Part Management       | ~10     | Product and part CRUD using form schemas                                        |
| **Future 5**     | Company - Registration & Warranty         | ~9      | Product registration with automated warranty evaluation                         |
| **Future 6**     | Company - Claim Management                | ~11     | Full claim lifecycle from submission to resolution                              |
| **Future 7**     | Consumer - Registration, Warranty, Claims | ~12     | Consumer self-service for product registration and claims                       |
| **Future Total** |                                           | **~59** |                                                                                 |

---

## Recommended Build Order (POC)

| Phase       | Section                                  | APIs | Description                                                                |
| ----------- | ---------------------------------------- | ---- | -------------------------------------------------------------------------- |
| **Phase 1** | Public Auth (1)                          | 8    | Login system with OTP, JWT tokens, profile switching between organizations |
| **Phase 2** | Admin - Organization (2.1)               | 6    | Company onboarding, creating root organizations, inviting super admins     |
| **Phase 3** | Admin - Features (2.2, 2.3)              | 9    | Global feature tree creation, enabling features per organization           |
| **Phase 4** | Company - Setup (3.1, 3.2, 3.3)          | 24   | Organization management, DealerTypes, user and partner management          |
| **Phase 5** | Company - Categories & Brands (3.4, 3.5) | 11   | Organization-scoped category hierarchy and brand management                |
| **Phase 6** | Admin - Data Viewing (2.4)               | 8    | ADMIN read-only access to organization data for support                    |
| **Phase 7** | Consumer (4)                             | 4    | Consumer authentication and profile management                             |
| **Phase 8** | Shared (5)                               | 2    | File upload and management service                                         |
