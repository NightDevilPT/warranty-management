# Complete Warranty Management System (WMS) API Documentation

---

## Database Tables Overview

| #   | Table              | Purpose                                                  |
| --- | ------------------ | -------------------------------------------------------- |
| 1   | `User`             | Global user accounts                                     |
| 2   | `UserAccess`       | User ↔ Organization membership + role + dealerType      |
| 3   | `Organization`     | Companies/tenants with hierarchy (ROOT/BRANCH)           |
| 4   | `DealerType`       | Company-defined role templates                           |
| 5   | `Feature`          | Feature/module hierarchy tree                            |
| 6   | `FeatureAccess`    | Feature assignments per user per org (always has userId) |
| 7   | `Category`         | Product categories (hierarchical)                        |
| 8   | `Brand`            | Product brands/manufacturers                             |
| 9   | `FormSchema`       | Dynamic form blueprints                                  |
| 10  | `FormData`         | Form submissions                                         |
| 11  | `WarrantyTemplate` | Warranty rules engine                                    |
| 12  | `Warranty`         | Customer warranties                                      |
| 13  | `OtpVerification`  | OTP codes                                                |

---

## MODULE 1: Auth (Authentication) - ✅ COMPLETED

| #   | API Endpoint                   | Method | Description                          | Auth | Allowed Roles     | Status  |
| --- | ------------------------------ | ------ | ------------------------------------ | ---- | ----------------- | ------- |
| 1   | `/api/auth/send-otp`           | POST   | Request OTP for login/verify         | No   | Public            | ✅ DONE |
| 2   | `/api/auth/verify-otp`         | POST   | Verify OTP & login                   | No   | Public            | ✅ DONE |
| 3   | `/api/auth/login`              | POST   | Email/password or passwordless login | No   | Public            | ✅ DONE |
| 4   | `/api/auth/logout`             | POST   | Logout & clear cookies               | Yes  | All Authenticated | ✅ DONE |
| 5   | `/api/auth/me`                 | GET    | Get current user profile             | Yes  | All Authenticated | ✅ DONE |
| 6   | `/api/auth/me`                 | PATCH  | Update current user profile          | Yes  | All Authenticated | ✅ DONE |
| 7   | `/api/auth/me/profile-picture` | POST   | Upload current user profile picture  | Yes  | All Authenticated | ✅ DONE |

---

## MODULE 2: User (User Management) - ✅ COMPLETED

| #   | API Endpoint                    | Method | Description                         | Auth | Allowed Roles     | Status  |
| --- | ------------------------------- | ------ | ----------------------------------- | ---- | ----------------- | ------- |
| 6   | `/api/users`                    | POST   | Create new user (Admin only)        | Yes  | `ADMIN`           | ✅ DONE |
| 7   | `/api/users/me`                 | GET    | Get current user profile            | Yes  | All Authenticated | ✅ DONE |
| 8   | `/api/users/me`                 | PATCH  | Update current user profile         | Yes  | All Authenticated | ✅ DONE |
| 9   | `/api/users/me/profile-picture` | POST   | Upload current user profile picture | Yes  | All Authenticated | ✅ DONE |
| 10  | `/api/users/me/password`        | PATCH  | Change own password                 | Yes  | All Authenticated | ✅ DONE |

---

## MODULE 3: Organization (Company Management - Admin)

| #   | API Endpoint                           | Method | Description                               | Auth | Allowed Roles | Status  |
| --- | -------------------------------------- | ------ | ----------------------------------------- | ---- | ------------- | ------- |
| 10  | `/api/admin/organizations`             | POST   | Create ROOT organization                  | Yes  | `ADMIN`       | ✅ DONE |
| 11  | `/api/admin/organizations`             | GET    | List all organizations (search, paginate) | Yes  | `ADMIN`       | ✅ DONE |
| 12  | `/api/admin/organizations/:orgId`      | GET    | Get organization by ID                    | Yes  | `ADMIN`       | ✅ DONE |
| 13  | `/api/admin/organizations/:orgId`      | PATCH  | Update organization                       | Yes  | `ADMIN`       | ✅ DONE |
| 14  | `/api/admin/organizations/:orgId/logo` | POST   | Upload organization logo                  | Yes  | `ADMIN`       | ✅ DONE |

---

## MODULE 4: Feature (Permission/Module Management - Admin)

