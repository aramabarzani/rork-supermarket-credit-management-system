import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const debtReportByPeriodProcedure = protectedProcedure
  .input(z.object({
    period: z.enum(['month', 'year']),
    month: z.number().min(1).max(12).optional(),
    year: z.number(),
  }))
  .query(async ({ input }) => {
    const mockCategories = [
      { category: 'موبایل', amount: 15000, count: 45 },
      { category: 'نووت', amount: 12000, count: 38 },
      { category: 'خۆراک', amount: 10000, count: 52 },
      { category: 'کەلوپەل', amount: 8000, count: 28 },
      { category: 'هیتر', amount: 5000, count: 15 },
    ];

    return {
      period: input.period === 'month' ? `${input.year}-${input.month}` : `${input.year}`,
      totalDebts: 178,
      totalAmount: 50000,
      averageAmount: 280.9,
      categories: mockCategories,
    };
  });

export const paymentReportByPeriodProcedure = protectedProcedure
  .input(z.object({
    period: z.enum(['month', 'year']),
    month: z.number().min(1).max(12).optional(),
    year: z.number(),
  }))
  .query(async ({ input }) => {
    return {
      period: input.period === 'month' ? `${input.year}-${input.month}` : `${input.year}`,
      totalPayments: 156,
      totalAmount: 42000,
      averageAmount: 269.2,
      paymentMethods: [
        { method: 'کاش', amount: 30000, count: 120 },
        { method: 'کارتی بانکی', amount: 12000, count: 36 },
      ],
    };
  });

export const customerReportByLevelProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return [
      {
        level: 'VIP - پلەی 5',
        customerCount: 8,
        totalDebt: 45000,
        totalPaid: 40000,
        averageDebt: 5625,
        averagePaid: 5000,
      },
      {
        level: 'VIP - پلەی 4',
        customerCount: 12,
        totalDebt: 38000,
        totalPaid: 32000,
        averageDebt: 3166.7,
        averagePaid: 2666.7,
      },
      {
        level: 'VIP - پلەی 3',
        customerCount: 15,
        totalDebt: 30000,
        totalPaid: 25000,
        averageDebt: 2000,
        averagePaid: 1666.7,
      },
      {
        level: 'ئاسایی',
        customerCount: 65,
        totalDebt: 87000,
        totalPaid: 70000,
        averageDebt: 1338.5,
        averagePaid: 1076.9,
      },
    ];
  });

export const employeeReportByLevelProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return [
      {
        employeeId: '1',
        employeeName: 'کارمەندی یەکەم',
        level: 'بەڕێوەبەر',
        debtsCreated: 85,
        paymentsReceived: 92,
        totalDebtAmount: 95000,
        totalPaymentAmount: 88000,
      },
      {
        employeeId: '2',
        employeeName: 'کارمەندی دووەم',
        level: 'کارمەند',
        debtsCreated: 65,
        paymentsReceived: 58,
        totalDebtAmount: 72000,
        totalPaymentAmount: 65000,
      },
      {
        employeeId: '3',
        employeeName: 'کارمەندی سێیەم',
        level: 'کارمەند',
        debtsCreated: 28,
        paymentsReceived: 32,
        totalDebtAmount: 33000,
        totalPaymentAmount: 29000,
      },
    ];
  });

export const inactiveCustomersReportProcedure = protectedProcedure
  .input(z.object({
    minDaysInactive: z.number().default(30),
  }))
  .query(async ({ input }) => {
    return [
      {
        customerId: '1',
        customerName: 'احمد محمد',
        lastActivityDate: '2024-11-15',
        daysSinceLastActivity: 45,
        totalDebt: 15000,
        totalPaid: 12000,
        remainingDebt: 3000,
      },
      {
        customerId: '2',
        customerName: 'محمد حسن',
        lastActivityDate: '2024-11-20',
        daysSinceLastActivity: 40,
        totalDebt: 8500,
        totalPaid: 7000,
        remainingDebt: 1500,
      },
      {
        customerId: '3',
        customerName: 'علي احمد',
        lastActivityDate: '2024-12-01',
        daysSinceLastActivity: 29,
        totalDebt: 12000,
        totalPaid: 10000,
        remainingDebt: 2000,
      },
    ];
  });

export const inactiveEmployeesReportProcedure = protectedProcedure
  .input(z.object({
    minDaysInactive: z.number().default(30),
  }))
  .query(async ({ input }) => {
    return [
      {
        employeeId: '4',
        employeeName: 'کارمەندی چوارەم',
        lastActivityDate: '2024-11-10',
        daysSinceLastActivity: 50,
        totalDebtsCreated: 15,
        totalPaymentsReceived: 12,
      },
      {
        employeeId: '5',
        employeeName: 'کارمەندی پێنجەم',
        lastActivityDate: '2024-11-25',
        daysSinceLastActivity: 35,
        totalDebtsCreated: 8,
        totalPaymentsReceived: 10,
      },
    ];
  });

