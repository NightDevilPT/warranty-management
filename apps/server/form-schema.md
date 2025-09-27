## Form Schema System

### Form Categories

```typescript
export interface FormCategoryEnum {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  ISSUES = 'ISSUES',
  BRAND = 'BRAND',
  FAULT = 'FAULT',
  REGISTRATION = 'REGISTRATION',
  CLAIM = 'CLAIM'
}
```

### Field Types

```typescript
export type FieldType = {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  URL = 'URL',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  RICHTEXT = 'RICHTEXT',
  DIVIDER = 'DIVIDER'
}
```

### Field Value Types

```typescript
export type FormFieldValue =
  | string
  | number
  | boolean
  | { url: string; size: number; meta: any }
  | Date
  | string[]
  | number[];
```

### Field Option Interface

```typescript
export interface FieldOption {
  label: string; // Display label
  value: string | number | any; // Stored value
  color?: string; // Optional display color
  icon?: string; // Optional icon
}
```

### Field Validation Rules

```typescript
export interface FieldValidation {
  required?: boolean; // Mandatory field
  minLength?: number; // Minimum character length
  maxLength?: number; // Maximum character length
  minValue?: number; // Minimum numeric value
  maxValue?: number; // Maximum numeric value
  pattern?: string; // Regex pattern validation
  customValidator?: string; // Custom validation function
  fileTypes?: string[]; // Allowed file types
  maxFileSize?: number; // Maximum file size in bytes
}
```

### Form Field Definition

```typescript
export interface FormField {
  id: string; // Unique field identifier
  type: FieldType; // Field data type
  label: string; // Display label
  name: string; // Database field name
  placeholder?: string; // Input placeholder text
  description?: string; // Help text
  options?: FieldOption[]; // Selection options
  validation?: FieldValidation; // Validation rules
  defaultValue?: any; // Pre-filled value
  value?: FormFieldValue; // Current field value
  isHidden?: boolean; // Visibility state
  isDisabled?: boolean; // Editability state
  dependsOn?: string[]; // Field dependencies
}
```

### Form Template Structure

```typescript
export interface FormTemplate {
  id: string; // Template identifier
  title: string; // Template title
  description?: string; // Template description
  category: FormCategoryEnum; // Form category
  fields: FormField[]; // Array of form fields
  rootOrganizationId: string; // Owning organization
}
```

### Warranty Template Structure

```typescript
enum WarrantyType {
  TIME_BASED = 'TIME_BASED',
  LIFETIME = 'LIFETIME',
  USAGE_BASED = 'USAGE_BASED',
  HYBRID = 'HYBRID',
}

enum DurationUnit {
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
  YEARS = 'YEARS',
  HOURS = 'HOURS',
  MILES = 'MILES',
  KILOMETERS = 'KILOMETERS',
  CYCLES = 'CYCLES',
}

enum ConditionOperator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_EQUALS = '>=',
  LESS_THAN_EQUALS = '<=',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

enum ConditionRuleEnum {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  ARRAY = 'ARRAY',
}

interface WarrantyRule {
  mapField: string; // Reference to registration form field (e.g., "product.category", "purchaseDate")
  value: any;
  operator: ConditionOperator;
  valueType: ConditionRuleEnum;
}

interface Duration {
  value: number;
  unit: DurationUnit;
  startDateField?: string; // Field that determines warranty start date
}

interface InfoTerms {
  label: string;
  description: string;
  isRequired: boolean;
}

interface WarrantyTemplate {
  _id: string;
  organizationId: string;
  name: string;
  description: string;
  type: WarrantyType;

  // Coverage details
  duration: Duration;

  // Rules engine
  rules: WarrantyRule[];

  // Terms & information
  terms: InfoTerms[];
  info: InfoTerms[];

  // Transfer rules
  transferable: {
    isTransferable: boolean;
    transferFee?: number;
    transferCurrency?: string;
  };

  // Template metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // Claims Regarding Maping and Details in Warranty Template
}
```
