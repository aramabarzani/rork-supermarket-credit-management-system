export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'trial';

export type UserRole = 'owner' | 'admin' | 'staff' | 'customer';

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  nameKurdish: string;
  duration: number;
  maxStaff: number;
  maxCustomers: number;
  price: number;
  features: string[];
  featuresKurdish: string[];
}

export interface TenantSubscription {
  id: string;
  adminId: string;
  adminName: string;
  adminPhone: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  createdAt: string;
  createdBy: string;
  lastRenewedAt?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  staffCount: number;
  customerCount: number;
  notificationsSent: number;
  lastNotificationAt?: string;
}

export interface TenantUsage {
  tenantId: string;
  staffCount: number;
  customerCount: number;
  debtCount: number;
  paymentCount: number;
  totalDebtAmount: number;
  totalPaidAmount: number;
  lastActivityAt: string;
}

export interface SubscriptionNotification {
  id: string;
  tenantId: string;
  adminId: string;
  adminName: string;
  adminPhone: string;
  type: 'expiry_warning' | 'expired' | 'suspended' | 'renewed';
  title: string;
  message: string;
  sentAt: string;
  read: boolean;
  daysUntilExpiry?: number;
  channels: ('sms' | 'email' | 'in_app')[];
  status: 'pending' | 'sent' | 'failed';
}

export interface SubscriptionNotificationSettings {
  enabled: boolean;
  warningDays: number[];
  channels: ('sms' | 'email' | 'in_app')[];
  autoSuspendOnExpiry: boolean;
  lastCheckDate?: string;
}

export interface RenewSubscriptionRequest {
  tenantId: string;
  plan: SubscriptionPlan;
  duration: number;
}

export interface CreateAdminRequest {
  name: string;
  phone: string;
  password: string;
  plan: SubscriptionPlan;
  duration: number;
}

export interface UpdateSubscriptionRequest {
  tenantId: string;
  plan?: SubscriptionPlan;
  expiryDate?: string;
  status?: SubscriptionStatus;
}

export interface SuspendTenantRequest {
  tenantId: string;
  reason: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    nameKurdish: 'پلانی بنەڕەتی',
    duration: 30,
    maxStaff: 5,
    maxCustomers: 50,
    price: 50000,
    features: [
      'Up to 5 staff members',
      'Up to 50 customers',
      'Basic reports',
      'SMS notifications',
      '30 days validity'
    ],
    featuresKurdish: [
      'تا ٥ کارمەند',
      'تا ٥٠ کڕیار',
      'راپۆرتی بنەڕەتی',
      'ئاگادارکردنەوەی SMS',
      '٣٠ ڕۆژ بەسەرچوون'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    nameKurdish: 'پلانی پیشەیی',
    duration: 365,
    maxStaff: 20,
    maxCustomers: 500,
    price: 500000,
    features: [
      'Up to 20 staff members',
      'Up to 500 customers',
      'Advanced reports',
      'SMS & Email notifications',
      'Priority support',
      '365 days validity'
    ],
    featuresKurdish: [
      'تا ٢٠ کارمەند',
      'تا ٥٠٠ کڕیار',
      'راپۆرتی پێشکەوتوو',
      'ئاگادارکردنەوەی SMS و ئیمەیڵ',
      'پشتگیری تایبەت',
      '٣٦٥ ڕۆژ بەسەرچوون'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    nameKurdish: 'پلانی کۆمپانیا',
    duration: -1,
    maxStaff: -1,
    maxCustomers: -1,
    price: 1000000,
    features: [
      'Unlimited staff',
      'Unlimited customers',
      'Custom reports',
      'All notification channels',
      '24/7 support',
      'Custom integrations',
      'No expiry'
    ],
    featuresKurdish: [
      'کارمەندی نامحدود',
      'کڕیاری نامحدود',
      'راپۆرتی تایبەت',
      'هەموو جۆرەکانی ئاگادارکردنەوە',
      'پشتگیری ٢٤/٧',
      'یەکخستنی تایبەت',
      'بێ بەسەرچوون'
    ]
  }
};