| #   | API Endpoint                            | Method | Description                      | Auth | Allowed Roles | Status  |
| --- | --------------------------------------- | ------ | -------------------------------- | ---- | ------------- | ------- |
| 15  | `/api/admin/features`                   | POST   | Create feature/module            | Yes  | `ADMIN`       | ✅ DONE |
| 16  | `/api/admin/features/tree`              | GET    | Get full feature tree hierarchy  | Yes  | `ADMIN`       | ✅ DONE |
| 17  | `/api/admin/features`                   | GET    | List features (search, paginate) | Yes  | `ADMIN`       | ✅ DONE |
| 18  | `/api/admin/features/:featureId`        | GET    | Get feature by ID with children  | Yes  | `ADMIN`       | ✅ DONE |
| 19  | `/api/admin/features/:featureId`        | PATCH  | Update feature                   | Yes  | `ADMIN`       | ✅ DONE |
| 20  | `/api/admin/features/:featureId/status` | PATCH  | Update feature status            | Yes  | `ADMIN`       | ✅ DONE |

---

## MODULE 5: FeatureAccess (Assign Features to Users)

| #   | API Endpoint                                                  | Method | Description                          | Auth | Allowed Roles                  | Status |
| --- | ------------------------------------------------------------- | ------ | ------------------------------------ | ---- | ------------------------------ | ------ |
| 21  | `/api/admin/organizations/:orgId/users/:userId/features`      | POST   | Assign features to user in org       | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | TODO   |
| 22  | `/api/admin/organizations/:orgId/users/:userId/features`      | GET    | Get user's features in org           | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | TODO   |
| 23  | `/api/admin/organizations/:orgId/users/:userId/features/bulk` | POST   | Bulk assign features from DealerType | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | TODO   |

---

## MODULE 6: DealerType (Role Templates - Company)

| #   | API Endpoint                            | Method | Description                        | Auth | Allowed Roles                          | Status |
| --- | --------------------------------------- | ------ | ---------------------------------- | ---- | -------------------------------------- | ------ |
| 24  | `/api/:slug/dealer-types`               | POST   | Create DealerType for organization | Yes  | `COMPANY_SUPER_ADMIN`                  | TODO   |
| 25  | `/api/:slug/dealer-types`               | GET    | List DealerTypes in organization   | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | TODO   |
| 26  | `/api/:slug/dealer-types/:dealerTypeId` | GET    | Get DealerType by ID               | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | TODO   |
| 27  | `/api/:slug/dealer-types/:dealerTypeId` | PATCH  | Update DealerType                  | Yes  | `COMPANY_SUPER_ADMIN`                  | TODO   |
| 28  | `/api/:slug/dealer-types/:dealerTypeId` | DELETE | Delete DealerType                  | Yes  | `COMPANY_SUPER_ADMIN`                  | TODO   |

---

## MODULE 7: Category (Product Categories - Admin)

| #   | API Endpoint                        | Method | Description                        | Auth | Allowed Roles                  | Status  |
| --- | ----------------------------------- | ------ | ---------------------------------- | ---- | ------------------------------ | ------- |
| 29  | `/api/admin/categories`             | POST   | Create category                    | Yes  | `ADMIN`                        | ✅ DONE |
| 30  | `/api/admin/categories/tree`        | GET    | Get category tree hierarchy        | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | ✅ DONE |
| 31  | `/api/admin/categories`             | GET    | List categories (search, paginate) | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | ✅ DONE |
| 32  | `/api/admin/categories/:categoryId` | GET    | Get category by ID with children   | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | ✅ DONE |
| 33  | `/api/admin/categories/:categoryId` | PATCH  | Update category                    | Yes  | `ADMIN`                        | ✅ DONE |
| 34  | `/api/admin/categories/:categoryId` | DELETE | Delete category                    | Yes  | `ADMIN`                        | ✅ DONE |

---

## MODULE 8: Brand (Product Brands - Admin)

| #   | API Endpoint                 | Method | Description                    | Auth | Allowed Roles                  | Status  |
| --- | ---------------------------- | ------ | ------------------------------ | ---- | ------------------------------ | ------- |
| 35  | `/api/admin/brands`          | POST   | Create brand                   | Yes  | `ADMIN`                        | ✅ DONE |
| 36  | `/api/admin/brands`          | GET    | List brands (search, paginate) | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | ✅ DONE |
| 37  | `/api/admin/brands/:brandId` | GET    | Get brand by ID                | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | ✅ DONE |
| 38  | `/api/admin/brands/:brandId` | PATCH  | Update brand                   | Yes  | `ADMIN`                        | ✅ DONE |
| 39  | `/api/admin/brands/:brandId` | DELETE | Delete brand                   | Yes  | `ADMIN`                        | ✅ DONE |

---

