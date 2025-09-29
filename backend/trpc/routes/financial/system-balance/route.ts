import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const systemBalanceProcedure = protectedProcedure
  .input(z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }))
  .query(async ({ input }) => {
    // Mock data - replace with actual database queries
    const totalDebt = 125000;
    const totalPayments = 98000;
    const remainingDebt = totalDebt - totalPayments;
    const totalCustomers = 45;
    const activeCustomers = 38;
    const inactiveCustomers = 7;
    
    return {
      totalDebt,
      totalPayments,
      remainingDebt,
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      balanceStatus: remainingDebt > 0 ? 'positive' : 'negative',
      lastUpdated: new Date().toISOString(),
    };
  });

export const customerBalanceProcedure = protectedProcedure
  .input(z.object({
    customerId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }))
  .query(async ({ input }) => {
    // Mock data - replace with actual database queries
    const customers = [
      {
        id: '1',
        name: 'احمد محمد',
        totalDebt: 15000,
        totalPayments: 12000,
        remainingDebt: 3000,
        lastActivity: '2024-01-15',
        status: 'active',
      },
      {
        id: '2',
        name: 'فاطمة علي',
        totalDebt: 8000,
        totalPayments: 8000,
        remainingDebt: 0,
        lastActivity: '2024-01-10',
        status: 'paid',
      },
      {
        id: '3',
        name: 'محمد حسن',
        totalDebt: 25000,
        totalPayments: 15000,
        remainingDebt: 10000,
        lastActivity: '2024-01-20',
        status: 'active',
      },
    ];

    if (input.customerId) {
      return customers.find(c => c.id === input.customerId) || null;
    }

    return customers;
  });

export const employeeBalanceProcedure = protectedProcedure
  .input(z.object({
    employeeId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }))
  .query(async ({ input }) => {
    // Mock data - replace with actual database queries
    const employees = [
      {
        id: '1',
        name: 'کارمەند یەکەم',
        totalDebtsProcessed: 45000,
        totalPaymentsProcessed: 38000,
        transactionsCount: 125,
        lastActivity: '2024-01-20',
        performance: 'excellent',
      },
      {
        id: '2',
        name: 'کارمەند دووەم',
        totalDebtsProcessed: 32000,
        totalPaymentsProcessed: 28000,
        transactionsCount: 89,
        lastActivity: '2024-01-19',
        performance: 'good',
      },
    ];

    if (input.employeeId) {
      return employees.find(e => e.id === input.employeeId) || null;
    }

    return employees;
  });
