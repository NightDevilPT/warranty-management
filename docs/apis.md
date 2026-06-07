# Complete Warranty Management System (WMS) API Documentation

---

## PRIORITY 1: Authentication & User Profiles (Week 1) ✅ COMPLETED

### Tables Used: `User`, `OtpVerification`

| #   | API Endpoint                    | Method | Description                          | Auth | Allowed Roles     | Status  |
| --- | ------------------------------- | ------ | ------------------------------------ | ---- | ----------------- | ------- |
| 1   | `/api/auth/send-otp`            | POST   | Request OTP for login/verify         | No   | Public            | ✅ DONE |
| 2   | `/api/auth/verify-otp`          | POST   | Verify OTP & login                   | No   | Public            | ✅ DONE |
| 3   | `/api/auth/login`               | POST   | Email/password or passwordless login | No   | Public            | ✅ DONE |
| 4   | `/api/auth/refresh`             | POST   | Refresh access token                 | No   | Public            | ✅ DONE |
| 5   | `/api/auth/logout`              | POST   | Logout & clear cookies               | Yes  | All Authenticated | ✅ DONE |
| 6   | `/api/users`                    | POST   | Create new user (Admin only)         | Yes  | `ADMIN`           | ✅ DONE |
| 7   | `/api/users/me`                 | GET    | Get current user profile             | Yes  | All Authenticated | ✅ DONE |
| 8   | `/api/users/me`                 | PATCH  | Update user profile                  | Yes  | All Authenticated | ✅ DONE |
| 9   | `/api/users/me/profile-picture` | POST   | Upload profile picture               | Yes  | All Authenticated | ✅ DONE |

---

## PRIORITY 2: System Admin Core Configuration (Week 2) 🟡 IN PROGRESS

### Tables Used: `Organization`, `Feature`, `OrganizationFeature`

| #   | API Endpoint                               | Method | Description                                          | Auth | Allowed Roles | Status  |
| --- | ------------------------------------------ | ------ | ---------------------------------------------------- | ---- | ------------- | ------- |
| 10  | `/api/admin/organizations`                 | POST   | Create ROOT organization                             | Yes  | `ADMIN`       | ✅ DONE |
| 11  | `/api/admin/organizations`                 | GET    | List all organizations (search, paginate)            | Yes  | `ADMIN`       | ✅ DONE |
| 12  | `/api/admin/organizations/:orgId`          | GET    | Get organization with feature tree                   | Yes  | `ADMIN`       | ✅ DONE |
| 13  | `/api/admin/organizations/:orgId/features` | POST   | Assign/toggle feature for organization               | Yes  | `ADMIN`       | ✅ DONE |
| 14  | `/api/admin/features`                      | POST   | Create feature/module                                | Yes  | `ADMIN`       | ✅ DONE |
| 15  | `/api/admin/features/tree`                 | GET    | Get full feature tree hierarchy                      | Yes  | `ADMIN`       | ✅ DONE |
| 16  | `/api/admin/features`                      | GET    | List features with search & pagination               | Yes  | `ADMIN`       | ✅ DONE |
| 17  | `/api/admin/features/:id`                  | GET    | Get feature by ID with children                      | Yes  | `ADMIN`       | ✅ DONE |
| 18  | `/api/admin/features/:id/status`           | PATCH  | Update feature status (ENABLED/DISABLED/COMING_SOON) | Yes  | `ADMIN`       | ✅ DONE |

### Tables Used: `Persona`, `FormSchema`, `WarrantyTemplate`

| #   | API Endpoint              | Method | Description                     | Auth | Allowed Roles | Status     |
| --- | ------------------------- | ------ | ------------------------------- | ---- | ------------- | ---------- |
| 19  | `/api/admin/personas`     | POST   | Create global atomic permission | Yes  | `ADMIN`       | ⏳ PENDING |
| 20  | `/api/admin/personas`     | GET    | List all global personas        | Yes  | `ADMIN`       | ⏳ PENDING |
| 21  | `/api/admin/personas/:id` | PATCH  | Toggle persona on/off           | Yes  | `ADMIN`       | ⏳ PENDING |
| 22  | `/api/admin/schemas`      | POST   | Create master form blueprints   | Yes  | `ADMIN`       | ⏳ PENDING |
| 23  | `/api/admin/templates`    | POST   | Create warranty rule templates  | Yes  | `ADMIN`       | ⏳ PENDING |

---

## PRIORITY 3: Tenant & Branch Management (Week 3)

### Tables Used: `Organization`, `OrganizationPersona`

| #   | API Endpoint              | Method | Description               | Auth | Allowed Roles         | Status     |
| --- | ------------------------- | ------ | ------------------------- | ---- | --------------------- | ---------- |
| 24  | `/api/:slug/branches`     | POST   | Create child branch org   | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |
| 25  | `/api/:slug/hierarchy`    | GET    | Get parent-child org tree | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |
| 26  | `/api/:slug/personas`     | POST   | Assign personas to branch | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |
| 27  | `/api/:slug/personas/:id` | PATCH  | Toggle persona for branch | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |

