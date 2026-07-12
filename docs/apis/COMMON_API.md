Here's the complete API documentation in table format:

---

# WMS API Documentation - Common APIs (Authentication)

## Module: `auth`

## Base Path: `/api/auth`

## Portal Type: `:portalType` = `admin` | `company` | `consumer`

---

## API Endpoints

| #   | Method | Endpoint                           | Description                                                                                                                                                                                                                                                                          | Auth | Status  |
| --- | ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------- |
| 1   | POST   | `/api/auth/:portalType/send-otp`   | Send OTP for login. Generates 6-digit code, stores against UserAccess, sends via email/SMS. Admin: requires `{ email }`. Company/Consumer: requires `{ email, orgHash }`. Consumer auto-creates User + UserAccess if new. OTP expires in 10 minutes. Rate limited: 3/min/email       | No   | ⏳ TODO |
| 2   | POST   | `/api/auth/:portalType/verify-otp` | Verify OTP and get tokens. Validates OTP against specific UserAccess (matched by email + orgHash + portalType). Returns access token (1hr) + refresh token (30d). Admin: global scope. Company: org-scoped with permissions from DealerType. Consumer: org-scoped, empty permissions | No   | ⏳ TODO |
| 3   | POST   | `/api/auth/logout`                 | End current session. Blacklists refresh token, clears httpOnly cookies. Other active sessions remain valid                                                                                                                                                                           | Yes  | ⏳ TODO |
| 4   | GET    | `/api/auth/me`                     | Get current UserAccess profile. Returns profile fields (firstName, lastName, fullName, phone, profile), current org context with permissions, and list of all active UserAccess records across all orgs with their respective profiles                                               | Yes  | ⏳ TODO |
| 5   | PATCH  | `/api/auth/me`                     | Update profile for current org context only. Modifiable: firstName, lastName (auto-updates fullName), phoneNumber, profile. Phone change sets phoneVerified=false. Changes do NOT affect other org contexts                                                                          | Yes  | ⏳ TODO |
| 6   | PATCH  | `/api/auth/me/password`            | Change password for current org context only. Requires currentPassword. Password change does NOT affect other org contexts                                                                                                                                                           | Yes  | ⏳ TODO |

---

## Detailed API Specifications

---

### 1. Send OTP

| Field          | Value                            |
| -------------- | -------------------------------- |
| **Method**     | POST                             |
| **Endpoint**   | `/api/auth/:portalType/send-otp` |
| **Auth**       | No                               |
| **Rate Limit** | 3 requests per minute per email  |

**Path Parameters:**
| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| portalType | string | `admin`, `company`, `consumer` | Portal type for login |

**Request Body (Admin):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Admin email address |

**Request Body (Company):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address |
| orgHash | string | Yes | Organization public hash for routing |

**Request Body (Consumer):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address |
| orgHash | string | Yes | Organization public hash for routing |

**Success Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| message | string | Success message |
| expiresIn | number | OTP expiry in seconds (600) |
| isNewUser | boolean | (Consumer only) True if UserAccess was auto-created |

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 404 | Organization not found | Invalid orgHash |
| 404 | No account found with this email | User doesn't exist (admin/company) |
| 404 | No company access found for this organization | User exists but no UserAccess for this org+portalType |
| 429 | Too many requests. Please try again later | Rate limit exceeded |

**Business Logic:**

1. Find Organization by `orgHash` (skip for admin)
2. Find User by `email`
3. Admin: Validate User has ADMIN UserAccess
4. Company: Find UserAccess by `userId + orgId + portalType=company`
5. Consumer: Find or Create User, Find or Create UserAccess with `portalType=consumer`
6. Generate 6-digit numeric OTP
7. Store in OtpVerification linked to UserAccess (not User)
8. Send OTP via email/SMS
9. Return success

---

### 2. Verify OTP

| Field        | Value                              |
| ------------ | ---------------------------------- |
| **Method**   | POST                               |
| **Endpoint** | `/api/auth/:portalType/verify-otp` |
| **Auth**     | No                                 |

**Path Parameters:**
| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| portalType | string | `admin`, `company`, `consumer` | Portal type for login |

**Request Body (Admin):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Admin email address |
| otp | number | Yes | 6-digit OTP code |

**Request Body (Company):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address |
| otp | number | Yes | 6-digit OTP code |
| orgHash | string | Yes | Organization public hash |

**Request Body (Consumer):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address |
| otp | number | Yes | 6-digit OTP code |
| orgHash | string | Yes | Organization public hash |

