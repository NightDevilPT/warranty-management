Here's a professionally refined version of your document with improved structure, consistency, and clarity:

---

# Warranty Management System Documentation

## Role Definitions
```ts
enum ROLES {
  ADMIN
  COMPANY_ADMIN
  PARTNER
  CONSUMER
}
```


## Field Definitions
```ts
interface Field {
  fieldId: String        // Unique identifier (e.g., "warranty_months")
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'CHECKBOX' | 'DATE' | 'FILE';
  label: String          // Display label
  placeholder?: String   // Optional hint text
  defaultValue?: Any     // Pre-filled value
  required: Boolean      // default: false
  options?: {            // For SELECT/RADIO types
    value: String
    label: String
  }[]
  validation?: {
    min?: Number         // For numbers/dates
    max?: Number
    pattern?: String     // Regex for text
    errorMessage?: String
  }
  ui?: {
    width?: String       // "50%", "full" etc.
    order?: Number       // Display sequence
    group?: String       // Section reference
  }
}
```

## Section Definition
```ts
interface Section {
  sectionId: String      // Unique identifier
  title: String          // Display header
  columns?: Number       // 1|2|3 column layout
  isCollapsible?: Boolean
  order: Number          // Display sequence
}
```


## Database Schema

### User Collection
```mermaid
erDiagram
  USER {
    ObjectId _id PK
    String firstName
    String lastName
    String email "unique, indexed"
    String avatar
    String role "ROLES, indexed"
    ObjectId tenantId "ref: Tenant, indexed"
    ObjectId settingsId "ref: Settings"
    Date createdAt "indexed"
    Date updatedAt
  }
```

### Settings Collection
```mermaid
erDiagram
  SETTINGS {
    ObjectId _id PK
    ObjectId userId "ref: User, unique, indexed"
    String theme "enum: DARK|LIGHT"
    String color "enum: RED|BLUE|GREEN"
    String view "enum: GRID|TABLE"
    String language "enum: EN|ES"
    Date createdAt
  }
```

## Administrative Privileges

### Admin Dashboard Functionality

#### Company Management
- View all registered companies
- Create/update company profiles and associated user records
- Company-specific operations:
  - **Company Details**: Full CRUD capabilities
  - **Warranty Templates**: Manage templates (CRUD)

#### Form Configuration
- Customizable form schemas:
  - Product : Dynamic Form Schema
  - Issue : Dynamic Form Schema
  - Categories : Dynamic Form Schema
  - Brands : Dynamic Form Schema
  - Fault : Dynamic Form Schema

#### Templates
- Customizable Templates
	- Email Templates

#### Partner Ecosystem
- **Partner Types**: Manage Partner (Dealer/Retailer/Repairer)
- **Personas**: Configure role-based profiles
- **Permissions**: Define access control for each role

---

## Database Collections

### Permissions Collection
```mermaid
erDiagram
  PERMISSIONS {
    ObjectId _id PK
    ObjectId userId "ref: User, indexed"
    ObjectId rootTenantId "ref: Tenant (Company Admin)"
    Object permissions "Example: {
      MANAGE_TAB: {
        CREATE: boolean,
        UPDATE: boolean,
        DELETE: boolean,
        READ: boolean
      },
      ...
    }"
    Date createdAt "indexed"
    Date updatedAt
    ObjectId createdBy "ref: User"
  }
```

### Tenant Collection
```mermaid
erDiagram
  TENANT {
    ObjectId _id PK
    String orgName "unique, indexed"
    ObjectId userId "ref: User, indexed"
    ObjectId rootTenantId "ref: Tenant (Company Admin)"
    String logo
    Object address
    String email "required"
    String phone
    Boolean isActive "default: true"
    Date createdAt "indexed"
    Date updatedAt
  }
```

