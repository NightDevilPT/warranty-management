# WMS API Documentation - Common APIs (Authentication)

## Module: `auth`

## Base Path: `/api/auth`

## Portal Type: `:portalType` = `admin` | `company` | `consumer`

---

## API Endpoints

| #   | Method | Endpoint                           | Description                                                                                                                                                                                                                                   | Auth | Status  |
| --- | ------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| 1   | POST   | `/api/auth/:portalType/send-otp`   | Send OTP for login. Admin: `{ email }`. Company/Consumer: `{ email, orgHash }`. Consumer auto-creates User + UserAccess if new. OTP expires in 10 minutes. In dev mode, OTP returned in response.                                             | No   | ✅ DONE |
| 2   | POST   | `/api/auth/:portalType/verify-otp` | Verify OTP and get tokens. Returns access token (15 min) + refresh token (7 days). Tokens set as httpOnly cookies by ResponseInterceptor. Admin: global scope. Company: org-scoped with permissions. Consumer: org-scoped, empty permissions. | No   | ✅ DONE |
| 3   | POST   | `/api/auth/logout`                 | End current session. Clears httpOnly cookies (access + refresh). Simple logic in controller - no CQRS needed.                                                                                                                                 | Yes  | ✅ DONE |
| 4   | GET    | `/api/auth/me`                     | Get current UserAccess profile. Returns profile fields, current org context with permissions. Does NOT expose availableOrgs (security).                                                                                                       | Yes  | ✅ DONE |
| 5   | PATCH  | `/api/auth/me`                     | Update profile for current org context only. Modifiable: firstName, lastName (auto-updates fullName), phoneNumber, profile. Phone change sets phoneVerified=false. Changes do NOT affect other org contexts.                                  | Yes  | ✅ DONE |
| 6   | POST   | `/api/auth/me/profile-picture`     | Upload profile picture. Deletes old picture before uploading new. Returns updated profile.                                                                                                                                                    | Yes  | ✅ DONE |
| 7   | PATCH  | `/api/auth/me/password`            | Change password for current org context only. Requires currentPassword. Password change does NOT affect other org contexts.                                                                                                                   | Yes  | ✅ DONE |

---

## Detailed API Specifications

---

### 1. Send OTP ✅ DONE

| Field          | Value                            |
| -------------- | -------------------------------- |
| **Method**     | POST                             |
| **Endpoint**   | `/api/auth/:portalType/send-otp` |
| **Auth**       | No (`@Public()`)                 |
| **Controller** | `OtpController.sendOtp`          |
| **Handler**    | `SendOtpHandler`                 |

**Path Parameters:**
| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| portalType | string | `admin`, `company`, `consumer` | Portal type for login |

**Request Body:**

```json
{
  "email": "admin@warranty.com",
  "orgHash": "admin01" // Required for company/consumer, not needed for admin
}
```

**Success Response (200):**

```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600,
  "isNewUser": true, // Consumer only
  "otp": "123456" // Development mode only
}
```

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 400 | Organization hash is required | Missing orgHash for company/consumer |
| 403 | Account is deactivated | UserAccess.isActive = false |
| 404 | Organization not found | Invalid orgHash |
| 404 | No account found with this email | User doesn't exist (admin/company) |
| 404 | No {portalType} access found for this organization | UserAccess not found |
| 500 | Failed to send OTP | Internal error |

**Business Logic:**

1. Admin: Find system organization by `slug: 'system'`
2. Company/Consumer: Find organization by `orgHash`
3. Find User by `email` (Consumer: auto-create if not found)
4. Find UserAccess by `userId + orgId + portalType` (Consumer: auto-create if not found)
5. Mark all previous unused OTPs as used
6. Generate 6-digit OTP, store in OtpVerification (expires in 10 min)
7. In production: Send OTP via email. In development: Return OTP in response
8. Return success

---

### 2. Verify OTP ✅ DONE

| Field          | Value                              |
| -------------- | ---------------------------------- |
| **Method**     | POST                               |
| **Endpoint**   | `/api/auth/:portalType/verify-otp` |
| **Auth**       | No (`@Public()`)                   |
| **Controller** | `OtpController.verifyOtp`          |
| **Handler**    | `VerifyOtpHandler`                 |

**Path Parameters:**
| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| portalType | string | `admin`, `company`, `consumer` | Portal type for login |

**Request Body:**

```json
{
  "email": "admin@warranty.com",
  "otp": 123456,
  "orgHash": "admin01" // Required for company/consumer
}
```

