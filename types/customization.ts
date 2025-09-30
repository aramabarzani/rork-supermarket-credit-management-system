export interface BrandingSettings {
  businessName: string;
  businessNameKu: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  font: string;
  slogan?: string;
  sloganKu?: string;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
}

export interface CustomField {
  id: string;
  name: string;
  nameKu: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
  placeholderKu?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    messageKu?: string;
  };
}

export interface CustomFieldGroup {
  id: string;
  name: string;
  nameKu: string;
  entity: 'customer' | 'debt' | 'payment' | 'employee';
  fields: CustomField[];
  enabled: boolean;
  order: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stat' | 'list' | 'table' | 'custom';
  title: string;
  titleKu: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  enabled: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  nameKu: string;
  role: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFormat {
  id: string;
  name: string;
  nameKu: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template?: string;
  enabled: boolean;
}

export interface NotificationChannel {
  id: string;
  type: 'sms' | 'email' | 'whatsapp' | 'telegram' | 'viber' | 'push';
  enabled: boolean;
  config: {
    apiKey?: string;
    apiSecret?: string;
    senderId?: string;
    webhookUrl?: string;
  };
}

export interface LanguageSettings {
  defaultLanguage: 'en' | 'ku' | 'ar';
  availableLanguages: string[];
  rtl: boolean;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  timezone: string;
}

export interface SystemCustomization {
  id: string;
  customerId: string;
  branding: BrandingSettings;
  theme: ThemeSettings;
  customFields: CustomFieldGroup[];
  dashboardLayouts: DashboardLayout[];
  reportFormats: ReportFormat[];
  notificationChannels: NotificationChannel[];
  language: LanguageSettings;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_THEME: ThemeSettings = {
  mode: 'light',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  backgroundColor: '#F9FAFB',
  surfaceColor: '#FFFFFF',
  textColor: '#111827',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'Inter',
};

export const DEFAULT_BRANDING: BrandingSettings = {
  businessName: 'My Business',
  businessNameKu: 'بزنسەکەم',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  backgroundColor: '#F9FAFB',
  textColor: '#111827',
  font: 'Inter',
};

export const DEFAULT_LANGUAGE: LanguageSettings = {
  defaultLanguage: 'ku',
  availableLanguages: ['en', 'ku', 'ar'],
  rtl: true,
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  numberFormat: '0,0.00',
  currencyFormat: '0,0.00 IQD',
  timezone: 'Asia/Baghdad',
};
