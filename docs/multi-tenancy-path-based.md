# Multi-tenancy (Path-based) for WMS

This document explains how the Warranty Management System (WMS) can onboard and serve **multiple companies** on a **single hosted platform** without using subdomains.

## Goal

- Support **many companies (tenants)** in one deployment.
- Ensure **strict data isolation** between companies.
- Keep URL routing simple and compatible with low-cost hosting (no DNS/subdomain setup).

## Core tenant concept

- Each onboarded company has a **Company Root Organization** (the tenant).
- Every company-scoped record (products, claims, schemas, templates, partner orgs, etc.) must be linked to the tenant via:
  - `rootOrgId` (recommended), OR
  - an `orgId` that can be traced to its `rootOrgId`.

Rule: **No query is allowed without tenant scope.**

## Path-based portal routing (recommended for low resources)

Use one domain (example: `domain.com`) and represent the company context using the **first path segment**: `{companySlug}`.

Example tenant URLs:
- `domain.com/acme/login`
- `domain.com/tata-motors/login`

### Admin Portal (global)

Admin is global and is not tenant-bound by the URL:
- `GET /admin`
- `GET /admin/companies`
- `GET /admin/companies/:companyId` (or `:companySlug`)
- `GET /admin/companies/:companyId/modules`
- `GET /admin/companies/:companyId/audit-logs`

### Company Portal (tenant-scoped)

Company Portal always includes company context in the path:
- `GET /{companySlug}/app/login`
- `GET /{companySlug}/app/dashboard`
- `GET /{companySlug}/app/products`
- `GET /{companySlug}/app/claims`
- `GET /{companySlug}/app/settings/modules`
- `GET /{companySlug}/app/settings/personas`
- `GET /{companySlug}/app/settings/form-schemas`

Note: a tenant can contain **branches** and **partner organizations**, but they still share the same `{companySlug}` because they are within the same root company tenant.

### Consumer Portal (tenant-scoped)

Consumer Portal also includes company context and lives directly under the tenant root path:
- `GET /{companySlug}/login`
- `GET /{companySlug}/signup`
- `GET /{companySlug}/register` (product/warranty registration)
- `GET /{companySlug}/my-products`
- `GET /{companySlug}/my-claims`
- `GET /{companySlug}/claim/new`

Important:
- Consumer pages use `/{companySlug}/...`
- Company (staff) pages use `/{companySlug}/app/...`
- This avoids route conflicts (for example, `/{companySlug}/login` is reserved for consumers).

## Tenant resolution (how backend finds the company)

For every request under `/{companySlug}/app/*` (company portal) or `/{companySlug}/*` (consumer portal):

1. Extract `companySlug` from the URL.
2. Look up the tenant (Company Root Organization) by `companySlug`.
3. Resolve `tenantId = rootOrgId` (or company root org id).
4. Scope all database reads/writes using that `tenantId`.

## Organizations inside a tenant (root, branch, partner)

Within one tenant (one `{companySlug}`):
- **Root org**: the main company organization.
- **Branch org**: branches of the root company (e.g., region/city branches).
- **Partner org**: external businesses (dealer/retailer/installer/repairer) that sell or service the root company’s products.

Important: a **branch** can also contain:
- **Internal staff** (branch employees)
- **External staff/partners** (partner orgs linked under the same root tenant)

All of these orgs must share the same `rootOrgId`.

## One global user, multiple tenant profiles (single DB)

Because you have a single database:
- Create **one global `User`** record per person (unique email/phone).
- Do **not** create a second user when they interact with another company.

Instead, create a **relationship record** per tenant, such as:
- `Membership(userId, rootOrgId, role, orgId?)`, or
- `ConsumerProfile(userId, rootOrgId, ...)`

This allows the same user to be:
- a consumer for multiple companies, and/or
- an internal staff member in one company and a partner user in another (if needed).

## Consumer purchase source (branch/partner) and registration

Consumers may buy a product from a **branch** or a **partner org** (dealer/retailer).
But the product still belongs to the **root company tenant** (`{companySlug}`).

Recommended registration rule:
- Consumer registrations/claims are scoped by `rootOrgId` (tenant), and may optionally store a `sellerOrgId` (branch/partner) for routing/assignment.

