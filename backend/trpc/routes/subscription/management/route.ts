import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { Subscription, SubscriptionPayment, InAppPurchase } from '../../../../../types/subscription';
import { SUBSCRIPTION_PLANS } from '../../../../../types/subscription';

const mockSubscriptions: Subscription[] = [];
const mockPayments: SubscriptionPayment[] = [];
const mockPurchases: InAppPurchase[] = [];

export const createSubscriptionProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
      customerName: z.string(),
      customerEmail: z.string(),
      plan: z.enum(['free', 'basic', 'professional', 'enterprise']),
      billingCycle: z.enum(['monthly', 'yearly', 'lifetime']),
      paymentMethod: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const planDetails = SUBSCRIPTION_PLANS.find((p) => p.id === input.plan);

    if (!planDetails) {
      return {
        success: false,
        message: 'Invalid plan',
      };
    }

    let amount = 0;
    if (input.billingCycle === 'monthly') amount = planDetails.monthlyPrice;
    else if (input.billingCycle === 'yearly') amount = planDetails.yearlyPrice;
    else if (input.billingCycle === 'lifetime') amount = planDetails.lifetimePrice;

    const now = new Date();
    let endDate = new Date();

    if (input.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (input.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (input.billingCycle === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      customerId: input.customerId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      plan: input.plan,
      status: 'active',
      billingCycle: input.billingCycle,
      amount,
      currency: 'USD',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      nextBillingDate: input.billingCycle !== 'lifetime' ? endDate.toISOString() : undefined,
      autoRenew: input.billingCycle !== 'lifetime',
      paymentMethod: input.paymentMethod,
      lastPaymentDate: now.toISOString(),
      lastPaymentAmount: amount,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    mockSubscriptions.push(subscription);

    const payment: SubscriptionPayment = {
      id: `pay_${Date.now()}`,
      subscriptionId: subscription.id,
      customerId: input.customerId,
      amount,
      currency: 'USD',
      status: 'completed',
      paymentMethod: input.paymentMethod || 'unknown',
      paymentDate: now.toISOString(),
      createdAt: now.toISOString(),
    };

    mockPayments.push(payment);

    console.log('Subscription created:', subscription);

    return {
      success: true,
      subscription,
      payment,
      message: 'Subscription created successfully',
    };
  });

export const getAllSubscriptionsProcedure = publicProcedure.query(async () => {
  return {
    subscriptions: mockSubscriptions,
    total: mockSubscriptions.length,
  };
});

export const getSubscriptionByIdProcedure = publicProcedure
  .input(
    z.object({
      subscriptionId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const subscription = mockSubscriptions.find((s) => s.id === input.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
      };
    }

    return {
      success: true,
      subscription,
    };
  });

export const getSubscriptionsByCustomerProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const subscriptions = mockSubscriptions.filter((s) => s.customerId === input.customerId);

    return {
      subscriptions,
      total: subscriptions.length,
    };
  });

