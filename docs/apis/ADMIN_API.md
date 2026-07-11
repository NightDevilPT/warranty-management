# WMS API Documentation - Admin Portal

---

## Base Path: `/api/admin`

## Auth: All endpoints require ADMIN role JWT token in cookies

---

## 1. Organization Management

Manage tenant companies on the platform. Create root organizations, view their details with full hierarchy (parent-child relationships), update company information, manage organization status, and invite super admins who will manage each company.

| #   | Endpoint                                             | Method | Description                                                                                                                                                                                   | Status  |
| --- | ---------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | `/api/admin/organizations`                           | POST   | Onboard a new company by creating a root organization with unique slug. This slug is used for tenant routing (e.g., `/api/company/techserve`). The organization starts as active              | ⏳ TODO |
| 2   | `/api/admin/organizations`                           | GET    | View all organizations on the platform. Supports search by name/slug, filter by type (ROOT/BRANCH), filter by status (active/disabled/deleted), and cursor-based pagination                   | ⏳ TODO |
| 3   | `/api/admin/organizations/:orgId`                    | GET    | Get complete details of a specific organization including its hierarchy - parent org, immediate children, all descendant branches, and root org reference                                     | ⏳ TODO |
| 4   | `/api/admin/organizations/:orgId`                    | PATCH  | Update organization details like display name, company name (legal name), URL slug, or logo. Slug changes propagate to all tenant URLs                                                        | ⏳ TODO |
| 5   | `/api/admin/organizations/:orgId/status`             | PATCH  | Enable (activate), disable (deactivate all users), or soft-delete (sets deletedAt, frees slug for reuse) an organization                                                                      | ⏳ TODO |
| 6   | `/api/admin/organizations/:orgId/invite-super-admin` | POST   | Send invitation to a COMPANY_SUPER_ADMIN who will manage this organization. Creates User record if email is new, creates UserAccess with COMPANY_SUPER_ADMIN role, and sends invitation email | ⏳ TODO |

---

## 2. Feature Management

Define the global permission system. Create modules (root features like "brand", "category") and their permissions (child features like "brand:create", "brand:view"). These features are then assigned to DealerTypes per organization to control what users can do.

