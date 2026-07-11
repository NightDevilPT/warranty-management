# WMS API Documentation - Common APIs (Authentication)

---

## Base Path: `/api/auth`

## Portal Type: `:portalType` = `admin` | `company` | `consumer`

---

## 1. OTP Authentication

| #   | Endpoint                           | Method | Description                                                                                                                                                                                                                                                                                                                                                                                  | Auth | Status  |
| --- | ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| 1   | `/api/auth/:portalType/send-otp`   | POST   | **Send OTP for login.** Generates a 6-digit code and sends via email/SMS. Admin: body requires `{ email }`. Company/Consumer: body requires `{ email, orgSlug }`. For consumer portal, if user doesn't exist, auto-creates User record (role=CONSUMER) and UserAccess (portalType=consumer). OTP expires in 10 minutes. Rate limited to 3 requests per minute per email                      | No   | ⏳ TODO |
| 2   | `/api/auth/:portalType/verify-otp` | POST   | **Verify OTP and get access.** Validates the 6-digit code. On success, marks OTP as used (prevents replay), returns access token (1 hour expiry) containing userId, orgId, orgSlug, portalType, role, permissions[] from DealerType. Also returns refresh token (30 days expiry) for silent token renewal. Admin tokens have global scope (no orgId). Company/Consumer tokens are org-scoped | No   | ⏳ TODO |

---

## 2. Token Management

| #   | Endpoint            | Method | Description                                                                                                                                                                                                                                                                                                                                                                           | Auth | Status  |
| --- | ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| 3   | `/api/auth/refresh` | POST   | **Get new access token without re-login.** Send refresh token in body or httpOnly cookie. Validates refresh token hasn't expired or been revoked. Returns new access token with updated permissions (picks up DealerType/feature changes since last login). Refresh token is rotated - old one invalidated, new one issued. If refresh token is expired, returns 401 forcing re-login | No\* | ⏳ TODO |
| 4   | `/api/auth/logout`  | POST   | **End current session.** Invalidates the refresh token server-side (adds to blacklist/removes from valid tokens). Clears httpOnly cookies for both access and refresh tokens. Other active sessions on different devices/browsers remain valid. After logout, must use send-otp again to login                                                                                        | Yes  | ⏳ TODO |

> \*Refresh endpoint requires valid refresh token (no access token needed)

---

## 3. Profile Management

| #   | Endpoint       | Method | Description                                                                                                                                                                                                                                                                                                                                  | Auth | Status  |
| --- | -------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| 5   | `/api/auth/me` | GET    | **Get current user's full profile.** Returns user details (id, email, phone, fullName, role, profile picture), list of all organizations the user belongs to with their roles and portal types, and current active organization context with permissions array. Used by frontend after login to populate UI and determine available features | Yes  | ⏳ TODO |
| 6   | `/api/auth/me` | PATCH  | **Update profile information.** Can modify firstName, lastName (auto-updates fullName), phoneNumber, profile picture URL. If email is changed, sets emailVerified=false and triggers re-verification. Cannot change role or permissions through this endpoint. Returns updated user object                                                   | Yes  | ⏳ TODO |

---

## Request/Response Examples

### 1. Admin Login Flow

```bash
# Step 1: Request OTP
POST /api/auth/admin/send-otp
Content-Type: application/json

Request:
{
  "email": "pawankumartadagsingh@gmail.com"
}

Response: 200 OK
{
  "message": "OTP sent successfully to your email",
  "expiresIn": 600
}
```

```bash
# Step 2: Verify OTP
POST /api/auth/admin/verify-otp
Content-Type: application/json

Request:
{
  "email": "pawankumartadagsingh@gmail.com",
  "otp": "123456"
}

Response: 200 OK
Set-Cookie: accessToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
Set-Cookie: refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000

{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid-001",
    "email": "pawankumartadagsingh@gmail.com",
    "fullName": "Pawan Kumar",
    "role": "ADMIN",
    "profile": null
  },
  "portalType": "admin"
}
```

### 2. Company User Login Flow

```bash
# Step 1: Request OTP
POST /api/auth/company/send-otp
Content-Type: application/json

Request:
{
  "email": "raj.sharma@techserve.com",
  "orgSlug": "techserve"
}

Response: 200 OK
{
  "message": "OTP sent successfully to your email",
  "expiresIn": 600
}
```

```bash
# Step 2: Verify OTP
POST /api/auth/company/verify-otp
Content-Type: application/json

Request:
{
  "email": "raj.sharma@techserve.com",
  "otp": "123456",
  "orgSlug": "techserve"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid-002",
    "email": "raj.sharma@techserve.com",
    "fullName": "Raj Sharma",
    "role": "COMPANY_STAFF"
  },
  "org": {
    "id": "org-uuid-001",
    "name": "TechServe India",
    "slug": "techserve"
  },
  "portalType": "company",
  "permissions": ["brand:view", "brand:create", "category:view"]
}
```

### 3. Consumer Login Flow (New User - Auto Registration)