---

## PRIORITY 4: Roles & Permissions (Week 4)

### Tables Used: `DealerType`, `DealerTypePersona`, `UserAccess`, `DealerPersona`

| #   | API Endpoint                           | Method | Description                   | Auth | Allowed Roles                          | Status     |
| --- | -------------------------------------- | ------ | ----------------------------- | ---- | -------------------------------------- | ---------- |
| 28  | `/api/:slug/dealer-types`              | POST   | Create custom role            | Yes  | `COMPANY_SUPER_ADMIN`                  | ⏳ PENDING |
| 29  | `/api/:slug/dealer-types`              | GET    | List available roles          | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | ⏳ PENDING |
| 30  | `/api/:slug/dealer-types/:id/personas` | PATCH  | Link personas to role         | Yes  | `COMPANY_SUPER_ADMIN`                  | ⏳ PENDING |
| 31  | `/api/:slug/users`                     | POST   | Invite user & assign role     | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | ⏳ PENDING |
| 32  | `/api/:slug/permissions/me`            | GET    | Get user's active permissions | Yes  | All Authenticated                      | ⏳ PENDING |

---

## PRIORITY 5: Dynamic Forms & Data (Week 5)

### Tables Used: `FormSchema`, `FormData`

| #   | API Endpoint                 | Method | Description                 | Auth | Allowed Roles                                             | Status     |
| --- | ---------------------------- | ------ | --------------------------- | ---- | --------------------------------------------------------- | ---------- |
| 33  | `/api/:slug/schemas/:type`   | GET    | Get active schema blueprint | Yes  | All Authenticated                                         | ⏳ PENDING |
| 34  | `/api/:slug/forms/:type`     | POST   | Submit dynamic form         | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |
| 35  | `/api/:slug/forms/:type`     | GET    | List submitted records      | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`, `COMPANY_PARTNER` | ⏳ PENDING |
| 36  | `/api/:slug/forms/:type/:id` | GET    | Get record detail           | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`, `COMPANY_PARTNER` | ⏳ PENDING |
| 37  | `/api/:slug/forms/:type/:id` | PATCH  | Update record               | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |

---

## PRIORITY 6: Warranties & Claims (Week 6)

### Tables Used: `FormData`, `Warranty`, `WarrantyTemplate`

| #   | API Endpoint                   | Method | Description                                   | Auth | Allowed Roles                                             | Status     |
| --- | ------------------------------ | ------ | --------------------------------------------- | ---- | --------------------------------------------------------- | ---------- |
| 38  | `/api/:slug/templates`         | GET    | List warranty templates                       | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |
| 39  | `/api/:slug/registrations`     | POST   | Submit registration & trigger warranty engine | Yes  | All Authenticated                                         | ⏳ PENDING |
| 40  | `/api/:slug/registrations`     | GET    | List registrations                            | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 41  | `/api/:slug/warranties`        | GET    | List evaluated warranties                     | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 42  | `/api/:slug/warranties/:id`    | GET    | View warranty snapshot                        | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 43  | `/api/:slug/claims`            | POST   | Initiate claim                                | Yes  | All Authenticated                                         | ⏳ PENDING |
| 44  | `/api/:slug/claims`            | GET    | List claims                                   | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 45  | `/api/:slug/claims/:id/status` | PATCH  | Update claim status                           | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`, `COMPANY_PARTNER` | ⏳ PENDING |

---

## PRIORITY 7: File Services (Week 7)

### Tables Used: None (AWS S3)

| #   | API Endpoint        | Method | Description         | Auth | Allowed Roles                          | Status     |
| --- | ------------------- | ------ | ------------------- | ---- | -------------------------------------- | ---------- |
| 46  | `/api/files/upload` | POST   | Upload file to S3   | Yes  | All Authenticated                      | ⏳ PENDING |
| 47  | `/api/files/:key`   | DELETE | Delete file from S3 | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | ⏳ PENDING |

---

## Summary

| Priority  | Category                       | APIs   | Status                         |
| --------- | ------------------------------ | ------ | ------------------------------ |
| 1         | Authentication & User Profiles | 9      | ✅ 9 DONE                      |
| 2         | System Admin Core              | 14     | ✅ 9 DONE / ⏳ 5 PENDING       |
| 3         | Tenant & Branch                | 4      | ⏳ 4 PENDING                   |
| 4         | Roles & Permissions            | 5      | ⏳ 5 PENDING                   |
| 5         | Dynamic Forms & Data           | 5      | ⏳ 5 PENDING                   |
| 6         | Warranties & Claims            | 8      | ⏳ 8 PENDING                   |
| 7         | File Services                  | 2      | ⏳ 2 PENDING                   |
| **TOTAL** |                                | **47** | **✅ 18 Done / ⏳ 29 Pending** |