export const debtReportByCityProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return [
      {
        city: 'هەولێر',
        totalDebts: 85,
        totalAmount: 95000,
        customerCount: 42,
        averageDebtPerCustomer: 2261.9,
        topCustomers: [
          { customerId: '1', customerName: 'احمد محمد', totalDebt: 15000 },
          { customerId: '2', customerName: 'محمد حسن', totalDebt: 12000 },
          { customerId: '3', customerName: 'علي احمد', totalDebt: 10000 },
        ],
      },
      {
        city: 'سلێمانی',
        totalDebts: 62,
        totalAmount: 68000,
        customerCount: 35,
        averageDebtPerCustomer: 1942.9,
        topCustomers: [
          { customerId: '4', customerName: 'حسن علي', totalDebt: 11000 },
          { customerId: '5', customerName: 'عمر محمد', totalDebt: 9500 },
          { customerId: '6', customerName: 'خالد احمد', totalDebt: 8200 },
        ],
      },
      {
        city: 'دهۆک',
        totalDebts: 31,
        totalAmount: 37000,
        customerCount: 23,
        averageDebtPerCustomer: 1608.7,
        topCustomers: [
          { customerId: '7', customerName: 'یاسر محمد', totalDebt: 7500 },
          { customerId: '8', customerName: 'کریم علي', totalDebt: 6800 },
          { customerId: '9', customerName: 'رشید احمد', totalDebt: 5900 },
        ],
      },
    ];
  });

export const paymentReportByCityProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return [
      {
        city: 'هەولێر',
        totalPayments: 92,
        totalAmount: 88000,
        customerCount: 42,
        averagePaymentPerCustomer: 2095.2,
        topPayers: [
          { customerId: '1', customerName: 'فاطمة علي', totalPaid: 14000 },
          { customerId: '2', customerName: 'زينب محمد', totalPaid: 11500 },
          { customerId: '3', customerName: 'مريم احمد', totalPaid: 9800 },
        ],
      },
      {
        city: 'سلێمانی',
        totalPayments: 58,
        totalAmount: 65000,
        customerCount: 35,
        averagePaymentPerCustomer: 1857.1,
        topPayers: [
          { customerId: '4', customerName: 'خديجة علي', totalPaid: 10500 },
          { customerId: '5', customerName: 'عائشة محمد', totalPaid: 9200 },
          { customerId: '6', customerName: 'سارة احمد', totalPaid: 8100 },
        ],
      },
      {
        city: 'دهۆک',
        totalPayments: 32,
        totalAmount: 29000,
        customerCount: 23,
        averagePaymentPerCustomer: 1260.9,
        topPayers: [
          { customerId: '7', customerName: 'هدى محمد', totalPaid: 6800 },
          { customerId: '8', customerName: 'نور علي', totalPaid: 5900 },
          { customerId: '9', customerName: 'أمل احمد', totalPaid: 5200 },
        ],
      },
    ];
  });