| #   | Endpoint                                | Method | Description                                                                                                                                                                                                                                              | Status  |
| --- | --------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 7   | `/api/admin/features`                   | POST   | Create a new feature in the permission tree. Root features (parentId=null) act as modules (e.g., "Brand Management"). Child features are permissions under a module (e.g., "brand:create"). Code must be globally unique. Status defaults to COMING_SOON | ⏳ TODO |
| 8   | `/api/admin/features/tree`              | GET    | Get the complete permission hierarchy as a nested tree. Root features (modules) contain their child features (permissions). Used to render the permission assignment UI in admin panel                                                                   | ⏳ TODO |
| 9   | `/api/admin/features`                   | GET    | Search and list all features with pagination. Filter by status (ENABLED/DISABLED/COMING_SOON), module (parentId), or search by name/code. Shows which module each feature belongs to                                                                     | ⏳ TODO |
| 10  | `/api/admin/features/:featureId`        | GET    | Get detailed information about a specific feature including its parent module, all child permissions (if it's a module), and how many DealerTypes currently have this feature assigned                                                                   | ⏳ TODO |
| 11  | `/api/admin/features/:featureId`        | PATCH  | Update feature metadata - display name, permission code, icon, description, parent module, or sort order within the parent. Cannot change code if already assigned to DealerTypes                                                                        | ⏳ TODO |
| 12  | `/api/admin/features/:featureId/status` | PATCH  | Change feature availability: ENABLED (available for assignment), DISABLED (hidden, not assignable), or COMING_SOON (visible with badge, not assignable). Affects all organizations globally                                                              | ⏳ TODO |

---

## 3. Brand Management

Manage product brands for any organization. Brands are organization-scoped - each company has its own independent list of brands. Used when registering products and organizing inventory.

| #   | Endpoint                                     | Method | Description                                                                                                                                                                                                        | Status  |
| --- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 13  | `/api/admin/organizations/:orgId/brands`     | POST   | Add a new brand to an organization's catalog. Slug must be unique within that organization (but can be reused after soft delete). Optional: logo URL, official website. Automatically sets createdBy and updatedBy | ⏳ TODO |
| 14  | `/api/admin/organizations/:orgId/brands`     | GET    | View all brands belonging to an organization. Filter by active/inactive status, search by name/slug/description, and paginate results. Shows brand logo, website, and when it was created                          | ⏳ TODO |
| 15  | `/api/admin/organizations/:orgId/brands/:id` | GET    | Get full details of a specific brand including how many products are currently associated with this brand (product count)                                                                                          | ⏳ TODO |
| 16  | `/api/admin/organizations/:orgId/brands/:id` | PATCH  | Modify brand information - name, slug (will affect product lookups), description, logo URL, website, or active status (hide from UI). Slug uniqueness checked only among active brands                             | ⏳ TODO |
| 17  | `/api/admin/organizations/:orgId/brands/:id` | DELETE | Soft delete a brand (sets deletedAt and deletedBy). The slug becomes available for reuse. Existing products using this brand are NOT affected and continue to reference it                                         | ⏳ TODO |

---

## 4. Category Management

Manage hierarchical product categories for any organization. Categories can be nested (e.g., Electronics > Mobile Phones > Smartphones) and are organization-scoped. Used for product classification and navigation.

| #   | Endpoint                                          | Method | Description                                                                                                                                                                                                         | Status  |
| --- | ------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 18  | `/api/admin/organizations/:orgId/categories`      | POST   | Create a new category in the organization's hierarchy. Can be root-level (parentId=null) or child of another category. Slug must be unique within the org. Set sortOrder to control display position among siblings | ⏳ TODO |
| 19  | `/api/admin/organizations/:orgId/categories/tree` | GET    | Get the complete category hierarchy as a nested tree structure. Root categories contain their children, which contain their children. Each node shows sort order, active status, and child count                    | ⏳ TODO |
| 20  | `/api/admin/organizations/:orgId/categories`      | GET    | Browse categories with options for flat list or tree view. Filter by parent category, active status, search by name/slug. Used for admin panel category management table                                            | ⏳ TODO |
| 21  | `/api/admin/organizations/:orgId/categories/:id`  | GET    | Get category details including its parent category, immediate children, full breadcrumb path to root, and count of products in this category                                                                        | ⏳ TODO |
| 22  | `/api/admin/organizations/:orgId/categories/:id`  | PATCH  | Update category - rename, change slug, move to different parent (restructures hierarchy), reorder among siblings, update image. Moving a category preserves all its child categories                                | ⏳ TODO |
| 23  | `/api/admin/organizations/:orgId/categories/:id`  | DELETE | Soft delete a category. Slug becomes reusable. Child categories are NOT automatically deleted - they become root-level categories. Products in this category are not affected                                       | ⏳ TODO |

---

## 5. Dealer Type Management

Manage role templates (DealerTypes) for organizations. DealerTypes define what features a group of users can access. Think of them as job roles like "Support Agent", "Warranty Manager", or "Dealer". Features are assigned to DealerTypes, and users inherit those features.

| #   | Endpoint                                                       | Method | Description                                                                                                                                                                                                             | Status  |
| --- | -------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 24  | `/api/admin/organizations/:orgId/dealer-types`                 | POST   | Create a new role template for the organization. Define name, partnerType (INTERNAL for staff, EXTERNAL for partners), and description. Features are assigned separately via the permissions endpoint                   | ⏳ TODO |
| 25  | `/api/admin/organizations/:orgId/dealer-types`                 | GET    | List all role templates for an organization. Shows each dealer type with count of assigned features and count of users currently assigned to this role. Filter by partnerType (INTERNAL/EXTERNAL)                       | ⏳ TODO |
| 26  | `/api/admin/organizations/:orgId/dealer-types/:id`             | GET    | Get complete details of a role template - all assigned features grouped by module, list of users assigned to this role, partnerType, and when it was created                                                            | ⏳ TODO |
| 27  | `/api/admin/organizations/:orgId/dealer-types/:id`             | PATCH  | Modify role template - rename, change description, or change partnerType (INTERNAL↔EXTERNAL). Cannot change partnerType if users are currently assigned to this role                                                   | ⏳ TODO |
| 28  | `/api/admin/organizations/:orgId/dealer-types/:id`             | DELETE | Soft delete a role template. Existing users assigned to this role KEEP their current permissions. The dealer type name becomes available for reuse. Users can be reassigned later                                       | ⏳ TODO |
| 29  | `/api/admin/organizations/:orgId/dealer-types/:id/permissions` | GET    | View all features currently assigned to this role template. Features are grouped by their parent module for easy reading. Shows which features are active vs disabled for this role                                     | ⏳ TODO |
| 30  | `/api/admin/organizations/:orgId/dealer-types/:id/permissions` | PUT    | Replace the entire feature set for this role template. Only features with status=ENABLED are available for assignment. All assigned features are replaced with the new set. Users get updated permissions on next login | ⏳ TODO |

---

## 6. User Management

Manage users within organizations. Invite new users to join a company, manage their roles and DealerTypes, view their effective permissions, and remove them when needed. Users exist globally but their organization access is managed here.

| #   | Endpoint                                                | Method | Description                                                                                                                                                                                                                         | Status  |
| --- | ------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 31  | `/api/admin/organizations/:orgId/users`                 | POST   | Invite a user to join this organization. If email is new, creates a User record. Creates UserAccess with specified role, partnerType, and dealerTypeId. If partnerType is EXTERNAL, a branch org is created. Sends invitation email | ⏳ TODO |
| 32  | `/api/admin/organizations/:orgId/users`                 | GET    | List all users who have access to this organization. Shows name, email, role, assigned DealerType, partnerType, last login. Filter by role, DealerType, or search by name/email. Includes pending invitations                       | ⏳ TODO |
| 33  | `/api/admin/organizations/:orgId/users/:id`             | GET    | Get detailed view of a user's access in this organization - their UserAccess record, assigned DealerType with all features, effective permissions list, and activity history within this org                                        | ⏳ TODO |
| 34  | `/api/admin/organizations/:orgId/users/:id`             | PATCH  | Modify user's organization access - change their role (COMPANY_STAFF→COMPANY_SUPER_ADMIN), update partnerType, or assign different DealerType. Cannot change partnerType if it conflicts with org structure                         | ⏳ TODO |
| 35  | `/api/admin/organizations/:orgId/users/:id`             | DELETE | Remove user from this organization (soft delete UserAccess). User's global account remains active. All historical data (products, claims) created by this user is preserved. User can be re-invited later                           | ⏳ TODO |
| 36  | `/api/admin/organizations/:orgId/users/:id/permissions` | GET    | View the effective permissions this user has in the organization. Resolved from their DealerType's assigned features. If COMPANY_SUPER_ADMIN, shows "FULL_ACCESS". Grouped by module for easy review                                | ⏳ TODO |
| 37  | `/api/admin/organizations/:orgId/users/:id/dealer-type` | PATCH  | Change which DealerType (role template) this user is assigned to. This replaces all their permissions with the new DealerType's feature set. Changes take effect on next token refresh or re-login                                  | ⏳ TODO |

---

## Summary

| Module       | APIs   | Purpose                                                  |
| ------------ | ------ | -------------------------------------------------------- |
| Organization | 6      | Onboard companies, manage hierarchy, invite super admins |
| Feature      | 6      | Build permission tree (modules + permissions)            |
| Brand        | 5      | Manage product brands per organization                   |
| Category     | 6      | Manage hierarchical product categories per org           |
| Dealer Type  | 7      | Create role templates with feature assignments           |
| User         | 7      | Invite users, manage roles, control permissions          |
| **TOTAL**    | **37** |                                                          |

---

## Request/Response Examples

### 1. Create Organization

```bash
POST /api/admin/organizations
Authorization: Bearer <admin-jwt>

Request:
{
  "name": "TechServe India",
  "companyName": "TechServe India Private Limited",
  "slug": "techserve",
  "type": "ROOT",
  "logo": "https://s3.amazonaws.com/bucket/logos/techserve.png"
}

Response: 201 Created
{
  "id": "org-uuid-123",
  "name": "TechServe India",
  "companyName": "TechServe India Private Limited",
  "slug": "techserve",
  "type": "ROOT",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. Create Feature (Module)

```bash
POST /api/admin/features

Request:
{
  "name": "Brand Management",
  "code": "brand",
  "description": "Module for managing product brands",
  "icon": "package",
  "parentId": null,
  "sortOrder": 1
}

Response: 201 Created
{
  "id": "feature-uuid-456",
  "name": "Brand Management",
  "code": "brand",
  "status": "COMING_SOON",
  "children": []
}
```

### 3. Create Feature (Permission under Module)

```bash
POST /api/admin/features

Request:
{
  "name": "Create Brand",
  "code": "brand:create",
  "description": "Allows user to create new brands",
  "parentId": "feature-uuid-456",
  "sortOrder": 1
}

Response: 201 Created
{
  "id": "feature-uuid-789",
  "name": "Create Brand",
  "code": "brand:create",
  "parentId": "feature-uuid-456",
  "status": "COMING_SOON"
}
```

### 4. Assign Permissions to Dealer Type

```bash
PUT /api/admin/organizations/org-123/dealer-types/dt-123/permissions

Request:
{
  "featureIds": [
    "feature-uuid-789",
    "feature-uuid-790",
    "feature-uuid-791"
  ]
}

Response: 200 OK
{
  "message": "Permissions updated successfully",
  "assignedFeatures": 3
}
```

### 5. Invite User to Organization

```bash
POST /api/admin/organizations/org-123/users

Request:
{
  "email": "raj.sharma@techserve.com",
  "firstName": "Raj",
  "lastName": "Sharma",
  "role": "COMPANY_STAFF",
  "partnerType": "INTERNAL",
  "dealerTypeId": "dt-123"
}

Response: 201 Created
{
  "userId": "user-uuid-999",
  "email": "raj.sharma@techserve.com",
  "fullName": "Raj Sharma",
  "role": "COMPANY_STAFF",
  "dealerType": "Support Agent",
  "invitationSent": true
}
```

---

### Status Badge Legend

| Badge   | Meaning                      |
| ------- | ---------------------------- |
| ⏳ TODO | Not yet implemented          |
| ✅ DONE | Fully implemented and tested |
| 🚧 WIP  | Currently in progress        |
