export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'online';

export interface Subscription {
  id: string;
  clientId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  features: string[];
  paymentMethod?: PaymentMethod;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  nameKu: string;
  price: number;
  currency: string;
  duration: number;
  maxUsers: number;
  maxCustomers: number;
  features: string[];
  featuresKu: string[];
}

export interface CreateSubscriptionInput {
  clientId: string;
  plan: SubscriptionPlan;
  paymentMethod: PaymentMethod;
  autoRenew: boolean;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed';
  receiptUrl?: string;
}
