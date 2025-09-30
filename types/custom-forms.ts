export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'datetime'
  | 'select' 
  | 'multiselect'
  | 'checkbox'
  | 'textarea'
  | 'phone'
  | 'email'
  | 'currency';

export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: string | number;
  message: string;
};

export type FieldOption = {
  label: string;
  value: string;
};

export type CustomField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: FieldOption[];
  validations?: ValidationRule[];
  dependsOn?: string;
  dependsOnValue?: string;
  order: number;
  metadata?: Record<string, unknown>;
};

export type FormType = 
  | 'debt'
  | 'payment'
  | 'customer'
  | 'employee'
  | 'custom';

export type CustomForm = {
  id: string;
  name: string;
  description?: string;
  type: FormType;
  fields: CustomField[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type FormSubmission = {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, unknown>;
  submittedBy: string;
  submittedAt: string;
  relatedEntityId?: string;
  relatedEntityType?: 'customer' | 'employee' | 'debt' | 'payment';
};

export type FormTemplate = {
  id: string;
  name: string;
  description: string;
  type: FormType;
  fields: Omit<CustomField, 'id'>[];
  isSystem: boolean;
};

export type FormExportFormat = 'excel' | 'pdf' | 'json' | 'csv';

export type FormShareMethod = 'email' | 'whatsapp' | 'google-sheets' | 'link';

export type FormAnalytics = {
  formId: string;
  totalSubmissions: number;
  submissionsByDate: Record<string, number>;
  submissionsByUser: Record<string, number>;
  averageCompletionTime: number;
  fieldUsageStats: Record<string, {
    filled: number;
    empty: number;
    uniqueValues: number;
  }>;
};