export const debtReportByLocationProcedure = protectedProcedure
  .input(z.object({
    city: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return [
      {
        city: input.city || 'هەولێر',
        location: 'ناوەندی شار',
        totalDebts: 45,
        totalAmount: 52000,
        customerCount: 28,
        averageDebtPerCustomer: 1857.1,
        topCustomers: [
          { customerId: '1', customerName: 'احمد محمد', totalDebt: 15000 },
          { customerId: '2', customerName: 'محمد حسن', totalDebt: 12000 },
        ],
      },
      {
        city: input.city || 'هەولێر',
        location: 'ئەنکاوە',
        totalDebts: 25,
        totalAmount: 28000,
        customerCount: 18,
        averageDebtPerCustomer: 1555.6,
        topCustomers: [
          { customerId: '3', customerName: 'علي احمد', totalDebt: 10000 },
          { customerId: '4', customerName: 'حسن علي', totalDebt: 8500 },
        ],
      },
      {
        city: input.city || 'هەولێر',
        location: 'ئیسکان',
        totalDebts: 15,
        totalAmount: 15000,
        customerCount: 12,
        averageDebtPerCustomer: 1250,
        topCustomers: [
          { customerId: '5', customerName: 'عمر محمد', totalDebt: 6000 },
          { customerId: '6', customerName: 'خالد احمد', totalDebt: 5000 },
        ],
      },
    ];
  });

export const paymentReportByLocationProcedure = protectedProcedure
  .input(z.object({
    city: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return [
      {
        city: input.city || 'هەولێر',
        location: 'ناوەندی شار',
        totalPayments: 52,
        totalAmount: 48000,
        customerCount: 28,
        averagePaymentPerCustomer: 1714.3,
        topPayers: [
          { customerId: '1', customerName: 'فاطمة علي', totalPaid: 14000 },
          { customerId: '2', customerName: 'زينب محمد', totalPaid: 11500 },
        ],
      },
      {
        city: input.city || 'هەولێر',
        location: 'ئەنکاوە',
        totalPayments: 28,
        totalAmount: 26000,
        customerCount: 18,
        averagePaymentPerCustomer: 1444.4,
        topPayers: [
          { customerId: '3', customerName: 'مريم احمد', totalPaid: 9800 },
          { customerId: '4', customerName: 'خديجة علي', totalPaid: 8200 },
        ],
      },
      {
        city: input.city || 'هەولێر',
        location: 'ئیسکان',
        totalPayments: 12,
        totalAmount: 14000,
        customerCount: 12,
        averagePaymentPerCustomer: 1166.7,
        topPayers: [
          { customerId: '5', customerName: 'عائشة محمد', totalPaid: 5500 },
          { customerId: '6', customerName: 'سارة احمد', totalPaid: 4800 },
        ],
      },
    ];
  });

export const vipCustomersReportProcedure = protectedProcedure
  .input(z.object({
    vipLevel: z.number().min(1).max(5).optional(),
  }))
  .query(async ({ input }) => {
    const mockVIPCustomers = [
      {
        customerId: '1',
        customerName: 'احمد محمد',
        vipLevel: 5,
        totalDebt: 45000,
        totalPaid: 42000,
        remainingDebt: 3000,
        lastPaymentDate: '2024-12-28',
        paymentHistory: [
          { date: '2024-12-28', amount: 5000 },
          { date: '2024-12-15', amount: 8000 },
          { date: '2024-12-01', amount: 12000 },
        ],
      },
      {
        customerId: '2',
        customerName: 'فاطمة علي',
        vipLevel: 5,
        totalDebt: 38000,
        totalPaid: 35000,
        remainingDebt: 3000,
        lastPaymentDate: '2024-12-25',
        paymentHistory: [
          { date: '2024-12-25', amount: 7000 },
          { date: '2024-12-10', amount: 10000 },
          { date: '2024-11-28', amount: 8000 },
        ],
      },
      {
        customerId: '3',
        customerName: 'محمد حسن',
        vipLevel: 4,
        totalDebt: 32000,
        totalPaid: 28000,
        remainingDebt: 4000,
        lastPaymentDate: '2024-12-20',
        paymentHistory: [
          { date: '2024-12-20', amount: 6000 },
          { date: '2024-12-05', amount: 9000 },
          { date: '2024-11-22', amount: 7000 },
        ],
      },
    ];

    if (input.vipLevel) {
      return mockVIPCustomers.filter(c => c.vipLevel === input.vipLevel);
    }

    return mockVIPCustomers;
  });

export const allDebtsByDateProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string(),
    endDate: z.string(),
  }))
  .query(async ({ input }) => {
    const mockReports = [
      {
        date: '2024-12-30',
        debts: [
          {
            id: '1',
            customerId: '1',
            customerName: 'احمد محمد',
            amount: 5000,
            category: 'موبایل',
            createdBy: '1',
            createdByName: 'کارمەندی یەکەم',
          },
          {
            id: '2',
            customerId: '2',
            customerName: 'محمد حسن',
            amount: 3500,
            category: 'نووت',
            createdBy: '1',
            createdByName: 'کارمەندی یەکەم',
          },
        ],
        totalAmount: 8500,
        count: 2,
      },
      {
        date: '2024-12-29',
        debts: [
          {
            id: '3',
            customerId: '3',
            customerName: 'علي احمد',
            amount: 7200,
            category: 'خۆراک',
            createdBy: '2',
            createdByName: 'کارمەندی دووەم',
          },
        ],
        totalAmount: 7200,
        count: 1,
      },
    ];

    return mockReports;
  });

export const allPaymentsByDateProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string(),
    endDate: z.string(),
  }))
  .query(async ({ input }) => {
    const mockReports = [
      {
        date: '2024-12-30',
        payments: [
          {
            id: '1',
            debtId: '1',
            customerId: '1',
            customerName: 'فاطمة علي',
            amount: 4000,
            receivedBy: '1',
            receivedByName: 'کارمەندی یەکەم',
          },
          {
            id: '2',
            debtId: '2',
            customerId: '2',
            customerName: 'زينب محمد',
            amount: 3000,
            receivedBy: '1',
            receivedByName: 'کارمەندی یەکەم',
          },
        ],
        totalAmount: 7000,
        count: 2,
      },
      {
        date: '2024-12-29',
        payments: [
          {
            id: '3',
            debtId: '3',
            customerId: '3',
            customerName: 'مريم احمد',
            amount: 6500,
            receivedBy: '2',
            receivedByName: 'کارمەندی دووەم',
          },
        ],
        totalAmount: 6500,
        count: 1,
      },
    ];

    return mockReports;
  });