**Success Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT access token (1 hour expiry) |
| refreshToken | string | JWT refresh token (30 days expiry) |
| user.id | string | UserAccess ID |
| user.email | string | User email (from User table) |
| user.fullName | string | Display name for this org context |
| user.role | string | Role in this org context |
| user.profile | string \| null | Profile picture URL |
| org.id | string | Organization ID |
| org.name | string | Organization display name |
| org.hash | string | Organization public hash |
| portalType | string | Portal type |
| permissions | string[] | Feature codes from DealerType (company only) |

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 404 | Organization not found | Invalid orgHash |
| 404 | No account found with this email | User doesn't exist |
| 404 | No {portalType} access found for this organization | UserAccess not found for org+portalType |
| 401 | Invalid or expired OTP | OTP wrong, expired, or already used |
| 409 | OTP already used | Replay attack detected |

**Business Logic:**

1. Find Organization by `orgHash`
2. Find User by `email`
3. Find UserAccess by `userId + orgId + portalType` (MUST match portal type from URL)
4. Find OtpVerification by `userAccessId + code + type=LOGIN`
5. Validate OTP: not expired, not used
6. Mark OTP as used (`isUsed = true`)
7. Resolve permissions:
   - COMPANY_SUPER_ADMIN: All FeatureAccess for org
   - COMPANY_STAFF/PARTNER: Features from DealerType
   - CONSUMER: Empty array
8. Generate tokens with UserAccess context
9. Set httpOnly cookies
10. Return tokens + user + org info

---

### 3. Logout

| Field        | Value              |
| ------------ | ------------------ |
| **Method**   | POST               |
| **Endpoint** | `/api/auth/logout` |
| **Auth**     | Yes (JWT required) |

**Request Body:** None

**Success Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| message | string | "Logged out successfully" |

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 401 | Unauthorized | Missing or invalid token |

**Business Logic:**

1. Extract refresh token from cookie
2. Add refresh token to blacklist
3. Clear httpOnly cookies (access + refresh)
4. Other active sessions remain valid

---

### 4. Get Current Profile

| Field        | Value              |
| ------------ | ------------------ |
| **Method**   | GET                |
| **Endpoint** | `/api/auth/me`     |
| **Auth**     | Yes (JWT required) |

**Request Body:** None

**Success Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Current UserAccess ID |
| email | string | User email (from User table) |
| phoneNumber | string \| null | Phone for this org context |
| firstName | string | First name for this org context |
| lastName | string | Last name for this org context |
| fullName | string | Display name for this org context |
| role | string | Role in this org context |
| profile | string \| null | Profile picture for this org context |
| emailVerified | boolean | Email verification status |
| phoneVerified | boolean | Phone verification status |
| currentOrg.orgId | string | Current organization ID |
| currentOrg.orgHash | string | Current organization hash |
| currentOrg.orgName | string | Current organization name |
| currentOrg.portalType | string | Current portal type |
| currentOrg.role | string | Current role |
| currentOrg.permissions | string[] | Current feature permissions |
| availableOrgs[].uaId | string | UserAccess ID for this context |
| availableOrgs[].orgId | string | Organization ID |
| availableOrgs[].orgName | string | Organization name |
| availableOrgs[].orgHash | string | Organization hash |
| availableOrgs[].portalType | string | Portal type |
| availableOrgs[].role | string | Role in this context |
| availableOrgs[].fullName | string | Display name for this context |

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 401 | Unauthorized | Missing or invalid token |

**Business Logic:**

1. Get current UserAccess from JWT token
2. Return UserAccess profile fields
3. Find all UserAccess records for this user (via User.accessProfiles where deletedAt is null)
4. Each available org shows its own fullName, role, portalType
5. Current org shows permissions array

---

### 5. Update Profile

| Field        | Value              |
| ------------ | ------------------ |
| **Method**   | PATCH              |
| **Endpoint** | `/api/auth/me`     |
| **Auth**     | Yes (JWT required) |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | No | New first name |
| lastName | string | No | New last name |
| phoneNumber | string | No | New phone number |
| profile | string | No | New profile picture URL |

**Success Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| id | string | UserAccess ID |
| fullName | string | Updated full name |
| phoneNumber | string | Updated phone number |
| profile | string | Updated profile picture |
| message | string | "Profile updated successfully for current organization context" |

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 401 | Unauthorized | Missing or invalid token |
| 409 | Phone number already in use | Duplicate phone in same org |

**Business Logic:**

