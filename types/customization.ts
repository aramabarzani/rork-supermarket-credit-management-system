export interface ClientCustomization {
  clientId: string;
  businessName: string;
  businessNameKu: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'ku' | 'ar' | 'en';
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  customFields: CustomField[];
  features: EnabledFeature[];
}

export interface CustomField {
  id: string;
  name: string;
  nameKu: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  entity: 'customer' | 'debt' | 'payment' | 'employee';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface EnabledFeature {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface UpdateCustomizationInput {
  clientId: string;
  businessName?: string;
  businessNameKu?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: 'ku' | 'ar' | 'en';
  currency?: string;
}

export interface AddCustomFieldInput {
  clientId: string;
  name: string;
  nameKu: string;
  type: CustomField['type'];
  entity: CustomField['entity'];
  required: boolean;
  options?: string[];
}
