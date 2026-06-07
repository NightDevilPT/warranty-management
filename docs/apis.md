You are completely right, and I apologize for the confusion. I tried to force your code to match my naming convention (`otp/request`) instead of updating the documentation to match the excellent code you already wrote (`send-otp`).

As the developer, your route naming (`/api/auth/send-otp` and `/api/auth/verify-otp`) is perfectly valid and standard. I have updated the master API documentation below to reflect **your exact endpoints** and properly marked them as **✅ DONE**.

Here is your updated, accurate master document:

---

# Complete Warranty Management System (WMS) API Documentation

---

## PRIORITY 1: Authentication & User Profiles (Week 1)

### Tables Used: `User`, `OtpVerification`

| Priority | API Endpoint           | Method | Description                             | Tables Used           | Auth | Allowed Roles     | Status         |
| -------- | ---------------------- | ------ | --------------------------------------- | --------------------- | ---- | ----------------- | -------------- |
| 1        | `/api/auth/send-otp`   | POST   | Request OTP for login/verify            | OtpVerification, User | No   | Public            | ✅ DONE        |
| 2        | `/api/auth/verify-otp` | POST   | Verify OTP & validate user              | OtpVerification, User | No   | Public            | ✅ DONE        |
| 3        | `/api/auth/login`      | POST   | Standard email/password login           | User                  | No   | Public            | ✅ DONE        |
| 4        | `/api/auth/signup`     | POST   | Register new consumer account           | User                  | No   | Public            | ⏳ PENDING     |
| 5        | `/api/auth/refresh`    | POST   | Exchange refresh token for access token | None                  | No   | Public            | ✅ DONE        |
| 6        | `/api/auth/logout`     | POST   | Logout user & invalidate session        | None                  | Yes  | All Authenticated | ✅ DONE        |
| 7        | `/api/users/me`        | GET    | Get current user profile                | User                  | Yes  | All Authenticated | 🟡 IN PROGRESS |
| 8        | `/api/users/me`        | PUT    | Update user profile info                | User                  | Yes  | All Authenticated | 🟡 IN PROGRESS |

---

## PRIORITY 2: System Admin Core Configuration & Onboarding (Week 2)

_These endpoints are strictly for the platform `ADMIN`. This is where schemas and warranty templates are generated for a company._

### Tables Used: `Organization`, `Persona`, `FormSchema`, `WarrantyTemplate`

| Priority | API Endpoint                           | Method | Description                                 | Tables Used      | Auth | Allowed Roles | Status     |
| -------- | -------------------------------------- | ------ | ------------------------------------------- | ---------------- | ---- | ------------- | ---------- |
| 9        | `/api/admin/organizations`             | POST   | Create `ROOT` organization                  | Organization     | Yes  | `ADMIN`       | ⏳ PENDING |
| 10       | `/api/admin/organizations`             | GET    | List all onboarded tenants                  | Organization     | Yes  | `ADMIN`       | ⏳ PENDING |
| 11       | `/api/admin/organizations/:id/modules` | PATCH  | Toggle company features/modules             | Organization     | Yes  | `ADMIN`       | ⏳ PENDING |
| 12       | `/api/admin/personas`                  | POST   | Create global atomic permission             | Persona          | Yes  | `ADMIN`       | ⏳ PENDING |
| 13       | `/api/admin/personas`                  | GET    | List all global personas                    | Persona          | Yes  | `ADMIN`       | ⏳ PENDING |
| 14       | `/api/admin/personas/:id`              | PATCH  | Globally toggle a persona on/off            | Persona          | Yes  | `ADMIN`       | ⏳ PENDING |
| 15       | `/api/admin/schemas`                   | POST   | Create master form blueprints for a tenant  | FormSchema       | Yes  | `ADMIN`       | ⏳ PENDING |
| 16       | `/api/admin/templates`                 | POST   | Create warranty rule templates for a tenant | WarrantyTemplate | Yes  | `ADMIN`       | ⏳ PENDING |

---

## PRIORITY 3: Tenant & Branch Management (Week 3)

### Tables Used: `Organization`, `OrganizationPersona`

| Priority | API Endpoint              | Method | Description                         | Tables Used         | Auth | Allowed Roles         | Status     |
| -------- | ------------------------- | ------ | ----------------------------------- | ------------------- | ---- | --------------------- | ---------- |
| 17       | `/api/:slug/branches`     | POST   | Create child branch org (Dealer)    | Organization        | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |
| 18       | `/api/:slug/hierarchy`    | GET    | Get parent-child org tree           | Organization        | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |
| 19       | `/api/:slug/personas`     | POST   | Assign inherited personas to branch | OrganizationPersona | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |
| 20       | `/api/:slug/personas/:id` | PATCH  | Toggle assigned persona for branch  | OrganizationPersona | Yes  | `COMPANY_SUPER_ADMIN` | ⏳ PENDING |

---

## PRIORITY 4: Roles & Permissions (Week 4)

_Note: `COMPANY_STAFF` and `COMPANY_PARTNER` access to operational endpoints is dynamically restricted by the personas attached to their `DealerType`._

### Tables Used: `DealerType`, `DealerTypePersona`, `UserAccess`, `DealerPersona`