1. Get current UserAccess from JWT
2. Update only the current UserAccess record (by userId + orgId + portalType)
3. If firstName or lastName changed, auto-update fullName
4. If phone changed, set phoneVerified = false
5. Changes do NOT affect other org contexts
6. User table is NEVER updated

---

### 6. Change Password

| Field        | Value                   |
| ------------ | ----------------------- |
| **Method**   | PATCH                   |
| **Endpoint** | `/api/auth/me/password` |
| **Auth**     | Yes (JWT required)      |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password for verification |
| newPassword | string | Yes | New password to set |

**Success Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| message | string | "Password updated successfully for current organization context" |

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 401 | Unauthorized | Missing or invalid token |
| 401 | Current password is incorrect | Wrong currentPassword |
| 400 | New password must be at least 8 characters | Validation failed |

**Business Logic:**

1. Get current UserAccess from JWT
2. Find UserAccess record
3. Verify currentPassword against UserAccess.passwordHash
4. Hash newPassword with bcrypt
5. Update UserAccess.passwordHash for this org context only
6. Password change does NOT affect other org contexts

---

## JWT Token Payload Structure

### Access Token (1 hour)

| Field       | Type           | Description                     |
| ----------- | -------------- | ------------------------------- |
| sub         | string         | UserAccess ID (primary subject) |
| userId      | string         | User ID (global identity)       |
| email       | string         | User email                      |
| orgId       | string         | Organization ID                 |
| orgHash     | string         | Organization public hash        |
| portalType  | string         | Portal type                     |
| role        | string         | Role in this org context        |
| permissions | string[]       | Feature codes                   |
| fullName    | string         | Display name for this context   |
| profile     | string \| null | Profile picture URL             |
| type        | string         | "access"                        |
| iat         | number         | Issued at timestamp             |
| exp         | number         | Expiration timestamp            |

### Refresh Token (30 days)

| Field  | Type   | Description          |
| ------ | ------ | -------------------- |
| sub    | string | UserAccess ID        |
| userId | string | User ID              |
| type   | string | "refresh"            |
| iat    | number | Issued at timestamp  |
| exp    | number | Expiration timestamp |

---

## Portal Type Behavior Matrix

| portalType | send-otp Body        | verify-otp Response               | Auto-Create User | Auto-Create UserAccess | Token Scope  | Permissions     |
| ---------- | -------------------- | --------------------------------- | ---------------- | ---------------------- | ------------ | --------------- |
| `admin`    | `{ email }`          | Global JWT, no orgId/orgHash      | No               | No                     | Global       | Full access     |
| `company`  | `{ email, orgHash }` | Org-scoped JWT with permissions   | No               | No                     | Organization | From DealerType |
| `consumer` | `{ email, orgHash }` | Org-scoped JWT, empty permissions | Yes              | Yes                    | Organization | Empty array     |

---

## Key Design Rules

| Rule                            | Description                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| **UserAccess is the account**   | All profile data, passwords, roles live in UserAccess                              |
| **User is just identity**       | User table only has email + isActive                                               |
| **orgHash matching**            | Every company/consumer request must include orgHash to find the correct UserAccess |
| **portalType matching**         | OTP verification matches exact portalType (company vs consumer are separate)       |
| **Context isolation**           | Profile/password updates only affect current UserAccess, not other orgs            |
| **OTP linked to UserAccess**    | OTP is stored against UserAccess, not User                                         |
| **Permissions from DealerType** | Resolved at login time from UserAccess.dealerTypeId                                |

---

## Summary

| #   | Method | Endpoint                           | Auth | Purpose                       |
| --- | ------ | ---------------------------------- | ---- | ----------------------------- |
| 1   | POST   | `/api/auth/:portalType/send-otp`   | No   | Request login OTP             |
| 2   | POST   | `/api/auth/:portalType/verify-otp` | No   | Verify OTP, get tokens        |
| 3   | POST   | `/api/auth/logout`                 | Yes  | End session                   |
| 4   | GET    | `/api/auth/me`                     | Yes  | Get profile with all orgs     |
| 5   | PATCH  | `/api/auth/me`                     | Yes  | Update profile (current org)  |
| 6   | PATCH  | `/api/auth/me/password`            | Yes  | Change password (current org) |

---

### Status Badge Legend

| Badge   | Meaning                      |
| ------- | ---------------------------- |
| ⏳ TODO | Not yet implemented          |
| ✅ DONE | Fully implemented and tested |
| 🚧 WIP  | Currently in progress        |