## MODULE 9: Branch (Organization Hierarchy - Company)

| #   | API Endpoint           | Method | Description                         | Auth | Allowed Roles         | Status  |
| --- | ---------------------- | ------ | ----------------------------------- | ---- | --------------------- | ------- |
| 40  | `/api/:slug/branches`  | POST   | Create child branch organization    | Yes  | `COMPANY_SUPER_ADMIN` | ✅ DONE |
| 41  | `/api/:slug/branches`  | GET    | List branches under organization    | Yes  | `COMPANY_SUPER_ADMIN` | ✅ DONE |
| 42  | `/api/:slug/hierarchy` | GET    | Get full org tree (root + branches) | Yes  | `COMPANY_SUPER_ADMIN` | ✅ DONE |

---

## MODULE 10: OrgUser (User Management within Organization - Company)

| #   | API Endpoint                                             | Method | Description                                   | Auth | Allowed Roles                          | Status  |
| --- | -------------------------------------------------------- | ------ | --------------------------------------------- | ---- | -------------------------------------- | ------- |
| 43  | `/api/admin/organizations/:orgId/users`                  | POST   | Invite/add user to org (with role + features) | Yes  | `COMPANY_SUPER_ADMIN`                  | ✅ DONE |
| 44  | `/api/admin/organizations/:orgId/users`                  | GET    | List users in organization                    | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | ✅ DONE |
| 45  | `/api/admin/organizations/:orgId/users/:userId`          | GET    | Get user detail in organization               | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | ✅ DONE |
| 46  | `/api/admin/organizations/:orgId/users/:userId`          | PATCH  | Update user role/access in org                | Yes  | `COMPANY_SUPER_ADMIN`                  | ✅ DONE |
| 47  | `/api/admin/organizations/:orgId/users/:userId`          | DELETE | Remove user from organization                 | Yes  | `COMPANY_SUPER_ADMIN`                  | ✅ DONE |
| 48  | `/api/admin/organizations/:orgId/users/:userId/features` | GET    | Get user's features in org                    | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | ✅ DONE |
| 49  | `/api/admin/organizations/:orgId/me/permissions`         | GET    | Get current user's permissions in org         | Yes  | All Authenticated                      | ✅ DONE |

---

## MODULE 12: FormSchema (Form Blueprints - Admin)

| #   | API Endpoint                   | Method | Description                  | Auth | Allowed Roles | Status |
| --- | ------------------------------ | ------ | ---------------------------- | ---- | ------------- | ------ |
| 50  | `/api/admin/schemas`           | POST   | Create form schema blueprint | Yes  | `ADMIN`       | TODO   |
| 51  | `/api/admin/schemas`           | GET    | List all form schemas        | Yes  | `ADMIN`       | TODO   |
| 52  | `/api/admin/schemas/:schemaId` | GET    | Get form schema by ID        | Yes  | `ADMIN`       | TODO   |
| 53  | `/api/admin/schemas/:schemaId` | PATCH  | Update form schema           | Yes  | `ADMIN`       | TODO   |

---

## MODULE 13: FormData (Form Submissions - Company)

| #   | API Endpoint                         | Method | Description                     | Auth | Allowed Roles                          | Status |
| --- | ------------------------------------ | ------ | ------------------------------- | ---- | -------------------------------------- | ------ |
| 54  | `/api/:slug/schemas/:type`           | GET    | Get active schema for form type | Yes  | All Authenticated                      | TODO   |
| 55  | `/api/:slug/forms/:type`             | POST   | Submit form data                | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | TODO   |
| 56  | `/api/:slug/forms/:type`             | GET    | List form submissions           | Yes  | All Authenticated                      | TODO   |
| 57  | `/api/:slug/forms/:type/:formDataId` | GET    | Get form record detail          | Yes  | All Authenticated                      | TODO   |
| 58  | `/api/:slug/forms/:type/:formDataId` | PATCH  | Update form record              | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | TODO   |

---

## MODULE 14: WarrantyTemplate (Warranty Rules - Admin)

| #   | API Endpoint                       | Method | Description                 | Auth | Allowed Roles | Status |
| --- | ---------------------------------- | ------ | --------------------------- | ---- | ------------- | ------ |
| 59  | `/api/admin/templates`             | POST   | Create warranty template    | Yes  | `ADMIN`       | TODO   |
| 60  | `/api/admin/templates`             | GET    | List warranty templates     | Yes  | `ADMIN`       | TODO   |
| 61  | `/api/admin/templates/:templateId` | GET    | Get warranty template by ID | Yes  | `ADMIN`       | TODO   |
| 62  | `/api/admin/templates/:templateId` | PATCH  | Update warranty template    | Yes  | `ADMIN`       | TODO   |

