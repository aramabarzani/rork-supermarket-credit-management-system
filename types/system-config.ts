export type NotificationType = 'sms' | 'email' | 'app' | 'whatsapp';
export type ReportFormat = 'pdf' | 'excel';
export type BackupFrequency = 'daily' | 'weekly' | 'monthly';
export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'ku' | 'ar' | 'en';

export interface SystemConfiguration {
  id: string;
  maxEmployees: number;
  maxCustomers: number;
  defaultDebtLimit: number;
  defaultPaymentLimit: number;
  passwordMinLength: number;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordRequireUppercase: boolean;
  inactivityTimeout: number;
  profileCustomFields: ProfileCustomField[];
  defaultReportFormat: ReportFormat;
  enabledNotificationTypes: NotificationType[];
  searchResultLimit: number;
  theme: Theme;
  systemEmail: string;
  systemSmsNumber: string;
  supportedLanguages: Language[];
  timezone: string;
  backupFrequency: BackupFrequency;
  backupLocation: string;
  monthlyNewsletterEnabled: boolean;
  systemVersion: string;
  allowUserSharing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

export interface SystemConfigUpdate {
  maxEmployees?: number;
  maxCustomers?: number;
  defaultDebtLimit?: number;
  defaultPaymentLimit?: number;
  passwordMinLength?: number;
  passwordRequireNumbers?: boolean;
  passwordRequireSymbols?: boolean;
  passwordRequireUppercase?: boolean;
  inactivityTimeout?: number;
  profileCustomFields?: ProfileCustomField[];
  defaultReportFormat?: ReportFormat;
  enabledNotificationTypes?: NotificationType[];
  searchResultLimit?: number;
  theme?: Theme;
  systemEmail?: string;
  systemSmsNumber?: string;
  supportedLanguages?: Language[];
  timezone?: string;
  backupFrequency?: BackupFrequency;
  backupLocation?: string;
  monthlyNewsletterEnabled?: boolean;
  systemVersion?: string;
  allowUserSharing?: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireNumbers: boolean;
  requireSymbols: boolean;
  requireUppercase: boolean;
}

export interface NotificationSettings {
  enabledTypes: NotificationType[];
  systemEmail: string;
  systemSmsNumber: string;
}

export interface BackupSettings {
  frequency: BackupFrequency;
  location: string;
  lastBackup?: string;
  nextBackup?: string;
}

export interface LimitSettings {
  maxEmployees: number;
  maxCustomers: number;
  defaultDebtLimit: number;
  defaultPaymentLimit: number;
  searchResultLimit: number;
}
