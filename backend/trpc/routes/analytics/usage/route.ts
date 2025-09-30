import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const timeRangeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const systemUsageProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
      period: timeRangeSchema,
    })
  )
  .query(async ({ input }) => {
    const mockData = [
      {
        date: '2025-05-18',
        totalLogins: 45,
        activeUsers: 38,
        debtsCreated: 12,
        paymentsProcessed: 28,
        averageSessionDuration: 35,
      },
      {
        date: '2025-05-19',
        totalLogins: 52,
        activeUsers: 42,
        debtsCreated: 15,
        paymentsProcessed: 32,
        averageSessionDuration: 42,
      },
      {
        date: '2025-05-20',
        totalLogins: 48,
        activeUsers: 40,
        debtsCreated: 14,
        paymentsProcessed: 30,
        averageSessionDuration: 38,
      },
      {
        date: '2025-05-21',
        totalLogins: 55,
        activeUsers: 45,
        debtsCreated: 18,
        paymentsProcessed: 35,
        averageSessionDuration: 45,
      },
      {
        date: '2025-05-22',
        totalLogins: 58,
        activeUsers: 48,
        debtsCreated: 20,
        paymentsProcessed: 38,
        averageSessionDuration: 48,
      },
    ];

    return mockData;
  });

export const realtimeStatsProcedure = publicProcedure.query(async () => {
  return {
    currentActiveUsers: 28,
    todayLogins: 42,
    todayDebtsCreated: 8,
    todayPaymentsProcessed: 15,
    averageResponseTime: 1.2,
    systemLoad: 45,
  };
});