---

## MODULE 15: Warranty & Registration (Company)

| #   | API Endpoint                               | Method | Description                                   | Auth | Allowed Roles     | Status |
| --- | ------------------------------------------ | ------ | --------------------------------------------- | ---- | ----------------- | ------ |
| 63  | `/api/:slug/templates`                     | GET    | List org warranty templates                   | Yes  | All Authenticated | TODO   |
| 64  | `/api/:slug/registrations`                 | POST   | Submit registration & trigger warranty engine | Yes  | All Authenticated | TODO   |
| 65  | `/api/:slug/registrations`                 | GET    | List registrations                            | Yes  | All (own data)    | TODO   |
| 66  | `/api/:slug/registrations/:registrationId` | GET    | Get registration detail                       | Yes  | All (own data)    | TODO   |
| 67  | `/api/:slug/warranties`                    | GET    | List evaluated warranties                     | Yes  | All (own data)    | TODO   |
| 68  | `/api/:slug/warranties/:warrantyId`        | GET    | View warranty detail snapshot                 | Yes  | All (own data)    | TODO   |

---

## MODULE 16: Claims (Company)

| #   | API Endpoint                        | Method | Description                  | Auth | Allowed Roles                          | Status |
| --- | ----------------------------------- | ------ | ---------------------------- | ---- | -------------------------------------- | ------ |
| 69  | `/api/:slug/claims`                 | POST   | Initiate a claim             | Yes  | All Authenticated                      | TODO   |
| 70  | `/api/:slug/claims`                 | GET    | List claims                  | Yes  | All (own data)                         | TODO   |
| 71  | `/api/:slug/claims/:claimId`        | GET    | Get claim detail             | Yes  | All (own data)                         | TODO   |
| 72  | `/api/:slug/claims/:claimId/status` | PATCH  | Update claim workflow status | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | TODO   |

---

## MODULE 17: File (File Services)

| #   | API Endpoint        | Method | Description         | Auth | Allowed Roles                  | Status |
| --- | ------------------- | ------ | ------------------- | ---- | ------------------------------ | ------ |
| 73  | `/api/files/upload` | POST   | Upload file to S3   | Yes  | All Authenticated              | TODO   |
| 74  | `/api/files/:key`   | DELETE | Delete file from S3 | Yes  | `ADMIN`, `COMPANY_SUPER_ADMIN` | TODO   |

---

## Summary by Module

| #         | Module                  | APIs   | Status         |
| --------- | ----------------------- | ------ | -------------- |
| 1         | Auth                    | 5      | ⏳ 5 TODO      |
| 2         | User                    | 4      | ⏳ 4 TODO      |
| 3         | Organization            | 5      | ⏳ 5 TODO      |
| 4         | Feature                 | 6      | ⏳ 6 TODO      |
| 5         | FeatureAccess           | 3      | ⏳ 3 TODO      |
| 6         | DealerType              | 5      | ⏳ 5 TODO      |
| 7         | Category                | 6      | ⏳ 6 TODO      |
| 8         | Brand                   | 5      | ⏳ 5 TODO      |
| 9         | Branch                  | 3      | ⏳ 3 TODO      |
| 10        | OrgUser                 | 6      | ⏳ 6 TODO      |
| 11        | Permission              | 1      | ⏳ 1 TODO      |
| 12        | FormSchema              | 4      | ⏳ 4 TODO      |
| 13        | FormData                | 5      | ⏳ 5 TODO      |
| 14        | WarrantyTemplate        | 4      | ⏳ 4 TODO      |
| 15        | Warranty & Registration | 6      | ⏳ 6 TODO      |
| 16        | Claims                  | 4      | ⏳ 4 TODO      |
| 17        | File                    | 2      | ⏳ 2 TODO      |
| **TOTAL** | **17 Modules**          | **74** | **⏳ 74 TODO** |

---

**Order to build:**

1. **Auth** → Login system
2. **User** → User CRUD
3. **Organization** → Company management
4. **Feature** → Permission tree
5. **FeatureAccess** → Assign features to users
6. **DealerType** → Role templates
7. **Category + Brand** → Product metadata
8. **Branch** → Organization hierarchy
9. **OrgUser** → User management in org
10. **Permission** → Current user permissions
11. **FormSchema + FormData** → Dynamic forms
12. **WarrantyTemplate + Warranty** → Warranty system
13. **Claims** → Claims management
14. **File** → File upload/delete
