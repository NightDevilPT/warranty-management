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
