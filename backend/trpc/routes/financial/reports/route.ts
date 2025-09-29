import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const monthlyReportProcedure = protectedProcedure
  .input(z.object({
    month: z.number().min(1).max(12),
    year: z.number(),
  }))
  .query(async ({ input }) => {
    // Mock data - replace with actual database queries
    return {
      month: input.month,
      year: input.year,
      totalDebt: 45000,
      totalPayments: 38000,
      netBalance: 7000,
      newCustomers: 5,
      activeCustomers: 42,
      transactionsCount: 156,
      topDebtors: [
        { name: 'احمد محمد', amount: 15000 },
        { name: 'محمد حسن', amount: 10000 },
        { name: 'علي احمد', amount: 8500 },
      ],
      topPayers: [
        { name: 'فاطمة علي', amount: 12000 },
        { name: 'زينب محمد', amount: 9500 },
        { name: 'حسن علي', amount: 7800 },
      ],
    };
  });

export const yearlyReportProcedure = protectedProcedure
  .input(z.object({
    year: z.number(),
  }))
  .query(async ({ input }) => {
    // Mock data - replace with actual database queries
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalDebt: Math.floor(Math.random() * 50000) + 20000,
      totalPayments: Math.floor(Math.random() * 40000) + 15000,
      newCustomers: Math.floor(Math.random() * 10) + 1,
    }));

    const totalDebt = monthlyData.reduce((sum, m) => sum + m.totalDebt, 0);
    const totalPayments = monthlyData.reduce((sum, m) => sum + m.totalPayments, 0);

    return {
      year: input.year,
      totalDebt,
      totalPayments,
      netBalance: totalDebt - totalPayments,
      monthlyData,
      averageMonthlyDebt: totalDebt / 12,
      averageMonthlyPayments: totalPayments / 12,
      bestMonth: monthlyData.reduce((best, current) => 
        current.totalPayments > best.totalPayments ? current : best
      ),
      worstMonth: monthlyData.reduce((worst, current) => 
        current.totalDebt > worst.totalDebt ? current : worst
      ),
    };
  });

export const irregularPaymentsProcedure = protectedProcedure
  .input(z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }))
  .query(async ({ input }) => {
    // Mock data for irregular payments
    return {
      irregularPayments: [
        {
          id: '1',
          customerName: 'احمد محمد',
          amount: -500,
          date: '2024-01-15',
          reason: 'خطأ في الإدخال',
          correctedBy: 'کارمەند یەکەم',
        },
        {
          id: '2',
          customerName: 'فاطمة علي',
          amount: 1200,
          date: '2024-01-18',
          reason: 'دفعة مضاعفة',
          correctedBy: 'کارمەند دووەم',
        },
      ],
      totalIrregularAmount: 700,
      correctionsMade: 2,
    };
  });

export const topDebtorsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().default(10),
    period: z.enum(['monthly', 'yearly']).default('monthly'),
  }))
  .query(async ({ input }) => {
    // Mock data for top debtors
    const debtors = [
      { id: '1', name: 'احمد محمد', totalDebt: 25000, lastPayment: '2024-01-10' },
      { id: '2', name: 'محمد حسن', totalDebt: 18500, lastPayment: '2024-01-15' },
      { id: '3', name: 'علي احمد', totalDebt: 15000, lastPayment: '2024-01-08' },
      { id: '4', name: 'حسن علي', totalDebt: 12000, lastPayment: '2024-01-20' },
      { id: '5', name: 'عمر محمد', totalDebt: 9500, lastPayment: '2024-01-12' },
    ];

    return debtors.slice(0, input.limit);
  });

export const topPayersProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().default(10),
    period: z.enum(['monthly', 'yearly']).default('monthly'),
  }))
  .query(async ({ input }) => {
    // Mock data for top payers
    const payers = [
      { id: '1', name: 'فاطمة علي', totalPayments: 22000, lastPayment: '2024-01-20' },
      { id: '2', name: 'زينب محمد', totalPayments: 18000, lastPayment: '2024-01-19' },
      { id: '3', name: 'مريم احمد', totalPayments: 15500, lastPayment: '2024-01-18' },
      { id: '4', name: 'خديجة علي', totalPayments: 12800, lastPayment: '2024-01-17' },
      { id: '5', name: 'عائشة محمد', totalPayments: 11200, lastPayment: '2024-01-16' },
    ];

    return payers.slice(0, input.limit);
  });

export const exportReportProcedure = protectedProcedure
  .input(z.object({
    reportType: z.enum(['monthly', 'yearly', 'customer', 'employee']),
    format: z.enum(['csv', 'excel']),
    filters: z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      customerId: z.string().optional(),
      employeeId: z.string().optional(),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    // Mock export functionality
    const reportData = {
      filename: `${input.reportType}_report_${new Date().toISOString().split('T')[0]}.${input.format}`,
      downloadUrl: `https://example.com/reports/${input.reportType}_${Date.now()}.${input.format}`,
      generatedAt: new Date().toISOString(),
      recordsCount: Math.floor(Math.random() * 1000) + 100,
    };

    return reportData;
  });
