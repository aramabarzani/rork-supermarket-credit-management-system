export type SubscriptionPlan = 'free' | 'basic' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  nameKu: string;
  description: string;
  descriptionKu: string;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  features: string[];
  maxEmployees: number;
  maxCustomers: number;
  maxBranches: number;
  maxStorage: number;
  priority: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  trialEndsAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  paymentMethod?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface InAppPurchase {
  id: string;
  customerId: string;
  featureId: string;
  featureName: string;
  featureNameKu: string;
  price: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchaseDate: string;
  expiryDate?: string;
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'free',
    name: 'Free',
    nameKu: 'بەخۆڕایی',
    description: 'Basic features for small businesses',
    descriptionKu: 'تایبەتمەندیە بنچینەییەکان بۆ بزنسی بچووک',
    monthlyPrice: 0,
    yearlyPrice: 0,
    lifetimePrice: 0,
    features: ['basic_features', 'local_backup'],
    maxEmployees: 2,
    maxCustomers: 50,
    maxBranches: 1,
    maxStorage: 100,
    priority: 1,
  },
  {
    id: 'basic',
    name: 'Basic',
    nameKu: 'بنچینەیی',
    description: 'Essential features for growing businesses',
    descriptionKu: 'تایبەتمەندیە پێویستەکان بۆ بزنسی گەشەکردوو',
    monthlyPrice: 29,
    yearlyPrice: 290,
    lifetimePrice: 999,
    features: ['basic_features', 'local_backup', 'email_gateway', 'advanced_reports'],
    maxEmployees: 5,
    maxCustomers: 200,
    maxBranches: 2,
    maxStorage: 500,
    priority: 2,
  },
  {
    id: 'professional',
    name: 'Professional',
    nameKu: 'پڕۆفیشناڵ',
    description: 'Advanced features for professional businesses',
    descriptionKu: 'تایبەتمەندیە پێشکەوتووەکان بۆ بزنسی پڕۆفیشناڵ',
    monthlyPrice: 79,
    yearlyPrice: 790,
    lifetimePrice: 2499,
    features: [
      'basic_features',
      'local_backup',
      'cloud_backup',
      'email_gateway',
      'sms_gateway',
      'advanced_reports',
      'custom_forms',
      'api_access',
    ],
    maxEmployees: 20,
    maxCustomers: 1000,
    maxBranches: 5,
    maxStorage: 2000,
    priority: 3,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameKu: 'کۆمپانیا',
    description: 'Complete solution for large enterprises',
    descriptionKu: 'چارەسەری تەواو بۆ کۆمپانیا گەورەکان',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    lifetimePrice: 5999,
    features: [
      'basic_features',
      'local_backup',
      'cloud_backup',
      'email_gateway',
      'sms_gateway',
      'whatsapp_integration',
      'telegram_integration',
      'advanced_reports',
      'custom_forms',
      'api_access',
      'multi_branch',
      'two_factor_auth',
    ],
    maxEmployees: -1,
    maxCustomers: -1,
    maxBranches: -1,
    maxStorage: -1,
    priority: 4,
  },
];

export const IN_APP_PURCHASES: {
  id: string;
  name: string;
  nameKu: string;
  description: string;
  descriptionKu: string;
  price: number;
  category: string;
  duration?: number;
}[] = [
  {
    id: 'sms_gateway_addon',
    name: 'SMS Gateway Add-on',
    nameKu: 'زیادکردنی دەروازەی SMS',
    description: 'Add SMS gateway to your plan',
    descriptionKu: 'زیادکردنی دەروازەی SMS بۆ پلانەکەت',
    price: 19,
    category: 'communication',
    duration: 30,
  },
  {
    id: 'cloud_backup_addon',
    name: 'Cloud Backup Add-on',
    nameKu: 'زیادکردنی باکاپی هەور',
    description: 'Add cloud backup to your plan',
    descriptionKu: 'زیادکردنی باکاپی هەور بۆ پلانەکەت',
    price: 15,
    category: 'backup',
    duration: 30,
  },
  {
    id: 'extra_branch',
    name: 'Extra Branch',
    nameKu: 'لقی زیاتر',
    description: 'Add one more branch to your account',
    descriptionKu: 'زیادکردنی یەک لقی تر بۆ هەژمارەکەت',
    price: 25,
    category: 'business',
  },
  {
    id: 'extra_storage',
    name: 'Extra Storage (1GB)',
    nameKu: 'بیرگەی زیاتر (١GB)',
    description: 'Add 1GB storage to your account',
    descriptionKu: 'زیادکردنی ١GB بیرگە بۆ هەژمارەکەت',
    price: 5,
    category: 'storage',
  },
];
