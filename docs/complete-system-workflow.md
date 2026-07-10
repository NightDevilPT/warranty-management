# Complete Warranty Management System (WMS) - Final System Workflow

## From ADMIN Setup to End Consumer Operations

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Database Tables & Their Purposes](#database-tables--their-purposes)
3. [Core Design Principles](#core-design-principles)
4. [Phase 1: System Initialization](#phase-1-system-initialization)
5. [Phase 2: Company Onboarding](#phase-2-company-onboarding)
6. [Phase 3: Feature Enablement for Organization](#phase-3-feature-enablement-for-organization)
7. [Phase 4: Core Configuration](#phase-4-core-configuration)
8. [Phase 5: Company Super Admin First Login](#phase-5-company-super-admin-first-login)
9. [Phase 6: Company Super Admin Daily Operations](#phase-6-company-super-admin-daily-operations)
10. [Phase 7: DealerType Creation & Feature Assignment](#phase-7-dealertype-creation--feature-assignment)
11. [Phase 8: Adding Internal Staff](#phase-8-adding-internal-staff)
12. [Phase 9: Adding External Partners](#phase-9-adding-external-partners)
13. [Phase 10: Multi-Role User Handling](#phase-10-multi-role-user-handling)
14. [Phase 11: Product & Part Management](#phase-11-product--part-management)
15. [Phase 12: Registration & Warranty Creation](#phase-12-registration--warranty-creation)
16. [Phase 13: Consumer Portal Operations](#phase-13-consumer-portal-operations)
17. [Phase 14: Claims Management](#phase-14-claims-management)
18. [Phase 15: Branch Partner Hierarchy](#phase-15-branch-partner-hierarchy)
19. [Phase 16: Soft Delete & Inactive Records](#phase-16-soft-delete--inactive-records)
20. [Phase 17: Edge Cases & Special Scenarios](#phase-17-edge-cases--special-scenarios)
21. [Complete Permission Resolution Logic](#complete-permission-resolution-logic)
22. [Complete Data Flow Summary](#complete-data-flow-summary)

---

## System Architecture Overview

### The Three Portals

The system is divided into three separate portals, each serving different users with different URL patterns and access levels.

**Admin Portal** is used by platform administrators with global access across all companies. They onboard new companies, manage core configuration like form schemas and warranty templates, and control what features each company can use. The URL pattern is `/admin`.

**Company Portal** is used by organization-level users. This includes Company Super Admins who manage their entire organization, internal staff who perform day-to-day operations, and external partners who access the system through their branch organizations. Each company accesses their portal through a unique URL slug like `/acme-electronics/app`.

**Consumer Portal** is used by end customers who purchase products and want to register warranties, view their coverage, and file claims. Like the Company Portal, consumers access the right portal through the company's unique URL slug like `/acme-electronics/consumer`.

### The Five User Roles

```
Role: ADMIN
Portal: Admin Portal
partnerType: Not applicable
DealerType Needed: No
Permission Source: Full system access
Example: Sarah is the platform administrator. She onboards companies, creates form schemas,
and manages warranty templates. She can see all companies and all data in the system.
```

```
Role: COMPANY_SUPER_ADMIN
Portal: Company Portal
partnerType: Not applicable (null)
DealerType Needed: No
Permission Source: All FeatureAccess records for the organization (filtered by orgId only)
Example: John is the administrator of Acme Electronics. He manages products, invites staff
and partners, creates DealerTypes, and oversees all operations for Acme. He has access to
every feature ADMIN enabled for Acme.
```

```
Role: COMPANY_STAFF
Portal: Company Portal
partnerType: INTERNAL
DealerType Needed: Yes
Permission Source: FeatureAccess filtered by orgId AND dealerTypeId
Example: Alice works at Acme Electronics as a SupportAgent. She can view and update claims,
view products and registrations. She stays in the same organization as Acme with no new
organization created.
```

```
Role: COMPANY_PARTNER
Portal: Company Portal
partnerType: EXTERNAL
DealerType Needed: Yes
Permission Source: FeatureAccess filtered by orgId AND dealerTypeId
Example: Bob runs Best Buy Electronics, an authorized dealer for Acme products. He gets his
own branch organization under Acme. He can view products, create and view registrations,
and view claims and warranties related to his sales.
```

```
Role: CONSUMER
Portal: Consumer Portal
partnerType: Not applicable (null)
DealerType Needed: No
Permission Source: Hardcoded basic permissions
Example: Jane is an end customer who bought a Samsung TV. She registers her product, views
her warranty coverage, and can file claims if something goes wrong. She only sees her own
data within the company she bought from.
```

---

## Database Tables & Their Purposes

### Core Identity Tables

**User Table** stores every person's global account on the platform. One email address equals one User record forever.

```
Example: John Doe signs up with email john@acme.com. He gets one User record. Later, John
joins Company B as an employee, buys a product from Company A as a consumer, and partners
with Company C. Through all of this, John still has only one User record. His various roles
across different companies are managed entirely through multiple UserAccess records.
```

**Organization Table** stores companies as tenants with hierarchy support through rootId and parentId.

```
Example: Acme Electronics is created as a ROOT organization with rootId null and parentId null.
Best Buy Electronics is created as a BRANCH under Acme with rootId pointing to Acme and
parentId pointing to Acme.
City Electronics is created as a BRANCH under Best Buy with rootId STILL pointing to Acme
(the top-level root never changes) and parentId pointing to Best Buy (the immediate parent).

This creates a clear hierarchy:
  Acme Electronics (ROOT)
    └── Best Buy Electronics (BRANCH)
          └── City Electronics (BRANCH)
```

**UserAccess Table** is the critical bridge between users and organizations. The unique constraint includes userId, orgId, and portalType.

```
Example: Alice has two UserAccess records for Acme Electronics simultaneously. The first has
portalType "COMPANY" and role "COMPANY_STAFF" for her job as a SupportAgent. The second has
portalType "CONSUMER" for the Acme TV she bought personally. Both records exist without
conflict because the unique constraint includes portalType.

Alice also has a third UserAccess record for Company X with portalType "CONSUMER" for a
washing machine she bought there. In total, Alice has three UserAccess records connecting
her single User account to multiple organizations in different ways.
```

### Feature & Permission Tables

**Feature Table** stores the global permission tree with parent-child hierarchy.

```
Example: The feature "PRODUCT_MANAGEMENT" is a parent module. Under it, four child features
exist: "PRODUCT_CREATE", "PRODUCT_VIEW", "PRODUCT_UPDATE", and "PRODUCT_DELETE". Each has
a unique code used for permission checks throughout the system.
```

**FeatureAccess Table** links features to DealerTypes within organizations. This table serves two distinct purposes depending on who creates the records.

```
Example of ADMIN-created records (Organization Feature Set):
ADMIN creates a DealerType called "OrgFeatures_Acme" to hold Acme's organization-wide features.
ADMIN then creates FeatureAccess records linking "OrgFeatures_Acme" to 22 features.
These records define the maximum any user in Acme can ever access.

Example of Company Admin-created records (DealerType Assignments):
John creates a DealerType called "SupportAgent" and assigns 5 features to it.
John creates a DealerType called "AuthorizedDealer" and assigns 5 features to it.
Each assignment creates a FeatureAccess record linking the DealerType to specific features.
```

**DealerType Table** stores company-defined role templates for both internal and external users.

```
Example of INTERNAL DealerType:
Name: SupportAgent
partnerType: INTERNAL
Created by: John (Acme's Company Super Admin)
Purpose: When assigned to Alice, she stays in Acme's organization as a COMPANY_STAFF employee.
She gets 5 features: View Claims, Update Claims, View Products, View Registrations, View Warranties.

Example of EXTERNAL DealerType:
Name: AuthorizedDealer
partnerType: EXTERNAL
Created by: John (Acme's Company Super Admin)
Purpose: When assigned to Bob, a new branch organization "Best Buy Electronics" is created.
Bob becomes COMPANY_PARTNER of this new organization. He gets 5 features: View Products,
Create Registrations, View Registrations, View Claims, View Warranties.
```

### Business Data Tables

**Category Table** stores product categories in a hierarchical tree.

```
Example: Electronics is a root category. Under it, Refrigerators and TVs are child
categories. Under Refrigerators, Double Door and Single Door are subcategories. Each
category belongs to Acme Electronics through its orgId.
```

**Brand Table** stores product brands and manufacturers.

```
Example: Acme Electronics creates three brands: Samsung, LG, and Sony. Each brand has a
unique slug within Acme's organization. Samsung gets slug "samsung", LG gets "lg", Sony
gets "sony". Another company could also create a "samsung" slug without conflict because
the uniqueness is scoped per organization.
```

**FormSchema Table** stores dynamic form definitions as JSON blueprints. Only ADMIN can create or modify these.

```
Example: The Product Schema defines fields like productName (text, required), modelNumber
(text, required), serialNumber (text, optional), description (textarea, optional), price
(number, optional), and manufacturingDate (date, optional). When John creates a product,
the system renders a form with exactly these fields. John cannot add a new field like
"warrantyDuration" to the product form. Only ADMIN can modify the schema.
```

**FormData Table** stores actual submissions using the form schemas.

```
Example: John creates a Samsung TV product. A FormData record stores the actual values:
productName is "Samsung 55-inch 4K Smart TV", modelNumber is "TV-55-4K-2024", price is
1500. The formType is "PRODUCT" and it references the Product FormSchema.

When Alice later registers this TV for a customer, another FormData record is created with
formType "REGISTRATION", referencing the Registration FormSchema, and linking to the TV
product through registeredProductId. The data includes purchaseDate as "2024-06-15" and
purchasePrice as 1500.
```

**WarrantyTemplate Table** stores warranty rules with JSON validation logic. Only ADMIN can create or modify these.

```
Example: The Standard 1-Year Warranty template has a validation rule that checks if the
registration purchase date is within 30 days. If a customer buys on June 15th and registers
on July 10th (25 days later), the rule passes and the warranty is applicable. If they
register on August 1st (47 days later), the rule fails.

The Extended 2-Year Warranty has two rules connected by AND: registration within 7 days AND
product price above $500. A $1500 TV registered 5 days after purchase would qualify. A $300
appliance would not qualify regardless of registration timing. A $1500 TV registered 10 days
after purchase would also not qualify because the first condition fails.
```

**Warranty Table** stores actual warranty records generated automatically after registration. Each record captures an immutable snapshot of the template.

```
Example: When the Samsung TV is registered on July 10th, the system evaluates the Standard
1-Year Warranty template. The 30-day rule passes. A Warranty record is created that captures
a complete snapshot of the template at this moment: the name "Standard 1-Year Warranty",
the type "FULL_REPLACEMENT", the 12-month period, all validation rules, coverage details,
and terms.

Six months later, ADMIN changes the Standard 1-Year Warranty to only 6 months coverage.
This existing warranty is unaffected because it has the immutable snapshot from creation time.
The TV still has 12 months of coverage as originally promised. Only new registrations get
the updated 6-month terms.
```

### Utility Tables

**OtpVerification Table** stores one-time passwords for authentication flows.

```
Example: Jane wants to log into the consumer portal. She enters her email and the system
generates a 6-digit OTP, stores it in OtpVerification with type LOGIN, sets an expiration
10 minutes from now, and marks isUsed as false. When Jane submits the correct OTP within
10 minutes, the system marks it as used and authenticates her. If she tries to use the same
OTP again, it is rejected because isUsed is now true, preventing replay attacks.
```

---

## Core Design Principles

### One User, One Global Account Forever

```
Example: John Doe first encounters the platform when Company B invites him as an employee.
A User record is created for john@gmail.com. Later, John buys a TV from Company A and
registers it as a consumer. The system finds his existing User record by email and creates
only a new UserAccess record for Company A. John never gets a second User record. His single
User record serves all his roles across all companies.
```

### UserAccess Created at Registration Time, Not Login Time

```
Example: When ADMIN invites John as Company Super Admin of Acme Electronics during onboarding,
a UserAccess record is created immediately with role COMPANY_SUPER_ADMIN. When John later
logs in with his email and password, the system finds his existing UserAccess records and
asks which profile he wants to use. No new UserAccess is created during login. Login only
retrieves existing records.
```

### Permission Resolution Based on Role Type

```
Example for COMPANY_SUPER_ADMIN:
John's UserAccess has role "COMPANY_SUPER_ADMIN". The system queries all FeatureAccess records
where orgId matches Acme and isActive is true, without any dealerTypeId filter. This returns
all 22 features ADMIN enabled for Acme. John gets all 22 features.

Example for COMPANY_STAFF:
Alice's UserAccess has role "COMPANY_STAFF" and dealerTypeId pointing to SupportAgent. The
system queries FeatureAccess where orgId matches Acme AND dealerTypeId matches SupportAgent
AND isActive is true. This returns only 5 features. Alice gets 5 features.

Example for CONSUMER:
Jane's UserAccess has portalType "CONSUMER" and no role. The system does not query FeatureAccess
at all. It returns a hardcoded set: Product Registration, Warranty View, Claim Create.
```

### DealerType Serves Both Internal and External Users

```
Example of INTERNAL assignment:
John creates SupportAgent DealerType with partnerType INTERNAL. When he assigns it to Alice,
no new organization is created. Alice gets a UserAccess record with orgId still pointing to
Acme Electronics. She is an employee of Acme.

Example of EXTERNAL assignment:
John creates AuthorizedDealer DealerType with partnerType EXTERNAL. When he assigns it to Bob,
a new branch organization "Best Buy Electronics" is automatically created. Bob gets a UserAccess
record with orgId pointing to this new Best Buy organization, not to Acme directly. Best Buy
has rootId pointing to Acme and parentId pointing to Acme.
```

### Company Super Admin Does Not Need a DealerType

```
Example: John's UserAccess record for Acme Electronics has role "COMPANY_SUPER_ADMIN" and
dealerTypeId set to null. When the system resolves his permissions, it sees his role and
queries all FeatureAccess where orgId equals Acme without filtering by dealerTypeId. John
gets all 22 features without ever needing a DealerType assigned to him.
```

### Permission Inheritance Creates a Natural Ceiling

```
Example: John has 22 features as Company Super Admin. He creates the AuthorizedDealer
DealerType and can only select from his 22 features. He chooses 5 features. Bob gets this
DealerType and now has 5 features. When Bob wants to create DealerTypes for Best Buy staff,
the system shows him only his 5 features as available options. Bob creates a BestBuyStaff
DealerType and assigns 3 of his 5 features. This creates a natural chain where permissions
only narrow down: 22 → 5 → 3.
```

### Core Configuration is Exclusively ADMIN Territory

```
Example: ADMIN creates the Product Form Schema defining what fields products have. John uses
this schema every day to create products, filling in the predefined fields like productName
and modelNumber. But John cannot add a new field like "energyRating" to the product form.
He cannot change the "price" field from optional to required. Only ADMIN can modify form
schemas. If John needs a new field, he must request ADMIN to update the schema.
```

### Soft Delete and Inactive States Preserve Data

```
Example: Acme Electronics decides to stop carrying Sony products. Instead of deleting the
Sony brand record, John sets its isActive to false. All existing products that reference
the Sony brand continue to work normally. Existing warranties for Sony products remain valid.
The Sony brand simply no longer appears in dropdown menus for new product creation.

Similarly, if an employee leaves the company, their User record gets a deletedAt timestamp
rather than being physically removed. All their historical form submissions, audit trails,
and references remain intact for compliance and reporting purposes.
```

### Data Isolation Ensures Multi-Tenant Security

```
Example: When Alice accesses the Company Portal as SupportAgent for Acme, the system filters
all queries by orgId equals Acme. She sees all claims in Acme based on her permissions. When
she switches to the Consumer Portal for Company X, the system filters by orgId equals
Company X AND createdBy equals Alice's userId. She sees only her personal TV registration
and warranty. She cannot see Company X's other consumers. She cannot see Acme's company data
from this consumer context.
```

---

## Phase 1: System Initialization

### Creating the Global Feature Tree

ADMIN begins by defining every possible permission that will ever exist in the system. These permissions are organized as a hierarchical tree with modules as parents and specific actions as children.

```
Example Feature Tree:

PRODUCT_MANAGEMENT (Module)
├── PRODUCT_CREATE - Allows creating new products
├── PRODUCT_VIEW - Allows viewing product listings and details
├── PRODUCT_UPDATE - Allows modifying existing products
└── PRODUCT_DELETE - Allows deactivating products (soft delete)

CLAIMS_MANAGEMENT (Module)
├── CLAIM_CREATE - Allows filing new claims
├── CLAIM_VIEW - Allows viewing claim listings and details
├── CLAIM_UPDATE - Allows modifying claims and adding notes
├── CLAIM_APPROVE - Allows approving or rejecting claims
└── CLAIM_ASSIGN - Allows assigning claims to specific staff members

REGISTRATION_MANAGEMENT (Module)
├── REGISTRATION_CREATE - Allows submitting product registrations
└── REGISTRATION_VIEW - Allows viewing registration listings and details

PARTNER_MANAGEMENT (Module)
├── PARTNER_CREATE - Allows inviting new staff and partners
├── PARTNER_VIEW - Allows viewing partner and staff listings
├── DEALER_TYPE_MANAGE - Allows creating and editing role templates
└── BRANCH_CREATE - Allows creating branch organizations

BRAND_MANAGEMENT (Module)
├── BRAND_CREATE - Allows creating new brands
├── BRAND_VIEW - Allows viewing brand listings and details
└── BRAND_UPDATE - Allows modifying existing brands

CATEGORY_MANAGEMENT (Module)
├── CATEGORY_CREATE - Allows creating new categories
├── CATEGORY_VIEW - Allows viewing category tree and details
└── CATEGORY_UPDATE - Allows modifying existing categories

WARRANTY_MANAGEMENT (Module)
├── WARRANTY_VIEW - Allows viewing warranty details and status
└── WARRANTY_VOID - Allows voiding warranties (sensitive, ADMIN may reserve this)

Total: 25 features across 7 modules
```

---

## Phase 2: Company Onboarding

### Creating the Root Organization

ADMIN onboards a new company by creating a ROOT organization.

```
Example: ADMIN creates Acme Electronics as a new company on the platform.

Organization Record:
- Name: "Acme Electronics" (display name shown in UI)
- Slug: "acme-electronics" (used in URLs like /acme-electronics/app)
- Company Name: "Acme Electronics Pvt Ltd" (official legal name)
- Type: ROOT (top-level organization, no parent)
- rootId: null (ROOT organizations have no root)
- parentId: null (ROOT organizations have no parent)
- isActive: true (organization is active and all users can access it)
- Created By: ADMIN's user ID (for audit trail)
```

### Creating the Company Super Admin User

ADMIN creates the person who will administer Acme Electronics in two steps.

```
Example: ADMIN invites John Doe to be the Company Super Admin of Acme Electronics.

Step 1 - Create Global User Record:
- Email: "john@acme.com" (unique across entire platform)
- First Name: "John"
- Last Name: "Doe"
- Full Name: "John Doe" (auto-generated from first and last name)
- Global Role: CONSUMER (default platform-wide role, actual power comes from UserAccess)
- isActive: true

Step 2 - Create UserAccess Record (this connects John to Acme):
- User: John's user ID
- Organization: Acme Electronics' organization ID
- Portal Type: "COMPANY" (gives access to Company Portal at /acme-electronics/app)
- Role: "COMPANY_SUPER_ADMIN" (makes John the organization administrator)
- Partner Type: null (Super Admin is neither internal staff nor external partner)
- Dealer Type: null (Super Admin does not need a DealerType for permissions)

This UserAccess record is CREATED NOW during onboarding, not when John later logs in.
An invitation email is sent to john@acme.com to complete account setup.
```

---

## Phase 3: Feature Enablement for Organization

### ADMIN Defines What Acme Electronics Can Use

ADMIN decides which features Acme Electronics can access and creates the organization's feature set.

```
Example: ADMIN determines Acme Electronics is a full-service manufacturer that needs most features.

Step 1 - Create Reference DealerType for Organization Features:
ADMIN creates a DealerType called "OrgFeatures_Acme" to serve as a container for Acme's features.
- Name: "OrgFeatures_Acme" (internal reference, not shown to company users)
- partnerType: "INTERNAL" (doesn't matter for this purpose)
- Created By: ADMIN's user ID

Step 2 - ADMIN creates FeatureAccess records for all enabled features:
ADMIN enables 22 out of 25 features for Acme Electronics:

Enabled features (22):
- PRODUCT_CREATE, PRODUCT_VIEW, PRODUCT_UPDATE, PRODUCT_DELETE
- CLAIM_CREATE, CLAIM_VIEW, CLAIM_UPDATE, CLAIM_APPROVE, CLAIM_ASSIGN
- REGISTRATION_CREATE, REGISTRATION_VIEW
- PARTNER_CREATE, PARTNER_VIEW, DEALER_TYPE_MANAGE, BRANCH_CREATE
- BRAND_CREATE, BRAND_VIEW, BRAND_UPDATE
- CATEGORY_CREATE, CATEGORY_VIEW, CATEGORY_UPDATE
- WARRANTY_VIEW

NOT enabled (3):
- WARRANTY_VOID (ADMIN reserves this for platform administrators)
- FORM_SCHEMA_MANAGE (ADMIN-only feature, never available to companies)
- WARRANTY_TEMPLATE_MANAGE (ADMIN-only feature, never available to companies)

Each enabled feature gets a FeatureAccess record linking OrgFeatures_Acme to that feature.
```

### What This Means for Acme

```
These 22 FeatureAccess records define the absolute maximum any user in Acme can ever access.
When John logs in as Company Super Admin, the system queries all FeatureAccess for Acme
without filtering by dealerTypeId, returning all 22 features.

When John later creates DealerTypes for his staff and partners, the system shows him only
these 22 features as available options. He can never assign WARRANTY_VOID because it doesn't
exist in Acme's FeatureAccess records.
```

---

## Phase 4: Core Configuration

### ADMIN Creates Form Schemas

ADMIN creates form schemas that define the structure of data entry forms. Company users fill out these forms daily but cannot modify their structure.

```
Example: Product Form Schema

Type: "PRODUCT"
Name: "Product Schema"
Version: 1 (incremented when schema is modified)
Status: Active (published and available for use)

The schema defines these fields:
1. productName - Text field, Required, Label: "Product Name"
2. modelNumber - Text field, Required, Label: "Model Number"
3. serialNumber - Text field, Optional, Label: "Serial Number"
4. description - Textarea field, Optional, Label: "Description"
5. price - Number field, Optional, Label: "Price (USD)"
6. manufacturingDate - Date field, Optional, Label: "Manufacturing Date"

When John creates a product, the system renders exactly these six fields.
John cannot add a seventh field or change "price" from optional to required.
Only ADMIN can modify this schema.
```

```
Example: Registration Form Schema

Type: "REGISTRATION"
Name: "Registration Schema"
Version: 1

Fields:
1. purchaseDate - Date field, Required, Label: "Purchase Date"
2. purchasePrice - Number field, Optional, Label: "Purchase Price"
3. invoiceNumber - Text field, Optional, Label: "Invoice Number"
4. sellerOrgId - Reference field (to Organization), Optional, Label: "Sold By"
5. customerNotes - Textarea field, Optional, Label: "Notes"

When Alice registers a product, she fills in these fields. The sellerOrgId can track
which branch partner sold the product.
```

```
Example: Claim Form Schema

Type: "CLAIM"
Name: "Claim Schema"
Version: 1

Fields:
1. issueDescription - Textarea field, Required, Label: "Issue Description"
2. issueDate - Date field, Required, Label: "Date Issue Occurred"
3. severity - Select field, Required, Label: "Severity"
   Options: "LOW", "MEDIUM", "HIGH", "CRITICAL"
4. warrantyId - Reference field (to Warranty), Required, Label: "Under Warranty"

When Jane files a claim, she describes the issue, when it happened, how severe it is,
and which warranty she's claiming against.
```

### ADMIN Creates Warranty Templates

ADMIN creates warranty templates with validation rules that determine coverage applicability.

```
Example: Standard 1-Year Warranty Template

Name: "Standard 1-Year Warranty"
Warranty Type: "FULL_REPLACEMENT"
Linked to: Product Schema (applies to all products)
Version: 1
Status: Active

Validation Rule:
Logic: AND (all conditions must pass)
Condition 1:
  - Check: registration.purchaseDate
  - Operator: WITHIN_DAYS
  - Value: 30
  - Meaning: Product must be registered within 30 days of purchase
  - Error Message: "Product must be registered within 30 days of purchase"

Scenario A - Warranty Applies:
Customer buys TV on June 15, 2024
Customer registers TV on July 10, 2024 (25 days after purchase)
Rule check: 25 days ≤ 30 days → PASSES
Warranty is APPLICABLE

Scenario B - Warranty Does Not Apply:
Customer buys TV on June 15, 2024
Customer registers TV on August 1, 2024 (47 days after purchase)
Rule check: 47 days > 30 days → FAILS
Warranty is NOT APPLICABLE
```

```
Example: Extended 2-Year Warranty Template

Name: "Extended 2-Year Warranty"
Warranty Type: "EXTENDED"
Linked to: Product Schema
Version: 1
Status: Active

Validation Rules:
Logic: AND (all conditions must pass)

Condition 1:
  - Check: registration.purchaseDate
  - Operator: WITHIN_DAYS
  - Value: 7
  - Meaning: Must register within 7 days of purchase

Condition 2:
  - Check: product.price
  - Operator: GTE (Greater Than or Equal)
  - Value: 500
  - Meaning: Product price must be $500 or more

Scenario A - Both Conditions Pass:
$1500 TV, registered 5 days after purchase
Condition 1: 5 days ≤ 7 days → PASSES
Condition 2: $1500 ≥ $500 → PASSES
Result: Warranty is APPLICABLE

Scenario B - First Condition Fails:
$1500 TV, registered 10 days after purchase
Condition 1: 10 days > 7 days → FAILS
Condition 2: $1500 ≥ $500 → PASSES
Result: Warranty is NOT APPLICABLE (AND logic requires all conditions)

Scenario C - Second Condition Fails:
$300 appliance, registered 3 days after purchase
Condition 1: 3 days ≤ 7 days → PASSES
Condition 2: $300 < $500 → FAILS
Result: Warranty is NOT APPLICABLE
```

---

## Phase 5: Company Super Admin First Login

### John Accepts His Invitation and Logs In

```
John receives an invitation email at john@acme.com. He clicks the link and is directed
to the Acme Electronics Company Portal at /acme-electronics/login.

John sets up his password or receives an OTP via email. After successful authentication,
the system resolves his permissions.

Permission Resolution Process:
1. System finds John's UserAccess record for Acme Electronics
2. System sees: role = "COMPANY_SUPER_ADMIN"
3. Following the COMPANY_SUPER_ADMIN logic:
   - Query all FeatureAccess where orgId = Acme AND isActive = true
   - No dealerTypeId filter applied
4. Returns all 22 features ADMIN enabled for Acme

John's JWT Token Contains:
- userId: John's ID
- orgId: Acme's ID
- orgSlug: "acme-electronics"
- portalType: "COMPANY"
- role: "COMPANY_SUPER_ADMIN"
- permissions: [22 feature codes]

What John Sees in the Portal:
✅ Product Management (Create, View, Update, Delete)
✅ Claims Management (Create, View, Update, Approve, Assign)
✅ Registration Management (Create, View)
✅ Partner Management (Create Partners, View Partners, Manage DealerTypes, Create Branches)
✅ Brand Management (Create, View, Update)
✅ Category Management (Create, View, Update)
✅ Warranty View

What John Does NOT See:
❌ Warranty Void (not enabled for Acme by ADMIN)
❌ Form Schema Management (ADMIN-only, never available in Company Portal)
❌ Warranty Template Management (ADMIN-only, never available in Company Portal)
```

---

## Phase 6: Company Super Admin Daily Operations

### Creating Brands

```
John navigates to the Brands section and creates three brands for Acme Electronics.

Brand 1:
- Name: "Samsung"
- Slug: "samsung" (auto-generated, unique within Acme)
- Description: "Samsung Electronics - Consumer electronics and appliances"
- Website: "https://www.samsung.com"
- Logo URL: "https://s3.amazonaws.com/acme/brands/samsung-logo.png"
- isActive: true
- Created By: John's user ID

Brand 2:
- Name: "LG"
- Slug: "lg"

Brand 3:
- Name: "Sony"
- Slug: "sony"

Another company could also create a brand with slug "samsung" without conflict
because the unique constraint is per organization (orgId + slug).
```

### Creating Categories

```
John creates a hierarchical category structure for Acme's products.

Root Category:
- Name: "Electronics"
- Slug: "electronics"
- Parent: null (root category, no parent)
- Sort Order: 1 (appears first in UI)
- isActive: true

Child Category 1 (under Electronics):
- Name: "Refrigerators"
- Slug: "refrigerators"
- Parent: Electronics category ID
- Sort Order: 1 (appears first under Electronics)

Child Category 2 (under Electronics):
- Name: "Televisions"
- Slug: "televisions"
- Parent: Electronics category ID
- Sort Order: 2 (appears second under Electronics)

Subcategory (under Refrigerators):
- Name: "Double Door"
- Slug: "double-door"
- Parent: Refrigerators category ID
- Sort Order: 1

Resulting Tree:
Electronics
├── Refrigerators
│   └── Double Door
└── Televisions
```

---

## Phase 7: DealerType Creation & Feature Assignment

### Understanding Available Features for DealerType Creation

```
When John clicks "Create DealerType", the system needs to show him what features he can
assign. Since John is COMPANY_SUPER_ADMIN, the system queries all FeatureAccess for Acme
without dealerTypeId filtering, returning all 22 features.

The UI displays toggles organized by module:
☑ PRODUCT_MANAGEMENT
  ☑ PRODUCT_CREATE
  ☑ PRODUCT_VIEW
  ☑ PRODUCT_UPDATE
  ☑ PRODUCT_DELETE

☑ CLAIMS_MANAGEMENT
  ☑ CLAIM_CREATE
  ☑ CLAIM_VIEW
  ☑ CLAIM_UPDATE
  ☑ CLAIM_APPROVE
  ☑ CLAIM_ASSIGN

... (all 22 features shown as toggleable)

Features not available (not in Acme's FeatureAccess):
❌ WARRANTY_VOID (not shown at all)
```

### Creating an INTERNAL DealerType for Support Staff

```
John creates a DealerType for his internal customer support team.

DealerType Record:
- Name: "SupportAgent"
- partnerType: "INTERNAL" (these users stay in Acme, no new org created)
- Description: "Customer support staff who handle claims and inquiries"
- isActive: true
- Created By: John's user ID

John selects 5 features from the 22 available:
☑ CLAIM_VIEW - Can see claim listings and details
☑ CLAIM_UPDATE - Can update claim information and add notes
☑ PRODUCT_VIEW - Can look up product information
☑ REGISTRATION_VIEW - Can verify customer registrations
☑ WARRANTY_VIEW - Can check warranty status and coverage

NOT selected (John decides SupportAgents don't need these):
☐ CLAIM_CREATE - Support agents process incoming claims, don't file new ones
☐ CLAIM_APPROVE - Requires manager level
☐ CLAIM_ASSIGN - Requires manager level
☐ PRODUCT_CREATE - Not relevant to support work
☐ All Partner Management features - Not relevant to support work
☐ All Brand/Category Management features - Not relevant to support work

For each selected feature, a FeatureAccess record is created:
- orgId: Acme
- dealerTypeId: SupportAgent
- featureId: [selected feature]
- isActive: true

Total FeatureAccess records created: 5
```

### Creating an EXTERNAL DealerType for Business Partners

```
John creates a DealerType for dealers who sell Acme products.

DealerType Record:
- Name: "AuthorizedDealer"
- partnerType: "EXTERNAL" (these users get their own branch organization)
- Description: "Authorized dealers who sell and register Acme products"
- isActive: true
- Created By: John's user ID

John selects 5 features:
☑ PRODUCT_VIEW - Can see product catalog and details
☑ REGISTRATION_CREATE - Can register products they sell
☑ REGISTRATION_VIEW - Can view their registration history
☑ CLAIM_VIEW - Can see claims related to their sales
☑ WARRANTY_VIEW - Can check warranty status for their customers

NOT selected:
☐ CLAIM_UPDATE - Dealers don't process claims
☐ All Partner Management features - Dealers don't manage Acme's team

Total FeatureAccess records created: 5
```

### Creating a Limited EXTERNAL DealerType

```
John creates an even more limited DealerType for simple retail partners.

DealerType Record:
- Name: "Retailer"
- partnerType: "EXTERNAL"
- Description: "Retail partners who only sell products"
- isActive: true

John selects only 2 features:
☑ PRODUCT_VIEW
☑ REGISTRATION_CREATE

Retailers can view products and register sales, nothing more.

Summary of DealerTypes John Created:
┌──────────────────┬────────────┬──────────┬──────────────────────────────────┐
│ Name             │ partnerType│ Features │ Typical Use                      │
├──────────────────┼────────────┼──────────┼──────────────────────────────────┤
│ SupportAgent     │ INTERNAL   │ 5        │ Internal customer support staff  │
│ AuthorizedDealer │ EXTERNAL   │ 5        │ External dealers with full access│
│ Retailer         │ EXTERNAL   │ 2        │ Simple retail partners           │
└──────────────────┴────────────┴──────────┴──────────────────────────────────┘
```

---

## Phase 8: Adding Internal Staff

### Inviting Alice as SupportAgent

```
John navigates to the user management section and invites Alice to join Acme as staff.

John fills in the invitation form:
- Email: alice@acme.com
- First Name: Alice
- Last Name: Smith
- Role: COMPANY_STAFF (she is an internal employee)
- partnerType: INTERNAL (she stays in Acme, no new organization needed)
- DealerType: SupportAgent (gives her 5 support-related features)

System Process:
1. Check if Alice already has a User record by searching for alice@acme.com
2. Alice is new to the platform, so create a User record:
   - Email: alice@acme.com
   - First Name: Alice
   - Last Name: Smith
   - Full Name: Alice Smith (auto-generated)
   - Global Role: CONSUMER (default platform-wide role)
   - isActive: true

3. Create UserAccess record connecting Alice to Acme:
   - User: Alice's new user ID
   - Organization: Acme Electronics (SAME organization as John)
   - Portal Type: "COMPANY"
   - Role: "COMPANY_STAFF"
   - partnerType: "INTERNAL" (she is an internal employee)
   - DealerType: SupportAgent ID (links to her permissions)

4. NO new organization is created because partnerType is INTERNAL.

5. Send invitation email to alice@acme.com
```

### Alice's Login and Permissions

```
Alice receives the invitation, sets up her account, and logs in at /acme-electronics/login.

Permission Resolution:
1. System finds Alice's UserAccess for Acme
2. Role is "COMPANY_STAFF" (not COMPANY_SUPER_ADMIN)
3. Following the non-admin logic:
   - Query FeatureAccess where:
     - orgId = Acme
     - dealerTypeId = SupportAgent
     - isActive = true
4. Returns 5 features

Alice's JWT Token:
- userId: Alice's ID
- orgId: Acme's ID
- portalType: "COMPANY"
- role: "COMPANY_STAFF"
- permissions: [CLAIM_VIEW, CLAIM_UPDATE, PRODUCT_VIEW, REGISTRATION_VIEW, WARRANTY_VIEW]

What Alice Sees:
✅ View Claims
✅ Update Claims (add notes, update information)
✅ View Products
✅ View Registrations
✅ View Warranties

What Alice Does NOT See:
❌ Create Claims (not in her features)
❌ Approve Claims (not in her features)
❌ Create Products (not in her features)
❌ Any Partner Management (not in her features)
❌ Any Brand/Category Management (not in her features)

Alice can now help customers by looking up their claims, checking warranty status,
and updating claim information. She cannot approve claims or manage other users.
```

---

## Phase 9: Adding External Partners

### Adding Best Buy Electronics as AuthorizedDealer

```
John navigates to add a new external partner. He fills in the partner invitation form:

- Partner Company Name: "Best Buy Electronics"
- Admin Email: bob@bestbuy.com
- Admin First Name: Bob
- Admin Last Name: Johnson
- Role: COMPANY_PARTNER
- partnerType: EXTERNAL (this will create a new branch organization)
- DealerType: AuthorizedDealer (gives 5 dealer-related features)

System Process:

Step 1 - Create Branch Organization:
Because partnerType is EXTERNAL, the system creates a new organization:
- Name: "Best Buy Electronics"
- Slug: "best-buy-electronics" (auto-generated, unique across platform)
- Company Name: "Best Buy Electronics LLC"
- Type: BRANCH (child organization)
- rootId: Acme Electronics' ID (always points to top-level ROOT)
- parentId: Acme Electronics' ID (immediate parent)
- isActive: true
- Created By: John's user ID

Step 2 - Create or Find User:
Check if bob@bestbuy.com already has a User record.
Bob is new, so create a User record:
- Email: bob@bestbuy.com
- First Name: Bob
- Last Name: Johnson
- Full Name: Bob Johnson
- Global Role: CONSUMER
- isActive: true

Step 3 - Create UserAccess:
- User: Bob's new user ID
- Organization: Best Buy Electronics (the NEW branch org, not Acme directly)
- Portal Type: "COMPANY"
- Role: "COMPANY_PARTNER"
- partnerType: "EXTERNAL"
- DealerType: AuthorizedDealer ID

Step 4 - Send invitation email to bob@bestbuy.com
```

### Bob's Login and Permissions

```
Bob receives the invitation, sets up his account, and logs in at /best-buy-electronics/login.

Permission Resolution:
1. System finds Bob's UserAccess for Best Buy Electronics
2. Role is "COMPANY_PARTNER" (not COMPANY_SUPER_ADMIN)
3. Following the non-admin logic:
   - Query FeatureAccess where:
     - orgId = Best Buy Electronics
     - dealerTypeId = AuthorizedDealer
     - isActive = true
4. Returns 5 features

Bob's JWT Token:
- userId: Bob's ID
- orgId: Best Buy Electronics' ID
- portalType: "COMPANY"
- role: "COMPANY_PARTNER"
- permissions: [PRODUCT_VIEW, REGISTRATION_CREATE, REGISTRATION_VIEW, CLAIM_VIEW, WARRANTY_VIEW]

What Bob Sees:
✅ View Products (see Acme's product catalog)
✅ Create Registrations (register products he sells)
✅ View Registrations (see his registration history)
✅ View Claims (see claims related to his sales)
✅ View Warranties (check warranty status for his customers)

What Bob Does NOT See:
❌ Create Products (not a manufacturer)
❌ Update Claims (claims handled by Acme's support team)
❌ Manage Partners (Bob can't manage Acme's other partners)
❌ Brand/Category Management (Acme manages this)

Organization Hierarchy Now:
Acme Electronics (ROOT)
  └── Best Buy Electronics (BRANCH)
      - rootId: Acme
      - parentId: Acme
```

---

## Phase 10: Multi-Role User Handling

### Scenario: Alice is Both Employee and Consumer

```
Alice works at Acme Electronics as a SupportAgent. In her personal life, she buys a Samsung
TV from Company X and an LG Washing Machine from Company Y. She uses the same email
(alice@acme.com) for everything.

Alice's UserAccess Records:

Record 1 - Employee at Acme:
- orgId: Acme Electronics
- portalType: "COMPANY"
- role: "COMPANY_STAFF"
- partnerType: "INTERNAL"
- dealerTypeId: SupportAgent
- Created: When John invited her

Record 2 - Consumer at Company X:
- orgId: Company X
- portalType: "CONSUMER"
- role: null
- partnerType: null
- dealerTypeId: null
- Created: Auto-created when she registered her TV on Company X's consumer portal

Record 3 - Consumer at Company Y:
- orgId: Company Y
- portalType: "CONSUMER"
- role: null
- partnerType: null
- dealerTypeId: null
- Created: Auto-created when she registered her washing machine on Company Y's consumer portal

Alice has ONE User record but THREE UserAccess records.
```

### Alice's Login Experience

```
Alice visits the login page and enters her email (alice@acme.com) and password/OTP.

The system finds her User record, then retrieves all her UserAccess records:

Available Profiles shown to Alice:
┌─────────────────────────────────────────────────────────────┐
│ Profile 1: Acme Electronics - SupportAgent (Employee)       │
│   Portal: Company Portal                                    │
│   Access: Process claims and help customers                 │
├─────────────────────────────────────────────────────────────┤
│ Profile 2: Company X - Consumer (My Products)               │
│   Portal: Consumer Portal                                   │
│   Access: View my Samsung TV warranty                       │
├─────────────────────────────────────────────────────────────┤
│ Profile 3: Company Y - Consumer (My Products)               │
│   Portal: Consumer Portal                                   │
│   Access: View my LG Washing Machine warranty               │
└─────────────────────────────────────────────────────────────┘

Alice selects Profile 2 (Company X Consumer).
The system generates a JWT with Company X's context and consumer permissions.
She can now see her TV warranty details.

Later, Alice switches to Profile 1 (Acme Employee).
The system generates a new JWT with Acme's context and SupportAgent permissions.
She can now process customer claims at work.
```

### Same User, Same Organization, Both Portals

```
What if Alice also buys an Acme product for personal use?

Alice would have a FOURTH UserAccess record:
- orgId: Acme Electronics (same org as her employee record)
- portalType: "CONSUMER" (different portal type)
- role: null
- dealerTypeId: null

This works because the unique constraint is [userId, orgId, portalType]:
- Record 1: [alice, acme, COMPANY] - Employee access
- Record 4: [alice, acme, CONSUMER] - Consumer access
Both can exist simultaneously without conflict.
```

### Data Isolation Across Profiles

```
When Alice is in Profile 2 (Company X Consumer):
- All queries filter by orgId = Company X AND createdBy = Alice's userId
- She sees ONLY her TV registration and warranty
- She CANNOT see other Company X consumers' data
- She CANNOT see any Acme company data
- She CANNOT see her Company Y data

When Alice switches to Profile 1 (Acme Employee):
- All queries filter by orgId = Acme (no createdBy filter for staff)
- She sees ALL claims in Acme (based on her SupportAgent permissions)
- She CANNOT see her personal consumer data from Company X or Company Y
```

---

## Phase 11: Product & Part Management

### Creating a Product

```
John (or any user with PRODUCT_CREATE permission) creates a new product.

The system fetches the Product FormSchema and renders a form with these fields:
- Product Name* (required text)
- Model Number* (required text)
- Serial Number (optional text)
- Description (optional textarea)
- Price (optional number)
- Manufacturing Date (optional date)

John fills in the form for a Samsung TV:
- Product Name: "Samsung 55-inch 4K Smart TV"
- Model Number: "TV-55-4K-2024"
- Serial Number: "TV-001"
- Description: "55-inch 4K UHD Smart TV with HDR support and built-in streaming apps"
- Price: 1500.00
- Manufacturing Date: 2024-05-01

A FormData record is created:
- orgId: Acme Electronics
- formSchemaId: Product Schema ID
- formType: "PRODUCT"
- data: JSON containing all the field values entered above
- status: "ACTIVE"
- createdBy: John's user ID

This product is now available for registration and warranty coverage.
```

### Creating Parts for a Product

```
John creates a part for the Samsung TV - the Smart Remote.

The system fetches the Part FormSchema and renders fields:
- Part Name* (required)
- Part Type* (required)
- Serial Number (optional)
- Description (optional)

John fills in:
- Part Name: "Smart Remote Control"
- Part Type: "Accessory"
- Serial Number: "REM-001"
- Description: "Voice-enabled smart remote with dedicated streaming buttons"

A FormData record is created:
- orgId: Acme Electronics
- formSchemaId: Part Schema ID
- formType: "PART"
- parentProductDataId: Samsung TV's FormData ID (links part to product)
- data: JSON with part details
- status: "ACTIVE"
- createdBy: John's user ID

Product-Part Relationship:
Samsung 55-inch 4K Smart TV (Product)
  └── Smart Remote Control (Part)

If John adds a power cable part, it would also link to the same TV product.
```

---

## Phase 12: Registration & Warranty Creation

### Alice Registers a Product Sold to a Customer

```
Alice (SupportAgent) registers a Samsung TV that was sold to a customer.

The system fetches the Registration FormSchema and renders:
- Purchase Date* (required date)
- Purchase Price (optional number)
- Invoice Number (optional text)
- Sold By (optional reference to Organization)
- Notes (optional textarea)

Alice selects the Samsung TV product and fills in:
- Purchase Date: 2024-06-15
- Purchase Price: 1500.00
- Invoice Number: "INV-2024-001"
- Sold By: Best Buy Electronics (the dealer who sold it)
- Notes: "Customer purchased during summer sale event"

A FormData record is created:
- orgId: Acme Electronics
- formSchemaId: Registration Schema ID
- formType: "REGISTRATION"
- registeredProductId: Samsung TV's FormData ID
- data: JSON with purchase details
- status: "ACTIVE"
- createdBy: Alice's user ID
```

### Automated Warranty Evaluation

```
Immediately after the registration is saved, the system runs the warranty engine.

Step 1 - Gather Context:
The system retrieves:
- Registration data: purchaseDate=2024-06-15, purchasePrice=1500
- Product data: Samsung TV, price=1500
- Parts data: Smart Remote (partType=Accessory)
- Brand: Samsung
- Categories: Electronics → Televisions

Step 2 - Find Applicable Templates:
The system finds all active warranty templates linked to:
- Product Schema (for product-level warranties)
- Part Schema (for part-level warranties)

Three templates are found:
1. Standard 1-Year Warranty (Product Schema)
2. Extended 2-Year Warranty (Product Schema)
3. Parts Coverage (Part Schema)

Step 3 - Build Evaluation Context:
{
  registration: { purchaseDate: "2024-06-15", purchasePrice: 1500 },
  product: { productName: "Samsung 55-inch 4K Smart TV", price: 1500 },
  parts: [{ partName: "Smart Remote Control", partType: "Accessory" }],
  brand: { name: "Samsung" },
  categories: [{ name: "Electronics" }, { name: "Televisions" }]
}

Step 4 - Evaluate Each Template:

Template 1: Standard 1-Year Warranty
Rule: purchaseDate within 30 days of today
Today is July 10, 2024 (registration date)
Purchase was June 15, 2024 → 25 days ago
25 ≤ 30 → PASSES
Result: APPLICABLE ✅

Template 2: Extended 2-Year Warranty
Rule 1: purchaseDate within 7 days
25 days > 7 → FAILS ❌
Rule 2: product.price ≥ 500
1500 ≥ 500 → PASSES
Logic: AND → One condition fails, entire rule fails
Result: NOT APPLICABLE ❌
(The customer registered too late for extended warranty)

Template 3: Parts Coverage
Rule: partType must be Motor, Compressor, or Circuit Board
Smart Remote partType is "Accessory"
"Accessory" is NOT in [Motor, Compressor, Circuit Board]
Result: NOT APPLICABLE ❌
(Only specific part types are covered)

Step 5 - Create Warranty Records:

Warranty 1 (Standard - Applicable):
- registrationFormDataId: Registration record ID
- warrantyTemplateId: Standard 1-Year Warranty ID
- productFormDataId: Samsung TV product ID
- partFormDataId: null (product-level warranty)
- isApplicable: true
- templateSnapshot: {
    name: "Standard 1-Year Warranty",
    warrantyType: "FULL_REPLACEMENT",
    warrantyPeriod: { value: 12, unit: "MONTHS" },
    coverageDetails: [...],
    terms: [...],
    // Complete copy of template at this moment
  }
- status: "ACTIVE"
- warrantyStartDate: 2024-06-15 (from purchase date)
- warrantyEndDate: 2025-06-15 (calculated: start + 12 months)

Warranty 2 (Extended - Not Applicable):
- isApplicable: false
- status: "NOT_APPLICABLE"
- templateSnapshot: (still captured for audit)

Warranty 3 (Parts - Not Applicable):
- isApplicable: false
- status: "NOT_APPLICABLE"
```

### Why Template Snapshot Matters

```
The templateSnapshot field captures the COMPLETE warranty template at the moment of creation.

Six months later, ADMIN decides to change the Standard 1-Year Warranty:
- Old: 12 months coverage, 30-day registration window
- New: 6 months coverage, 15-day registration window

The Samsung TV registered on July 10, 2024 still has:
- 12 months coverage (from the snapshot)
- Coverage until June 15, 2025
- The original terms and conditions

Only NEW registrations after the template change get the updated 6-month terms.
This prevents retroactive changes to existing warranties.
```

---

## Phase 13: Consumer Portal Operations

### Jane's First Visit to the Consumer Portal

```
Jane Doe buys a Samsung TV from Best Buy Electronics. The store gives her a QR code
that links to acme-electronics/consumer/register.

Jane visits the consumer portal. She enters her email (jane@gmail.com) to get started.

System Process:
1. Check if User exists for jane@gmail.com
2. Jane is new - create User record:
   - Email: jane@gmail.com
   - First Name: (not yet provided)
   - Last Name: (not yet provided)
   - Full Name: (will be updated when Jane completes her profile)
   - Global Role: CONSUMER
   - isActive: true

3. Check if UserAccess exists for Jane + Acme + CONSUMER portal
4. No existing access - AUTO-CREATE UserAccess:
   - User: Jane's new user ID
   - Organization: Acme Electronics
   - Portal Type: "CONSUMER"
   - Role: null
   - partnerType: null
   - dealerTypeId: null

5. Generate OTP and send to jane@gmail.com

Jane enters the OTP and is authenticated. She completes her profile:
- First Name: Jane
- Last Name: Doe
```

### Jane Registers Her TV

```
Jane fills in the registration form on the consumer portal:

- Product: Selects "Samsung 55-inch 4K Smart TV" from available products
- Purchase Date: 2024-06-15
- Purchase Price: 1500.00
- Invoice Number: "INV-2024-001"

The same warranty evaluation process runs as in Phase 12.
Jane gets a Standard 1-Year Warranty for her TV (Extended warranty not applicable
because she registered 25 days after purchase).

A FormData registration record is created with createdBy set to Jane's user ID.
```

### Jane Views Her Warranties

```
Jane logs into the consumer portal at acme-electronics/consumer and views her dashboard.

The system queries:
- FormData where orgId = Acme AND formType = "REGISTRATION" AND createdBy = Jane's userId
- Returns: Jane's TV registration

For each registration, the system gets associated warranties:
- Warranty where registrationFormDataId = Jane's registration ID

Jane sees:
┌─────────────────────────────────────────────────────────────┐
│ My Products                                                 │
├─────────────────────────────────────────────────────────────┤
│ Samsung 55-inch 4K Smart TV                                 │
│ Model: TV-55-4K-2024                                        │
│ Registered: July 10, 2024                                   │
│                                                             │
│ Active Warranties:                                          │
│ ✅ Standard 1-Year Warranty                                 │
│    Type: Full Replacement                                   │
│    Coverage: June 15, 2024 - June 15, 2025                  │
│    Status: Active                                           │
│    [View Details] [Download Certificate]                    │
│                                                             │
│ Extended 2-Year Warranty                                    │
│    Status: Not Applicable                                   │
│    Reason: Must register within 7 days of purchase          │
│                                                             │
│ [File a Claim]                                              │
└─────────────────────────────────────────────────────────────┘

Jane cannot see other consumers' products.
Jane cannot see Acme's internal company data.
She sees ONLY her own registrations and warranties.
```

---

## Phase 14: Claims Management

### Jane Files a Claim

```
Jane's Samsung TV develops an issue. She logs into the consumer portal and files a claim.

She selects her TV warranty and fills in the Claim FormSchema fields:
- Issue Description: "TV screen has developed dead pixels in the top right corner.
  Approximately 15-20 pixels are not displaying correctly."
- Issue Date: 2024-08-01
- Severity: MEDIUM
- Warranty: Her Standard 1-Year Warranty ID

A FormData record is created:
- orgId: Acme Electronics
- formSchemaId: Claim Schema ID
- formType: "CLAIM"
- data: JSON with claim details
- status: "SUBMITTED" (initial status when claim is filed)
- createdBy: Jane's user ID
```

### Alice Processes the Claim

```
Alice (SupportAgent at Acme) sees the new claim in her dashboard.

She has CLAIM_VIEW and CLAIM_UPDATE permissions from her SupportAgent DealerType.

Alice reviews the claim:
- Customer: Jane Doe
- Product: Samsung 55-inch 4K Smart TV
- Warranty: Standard 1-Year Warranty (Active, valid until June 2025)
- Issue: Dead pixels on screen
- Severity: MEDIUM

Alice changes the claim status from SUBMITTED to IN_REVIEW.
She adds an internal note: "Contacted customer, requested photos of the screen.
Will escalate to warranty manager if photos confirm dead pixels."

Claim Workflow:
SUBMITTED → IN_REVIEW → (pending investigation)

Alice CAN update the claim (CLAIM_UPDATE permission).
Alice CANNOT approve the claim (CLAIM_APPROVE not in her permissions).
Alice would need to escalate to someone with CLAIM_APPROVE permission.

Later, a WarrantyManager (who has CLAIM_APPROVE permission) reviews and:
- Verifies the issue is covered under warranty
- Changes status from IN_REVIEW to APPROVED
- Adds note: "Approved for screen replacement under Standard Warranty"

Final Status:
SUBMITTED → IN_REVIEW → APPROVED → CLOSED

Jane can track her claim status through the consumer portal.
She sees the timeline: Submitted Aug 1 → In Review Aug 2 → Approved Aug 5 → Closed Aug 10.
```

---

## Phase 15: Branch Partner Hierarchy

### Bob Creates His Own Team at Best Buy

```
Bob is the admin of Best Buy Electronics (COMPANY_PARTNER with AuthorizedDealer DealerType).
He has 5 features: PRODUCT_VIEW, REGISTRATION_CREATE, REGISTRATION_VIEW, CLAIM_VIEW, WARRANTY_VIEW.

Bob wants to create a DealerType for his own staff. When he clicks "Create DealerType",
the system shows him available features. Since Bob is not COMPANY_SUPER_ADMIN, the system
shows only HIS 5 features as available to assign.

Bob sees only these toggles:
☑ PRODUCT_VIEW
☑ REGISTRATION_CREATE
☑ REGISTRATION_VIEW
☑ CLAIM_VIEW
☑ WARRANTY_VIEW

Features Bob CANNOT see or assign:
❌ PRODUCT_CREATE (Bob doesn't have this)
❌ CLAIM_UPDATE (Bob doesn't have this)
❌ Any Partner Management features (Bob doesn't have these)
❌ Any Brand/Category Management features (Bob doesn't have these)

Bob creates "BestBuyStaff" DealerType (INTERNAL) with 3 features:
☑ PRODUCT_VIEW
☑ REGISTRATION_CREATE
☑ REGISTRATION_VIEW

Bob creates "SubDealer" DealerType (EXTERNAL) with 2 features:
☑ PRODUCT_VIEW
☑ REGISTRATION_CREATE
```

### Bob Adds City Electronics as Sub-Partner

```
Bob adds City Electronics as an external sub-partner under Best Buy.

Step 1 - Create Sub-Branch Organization:
- Name: "City Electronics"
- Slug: "city-electronics"
- Type: BRANCH
- rootId: Acme Electronics (always points to top-level ROOT - NEVER changes)
- parentId: Best Buy Electronics (immediate parent)
- isActive: true

Step 2 - Create UserAccess for City admin:
- User: charlie@cityelectronics.com
- Organization: City Electronics (new branch)
- Role: "COMPANY_PARTNER"
- partnerType: "EXTERNAL"
- DealerType: SubDealer (2 features)

Organization Hierarchy:
Acme Electronics (ROOT) - rootId: null, parentId: null
  └── Best Buy Electronics (BRANCH) - rootId: Acme, parentId: Acme
        └── City Electronics (BRANCH) - rootId: Acme, parentId: Best Buy

Notice: City Electronics' rootId is Acme (NOT Best Buy).
rootId ALWAYS points to the top-level ROOT organization.
parentId points to the immediate parent (Best Buy).
```

### Permission Chain Across Hierarchy

```
Full Permission Chain:
ADMIN (all 25 features, global access)
  │
  └── Acme Electronics (22 features enabled by ADMIN)
        │
        ├── John (COMPANY_SUPER_ADMIN, 22 features)
        │     Can assign any of 22 features to DealerTypes
        │
        ├── Alice (COMPANY_STAFF, SupportAgent, 5 features)
        │     Can only do what SupportAgent allows
        │
        └── Best Buy Electronics (BRANCH)
              │
              └── Bob (COMPANY_PARTNER, AuthorizedDealer, 5 features)
                    Can assign any of his 5 features to DealerTypes
                    │
                    ├── Best Buy Staff (INTERNAL, 3 features)
                    │     Subset of Bob's 5 features
                    │
                    └── City Electronics (SUB-BRANCH)
                          │
                          └── Charlie (COMPANY_PARTNER, SubDealer, 2 features)
                                Can assign any of his 2 features
                                │
                                └── City Staff (INTERNAL, max 2 features)

The chain always narrows: 25 → 22 → 5 → 2
Nobody can grant permissions they don't have.
```

---

## Phase 16: Soft Delete & Inactive Records

### Deactivating a Brand

```
Acme Electronics decides to stop carrying Sony products. Instead of deleting the Sony brand,
John sets isActive to false.

Before deactivation:
- Sony brand appears in dropdown menus for new product creation
- Existing Sony products work normally

After deactivation (isActive = false):
- Sony brand no longer appears in dropdown menus for NEW product creation
- Existing products that reference Sony continue to work normally
- Existing warranties for Sony products remain valid
- Historical data remains intact for reporting and audits

If Acme later decides to carry Sony again, John sets isActive back to true.
```

### Soft Deleting a User

```
Alice leaves Acme Electronics. Instead of physically deleting her records:

User Record:
- deletedAt: 2024-12-31T00:00:00Z (timestamp when she was deleted)
- deletedBy: John's user ID (who performed the deletion)
- isActive: false (cannot login)

What remains intact:
- All FormData records created by Alice (registration records, claim updates)
- All audit trails showing Alice's actions
- All references to Alice as creator or updater
- Her UserAccess record (with deletedAt context)

What changes:
- Alice can no longer log in
- Alice does not appear in active user lists
- New assignments cannot be made to Alice

If Alice returns to Acme later, her account can be reactivated by clearing deletedAt
and setting isActive back to true.
```

### Deactivating a DealerType

```
John decides the Retailer DealerType is no longer needed. Instead of deleting it:

DealerType Record:
- isActive: false

What happens:
- Retailer no longer appears as an option when inviting new users
- Existing users assigned to Retailer continue to work normally
- Their FeatureAccess records remain active
- If John reactivates Retailer later, it reappears as an option

If John tries to delete a DealerType that has users assigned:
- System prevents deletion
- System shows message: "Cannot delete. 5 users are assigned to Retailer."
- John must reassign those users first, or simply deactivate the DealerType
```

### Deactivating an Organization

```
If ADMIN needs to suspend Acme Electronics temporarily:

Organization Record:
- isActive: false

What happens:
- ALL users in Acme cannot log in
- All branch organizations under Acme are also affected
- Data remains intact
- ADMIN can reactivate by setting isActive back to true

This is a master switch for the entire organization and all its branches.
```

---

## Phase 17: Edge Cases & Special Scenarios

### Edge Case 1: User Already Exists When Invited

```
Scenario: John invites alice@acme.com as SupportAgent, but Alice already has a User account
because she previously registered as a consumer on another company's portal.

System Process:
1. Search for User by email "alice@acme.com"
2. User FOUND (Alice already exists from previous consumer registration)
3. DO NOT create a new User record - use existing User ID
4. Check if UserAccess already exists for [Alice, Acme, COMPANY]
5. No existing COMPANY access - create UserAccess:
   - userId: Alice's EXISTING user ID
   - orgId: Acme
   - portalType: "COMPANY"
   - role: "COMPANY_STAFF"
   - partnerType: "INTERNAL"
   - dealerTypeId: SupportAgent ID

Result: Alice now has multiple UserAccess records:
- Original consumer access to Company X (CONSUMER portal)
- New staff access to Acme (COMPANY portal)

Alice's single User record now serves both purposes.
```

### Edge Case 2: Duplicate Invitation Prevention

```
Scenario: John accidentally tries to invite Alice again to Acme as staff.

System Process:
1. Find User by email "alice@acme.com" → Found
2. Check UserAccess for [Alice, Acme, COMPANY] → FOUND (already exists)
3. Unique constraint [userId, orgId, portalType] prevents duplicate

System responds:
"Alice already has COMPANY access to Acme Electronics.
Current role: COMPANY_STAFF (SupportAgent).
You can update her role or DealerType instead of inviting again."
```

### Edge Case 3: Consumer Becomes Staff at Same Company

```
Scenario: Jane has been a consumer at Acme (registered her TV). Now Acme hires her as staff.

Jane's existing UserAccess:
- orgId: Acme, portalType: "CONSUMER", role: null

John invites Jane as COMPANY_STAFF with SupportAgent DealerType.

System creates second UserAccess:
- orgId: Acme, portalType: "COMPANY", role: "COMPANY_STAFF", dealerTypeId: SupportAgent

Both records coexist because the unique constraint includes portalType:
- [jane, acme, CONSUMER] - Her personal product registrations
- [jane, acme, COMPANY] - Her employee access

When Jane logs in, she sees both profiles:
1. Acme Electronics - SupportAgent (Employee)
2. Acme Electronics - Consumer (My Products)

She switches between them as needed.
```

### Edge Case 4: Branch Admin Gets Own Feature Set

```
Scenario: Bob is COMPANY_PARTNER at Best Buy with AuthorizedDealer DealerType (5 features).
Bob needs to manage his branch - add staff, create DealerTypes, etc.

Bob's permissions in Best Buy come from FeatureAccess filtered by:
- orgId = Best Buy Electronics
- dealerTypeId = AuthorizedDealer
- isActive = true

Bob gets 5 features. He can:
- Create DealerTypes (if his 5 features include DEALER_TYPE_MANAGE - but it doesn't in this case)
- Add Internal staff to Best Buy
- Add External sub-partners

But Bob can ONLY assign from his 5 features. If DEALER_TYPE_MANAGE is not in his features,
he cannot create DealerTypes at all. John would need to add this to the AuthorizedDealer
DealerType if he wants branch admins to manage their own DealerTypes.
```

### Edge Case 5: ADMIN Adds a New Feature to Existing Organizations

```
Scenario: ADMIN creates a new feature "EXPORT_REPORTS" and wants to make it available.

Step 1: ADMIN adds feature to Feature table:
- Code: "EXPORT_REPORTS"
- Name: "Export Reports"
- Parent: null (root-level module)
- Status: ENABLED

Step 2: ADMIN decides which organizations get this feature.

For Acme Electronics (which has an OrgFeatures_Acme DealerType):
- ADMIN creates FeatureAccess: orgId=Acme, dealerTypeId=OrgFeatures_Acme, featureId=EXPORT_REPORTS
- Initially set isActive: false (disabled by default, ADMIN enables when ready)
- John (Company Super Admin) does NOT see this feature yet because isActive is false

Step 3: ADMIN enables the feature:
- Set isActive: true on the FeatureAccess record
- Now John's next permission resolution includes EXPORT_REPORTS
- John sees the new feature in his portal and can assign it to DealerTypes

For organizations where ADMIN does NOT create a FeatureAccess record:
- The feature simply doesn't exist for that organization
- Their Company Super Admin never sees it
```

### Edge Case 6: ADMIN Disables a Feature for an Organization

```
Scenario: ADMIN decides Acme should no longer have PRODUCT_DELETE capability.

ADMIN sets isActive to false on the FeatureAccess record:
- orgId: Acme, dealerTypeId: OrgFeatures_Acme, featureId: PRODUCT_DELETE, isActive: false

Effect:
- John's next permission resolution: PRODUCT_DELETE is no longer returned
  (query filters isActive: true)
- John no longer sees the Delete Product option in his UI
- All DealerTypes that had PRODUCT_DELETE effectively lose it
  (permission resolution for staff/partners also filters isActive: true)
- Even if SupportAgent DealerType had PRODUCT_DELETE in its FeatureAccess,
  the organization-level disablement overrides it

If ADMIN later re-enables it (isActive: true):
- PRODUCT_DELETE returns for everyone who had it
```

### Edge Case 7: Registration with Seller Tracking

```
Scenario: A customer buys a Samsung TV from Best Buy Electronics (branch) and the
registration tracks which branch made the sale.

Registration FormData:
- orgId: Acme Electronics (root organization)
- registeredProductId: Samsung TV product
- data: {
    purchaseDate: "2024-06-15",
    purchasePrice: 1500.00,
    sellerOrgId: Best Buy Electronics' orgId,  // Tracks which branch sold it
    invoiceNumber: "INV-2024-001"
  }

This allows reporting:
- How many products did Best Buy sell?
- What is the total sales value per branch?
- Which branches have the highest registration rates?

The sellerOrgId field stores the branch organization ID while the registration
itself belongs to the root organization (Acme).
```

### Edge Case 8: Same Consumer at Multiple Companies

```
Scenario: Jane buys products from three different companies on the platform.

Jane's UserAccess records:
1. Acme Electronics - CONSUMER (for her Samsung TV)
2. Company X - CONSUMER (for her LG Washing Machine)
3. Company Y - CONSUMER (for her Sony Headphones)

When Jane logs in with her email, she sees all three consumer profiles.
Each profile shows only products registered with that specific company.

Data Isolation:
- Jane cannot see Company X's products when logged into Acme's consumer portal
- Company X cannot see Jane's Acme registrations
- Each company's consumer data is completely isolated

Jane's registrations are stored as:
- FormData records with different orgId values (Acme, Company X, Company Y)
- All with createdBy = Jane's userId
- Each company can only query FormData where orgId matches their own ID
```

---

## Complete Permission Resolution Logic

### The Decision Flow

```
When a user accesses any protected route, the system resolves their permissions:

Step 1: Identify the User and Organization Context
- Extract userId and orgId from the JWT token
- Find the UserAccess record matching [userId, orgId, portalType]

Step 2: Check Portal Type
- If portalType is "CONSUMER":
  → Return hardcoded consumer permissions
  → [PRODUCT_REGISTER, WARRANTY_VIEW, CLAIM_CREATE, CLAIM_VIEW, REGISTRATION_VIEW]
  → Stop here, no further database queries needed

Step 3: Check Role
- If role is "COMPANY_SUPER_ADMIN":
  → Query FeatureAccess where orgId = current org AND isActive = true
  → Do NOT filter by dealerTypeId
  → Return all unique feature codes

- If role is "COMPANY_STAFF" or "COMPANY_PARTNER":
  → Check if dealerTypeId exists
  → If no dealerTypeId, return empty permissions
  → Query FeatureAccess where orgId = current org
    AND dealerTypeId = user's dealerTypeId
    AND isActive = true
  → Return those feature codes
```

### Permission Resolution Examples

```
Example 1: John (COMPANY_SUPER_ADMIN)
UserAccess: { role: "COMPANY_SUPER_ADMIN", orgId: "Acme", dealerTypeId: null }

Resolution:
1. portalType is "COMPANY" → not consumer
2. role is "COMPANY_SUPER_ADMIN" → use org-only filter
3. Query: FeatureAccess where orgId="Acme" AND isActive=true
4. Returns: All 22 feature codes

John gets: [PRODUCT_CREATE, PRODUCT_VIEW, ..., WARRANTY_VIEW]

---------------------------------------------------------------

Example 2: Alice (COMPANY_STAFF)
UserAccess: { role: "COMPANY_STAFF", orgId: "Acme", dealerTypeId: "SupportAgent" }

Resolution:
1. portalType is "COMPANY" → not consumer
2. role is "COMPANY_STAFF" → use dealerTypeId filter
3. dealerTypeId exists → "SupportAgent"
4. Query: FeatureAccess where orgId="Acme" AND dealerTypeId="SupportAgent" AND isActive=true
5. Returns: 5 feature codes

Alice gets: [CLAIM_VIEW, CLAIM_UPDATE, PRODUCT_VIEW, REGISTRATION_VIEW, WARRANTY_VIEW]

---------------------------------------------------------------

Example 3: Bob (COMPANY_PARTNER)
UserAccess: { role: "COMPANY_PARTNER", orgId: "Best Buy", dealerTypeId: "AuthorizedDealer" }

Resolution:
1. portalType is "COMPANY" → not consumer
2. role is "COMPANY_PARTNER" → use dealerTypeId filter
3. dealerTypeId exists → "AuthorizedDealer"
4. Query: FeatureAccess where orgId="Best Buy" AND dealerTypeId="AuthorizedDealer" AND isActive=true
5. Returns: 5 feature codes

Bob gets: [PRODUCT_VIEW, REGISTRATION_CREATE, REGISTRATION_VIEW, CLAIM_VIEW, WARRANTY_VIEW]

---------------------------------------------------------------

Example 4: Jane (CONSUMER)
UserAccess: { portalType: "CONSUMER", orgId: "Acme", role: null, dealerTypeId: null }

Resolution:
1. portalType is "CONSUMER" → return hardcoded permissions
2. No database query needed

Jane gets: [PRODUCT_REGISTER, WARRANTY_VIEW, CLAIM_CREATE, CLAIM_VIEW, REGISTRATION_VIEW]
```

---

## Complete Data Flow Summary

### System Initialization

```
ADMIN creates 25 features organized in 7 modules → Feature Table populated
```

### Company Onboarding

```
ADMIN creates Acme Electronics (ROOT organization)
ADMIN creates John's User record (global account)
ADMIN creates John's UserAccess (COMPANY_SUPER_ADMIN, no DealerType)
→ User, Organization, UserAccess tables have initial records
```

### Feature Enablement

```
ADMIN creates OrgFeatures_Acme DealerType (reference container)
ADMIN creates 22 FeatureAccess records for Acme
→ DealerType and FeatureAccess tables populated
```

### Core Configuration

```
ADMIN creates 4 FormSchemas (Product, Part, Registration, Claim)
ADMIN creates 3 WarrantyTemplates (Standard, Extended, Parts)
→ FormSchema and WarrantyTemplate tables populated
```

### Company Admin Operations

```
John logs in → System resolves 22 permissions
John creates 3 Brands (Samsung, LG, Sony)
John creates Category hierarchy (Electronics → Refrigerators, TVs)
→ Brand and Category tables populated
```

### DealerType Creation

```
John creates SupportAgent (INTERNAL, 5 features)
John creates AuthorizedDealer (EXTERNAL, 5 features)
John creates Retailer (EXTERNAL, 2 features)
→ 3 new DealerTypes + 12 new FeatureAccess records
```

### Staff and Partner Addition

```
Alice invited as COMPANY_STAFF (SupportAgent) → 5 permissions
Bob added as COMPANY_PARTNER (AuthorizedDealer) → New Best Buy branch org created
→ User and UserAccess tables grow, Organization table gets branch
```

### Multi-Role Users

```
Alice registers TV on Company X → Auto-creates CONSUMER UserAccess
Alice registers Washer on Company Y → Auto-creates CONSUMER UserAccess
→ Alice has 3 UserAccess records from 1 User record
```

### Products and Registrations

```
John creates Samsung TV (Product FormData)
Alice registers TV for customer (Registration FormData)
→ FormData table grows
```

### Warranty Generation

```
System evaluates 3 warranty templates against registration
Creates Warranty records with immutable template snapshots
→ Warranty table populated
```

### Consumer Operations

```
Jane signs up on Acme consumer portal → User + UserAccess created
Jane registers her TV → Registration + Warranty created
Jane files claim → Claim FormData created
→ All tables continue growing with consumer data
```

### Claims Processing

```
Alice reviews Jane's claim (SUBMITTED → IN_REVIEW)
WarrantyManager approves claim (IN_REVIEW → APPROVED → CLOSED)
→ Claim FormData updated with status changes
```

### Branch Hierarchy

```
Bob creates BestBuyStaff DealerType (3 of his 5 features)
Bob adds City Electronics as sub-partner → Another branch org created
→ Hierarchy: Acme → Best Buy → City Electronics
```

---

## Summary of All Tables and Their Contents

```
Feature Table: 25 records
├── 7 parent modules (PRODUCT_MANAGEMENT, CLAIMS_MANAGEMENT, etc.)
└── 18 child permissions (PRODUCT_CREATE, CLAIM_VIEW, etc.)

Organization Table: 3 records
├── Acme Electronics (ROOT)
├── Best Buy Electronics (BRANCH, rootId: Acme, parentId: Acme)
└── City Electronics (BRANCH, rootId: Acme, parentId: Best Buy)

User Table: 6 records
├── John Doe (john@acme.com)
├── Alice Smith (alice@acme.com)
├── Bob Johnson (bob@bestbuy.com)
├── Charlie (charlie@cityelectronics.com)
├── Jane Doe (jane@gmail.com)
└── ADMIN user

UserAccess Table: 9+ records
├── John → Acme (COMPANY_SUPER_ADMIN)
├── Alice → Acme (COMPANY_STAFF, SupportAgent)
├── Alice → Company X (CONSUMER)
├── Alice → Company Y (CONSUMER)
├── Bob → Best Buy (COMPANY_PARTNER, AuthorizedDealer)
├── Charlie → City Electronics (COMPANY_PARTNER, SubDealer)
├── Jane → Acme (CONSUMER)
└── ... (others as needed)

DealerType Table: 6+ records
├── OrgFeatures_Acme (reference for org feature set)
├── SupportAgent (INTERNAL, 5 features)
├── AuthorizedDealer (EXTERNAL, 5 features)
├── Retailer (EXTERNAL, 2 features)
├── BestBuyStaff (INTERNAL, 3 features)
└── SubDealer (EXTERNAL, 2 features)

FeatureAccess Table: 39+ records
├── 22 records (OrgFeatures_Acme → features)
├── 5 records (SupportAgent → features)
├── 5 records (AuthorizedDealer → features)
├── 2 records (Retailer → features)
├── 3 records (BestBuyStaff → features)
└── 2 records (SubDealer → features)

FormSchema Table: 4 records (Product, Part, Registration, Claim)
WarrantyTemplate Table: 3 records (Standard, Extended, Parts)
FormData Table: Multiple records (Products, Parts, Registrations, Claims)
Warranty Table: Multiple records (one per applicable template per registration)
Brand Table: 3 records (Samsung, LG, Sony)
Category Table: Multiple records in hierarchy
```