**Success Response (200):**

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "userAccess-uuid",
    "email": "admin@warranty.com",
    "fullName": "System Administrator",
    "role": "ADMIN",
    "profile": null
  },
  "org": {
    "id": "org-uuid",
    "name": "System",
    "hash": "admin01"
  },
  "portalType": "admin",
  "permissions": []
}
```

> **Note:** `accessToken` and `refreshToken` are extracted from response body and set as httpOnly cookies by ResponseInterceptor.

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 400 | Organization hash is required | Missing orgHash for company/consumer |
| 401 | Invalid or expired OTP | OTP wrong, expired, or already used |
| 403 | Account is deactivated | UserAccess.isActive = false |
| 404 | Organization not found | Invalid orgHash |
| 404 | No account found with this email | User doesn't exist |
| 404 | No {portalType} access found for this organization | UserAccess not found |
| 500 | Failed to verify OTP | Internal error |

**Business Logic:**

1. Find Organization (admin: system org, others: by orgHash)
2. Find User by email
3. Find UserAccess by `userId + orgId + portalType`
4. Validate OTP from OtpVerification
5. Mark OTP as used
6. Resolve permissions based on role
7. Generate JWT tokens with UserAccess context
8. Return tokens + user + org info

---

### 3. Logout ✅ DONE

| Field          | Value                             |
| -------------- | --------------------------------- |
| **Method**     | POST                              |
| **Endpoint**   | `/api/auth/logout`                |
| **Auth**       | Yes (JWT required)                |
| **Controller** | `OtpController.logout`            |
| **Handler**    | None (simple logic in controller) |

**Request Body:** None

**Success Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

**Business Logic:**

1. Clear `accessToken` cookie
2. Clear `refreshToken` cookie
3. Return success message

---

### 4. Get Current Profile ✅ DONE

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| **Method**     | GET                                     |
| **Endpoint**   | `/api/auth/me`                          |
| **Auth**       | Yes (JWT required)                      |
| **Guards**     | `@UseGuards(JwtAuthGuard, TenantGuard)` |
| **Controller** | `ProfileController.getProfile`          |
| **Handler**    | `GetProfileHandler`                     |

**Request Body:** None

**Success Response (200):**

```json
{
  "id": "userAccess-uuid",
  "email": "admin@warranty.com",
  "phoneNumber": null,
  "firstName": "System",
  "lastName": "Administrator",
  "fullName": "System Administrator",
  "role": "ADMIN",
  "profile": null,
  "emailVerified": true,
  "phoneVerified": false,
  "currentOrg": {
    "orgId": "org-uuid",
    "orgName": "System",
    "portalType": "admin",
    "role": "ADMIN",
    "permissions": []
  }
}
```

> **Security Note:** `availableOrgs` is NOT returned - prevents exposing other organizations' hashes.

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 401 | Authentication required. Please login. | No token |
| 401 | Session expired. Please login again. | Token expired |
| 404 | Profile not found | UserAccess not found for this org context |

---

### 5. Update Profile ✅ DONE

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| **Method**     | PATCH                                   |
| **Endpoint**   | `/api/auth/me`                          |
| **Auth**       | Yes (JWT required)                      |
| **Guards**     | `@UseGuards(JwtAuthGuard, TenantGuard)` |
| **Controller** | `ProfileController.updateProfile`       |
| **Handler**    | `UpdateProfileHandler`                  |

**Request Body (all fields optional):**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "profile": "https://s3.amazonaws.com/profiles/abc.jpg"
}
```

**Success Response (200):**
Returns full ProfileResponseDto (same format as GET /me)

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 401 | Authentication required. Please login. | No token |
| 404 | Profile not found | UserAccess not found |
| 409 | Phone number already in use | Duplicate phone in same org |

**Business Logic:**

1. Find current UserAccess by `req.user.id` (UserAccess ID from JWT)
2. Update only provided fields
3. Auto-update fullName if firstName/lastName changed
4. Set phoneVerified=false if phone changed
5. User table is NEVER updated

---

### 6. Upload Profile Picture ✅ DONE

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| **Method**     | POST                                     |
| **Endpoint**   | `/api/auth/me/profile-picture`           |
| **Auth**       | Yes (JWT required)                       |
| **Guards**     | `@UseGuards(JwtAuthGuard, TenantGuard)`  |
| **Controller** | `ProfileController.uploadProfilePicture` |
| **Handler**    | `UploadProfilePictureHandler`            |

**Request:** `multipart/form-data` with `file` field

**Success Response (200):**
Returns full ProfileResponseDto with updated profile URL

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 400 | File is required | No file uploaded |
| 401 | Authentication required. Please login. | No token |
| 404 | Profile not found | UserAccess not found |
| 413 | File too large | File exceeds max size |
| 500 | Failed to upload profile picture | S3/internal error |

**Business Logic:**

1. Find current UserAccess
2. Delete old profile picture from S3 if exists
3. Upload new picture to S3 (`profiles/` folder)
4. Update UserAccess.profile with new URL

---

### 7. Change Password ✅ DONE

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| **Method**     | PATCH                                   |
| **Endpoint**   | `/api/auth/me/password`                 |
| **Auth**       | Yes (JWT required)                      |
| **Guards**     | `@UseGuards(JwtAuthGuard, TenantGuard)` |
| **Controller** | `ProfileController.changePassword`      |
| **Handler**    | `ChangePasswordHandler`                 |