```bash
# Step 1: Request OTP (first time - auto creates account)
POST /api/auth/consumer/send-otp
Content-Type: application/json

Request:
{
  "email": "rahul.verma@email.com",
  "orgSlug": "techserve"
}

# Behind the scenes:
# - Creates User: { email: "rahul.verma@email.com", role: "CONSUMER", firstName: "rahul.verma" }
# - Creates UserAccess: { userId, orgId, portalType: "consumer", role: "CONSUMER" }
# - Sends OTP

Response: 200 OK
{
  "message": "OTP sent successfully to your email",
  "isNewUser": true,
  "expiresIn": 600
}
```

```bash
# Step 2: Verify OTP
POST /api/auth/consumer/verify-otp
Content-Type: application/json

Request:
{
  "email": "rahul.verma@email.com",
  "otp": "123456",
  "orgSlug": "techserve"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid-003",
    "email": "rahul.verma@email.com",
    "fullName": "rahul.verma",
    "role": "CONSUMER"
  },
  "org": {
    "id": "org-uuid-001",
    "name": "TechServe India",
    "slug": "techserve"
  },
  "portalType": "consumer"
}
```

### 4. Refresh Token

```bash
POST /api/auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

### 5. Get Current User Profile

```bash
GET /api/auth/me
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "user-uuid-002",
  "email": "raj.sharma@techserve.com",
  "phoneNumber": "+919876543210",
  "firstName": "Raj",
  "lastName": "Sharma",
  "fullName": "Raj Sharma",
  "role": "COMPANY_STAFF",
  "profile": "https://s3.amazonaws.com/profiles/user-002.jpg",
  "emailVerified": true,
  "phoneVerified": true,
  "currentOrg": {
    "orgId": "org-uuid-001",
    "orgSlug": "techserve",
    "orgName": "TechServe India",
    "portalType": "company",
    "role": "COMPANY_STAFF",
    "permissions": ["brand:view", "brand:create", "category:view"]
  },
  "availableOrgs": [
    {
      "orgId": "org-uuid-001",
      "orgName": "TechServe India",
      "orgSlug": "techserve",
      "portalType": "company",
      "role": "COMPANY_STAFF"
    },
    {
      "orgId": "org-uuid-001",
      "orgName": "TechServe India",
      "orgSlug": "techserve",
      "portalType": "consumer",
      "role": "CONSUMER"
    }
  ]
}
```

### 6. Update Profile

```bash
PATCH /api/auth/me
Authorization: Bearer <accessToken>

Request:
{
  "firstName": "Rajesh",
  "lastName": "Sharma",
  "phoneNumber": "+919876543211"
}

Response: 200 OK
{
  "id": "user-uuid-002",
  "fullName": "Rajesh Sharma",
  "phoneNumber": "+919876543211",
  "message": "Profile updated successfully"
}
```

---

## Summary

| #   | Endpoint                           | Method | Auth | Purpose                                     |
| --- | ---------------------------------- | ------ | ---- | ------------------------------------------- |
| 1   | `/api/auth/:portalType/send-otp`   | POST   | No   | Request login OTP via email/phone           |
| 2   | `/api/auth/:portalType/verify-otp` | POST   | No   | Verify OTP, get JWT access + refresh tokens |
| 3   | `/api/auth/refresh`                | POST   | No\* | Get new access token using refresh token    |
| 4   | `/api/auth/logout`                 | POST   | Yes  | End session, invalidate tokens              |
| 5   | `/api/auth/me`                     | GET    | Yes  | View current user profile with org list     |
| 6   | `/api/auth/me`                     | PATCH  | Yes  | Update name, phone, email, profile picture  |

> \*Refresh requires valid refresh token, not access token

---

## JWT Token Payload Structure

### Access Token (1 hour)

```json
{
  "sub": "user-uuid",
  "email": "user@email.com",
  "orgId": "org-uuid",
  "orgSlug": "techserve",
  "portalType": "company",
  "role": "COMPANY_STAFF",
  "permissions": ["brand:view", "brand:create"],
  "type": "access",
  "iat": 1704067200,
  "exp": 1704070800
}
```

### Refresh Token (30 days)

```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1704067200,
  "exp": 1706659200
}
```

---

## Portal Type Behavior

| portalType | send-otp Body        | verify-otp Response                             | Auto-Create User        |
| ---------- | -------------------- | ----------------------------------------------- | ----------------------- |
| `admin`    | `{ email }`          | Global JWT, no org scope                        | No                      |
| `company`  | `{ email, orgSlug }` | Org-scoped JWT with permissions from DealerType | No                      |
| `consumer` | `{ email, orgSlug }` | Org-scoped JWT, empty permissions               | Yes (User + UserAccess) |

---

### Status Badge Legend

| Badge   | Meaning                      |
| ------- | ---------------------------- |
| ⏳ TODO | Not yet implemented          |
| ✅ DONE | Fully implemented and tested |
| 🚧 WIP  | Currently in progress        |