### PartnerType Collection
```mermaid
erDiagram
  PARTNERTYPE {
    ObjectId _id PK
    String title "enum: Dealer|Retailer|Repairer|etc"
    String description
    ObjectId userId "ref: User, indexed"
    ObjectId permissionsId "ref: Permissions"
    ObjectId rootTenantId "ref: Tenant (Company Admin)"
    Date createdAt
  }
```

### PartnerSchema Collection
```mermaid
erDiagram
  PARTNERSCHEMA {
    ObjectId _id PK
    Object default "{
      firstName: { type: String, required: Boolean },
      lastName: { type: String, required: Boolean },
      orgName: { type: String, required: Boolean },
      logo: { type: String, required: Boolean },
      email: { type: String, required: Boolean },
      address: { type: Object, required: Boolean },
      partnerType: { type: ObjectId, ref: PartnerType, required: Boolean }
    }"
    Object additional "{}"
    Date createdAt "indexed"
  }
```

### BusinessUserInvite Collection
```mermaid
erDiagram
  BUSINESSUSERINVITE {
    ObjectId _id PK
    String email "required, indexed"
    String role "enum: PARTNER|etc"
    String token "unique, required"
    String status "enum: PENDING|COMPLETED|EXPIRED"
    ObjectId tenantId "ref: Tenant, indexed"
    ObjectId rootTenant "ref: Tenant (Company Admin)"
    Date createdAt "indexed"
    Date expiresAt "indexed"
  }
```

### EmailTemplate Collection
```mermaid
erDiagram
  EMAIL_TEMPLATE {
    ObjectId _id PK
    ObjectId rootTenantId "ref: Tenant (Company Admin), required, indexed"
    String name "required, unique per tenant"
    String subject "required"
    String htmlContent "required"
    String textContent "required (plain text fallback)"
    String templateKey "required, unique, enum: WELCOME|PASSWORD_RESET|INVITATION|CLAIM_APPROVAL|etc."
    String senderName "required"
    String senderEmail "required, format: email"
    Boolean isActive "default: true"
    Array variables "required: [{
      key: String (e.g., 'userName'), 
      description: String (e.g., 'Recipient first name')
    }]"
    Date createdAt "indexed"
    Date updatedAt
  }
```


### Form Schema Collection
**We can not use any lib so priovde me the proper type to make a proper type of form schema so via frontend by drag and drop we create form schema and this schema can be defined by the super admin for the onboarded company**
```mermaid
erDiagram
  DYNAMIC_FORM_SCHEMA {
    ObjectId _id PK
    ObjectId rootTenantId "ref: Tenant (Company Admin), required, indexed"
    String schemaType "required, enum: PRODUCT|ISSUE|CATEGORY|BRAND|FAULT|CUSTOM"
    String displayName "required, unique per tenant"
    
    Field[] fields "required, array of field definitions"
    Section[] sections "optional, form layout grouping"
    
    Object validationRules "validations"
	Object conditionalLogic "conditional logic"
    String status "enum: DRAFT|PUBLISHED|ARCHIVED, default: DRAFT"
    Integer version "required, default: 1"
    
    Date createdAt "indexed"
    Date updatedAt
    ObjectId createdBy "ref: User, indexed"
    ObjectId lastModifiedBy "ref: User"
  }
```

Example Documentation 
```
{
  "rootTenantId": "65a1bc...",
  "schemaType": "PRODUCT",
  "displayName": "Electronics Product Form",
  "fields": [
    {
      "fieldId": "product_name",
      "type": "TEXT",
      "label": "Product Name",
      "required": true,
      "ui": { "order": 1, "group": "basic_info" }
    },
    {
      "fieldId": "warranty_months",
      "type": "NUMBER",
      "label": "Warranty Period",
	  "required": true,
      "validation": { "min": 0, "max": 60 },
      "ui": { "order": 2, "group": "basic_info" }
    }
  ],
  "sections": [
    {
      "sectionId": "basic_info",
      "title": "Basic Information",
      "columns": 2,
      "order": 1
    }
  ],
  "status": "PUBLISHED",
  "version": 3
}
```

