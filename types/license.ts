export type LicenseType = 'trial' | 'basic' | 'professional' | 'enterprise' | 'lifetime';

export type LicenseStatus = 'active' | 'inactive' | 'expired' | 'suspended' | 'pending';

export interface License {
  id: string;
  licenseKey: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: LicenseType;
  status: LicenseStatus;
  features: string[];
  maxEmployees: number;
  maxCustomers: number;
  maxBranches: number;
  issueDate: string;
  expiryDate: string;
  activationDate?: string;
  lastValidationDate?: string;
  deviceId?: string;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseValidationRequest {
  licenseKey: string;
  deviceId: string;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface LicenseValidationResponse {
  valid: boolean;
  license?: License;
  message: string;
  remainingDays?: number;
}

export interface LicenseGenerateRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: LicenseType;
  durationDays: number;
  maxEmployees: number;
  maxCustomers: number;
  maxBranches: number;
  features: string[];
}

export interface LicenseFeature {
  id: string;
  name: string;
  nameKu: string;
  description: string;
  descriptionKu: string;
  category: string;
  enabled: boolean;
}

export const LICENSE_FEATURES: LicenseFeature[] = [
  { id: 'sms_gateway', name: 'SMS Gateway', nameKu: 'دەروازەی SMS', description: 'Send SMS notifications', descriptionKu: 'ناردنی ئاگاداری بە SMS', category: 'communication', enabled: true },
  { id: 'email_gateway', name: 'Email Gateway', nameKu: 'دەروازەی ئیمەیڵ', description: 'Send email notifications', descriptionKu: 'ناردنی ئاگاداری بە ئیمەیڵ', category: 'communication', enabled: true },
  { id: 'whatsapp_integration', name: 'WhatsApp Integration', nameKu: 'پەیوەندی بە واتساپ', description: 'WhatsApp Business API', descriptionKu: 'پەیوەندی بە واتساپ بیزنس', category: 'communication', enabled: true },
  { id: 'telegram_integration', name: 'Telegram Integration', nameKu: 'پەیوەندی بە تلگرام', description: 'Telegram Bot API', descriptionKu: 'پەیوەندی بە بۆتی تلگرام', category: 'communication', enabled: true },
  { id: 'cloud_backup', name: 'Cloud Backup', nameKu: 'باکاپی هەور', description: 'Automatic cloud backup', descriptionKu: 'باکاپی خۆکار لە هەور', category: 'backup', enabled: true },
  { id: 'multi_branch', name: 'Multi-Branch', nameKu: 'چەند لق', description: 'Multiple branch support', descriptionKu: 'پشتگیری چەند لق', category: 'business', enabled: true },
  { id: 'advanced_reports', name: 'Advanced Reports', nameKu: 'ڕاپۆرتی پێشکەوتوو', description: 'Advanced reporting features', descriptionKu: 'تایبەتمەندیەکانی ڕاپۆرتی پێشکەوتوو', category: 'reports', enabled: true },
  { id: 'custom_forms', name: 'Custom Forms', nameKu: 'فۆرمی تایبەتی', description: 'Create custom forms', descriptionKu: 'دروستکردنی فۆرمی تایبەتی', category: 'customization', enabled: true },
  { id: 'api_access', name: 'API Access', nameKu: 'دەستگەیشتن بە API', description: 'External API integration', descriptionKu: 'پەیوەندی بە APIی دەرەکی', category: 'integration', enabled: true },
  { id: 'two_factor_auth', name: 'Two-Factor Authentication', nameKu: 'دڵنیابوونی دوو هەنگاو', description: '2FA security', descriptionKu: 'ئاسایشی دوو هەنگاو', category: 'security', enabled: true },
];
