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
    Array memberships "Array of { organizationId, roles[], rootOrgId }"
    ObjectId primaryOrganizationId "ref: Organization"
    ObjectId settingsId "ref: Settings"
    Date createdAt "indexed"
    Date updatedAt
  }
```

#### Example of Roles

```json
[
  { "organizationId": "global", "roles": ["ADMIN"] },
  { "organizationId": "Org1", "roles": ["COMPANY_ADMIN"] },
  { "organizationId": "Org2", "roles": ["PARTNER", "CONSUMER"] }
    {
      "organizationId": "global",
      "roles": ["ADMIN"],
    },
    {
      "organizationId": "org_electronics",
      "roles": ["COMPANY_ADMIN"],
      "rootOrgId": "org_electronics"
    },
    {
      "organizationId": "org_appliances",
      "roles": ["PARTNER", "CONSUMER"],
      "rootOrgId": "org_electronics"
    }
]
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
  - Warranty Templates

---

### Organization Collection

```mermaid
erDiagram
  Organization {
    ObjectId _id PK
    String orgName "unique, indexed"
    ObjectId userId "ref: User, indexed"
    ObjectId rootTenantId "ref: Organization (parent/root org)"
    String logo
    Object address
    String email "required"
    String phone
    Boolean isActive "default: true"
    Date createdAt "indexed"
    Date updatedAt
    Array companyAdminIds "ref: CompanyAdmin UserId"
    Array partnerIds "ref: Partner UserId"
    Array consumerIds "ref: Consumer UserId"
  }
```

### Form Schema

```ts
export type FieldType =
  | 'text' // Simple text box (like for name)
  | 'textarea' // Big text box (like for description)
  | 'number' // Only numbers allowed
  | 'select' // Dropdown menu (choose one option)
  | 'multi-select' // Choose multiple options
  | 'checkbox' // Yes/No checkbox
  | 'checkbox-group' // Multiple checkboxes
  | 'radio' // Radio buttons (choose one)
  | 'date' // Date picker
  | 'datetime' // Date and time picker
  | 'file' // File upload
  | 'image' // Image upload
  | 'url' // Website URL
  | 'email' // Email address
  | 'phone' // Phone number
  | 'rich-text' // Text editor with formatting
  | 'section' // Group heading
  | 'divider' // Horizontal line
  | 'header'; // Title header

// Define possible field value types
export type FormFieldValue =
  | string
  | number
  | boolean
  | { url: string; size: number; meta: any }
  | Date
  | string[]
  | number[];

// 2. Field Option - Choices for dropdown/radio
export interface FieldOption {
  id: string; // Unique ID for each option
  label: string; // What user sees
  value: string; // What gets stored in database
  color?: string; // Optional color for display
  icon?: string; // Optional icon
}

// 3. Enhanced Validation Rules
export interface FieldValidation {
  required?: boolean; // Must be filled (true/false)
  minLength?: number; // Minimum characters (e.g., password min 8 chars)
  maxLength?: number; // Maximum characters
  minValue?: number; // Minimum number (e.g., age must be 18+)
  maxValue?: number; // Maximum number
  pattern?: string; // Specific format (like phone pattern)
  customValidator?: string; // Special custom rule name
  fileTypes?: string[]; // Allowed file types ['jpg', 'pdf']
  maxFileSize?: number; // Maximum file size (in bytes)
}

// 5. Enhanced Single Field Definition
export interface FormField {
  id: string; // Unique ID
  type: FieldType; // What kind of field
  label: string; // Field label
  name: string; // Database field name
  placeholder?: string; // Hint text
  description?: string; // Help text for users
  options?: FieldOption[]; // For select/radio
  validation?: FieldValidation; // Validation rules
  defaultValue?: any; // Pre-filled value
  value?: FormFieldValue; // Current field value (NEW - stores user input)
  isHidden?: boolean; // Current hidden state (computed)
  isDisabled?: boolean; // Current disabled state (computed)
  dependsOn?: string[]; // Which fields this field depends on
}

// 6. Complete Form Template
export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  category: string;
  fields: FormField[]; // All fields in order
  rootOrganizationId: string;
}
```


### Hierarchy Flow: Super Admin / Company Admin / Organization / Consumer

```mermaid
graph TD
    SA["Super Admin"]

    SA --> Root1[Root: NightDevilPT]
    SA --> Root2[Root: SecondCompanyPT]

    Root1 --> Sub1[Sub: ND Electronics]
    Root1 --> Sub2[Sub: ND Appliances]
    Sub1 --> Partner1[Partner: ElectroServ]
    Partner1 --> Consumer1((Consumer A))
    Partner1 --> Consumer2((Consumer B))

    Root2 --> Sub3[Sub: SC Auto]
    Sub3 --> Partner2[Partner: AutoCare]
    Partner2 --> Consumer3((Consumer C))

    Root1 --> DirectConsumer((Direct Consumer))
```
