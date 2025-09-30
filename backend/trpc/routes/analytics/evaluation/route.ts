import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const timeRangeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const debtEvaluationProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
      period: timeRangeSchema,
    })
  )
  .query(async ({ input }) => {
    const mockDebts = [
      { amount: 5000, date: '2025-01-15' },
      { amount: 3000, date: '2025-02-10' },
      { amount: 7500, date: '2025-03-05' },
      { amount: 2000, date: '2025-04-20' },
      { amount: 10000, date: '2025-05-12' },
    ];

    const totalDebt = mockDebts.reduce((sum, d) => sum + d.amount, 0);
    const debtCount = mockDebts.length;

    return {
      totalDebt,
      averageDebt: totalDebt / debtCount,
      maxDebt: Math.max(...mockDebts.map((d) => d.amount)),
      minDebt: Math.min(...mockDebts.map((d) => d.amount)),
      debtCount,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
    };
  });

export const paymentEvaluationProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
      period: timeRangeSchema,
    })
  )
  .query(async ({ input }) => {
    const mockPayments = [
      { amount: 2000, date: '2025-01-20' },
      { amount: 1500, date: '2025-02-15' },
      { amount: 3000, date: '2025-03-10' },
      { amount: 1000, date: '2025-04-25' },
      { amount: 4000, date: '2025-05-18' },
    ];

    const totalPayment = mockPayments.reduce((sum, p) => sum + p.amount, 0);
    const paymentCount = mockPayments.length;

    return {
      totalPayment,
      averagePayment: totalPayment / paymentCount,
      maxPayment: Math.max(...mockPayments.map((p) => p.amount)),
      minPayment: Math.min(...mockPayments.map((p) => p.amount)),
      paymentCount,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
    };
  });

export const customerEvaluationProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string().optional(),
      rating: z.enum(['VIP', 'Normal']).optional(),
    })
  )
  .query(async ({ input }) => {
    const mockCustomers = [
      {
        customerId: '1',
        customerName: 'ئەحمەد محەمەد',
        totalDebt: 15000,
        totalPayment: 8000,
        remainingDebt: 7000,
        paymentRate: 53.33,
        rating: 'VIP' as const,
        lastActivityDate: '2025-05-20',
      },
      {
        customerId: '2',
        customerName: 'سارا ئیبراهیم',
        totalDebt: 8000,
        totalPayment: 6000,
        remainingDebt: 2000,
        paymentRate: 75,
        rating: 'Normal' as const,
        lastActivityDate: '2025-05-18',
      },
      {
        customerId: '3',
        customerName: 'کەریم ڕەشید',
        totalDebt: 20000,
        totalPayment: 15000,
        remainingDebt: 5000,
        paymentRate: 75,
        rating: 'VIP' as const,
        lastActivityDate: '2025-05-22',
      },
    ];

    let filtered = mockCustomers;

    if (input.customerId) {
      filtered = filtered.filter((c) => c.customerId === input.customerId);
    }

    if (input.rating) {
      filtered = filtered.filter((c) => c.rating === input.rating);
    }

    return filtered;
  });

export const employeeEvaluationProcedure = publicProcedure
  .input(
    z.object({
      employeeId: z.string().optional(),
      level: z.enum(['senior', 'mid', 'junior']).optional(),
    })
  )
  .query(async ({ input }) => {
    const mockEmployees = [
      {
        employeeId: '1',
        employeeName: 'ڕێبەر عەلی',
        totalDebtsCreated: 45,
        totalPaymentsProcessed: 120,
        totalAmountHandled: 250000,
        activityCount: 165,
        level: 'senior' as const,
        lastActivityDate: '2025-05-22',
      },
      {
        employeeId: '2',
        employeeName: 'ژیان حەسەن',
        totalDebtsCreated: 30,
        totalPaymentsProcessed: 80,
        totalAmountHandled: 150000,
        activityCount: 110,
        level: 'mid' as const,
        lastActivityDate: '2025-05-21',
      },
      {
        employeeId: '3',
        employeeName: 'دلێر ئەحمەد',
        totalDebtsCreated: 15,
        totalPaymentsProcessed: 40,
        totalAmountHandled: 75000,
        activityCount: 55,
        level: 'junior' as const,
        lastActivityDate: '2025-05-20',
      },
    ];

    let filtered = mockEmployees;

    if (input.employeeId) {
      filtered = filtered.filter((e) => e.employeeId === input.employeeId);
    }

    if (input.level) {
      filtered = filtered.filter((e) => e.level === input.level);
    }

    return filtered;
  });

export const systemStatisticsProcedure = publicProcedure.query(async () => {
  return {
    totalCustomers: 150,
    totalEmployees: 12,
    totalDebts: 450,
    totalPayments: 890,
    totalDebtAmount: 2500000,
    totalPaymentAmount: 1800000,
    remainingDebtAmount: 700000,
    vipCustomers: 35,
    normalCustomers: 115,
    activeCustomers: 120,
    inactiveCustomers: 30,
  };
});
