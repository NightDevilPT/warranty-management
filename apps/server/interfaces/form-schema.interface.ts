import { Types } from "mongoose";

// ENUMS (you can move these to a separate file if you want to share between backend and frontend)
export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
  CHECKBOX = 'checkbox',
  CHECKBOX_GROUP = 'checkbox-group',
  RADIO = 'radio',
  DATE = 'date',
  DATETIME = 'datetime',
  FILE = 'file',
  IMAGE = 'image',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  RICH_TEXT = 'rich-text',
  SECTION = 'section',
  DIVIDER = 'divider',
  HEADER = 'header',
}

export enum FormSchemaCategory {
  PRODUCT = 'product',
  CATEGORY = 'category',
  ISSUE = 'issue',
  FAULT = 'fault',
  BRANDS = 'brands'
}

export type FormFieldValue =
  | string
  | number
  | boolean
  | { url: string; size: number; meta: any }
  | Date
  | string[]
  | number[];

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  icon?: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customValidator?: string;
  fileTypes?: string[];
  maxFileSize?: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  description?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
  defaultValue?: any;
  value?: FormFieldValue;
  isHidden?: boolean;
  isDisabled?: boolean;
  dependsOn?: string[];
  order: number;
}

export interface FormTemplate {
  id?: string;
  title: string;
  description?: string;
  category: FormSchemaCategory;
  fields: FormField[];
  rootOrganizationId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
