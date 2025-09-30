import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const timeRangeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const debtTrendProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
      period: timeRangeSchema,
    })
  )
  .query(async ({ input }) => {
    const mockData = [
      { date: '2025-01', amount: 150000, count: 45 },
      { date: '2025-02', amount: 180000, count: 52 },
      { date: '2025-03', amount: 220000, count: 68 },
      { date: '2025-04', amount: 195000, count: 58 },
      { date: '2025-05', amount: 240000, count: 72 },
    ];

    return mockData;
  });

export const paymentTrendProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
      period: timeRangeSchema,
    })
  )
  .query(async ({ input }) => {
    const mockData = [
      { date: '2025-01', amount: 120000, count: 85 },
      { date: '2025-02', amount: 145000, count: 95 },
      { date: '2025-03', amount: 170000, count: 110 },
      { date: '2025-04', amount: 155000, count: 98 },
      { date: '2025-05', amount: 190000, count: 125 },
    ];

    return mockData;
  });

export const comparisonDataProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
      period: timeRangeSchema,
    })
  )
  .query(async ({ input }) => {
    const mockData = [
      { period: '2025-01', debt: 150000, payment: 120000, difference: 30000 },
      { period: '2025-02', debt: 180000, payment: 145000, difference: 35000 },
      { period: '2025-03', debt: 220000, payment: 170000, difference: 50000 },
      { period: '2025-04', debt: 195000, payment: 155000, difference: 40000 },
      { period: '2025-05', debt: 240000, payment: 190000, difference: 50000 },
    ];

    return mockData;
  });

export const customerStatsByRatingProcedure = publicProcedure.query(async () => {
  return [
    {
      rating: 'VIP' as const,
      count: 35,
      totalDebt: 850000,
      totalPayment: 620000,
      averageDebt: 24285.71,
    },
    {
      rating: 'Normal' as const,
      count: 115,
      totalDebt: 1650000,
      totalPayment: 1180000,
      averageDebt: 14347.83,
    },
  ];
});

export const employeeStatsByLevelProcedure = publicProcedure.query(async () => {
  return [
    {
      level: 'senior' as const,
      count: 4,
      totalDebtsCreated: 180,
      totalPaymentsProcessed: 480,
      averagePerformance: 165,
    },
    {
      level: 'mid' as const,
      count: 5,
      totalDebtsCreated: 150,
      totalPaymentsProcessed: 400,
      averagePerformance: 110,
    },
    {
      level: 'junior' as const,
      count: 3,
      totalDebtsCreated: 45,
      totalPaymentsProcessed: 120,
      averagePerformance: 55,
    },
  ];
});

export const locationStatsProcedure = publicProcedure
  .input(
    z.object({
      city: z.string().optional(),
      location: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const mockData = [
      {
        city: 'هەولێر',
        location: 'ناوەندی شار',
        totalDebt: 650000,
        totalPayment: 480000,
        customerCount: 45,
      },
      {
        city: 'هەولێر',
        location: 'ڕێگای ١٠٠ مەتری',
        totalDebt: 420000,
        totalPayment: 310000,
        customerCount: 32,
      },
      {
        city: 'سلێمانی',
        location: 'سەرچناری',
        totalDebt: 580000,
        totalPayment: 420000,
        customerCount: 38,
      },
      {
        city: 'دهۆک',
        location: 'ناوەندی شار',
        totalDebt: 350000,
        totalPayment: 260000,
        customerCount: 25,
      },
    ];

    let filtered = mockData;

    if (input.city) {
      filtered = filtered.filter((d) => d.city === input.city);
    }

    if (input.location) {
      filtered = filtered.filter((d) => d.location === input.location);
    }

    return filtered;
  });
