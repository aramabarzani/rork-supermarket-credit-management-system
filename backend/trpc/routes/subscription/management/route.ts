import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { Subscription, SubscriptionPlanDetails, SubscriptionPayment } from '@/types/subscription';
import { safeStorage } from '@/utils/storage';

const SUBSCRIPTIONS_KEY = 'subscriptions';
const PAYMENTS_KEY = 'subscription_payments';

async function getSubscriptions(): Promise<Subscription[]> {
  try {
    const subscriptions = await safeStorage.getItem<Subscription[]>(SUBSCRIPTIONS_KEY, []);
    return subscriptions || [];
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    return [];
  }
}

async function saveSubscriptions(subscriptions: Subscription[]): Promise<void> {
  try {
    await safeStorage.setItem(SUBSCRIPTIONS_KEY, subscriptions);
  } catch (error) {
    console.error('Error saving subscriptions:', error);
  }
}

async function getPayments(): Promise<SubscriptionPayment[]> {
  try {
    const payments = await safeStorage.getItem<SubscriptionPayment[]>(PAYMENTS_KEY, []);
    return payments || [];
  } catch (error) {
    console.error('Error loading payments:', error);
    return [];
  }
}

async function savePayments(payments: SubscriptionPayment[]): Promise<void> {
  try {
    await safeStorage.setItem(PAYMENTS_KEY, payments);
  } catch (error) {
    console.error('Error saving payments:', error);
  }
}

const subscriptionPlans: SubscriptionPlanDetails[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    nameKu: 'پلانی بنچینەیی',
    price: 50000,
    currency: 'IQD',
    duration: 1,
    maxUsers: 5,
    maxCustomers: 100,
    features: ['customer_management', 'debt_tracking', 'payment_tracking', 'basic_reports'],
    featuresKu: ['بەڕێوەبردنی کڕیار', 'شوێنکەوتنی قەرز', 'شوێنکەوتنی پارەدان', 'ڕاپۆرتی بنچینەیی'],
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    nameKu: 'پلانی پڕۆفیشناڵ',
    price: 100000,
    currency: 'IQD',
    duration: 1,
    maxUsers: 20,
    maxCustomers: 500,
    features: ['all_basic', 'advanced_reports', 'sms_notifications', 'email_notifications', 'backup', 'analytics'],
    featuresKu: ['هەموو بنچینەییەکان', 'ڕاپۆرتی پێشکەوتوو', 'ئاگاداری SMS', 'ئاگاداری ئیمەیڵ', 'پاشەکەوت', 'شیکاری'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    nameKu: 'پلانی کۆمپانیا',
    price: 200000,
    currency: 'IQD',
    duration: 1,
    maxUsers: -1,
    maxCustomers: -1,
    features: ['all_professional', 'multi_branch', 'custom_fields', 'api_access', 'priority_support', 'custom_branding'],
    featuresKu: ['هەموو پڕۆفیشناڵەکان', 'چەند لق', 'خانەی تایبەتی', 'دەستگەیشتنی API', 'پشتگیری تایبەت', 'براندی تایبەتی'],
  },
];

export const getSubscriptionPlansProcedure = protectedProcedure
  .query(async (): Promise<SubscriptionPlanDetails[]> => {
    return subscriptionPlans;
  });

export const createSubscriptionProcedure = protectedProcedure
  .input(z.object({
    clientId: z.string(),
    plan: z.enum(['basic', 'professional', 'enterprise']),
    paymentMethod: z.enum(['cash', 'bank_transfer', 'online']),
    autoRenew: z.boolean(),
  }))
  .mutation(async ({ input }): Promise<Subscription> => {
    const planDetails = subscriptionPlans.find(p => p.id === input.plan);
    if (!planDetails) {
      throw new Error('پلان نەدۆزرایەوە');
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + planDetails.duration * 30 * 24 * 60 * 60 * 1000);

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      clientId: input.clientId,
      plan: input.plan,
      status: 'active',
      price: planDetails.price,
      currency: planDetails.currency,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: input.autoRenew,
      features: planDetails.features,
      paymentMethod: input.paymentMethod,
      lastPaymentDate: now.toISOString(),
      nextPaymentDate: endDate.toISOString(),
    };

    const subscriptions = await getSubscriptions();
    subscriptions.push(subscription);
    await saveSubscriptions(subscriptions);

    const payment: SubscriptionPayment = {
      id: `pay_${Date.now()}`,
      subscriptionId: subscription.id,
      amount: planDetails.price,
      currency: planDetails.currency,
      paymentMethod: input.paymentMethod,
      paymentDate: now.toISOString(),
      status: 'completed',
    };

    const payments = await getPayments();
    payments.push(payment);
    await savePayments(payments);

    return subscription;
  });

export const getClientSubscriptionProcedure = protectedProcedure
  .input(z.object({
    clientId: z.string(),
  }))
  .query(async ({ input }): Promise<Subscription | null> => {
    const subscriptions = await getSubscriptions();
    return subscriptions.find(s => s.clientId === input.clientId) || null;
  });

export const getAllSubscriptionsProcedure = protectedProcedure
  .query(async (): Promise<Subscription[]> => {
    return await getSubscriptions();
  });

export const cancelSubscriptionProcedure = protectedProcedure
  .input(z.object({
    subscriptionId: z.string(),
  }))
  .mutation(async ({ input }): Promise<Subscription> => {
    const subscriptions = await getSubscriptions();
    const subscription = subscriptions.find(s => s.id === input.subscriptionId);
    if (!subscription) {
      throw new Error('بەشداری نەدۆزرایەوە');
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;

    await saveSubscriptions(subscriptions);
    return subscription;
  });

export const renewSubscriptionProcedure = protectedProcedure
  .input(z.object({
    subscriptionId: z.string(),
    paymentMethod: z.enum(['cash', 'bank_transfer', 'online']),
  }))
  .mutation(async ({ input }): Promise<Subscription> => {
    const subscriptions = await getSubscriptions();
    const subscription = subscriptions.find(s => s.id === input.subscriptionId);
    if (!subscription) {
      throw new Error('بەشداری نەدۆزرایەوە');
    }

    const planDetails = subscriptionPlans.find(p => p.id === subscription.plan);
    if (!planDetails) {
      throw new Error('پلان نەدۆزرایەوە');
    }

    const now = new Date();
    const currentEnd = new Date(subscription.endDate);
    const newEnd = new Date(Math.max(currentEnd.getTime(), now.getTime()) + planDetails.duration * 30 * 24 * 60 * 60 * 1000);

    subscription.status = 'active';
    subscription.endDate = newEnd.toISOString();
    subscription.lastPaymentDate = now.toISOString();
    subscription.nextPaymentDate = newEnd.toISOString();

    await saveSubscriptions(subscriptions);

    const payment: SubscriptionPayment = {
      id: `pay_${Date.now()}`,
      subscriptionId: subscription.id,
      amount: planDetails.price,
      currency: planDetails.currency,
      paymentMethod: input.paymentMethod,
      paymentDate: now.toISOString(),
      status: 'completed',
    };

    const payments = await getPayments();
    payments.push(payment);
    await savePayments(payments);

    return subscription;
  });

export const getSubscriptionPaymentsProcedure = protectedProcedure
  .input(z.object({
    subscriptionId: z.string(),
  }))
  .query(async ({ input }): Promise<SubscriptionPayment[]> => {
    const payments = await getPayments();
    return payments.filter(p => p.subscriptionId === input.subscriptionId);
  });
