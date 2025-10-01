import { SubscriptionPlan, SubscriptionStatus } from './subscription';

export interface Tenant {
  id: string;
  adminId: string;
  adminName: string;
  adminPhone: string;
  adminEmail?: string;
  storeName: string;
  storeNameKurdish: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  address: string;
  city: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  createdAt: string;
  lastRenewedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  staffCount: number;
  customerCount: number;
  debtCount: number;
  totalDebtAmount: number;
  totalPaidAmount: number;
  lastActivityAt?: string;
  branding?: TenantBranding;
  settings?: TenantSettings;
  features?: TenantFeatures;
}

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
  storeBanner?: string;
  customCss?: string;
}

export interface TenantSettings {
  language: 'ku' | 'ar' | 'en';
  currency: string;
  timezone: string;
  dateFormat: string;
  fiscalYearStart: string;
  enableNotifications: boolean;
  enableSMS: boolean;
  enableEmail: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface TenantFeatures {
  maxStaff: number;
  maxCustomers: number;
  maxDebts: number;
  enableAdvancedReports: boolean;
  enableCustomForms: boolean;
  enableIntegrations: boolean;
  enableAPI: boolean;
  enableWhiteLabel: boolean;
  enableMultiLocation: boolean;
  enableInventory: boolean;
  enableAdvancedSearch: boolean;
  enableVoiceSearch: boolean;
  enableCustomerGroups: boolean;
  enableCustomerRatings: boolean;
  enableDebtCategories: boolean;
  enableNotifications: boolean;
  enableReceipts: boolean;
  enableBalanceMonitor: boolean;
  enableExportData: boolean;
  enableBackupRestore: boolean;
  enableActivityLog: boolean;
  enableSecurityFeatures: boolean;
  enableMultiLanguage: boolean;
  enableCustomThemes: boolean;
  enableAnalytics: boolean;
  enableRealtimeMonitoring: boolean;
  enableErrorLogging: boolean;
  enableSystemUpdates: boolean;
  enableNotes: boolean;
  enableSharing: boolean;
  enableGuidance: boolean;
  enableNewsletter: boolean;
  enableInternalMessaging: boolean;
  enableUsabilitySettings: boolean;
  enablePerformanceMonitoring: boolean;
  enableUsageStatistics: boolean;
}

export interface TenantStats {
  tenantId: string;
  totalRevenue: number;
  monthlyRevenue: number;
  activeCustomers: number;
  pendingDebts: number;
  overdueDebts: number;
  collectionRate: number;
  averageDebtAmount: number;
  topCustomers: {
    id: string;
    name: string;
    totalDebt: number;
  }[];
  recentActivities: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export interface TenantOnboarding {
  tenantId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

export interface TenantInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
}

export interface TenantSupport {
  id: string;
  tenantId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    attachments?: string[];
  }[];
}