| Priority | API Endpoint                           | Method | Description                          | Tables Used               | Auth | Allowed Roles                                             | Status     |
| -------- | -------------------------------------- | ------ | ------------------------------------ | ------------------------- | ---- | --------------------------------------------------------- | ---------- |
| 21       | `/api/:slug/dealer-types`              | POST   | Create custom role (e.g., Installer) | DealerType                | Yes  | `COMPANY_SUPER_ADMIN`                                     | ⏳ PENDING |
| 22       | `/api/:slug/dealer-types`              | GET    | List available roles                 | DealerType                | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |
| 23       | `/api/:slug/dealer-types/:id/personas` | PATCH  | Link atomic personas to role         | DealerTypePersona         | Yes  | `COMPANY_SUPER_ADMIN`                                     | ⏳ PENDING |
| 24       | `/api/:slug/users`                     | POST   | Invite user & assign DealerType      | UserAccess, DealerPersona | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |
| 25       | `/api/:slug/permissions/me`            | GET    | Resolve user's active permissions    | DealerPersona, OrgPersona | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`, `COMPANY_PARTNER` | ⏳ PENDING |

---

## PRIORITY 5: Dynamic Forms & Data (Week 5)

_Company users only have read access to the schemas created by the `ADMIN` in Priority 2. They use these to submit `FormData`._

### Tables Used: `FormSchema`, `FormData`

| Priority | API Endpoint                 | Method | Description                               | Tables Used | Auth | Allowed Roles                                             | Status     |
| -------- | ---------------------------- | ------ | ----------------------------------------- | ----------- | ---- | --------------------------------------------------------- | ---------- |
| 26       | `/api/:slug/schemas/:type`   | GET    | Fetch active schema blueprint             | FormSchema  | Yes  | All Authenticated                                         | ⏳ PENDING |
| 27       | `/api/:slug/forms/:type`     | POST   | Submit dynamic form (Product, Part, etc.) | FormData    | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |
| 28       | `/api/:slug/forms/:type`     | GET    | List submitted data records               | FormData    | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`, `COMPANY_PARTNER` | ⏳ PENDING |
| 29       | `/api/:slug/forms/:type/:id` | GET    | Get full details of specific record       | FormData    | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`, `COMPANY_PARTNER` | ⏳ PENDING |
| 30       | `/api/:slug/forms/:type/:id` | PATCH  | Update JSON payload of record             | FormData    | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |

---

## PRIORITY 6: Warranties & Claims (Week 6)

_Company users only have read access to warranty templates created by the `ADMIN`. Registrations trigger the warranty evaluation engine._

### Tables Used: `FormData`, `Warranty`, `WarrantyTemplate`

| Priority | API Endpoint                   | Method | Description                          | Tables Used        | Auth | Allowed Roles                                             | Status     |
| -------- | ------------------------------ | ------ | ------------------------------------ | ------------------ | ---- | --------------------------------------------------------- | ---------- |
| 31       | `/api/:slug/templates`         | GET    | List available warranty templates    | WarrantyTemplate   | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`                    | ⏳ PENDING |
| 32       | `/api/:slug/registrations`     | POST   | Submit Registration & trigger engine | FormData, Warranty | Yes  | `CONSUMER`, `COMPANY_STAFF`, `COMPANY_PARTNER`            | ⏳ PENDING |
| 33       | `/api/:slug/registrations`     | GET    | List registrations                   | FormData           | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 34       | `/api/:slug/warranties`        | GET    | List evaluated warranties            | Warranty           | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 35       | `/api/:slug/warranties/:id`    | GET    | View immutable warranty snapshot     | Warranty           | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 36       | `/api/:slug/claims`            | POST   | Initiate a claim                     | FormData           | Yes  | `CONSUMER`, `COMPANY_STAFF`, `COMPANY_PARTNER`            | ⏳ PENDING |
| 37       | `/api/:slug/claims`            | GET    | List claims for review               | FormData           | Yes  | All (Consumers see own)                                   | ⏳ PENDING |
| 38       | `/api/:slug/claims/:id/status` | PATCH  | Transition claim workflow status     | FormData           | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF`, `COMPANY_PARTNER` | ⏳ PENDING |

---

## PRIORITY 7: Global Services (Week 7)

### Tables Used: None (AWS S3)

| Priority | API Endpoint        | Method | Description                      | Tables Used | Auth | Allowed Roles                          | Status     |
| -------- | ------------------- | ------ | -------------------------------- | ----------- | ---- | -------------------------------------- | ---------- |
| 39       | `/api/files/upload` | POST   | Upload files to S3 (logos, docs) | None        | Yes  | All Authenticated                      | ⏳ PENDING |
| 40       | `/api/files/:key`   | DELETE | Remove a file from S3 storage    | None        | Yes  | `COMPANY_SUPER_ADMIN`, `COMPANY_STAFF` | ⏳ PENDING |

---

## Summary Table by Category

| Priority  | Category                        | APIs   | Tables Used                                              | Status                                       |
| --------- | ------------------------------- | ------ | -------------------------------------------------------- | -------------------------------------------- |
| 1         | Authentication & User Profiles  | 8      | User, OtpVerification                                    | 5 ✅ DONE / 1 ⏳ PEND / 2 🟡 PROG            |
| 2         | System Admin Core Configuration | 8      | Organization, Persona, FormSchema, WarrantyTemplate      | 8 ⏳ PENDING                                 |
| 3         | Tenant & Branch Management      | 4      | Organization, OrganizationPersona                        | 4 ⏳ PENDING                                 |
| 4         | Roles & Permissions             | 5      | DealerType, DealerTypePersona, UserAccess, DealerPersona | 5 ⏳ PENDING                                 |
| 5         | Dynamic Forms & Data            | 5      | FormSchema, FormData                                     | 5 ⏳ PENDING                                 |
| 6         | Warranties & Claims             | 8      | FormData, Warranty, WarrantyTemplate                     | 8 ⏳ PENDING                                 |
| 7         | Global Services                 | 2      | None (AWS S3)                                            | 2 ⏳ PENDING                                 |
| **TOTAL** |                                 | **40** |                                                          | **5 Completed / 2 In Progress / 33 Pending** |