export const cancelSubscriptionProcedure = publicProcedure
  .input(
    z.object({
      subscriptionId: z.string(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const subscription = mockSubscriptions.find((s) => s.id === input.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
      };
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date().toISOString();
    subscription.cancellationReason = input.reason;
    subscription.autoRenew = false;
    subscription.updatedAt = new Date().toISOString();

    console.log('Subscription cancelled:', subscription);

    return {
      success: true,
      subscription,
      message: 'Subscription cancelled successfully',
    };
  });

export const renewSubscriptionProcedure = publicProcedure
  .input(
    z.object({
      subscriptionId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const subscription = mockSubscriptions.find((s) => s.id === input.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
      };
    }

    const now = new Date();
    let newEndDate = new Date(subscription.endDate);

    if (subscription.billingCycle === 'monthly') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else if (subscription.billingCycle === 'yearly') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    subscription.status = 'active';
    subscription.endDate = newEndDate.toISOString();
    subscription.nextBillingDate = newEndDate.toISOString();
    subscription.lastPaymentDate = now.toISOString();
    subscription.lastPaymentAmount = subscription.amount;
    subscription.updatedAt = now.toISOString();

    const payment: SubscriptionPayment = {
      id: `pay_${Date.now()}`,
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      amount: subscription.amount,
      currency: subscription.currency,
      status: 'completed',
      paymentMethod: subscription.paymentMethod || 'unknown',
      paymentDate: now.toISOString(),
      createdAt: now.toISOString(),
    };

    mockPayments.push(payment);

    console.log('Subscription renewed:', subscription);

    return {
      success: true,
      subscription,
      payment,
      message: 'Subscription renewed successfully',
    };
  });

export const upgradeSubscriptionProcedure = publicProcedure
  .input(
    z.object({
      subscriptionId: z.string(),
      newPlan: z.enum(['free', 'basic', 'professional', 'enterprise']),
    })
  )
  .mutation(async ({ input }) => {
    const subscription = mockSubscriptions.find((s) => s.id === input.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
      };
    }

    const planDetails = SUBSCRIPTION_PLANS.find((p) => p.id === input.newPlan);

    if (!planDetails) {
      return {
        success: false,
        message: 'Invalid plan',
      };
    }

    let newAmount = 0;
    if (subscription.billingCycle === 'monthly') newAmount = planDetails.monthlyPrice;
    else if (subscription.billingCycle === 'yearly') newAmount = planDetails.yearlyPrice;
    else if (subscription.billingCycle === 'lifetime') newAmount = planDetails.lifetimePrice;

    subscription.plan = input.newPlan;
    subscription.amount = newAmount;
    subscription.updatedAt = new Date().toISOString();

    console.log('Subscription upgraded:', subscription);

    return {
      success: true,
      subscription,
      message: 'Subscription upgraded successfully',
    };
  });

export const createInAppPurchaseProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
      featureId: z.string(),
      featureName: z.string(),
      featureNameKu: z.string(),
      price: z.number(),
      paymentMethod: z.string(),
      durationDays: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const now = new Date();
    let expiryDate: string | undefined;

    if (input.durationDays) {
      const expiry = new Date(now.getTime() + input.durationDays * 24 * 60 * 60 * 1000);
      expiryDate = expiry.toISOString();
    }

    const purchase: InAppPurchase = {
      id: `iap_${Date.now()}`,
      customerId: input.customerId,
      featureId: input.featureId,
      featureName: input.featureName,
      featureNameKu: input.featureNameKu,
      price: input.price,
      currency: 'USD',
      status: 'completed',
      purchaseDate: now.toISOString(),
      expiryDate,
      transactionId: `txn_${Date.now()}`,
      createdAt: now.toISOString(),
    };

    mockPurchases.push(purchase);

    console.log('In-app purchase created:', purchase);

    return {
      success: true,
      purchase,
      message: 'Purchase completed successfully',
    };
  });

export const getPaymentHistoryProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string().optional(),
      subscriptionId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let payments = mockPayments;

    if (input.customerId) {
      payments = payments.filter((p) => p.customerId === input.customerId);
    }

    if (input.subscriptionId) {
      payments = payments.filter((p) => p.subscriptionId === input.subscriptionId);
    }

    return {
      payments,
      total: payments.length,
    };
  });

export const getPurchaseHistoryProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const purchases = mockPurchases.filter((p) => p.customerId === input.customerId);

    return {
      purchases,
      total: purchases.length,
    };
  });

export const getRevenueStatsProcedure = publicProcedure.query(async () => {
  const totalRevenue = mockPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyRevenue = mockPayments
    .filter((p) => {
      const paymentDate = new Date(p.paymentDate);
      const now = new Date();
      return (
        p.status === 'completed' &&
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'active').length;

  const subscriptionsByPlan = mockSubscriptions.reduce(
    (acc, s) => {
      acc[s.plan] = (acc[s.plan] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalRevenue,
    monthlyRevenue,
    activeSubscriptions,
    totalSubscriptions: mockSubscriptions.length,
    subscriptionsByPlan,
    totalPurchases: mockPurchases.length,
  };
});