**Request Body:**

```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewPass@456"
}
```

**Success Response (200):**

```json
{
  "message": "Password updated successfully for current organization context"
}
```

**Error Responses:**
| Status | Message | Condition |
|--------|---------|-----------|
| 400 | New password must be at least 8 characters | Validation failed |
| 400 | No password set for this account | OTP-only user |
| 401 | Authentication required. Please login. | No token |
| 401 | Current password is incorrect | Wrong currentPassword |
| 404 | Profile not found | UserAccess not found |

**Business Logic:**

1. Find current UserAccess
2. Verify passwordHash exists
3. Compare currentPassword with stored hash
4. Hash newPassword with bcrypt
5. Update UserAccess.passwordHash

---

## JWT Token Payload

### Access Token (15 minutes)

```json
{
  "sub": "userAccess-uuid",
  "userId": "user-uuid",
  "email": "admin@warranty.com",
  "orgId": "org-uuid",
  "orgHash": "admin01",
  "portalType": "admin",
  "role": "ADMIN",
  "permissions": [],
  "fullName": "System Administrator",
  "profile": null,
  "type": "access"
}
```

### Refresh Token (7 days)

```json
{
  "sub": "userAccess-uuid",
  "userId": "user-uuid",
  "type": "refresh"
}
```

---

## Portal Type Behavior Matrix

| portalType | send-otp Body        | verify-otp Response               | Auto-Create User | Auto-Create UserAccess | Token Scope  | Permissions         |
| ---------- | -------------------- | --------------------------------- | ---------------- | ---------------------- | ------------ | ------------------- |
| `admin`    | `{ email }`          | System org JWT                    | No               | No                     | Platform     | Empty (full access) |
| `company`  | `{ email, orgHash }` | Org-scoped JWT + permissions      | No               | No                     | Organization | From DealerType     |
| `consumer` | `{ email, orgHash }` | Org-scoped JWT, empty permissions | Yes              | Yes                    | Organization | Empty array         |

---

## Implementation Details

### File Structure

```
src/modules/auth/
├── otp/
│   ├── commands/
│   │   ├── handlers/
│   │   │   ├── send-otp.handler.ts
│   │   │   └── verify-otp.handler.ts
│   │   ├── impl/
│   │   │   ├── send-otp.command.ts
│   │   │   └── verify-otp.command.ts
│   │   └── index.ts
│   ├── dto/
│   │   ├── send-otp.dto.ts
│   │   ├── verify-otp.dto.ts
│   │   └── otp-response.dto.ts
│   ├── otp.service.ts
│   ├── otp.controller.ts
│   └── otp.module.ts
├── profile/
│   ├── commands/
│   │   ├── handlers/
│   │   │   ├── update-profile.handler.ts
│   │   │   ├── change-password.handler.ts
│   │   │   └── upload-profile-picture.handler.ts
│   │   ├── impl/
│   │   │   ├── update-profile.command.ts
│   │   │   ├── change-password.command.ts
│   │   │   └── upload-profile-picture.command.ts
│   │   └── index.ts
│   ├── queries/
│   │   ├── handlers/
│   │   │   └── get-profile.handler.ts
│   │   ├── impl/
│   │   │   └── get-profile.query.ts
│   │   └── index.ts
│   ├── dto/
│   │   ├── update-profile.dto.ts
│   │   ├── change-password.dto.ts
│   │   └── profile-response.dto.ts
│   ├── profile.service.ts
│   ├── profile.controller.ts
│   └── profile.module.ts
└── auth.module.ts
```

---

## Summary

| #   | Method | Endpoint                           | Auth | Purpose                        | Status  |
| --- | ------ | ---------------------------------- | ---- | ------------------------------ | ------- |
| 1   | POST   | `/api/auth/:portalType/send-otp`   | No   | Request login OTP              | ✅ DONE |
| 2   | POST   | `/api/auth/:portalType/verify-otp` | No   | Verify OTP, get tokens         | ✅ DONE |
| 3   | POST   | `/api/auth/logout`                 | Yes  | End session, clear cookies     | ✅ DONE |
| 4   | GET    | `/api/auth/me`                     | Yes  | Get profile (current org only) | ✅ DONE |
| 5   | PATCH  | `/api/auth/me`                     | Yes  | Update profile (current org)   | ✅ DONE |
| 6   | POST   | `/api/auth/me/profile-picture`     | Yes  | Upload profile picture         | ✅ DONE |
| 7   | PATCH  | `/api/auth/me/password`            | Yes  | Change password (current org)  | ✅ DONE |

---

### Status Badge Legend

| Badge   | Meaning                      |
| ------- | ---------------------------- |
| ✅ DONE | Fully implemented and tested |
| 🚧 WIP  | Currently in progress        |
| ⏳ TODO | Not yet implemented          |
