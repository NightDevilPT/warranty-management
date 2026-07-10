# Warranty Management System (WMS) - Product & Admin Flow Spec

## Updated with Soft Delete, Multi-Role Users & Complete Database Design

This document defines the portals, roles, permissions model, onboarding flows, soft delete strategy, and multi-role user handling for building the Warranty Management System.

---

## Table of Contents

1. [Overview](#overview)
2. [Portals](#portals)
3. [Core Concepts](#core-concepts)
4. [Key Features](#key-features)
5. [Flows](#flows)
6. [Roles & Access Rules](#roles--access-rules)
7. [Permission Resolution](#permission-resolution)
8. [Soft Delete & Data Integrity](#soft-delete--data-integrity)
9. [Multi-Role User Handling](#multi-role-user-handling)
10. [Database Tables Reference](#database-tables-reference)
11. [Missing / Recommended Features](#missing--recommended-features)

---

## Overview

The Warranty Management System is a multi-tenant platform that lets companies manage warranty workflows through configurable portals. Each company operates in complete data isolation with its own users, products, brands, categories, and warranty rules.

**What each company can have:**

- Custom form schemas for products, claims, registrations, and other entity types, configured exclusively by ADMIN
- Custom warranty templates with automated validation rules, configured exclusively by ADMIN
- Custom partner types (DealerTypes) for both internal staff and external business partners, configured by Company Super Admin
- Custom user permissions and UI module visibility, controlled through DealerType assignments

**Key distinction**: Form schemas and warranty templates are "Core Configuration" managed only by SYSTEM_ADMIN. Company Super Admin uses these schemas daily to add data but cannot modify their structure. This separation ensures consistency across the platform while giving companies flexibility in their operations.

**Soft Delete Philosophy**: The system never physically deletes records. Instead, every major table includes `deletedAt` and `deletedBy` fields. When a record is "deleted", the timestamp is set but the record remains for audit purposes. Unique constraints use PostgreSQL partial indexes with `WHERE "deletedAt" IS NULL`, allowing deleted records to be recreated with the same unique identifiers. This preserves complete audit trails and allows data recovery.

**Multi-Role User Philosophy**: A person has exactly one User record for their entire lifetime on the platform, identified by their unique email address. Through multiple UserAccess records, the same person can be an employee at one company, a consumer at another, and a partner at a third. The UserAccess table's unique constraint includes `userId`, `orgId`, and `portalType`, allowing the same user to have both COMPANY and CONSUMER access to the same organization simultaneously.

---

## Portals

### Admin Portal (SYSTEM_ADMIN)

**URL Pattern**: `/admin`

**Purpose**: Platform-wide administration and company onboarding. This portal is accessible only to users with the ADMIN role.

**System Admin capabilities**:

- **Onboard companies**: Create root organizations with base configuration including company name, URL-friendly slug, official business name, and logo. The slug is unique across all non-deleted organizations.

- **Configure company features**: Enable which modules and features each company can access by creating FeatureAccess records with a reference DealerType. This defines the maximum permissions any user in that company can ever have. Features can be enabled or disabled per organization at any time, with changes taking effect on the next permission resolution.

- **Create and manage form schemas** for each company as Core Configuration. These schemas define the structure of data entry forms. Supported types include Product Schema (defines product fields), Claim Schema (defines claim fields), Registration Schema (defines registration fields), and others as needed. Each schema has a version number for tracking changes without breaking existing data. Company Super Admin cannot create, edit, or delete form schemas.

- **Create and manage warranty templates** for each company as Core Configuration. These templates define warranty types, coverage periods, and JSON validation rules with AND/OR conditions. Templates are linked to form schemas to indicate which entity type they apply to. Company Super Admin cannot create, edit, or delete warranty templates.

- **Version control schemas and templates**: When changes are needed, new versions are created while existing data continues to reference the version used at the time of creation.

- **Invite the company's COMPANY_SUPER_ADMIN**: Create the initial user account and UserAccess record that establishes them as the organization's administrator. An invitation email is sent for account setup.

- **View and manage onboarded companies**: List all companies, inspect their configuration and records. ADMIN has global visibility into all system data for support and oversight purposes.

- **Soft delete organizations**: When a company leaves the platform, set deletedAt on the organization rather than physically removing it. The slug becomes available for reuse. All child organizations and data records are preserved for audit.

### Company Portal (Company Users)

**URL Pattern**: `/{companySlug}/app` for the main application, `/{companySlug}/login` for authentication.

**Purpose**: Tenant-specific operations and configuration within a single company context. Users include COMPANY_SUPER_ADMIN, COMPANY_STAFF, and COMPANY_PARTNER.

**Company Super Admin capabilities**:

- **Add products** using the product form schema defined by ADMIN. The system renders form fields matching the schema, and the admin fills in the values.

- **Add product registrations** using the registration form schema. Registrations track purchase details and trigger automated warranty evaluation.

- **Handle consumer claims** using the claim form schema. Claims go through defined status workflows from submission to resolution.

- **Manage brands, categories, and other business data**. These are scoped to the organization through orgId.

- **Create DealerTypes** for both Internal and External users with specific permissions. When creating a DealerType, the system shows only features that the Company Super Admin themselves has access to. This enforces the permission inheritance ceiling.

- **Add Internal staff** (COMPANY_STAFF) who stay in the same organization. The user is invited with partnerType INTERNAL and a selected DealerType. No new organization is created.

- **Add External partners** (COMPANY_PARTNER) who get their own branch organization. The user is invited with partnerType EXTERNAL and a selected DealerType. A new BRANCH organization is automatically created with rootId pointing to the top-level ROOT and parentId pointing to the inviting organization.

- **Control UI visibility for company roles**: Only features enabled by ADMIN appear as toggleable permissions when creating or editing DealerTypes.

**Company Super Admin restrictions**:

- Cannot create, edit, or delete form schemas (ADMIN only)
- Cannot create, edit, or delete warranty templates (ADMIN only)
- Cannot assign features they themselves do not have (permission ceiling)

**Partner Types**:

- **Internal** (partnerType: INTERNAL): Employees who belong to the same organization. They get a UserAccess record with the same orgId and a DealerType for permissions.

- **External** (partnerType: EXTERNAL): Business partners who get their own branch organization. A new BRANCH organization is created. They can manage their own branch by adding internal staff and external sub-partners.

- Both types use DealerType for permissions. The UI shown to the user is based on their DealerType's assigned features.

### Consumer Portal (End Customers)

**URL Pattern**: `/{companySlug}/consumer`

**Purpose**: End-customer self-service for warranty management.

**Consumer capabilities**:

- **Sign up and log in** using OTP sent to email or phone. No password is required. If the consumer already has a User account from another company, the existing account is used.

- **Register products** by filling in the registration form schema fields. The system automatically evaluates warranty rules and creates applicable warranty records.

- **View their warranties** and coverage details including warranty type, coverage period, and status. Consumers see only their own registrations and warranties.

- **Initiate claims** for products they own, within the claim rules and form schema defined by the company. Claims follow defined status workflows.

- **Track their claims** through status updates and history.

- **Use the same account across multiple companies**: If a consumer buys products from different companies on the platform, they use the same email and account. Each company's consumer data is completely isolated.

**Consumer registration for branch sales**: Registration can optionally store the selling organization ID for tracking which branch or partner made the sale. The consumer can be directed to the right portal through QR codes or links that auto-resolve the tenant and product context.

---

## Core Concepts

### User Data Model

**Single User Table for All Roles**: Every person on the platform has exactly one User record identified by their unique email address. This record is created the first time they interact with any part of the system and is never duplicated. The global `role` field on the User record defaults to CONSUMER, but the actual power a user has is determined entirely by their UserAccess records.

**Soft Delete for Users**: When a user account needs to be deactivated, the `deletedAt` timestamp is set rather than physically removing the record. The email and phone number become available for reuse through PostgreSQL partial unique indexes (`WHERE "deletedAt" IS NULL`). All historical data, form submissions, and audit trails remain intact.

**Role Definitions**:

| Role                  | Portal          | partnerType | DealerType Needed | Permission Source                      |
| --------------------- | --------------- | ----------- | ----------------- | -------------------------------------- |
| `ADMIN`               | Admin Portal    | -           | No                | Full system access                     |
| `COMPANY_SUPER_ADMIN` | Company Portal  | -           | No                | All FeatureAccess for the organization |
| `COMPANY_STAFF`       | Company Portal  | INTERNAL    | Yes               | FeatureAccess filtered by dealerTypeId |
| `COMPANY_PARTNER`     | Company Portal  | EXTERNAL    | Yes               | FeatureAccess filtered by dealerTypeId |
| `CONSUMER`            | Consumer Portal | -           | No                | Hardcoded basic permissions            |

**User-Organization Relationship**: The UserAccess table connects users to organizations. Each record represents one way a user can access an organization with a specific portal type and role. The unique constraint includes `userId`, `orgId`, and `portalType`, allowing the same user to have both COMPANY and CONSUMER access to the same organization.

**UserAccess Creation Timing**: UserAccess records are created at the moment a user first interacts with a company, not when they log in. Creation happens during company onboarding when ADMIN invites the Company Super Admin, when a Company Super Admin invites staff or partners, or when a consumer signs up on a consumer portal to register a product. When a user logs in, the system retrieves existing UserAccess records and presents them as available profiles.

### Organizations & Hierarchy

**Organization Data Model**: Organizations have a type of ROOT for top-level parent companies or BRANCH for child organizations. The hierarchy uses two fields: `rootId` always points to the top-level ROOT organization and never changes down the hierarchy, while `parentId` points to the immediate parent organization.

**Hierarchy Example**:

```
Acme Electronics (ROOT)
  └── Best Buy Electronics (BRANCH)
        └── City Electronics (BRANCH)
```

**Organization Records**:

| Organization         | type   | rootId | parentId |
| -------------------- | ------ | ------ | -------- |
| Acme Electronics     | ROOT   | null   | null     |
| Best Buy Electronics | BRANCH | Acme   | Acme     |
| City Electronics     | BRANCH | Acme   | Best Buy |

**Key Rules**:

- `rootId` always points to the top-level ROOT organization for all organizations in the hierarchy
- `parentId` points to the immediate parent one level up
- ROOT organizations have both `rootId` and `parentId` as null
- A branch's `rootId` is always the same as its parent's `rootId`

**Soft Delete for Organizations**: When an organization is soft deleted, all user accesses become inaccessible. The slug becomes available for reuse due to the partial unique index. Child organizations and all data records are preserved but also become inaccessible through normal queries.

**User-Organization Connection**: Users connect to organizations through UserAccess records. This allows one user to belong to multiple organizations, have different roles in different organizations, and be tracked for audit purposes.

### Partner Creation: Internal vs External

When Company Super Admin creates a partner or staff member, they specify the partnerType, the role, and the DealerType. Both COMPANY_STAFF and COMPANY_PARTNER use DealerType for permissions. The key difference is whether a new organization is created.

**Internal (partnerType = INTERNAL) → Role: COMPANY_STAFF**: Internal workers who belong to the same company organization. No new organization is created. The UserAccess record uses the same orgId as the inviting admin. The user's permissions come from the assigned DealerType. Examples include SupportAgent, WarrantyManager, and SalesStaff.

**External (partnerType = EXTERNAL) → Role: COMPANY_PARTNER**: External business partners who get their own branch organization. A new BRANCH organization is automatically created with rootId pointing to the top-level ROOT and parentId pointing to the inviting organization. The UserAccess record uses the new branch's orgId. The user's permissions come from the assigned DealerType. They can manage their own branch by adding internal staff and external sub-partners. Examples include AuthorizedDealer, Retailer, Installer, and ServiceCenter.

**Soft Delete for UserAccess**: When a user is removed from an organization, the UserAccess record gets a deletedAt timestamp. The user can be re-added later with a new UserAccess record because the partial unique index only applies to non-deleted records.

### DealerType (Company-Defined Role Templates)

Company Super Admin creates DealerTypes for both Internal and External users with specific permissions. DealerTypes are company-defined role templates that control what users can see and do.

**How it works**:

1. Company Super Admin navigates to the Dealer Types section in the Company Portal.
2. Creates a DealerType with a name, partnerType (INTERNAL or EXTERNAL), and description.
3. Toggles permissions from the features ADMIN enabled for the organization. The admin can only toggle features they themselves possess.
4. When inviting a user, selects the appropriate DealerType.
5. Permissions are automatically resolved from the DealerType when the user logs in.

**Example DealerTypes for Internal Staff**:

- **SupportAgent**: Claims (view, update), Products (view) — 3 features
- **WarrantyManager**: Claims (view, update, approve), Registration (view), Products (view) — 5 features
- **QualityAuditor**: Claims (view), Products (view) — 2 features

**Example DealerTypes for External Partners**:

- **AuthorizedDealer**: Products (view), Registration (create, view), Claims (view) — 4 features
- **Retailer**: Products (view), Registration (create) — 2 features
- **Installer**: Products (view), Registration (create), Claims (create) — 3 features

**Soft Delete for DealerTypes**: When a DealerType is soft deleted, it can no longer be assigned to new users. Existing users with that DealerType continue to function normally. A new DealerType with the same name can be created after deletion.

### Hierarchical Branch Creation

External partners act as branch organizations. Each branch can have its own internal staff and external partners, creating a hierarchical tree structure.

**Flow**:

1. Company A adds External partner "Metro Dealers" with DealerType "Dealer"
2. Metro Dealers becomes a BRANCH organization under Company A
3. Metro Dealers can add Internal staff to their own organization
4. Metro Dealers can create their own DealerTypes from features they possess
5. Metro Dealers can add External sub-partners, creating deeper branches

**Permission Inheritance Rule**: A child partner cannot have more permissions than its parent. When a branch admin creates DealerTypes, they can only toggle features they themselves have. This creates a natural chain where permissions narrow down: 22 features at the top level might become 5 features at the dealer level, then 2 features at the sub-dealer level.

### Company Feature/Module Visibility

Each company sees only what ADMIN has enabled for them. This is controlled through FeatureAccess records created with a reference DealerType.

**Layer 1 - ADMIN enables features**: ADMIN creates FeatureAccess records that define the organization's maximum permission set. If a feature is not enabled at this level, it does not appear anywhere in the Company Portal.

**Layer 2 - Company Super Admin assigns features**: Within enabled features, Company Super Admin creates DealerTypes and assigns subsets of features to each. The UI shows only features that are enabled for the organization.

**Example**: If ADMIN enables Claims and Products but not Partner Management for a company, the Company Super Admin sees only Claims and Products features when creating DealerTypes. Partner Management features are not visible and cannot be assigned.

### Roles vs. DealerType vs. Permissions

The system separates three distinct concepts:

- **Role**: System-level classification that determines portal access. ADMIN has global access. COMPANY_SUPER_ADMIN has full organization access. COMPANY_STAFF and COMPANY_PARTNER have DealerType-based access. CONSUMER has basic self-service access.

- **DealerType**: Company-defined role template with a specific set of permissions. Created by Company Super Admin for both internal and external users. Examples include SupportAgent, WarrantyManager, and AuthorizedDealer.

- **Permission**: Granular capability flags that drive API access and UI visibility. Stored as Feature records with unique codes like PRODUCT_CREATE, CLAIM_VIEW, and REGISTRATION_APPROVE.

**Practical Model**: Role determines which portal a user accesses and whether they are internal or external. DealerType determines what permissions they have and what they see in the UI. Staff and partners both use DealerType for permissions. Company Super Admin has full access to all organization-enabled features without needing a DealerType.

---

## Key Features

### Dynamic Forms (Core Configuration)

Form schemas are dynamic form definitions created by ADMIN. They define the structure of data entry forms as JSON blueprints with fields, types, validation rules, and UI layout.

**Supported schema types**: Product, Part, Registration, Claim, and others as needed. Each schema has a version number for tracking changes without breaking existing data. Schemas can be linked to each other, such as Part schemas linking to Product schemas.

**Company usage**: Company users fill out forms based on these schemas daily but cannot modify the schema structure. If a company needs a new field, they must request ADMIN to update the schema. FormData records store the actual submissions and reference the schema version used.

**Soft delete**: When a schema is soft deleted, existing FormData records referencing it remain intact. New submissions cannot use the deleted schema.

### Dynamic Warranty Templates (Core Configuration)

Warranty templates define warranty terms and automated validation rules. Created by ADMIN and linked to form schemas.

**Template structure**: Each template has a name, warranty type, version, and JSON validation rules with AND/OR conditions. Rules can reference fields from the registration, product, parts, brand, and categories.

**Automated evaluation**: When a product is registered, the warranty engine evaluates all active templates linked to the product's form schema. For each applicable template, a Warranty record is created with an immutable `templateSnapshot` that captures the complete template at that moment. This prevents retroactive changes from affecting existing warranties.

**Soft delete**: Deleted templates are not evaluated for new registrations, but existing warranties created from them remain valid with their snapshots intact.

### Custom Email Templates

Company admins can customize email templates for system events such as registration created, claim created, claim updated, and registration updated. Templates support dynamic variables in subject and body for personalization.

---

## Flows

### Company Onboarding (SYSTEM_ADMIN)

**Step 1 - Requirement Gathering**: ADMIN identifies which modules and features the company needs based on their business requirements.

**Step 2 - Create Root Organization**: ADMIN creates the ROOT organization with name, slug, company name, logo, and other base configuration. The slug is unique across all non-deleted organizations.

**Step 3 - Enable Company Features**: ADMIN creates a reference DealerType (named something like "OrgFeatures_CompanyName") and FeatureAccess records linking this DealerType to the features selected for the company. These records define the maximum permissions any user in the company can ever have.

**Step 4 - Create Form Schemas**: ADMIN creates form schemas for Product, Part, Registration, Claim, and any other needed types. These are Core Configuration that Company Admin cannot modify.

**Step 5 - Create Warranty Templates**: ADMIN creates warranty templates with validation rules linked to the appropriate form schemas.

**Step 6 - Invite Company Super Admin**: ADMIN creates a User record for the Company Super Admin and a UserAccess record with role COMPANY_SUPER_ADMIN, portalType COMPANY, and no dealerTypeId. An invitation email is sent.

**Step 7 - Handover**: After the Company Super Admin accepts the invitation and sets up their account, they take over day-to-day operations including adding products, handling registrations and claims, creating DealerTypes, and managing users and partners.

### User & Partner Invitation

**Invitation Created**: An admin invites a user with their name, email, target organization context, role, partnerType, and DealerType.

**For Internal Staff (partnerType: INTERNAL)**: The system checks if the user already has a User account. If not, creates one. Then creates a UserAccess record with the same organization ID as the inviter, role COMPANY_STAFF, partnerType INTERNAL, and the selected DealerType. No new organization is created.

**For External Partners (partnerType: EXTERNAL)**: The system creates a new BRANCH organization with rootId pointing to the top-level ROOT and parentId pointing to the inviter's organization. The system checks if the user already has a User account. If not, creates one. Then creates a UserAccess record with the new branch organization ID, role COMPANY_PARTNER, partnerType EXTERNAL, and the selected DealerType.

**Account Linking**: If the invited email already has a User record on the platform, the existing record is used. The system checks for existing UserAccess records (where deletedAt is null) to prevent duplicate active accesses.

**Permission Assignment**: Both internal and external users get permissions from their assigned DealerType. The UI they see is based on these permissions.

### Consumer Registration & Claims

**Consumer Signup**: Consumer visits the consumer portal and enters their email. System checks if User exists. If not, creates one. System checks if UserAccess exists for this user, organization, and CONSUMER portal type. If not, auto-creates one with portalType CONSUMER. An OTP is sent for authentication.

**Product Registration**: Consumer fills in registration form fields defined by the Registration FormSchema. System creates a FormData record and runs the warranty evaluation engine to generate Warranty records.

**Claim Filing**: Consumer selects a warranty, fills in claim form fields defined by the Claim FormSchema. System creates a FormData record with status SUBMITTED. Staff with appropriate permissions process the claim through status transitions.

---

## Roles & Access Rules

| Role                  | Portal          | partnerType | DealerType | Permission Source                                  |
| --------------------- | --------------- | ----------- | ---------- | -------------------------------------------------- |
| `ADMIN`               | Admin Portal    | -           | No         | Full system access                                 |
| `COMPANY_SUPER_ADMIN` | Company Portal  | -           | No         | All FeatureAccess for org (no dealerTypeId filter) |
| `COMPANY_STAFF`       | Company Portal  | INTERNAL    | Yes        | FeatureAccess filtered by dealerTypeId             |
| `COMPANY_PARTNER`     | Company Portal  | EXTERNAL    | Yes        | FeatureAccess filtered by dealerTypeId             |
| `CONSUMER`            | Consumer Portal | -           | No         | Hardcoded basic permissions                        |

**ADMIN**: Platform admin with global access across all companies. Onboards companies, enables features, manages core configuration including form schemas and warranty templates. Has visibility into all system data.

**COMPANY_SUPER_ADMIN**: Organization administrator for root company or branch. Full access to all features ADMIN enabled for the organization. Manages products, registrations, claims, brands, categories, DealerTypes, and users. Cannot create or modify form schemas or warranty templates.

**COMPANY_STAFF**: Internal employees with permission-based access. Stays in the same organization. Permissions from assigned DealerType.

**COMPANY_PARTNER**: External business partners with permission-based access. Gets their own branch organization. Permissions from assigned DealerType.

**CONSUMER**: End customers with access only to their own registrations, warranties, and claims within a specific company's consumer portal.

---

## Permission Resolution

### How Permissions Are Resolved

When a user accesses any protected route, the system resolves their permissions through role-based logic.

**For COMPANY_SUPER_ADMIN**: The system queries all FeatureAccess records where orgId matches the user's organization and isActive is true. No dealerTypeId filter is applied. This returns all features ADMIN enabled for the organization. The Company Super Admin gets the full organization permission set.

**For COMPANY_STAFF and COMPANY_PARTNER**: The system checks if the user has a dealerTypeId. If not, returns no permissions. If yes, queries FeatureAccess where orgId matches, dealerTypeId matches the user's assigned DealerType, and isActive is true. Returns only those features.

**For CONSUMER**: The system returns hardcoded basic permissions without querying FeatureAccess. These include product registration, warranty viewing, claim creation, claim viewing, and registration viewing.

### Permission Inheritance Ceiling

When Company Super Admin creates a DealerType, the system shows only features they themselves have access to. Branch admins can only assign features they possess. This creates a natural chain where permissions only narrow down. No one can grant permissions they do not have.

---

## Soft Delete & Data Integrity

### Soft Delete Design

Every major table includes `deletedAt` (timestamp) and `deletedBy` (user reference) fields. When a record is "deleted", the `deletedAt` timestamp is set to the current time. The record remains in the database for audit purposes. All normal application queries filter by `WHERE "deletedAt" IS NULL` to show only active records.

### Unique Constraints with Partial Indexes

PostgreSQL partial unique indexes use the condition `WHERE "deletedAt" IS NULL`. This means uniqueness is only enforced among active, non-deleted records. A deleted record with a particular slug or name does not block a new active record with the same values.

**Tables with partial unique indexes**: User (email and phone), Organization (slug), Brand (orgId + slug), Category (orgId + slug), DealerType (orgId + name), FormSchema (orgId + type + name + version), WarrantyTemplate (orgId + formSchemaId + name + version), UserAccess (userId + orgId + portalType).

### Audit Trail

Every table tracks who created, updated, and deleted each record. The User model has reverse relations for all delete operations, enabling queries like "find all brands deleted by John" or "show all deletions performed by ADMIN in the last month."

### Soft Delete Examples

**Brand Deletion and Recreation**: Acme deletes "Samsung" brand by setting deletedAt. The brand no longer appears in active lists. Acme can create a new "Samsung" brand because the partial unique index ignores the deleted record. The old record remains for historical reference.

**User Removal and Re-addition**: Alice leaves Acme. Her UserAccess gets deletedAt. Later she returns. A new UserAccess is created because the partial unique index only applies to non-deleted records. Her previous access history is preserved in the old record.

**Organization Deletion**: A company leaves the platform. ADMIN sets deletedAt on the organization. The slug becomes available for a new company. All child organizations and data are preserved for audit.

---

## Multi-Role User Handling

### One User, Multiple Contexts

A single User record can have multiple UserAccess records connecting them to different organizations with different roles and portal types. This enables a person to be an employee at one company, a consumer at another, and a partner at a third, all with the same email and login credentials.

### Same Organization, Both Portals

The UserAccess unique constraint includes portalType, allowing the same user to have both COMPANY and CONSUMER access to the same organization. This handles the case where an employee also purchases their employer's products for personal use.

### Login Profile Selection

When a user logs in, the system retrieves all their UserAccess records where deletedAt is null and presents them as available profiles. Each profile shows the organization name, portal type, and role. The user selects which context to use. The system generates a JWT token with that specific organization, portal, role, and permissions.

### Data Isolation

Data is isolated through two mechanisms. All queries filter by orgId to ensure users only see data from their current organization context. Consumer queries additionally filter by createdBy (userId) to ensure consumers only see their own personal data. When a user switches contexts, they get a new JWT with the new context, and all subsequent queries are scoped accordingly.

---

## Database Tables Reference

| #   | Table            | Purpose                              | Soft Delete | Unique Constraint Type                    |
| --- | ---------------- | ------------------------------------ | ----------- | ----------------------------------------- |
| 1   | User             | Global user accounts                 | deletedAt   | Partial (email, phone)                    |
| 2   | Organization     | Companies with hierarchy             | deletedAt   | Partial (slug)                            |
| 3   | UserAccess       | User-Organization connection         | deletedAt   | Partial (userId+orgId+portalType)         |
| 4   | DealerType       | Role templates for Internal/External | deletedAt   | Partial (orgId+name)                      |
| 5   | Feature          | Global permission tree               | None        | Full (code, parentId+code)                |
| 6   | FeatureAccess    | Features assigned to DealerTypes     | None        | Full (orgId+dealerTypeId+featureId)       |
| 7   | Category         | Product categories                   | deletedAt   | Partial (orgId+slug)                      |
| 8   | Brand            | Product brands                       | deletedAt   | Partial (orgId+slug)                      |
| 9   | FormSchema       | Dynamic form blueprints              | deletedAt   | Partial (orgId+type+name+version)         |
| 10  | FormData         | Form submissions                     | deletedAt   | None                                      |
| 11  | WarrantyTemplate | Warranty rules                       | deletedAt   | Partial (orgId+formSchemaId+name+version) |
| 12  | Warranty         | Generated warranties                 | deletedAt   | None                                      |
| 13  | OtpVerification  | OTP codes                            | None        | None                                      |

---

## Missing / Recommended Features

### Cross-cutting Concerns

- JWT-based authentication with refresh token rotation and optional MFA
- Comprehensive audit logging for all significant actions with before/after values
- Email and in-app notifications for key events
- File uploads and attachments for claims and registrations
- Reporting dashboards with KPIs per organization
- Global search with filtering, pagination, and export
- Standard claim status workflow definitions with allowed transitions

### Admin Portal Additions

- Company lifecycle management (enable, disable, suspend)
- Module catalog with enable/disable per company
- Support tools for impersonation and account management
- Default schema and template libraries for faster onboarding

### Company Portal Additions

- Enhanced partner onboarding workflows
- Improved permission management UX with select all and copy functionality
- Branch data scope controls for parent visibility
- Claim assignment, SLA tracking, and internal notes
- Email template preview and testing

### Consumer Portal Additions

- Product ownership verification methods
- Claim timeline and status tracking
- Self-service profile management
- Warranty certificate downloads
