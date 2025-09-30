import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import type { ActiveUser, UserActivity, LoginRecord, LoginStatistics, RealtimeStats } from "@/types/monitoring";

const mockActiveUsers: ActiveUser[] = [
  {
    id: 'admin',
    name: 'بەڕێوەبەر',
    role: 'admin',
    loginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    currentPage: 'داشبۆرد',
    deviceInfo: 'iPhone 14 Pro',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'employee-1',
    name: 'کارمەند یەک',
    role: 'employee',
    loginAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    currentPage: 'کڕیاران',
    deviceInfo: 'Samsung Galaxy S23',
    ipAddress: '192.168.1.101',
  },
];

const mockActivities: UserActivity[] = [
  {
    id: '1',
    userId: 'admin',
    userName: 'بەڕێوەبەر',
    userRole: 'admin',
    action: 'debt_added',
    description: 'زیادکردنی قەرزی نوێ بە بڕی ٥٠٠،٠٠٠ د.ع',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: 'employee-1',
    userName: 'کارمەند یەک',
    userRole: 'employee',
    action: 'payment_received',
    description: 'وەرگرتنی پارەدان بە بڕی ٢٠٠،٠٠٠ د.ع',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    userId: 'admin',
    userName: 'بەڕێوەبەر',
    userRole: 'admin',
    action: 'customer_added',
    description: 'زیادکردنی کڕیاری نوێ',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const mockLoginRecords: LoginRecord[] = [
  {
    id: '1',
    userId: 'admin',
    userName: 'بەڕێوەبەر',
    userRole: 'admin',
    loginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deviceInfo: 'iPhone 14 Pro',
    ipAddress: '192.168.1.100',
    success: true,
  },
  {
    id: '2',
    userId: 'employee-1',
    userName: 'کارمەند یەک',
    userRole: 'employee',
    loginAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    deviceInfo: 'Samsung Galaxy S23',
    ipAddress: '192.168.1.101',
    success: true,
  },
  {
    id: '3',
    userId: 'customer-1',
    userName: 'ئەحمەد محەمەد',
    userRole: 'customer',
    loginAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    logoutAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    duration: 30 * 60 * 1000,
    deviceInfo: 'Chrome Browser',
    ipAddress: '192.168.1.102',
    success: true,
  },
];

export const getActiveUsersProcedure = protectedProcedure.query(async () => {
  return mockActiveUsers;
});

export const getRecentActivitiesProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().optional().default(50),
    userId: z.string().optional(),
    action: z.string().optional(),
  }))
  .query(async ({ input }) => {
    let filtered = [...mockActivities];

    if (input.userId) {
      filtered = filtered.filter(a => a.userId === input.userId);
    }

    if (input.action) {
      filtered = filtered.filter(a => a.action === input.action);
    }

    return filtered.slice(0, input.limit);
  });

export const getLoginRecordsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional(),
    role: z.enum(['admin', 'employee', 'customer']).optional(),
    limit: z.number().optional().default(100),
  }))
  .query(async ({ input }) => {
    let filtered = [...mockLoginRecords];

    if (input.userId) {
      filtered = filtered.filter(r => r.userId === input.userId);
    }

    if (input.role) {
      filtered = filtered.filter(r => r.userRole === input.role);
    }

    if (input.startDate) {
      filtered = filtered.filter(r => new Date(r.loginAt) >= new Date(input.startDate!));
    }

    if (input.endDate) {
      filtered = filtered.filter(r => new Date(r.loginAt) <= new Date(input.endDate!));
    }

    return filtered.slice(0, input.limit);
  });

export const getLoginStatisticsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const records = mockLoginRecords;

    const stats: LoginStatistics = {
      totalLogins: records.length,
      successfulLogins: records.filter(r => r.success).length,
      failedLogins: records.filter(r => !r.success).length,
      uniqueUsers: new Set(records.map(r => r.userId)).size,
      averageSessionDuration: records
        .filter(r => r.duration)
        .reduce((sum, r) => sum + (r.duration || 0), 0) / records.filter(r => r.duration).length || 0,
      byRole: {
        admin: records.filter(r => r.userRole === 'admin').length,
        employee: records.filter(r => r.userRole === 'employee').length,
        customer: records.filter(r => r.userRole === 'customer').length,
      },
      byDate: [],
    };

    const dateMap = new Map<string, number>();
    records.forEach(r => {
      const date = new Date(r.loginAt).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    stats.byDate = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));

    return stats;
  });

export const getRealtimeStatsProcedure = protectedProcedure.query(async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const stats: RealtimeStats = {
    activeUsers: mockActiveUsers.length,
    todayLogins: mockLoginRecords.filter(r => new Date(r.loginAt) >= todayStart).length,
    todayActivities: mockActivities.filter(a => new Date(a.timestamp) >= todayStart).length,
    systemHealth: 'good',
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    pendingAlerts: 2,
  };

  return stats;
});

export const trackUserActivityProcedure = protectedProcedure
  .input(z.object({
    action: z.string(),
    description: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const activity: UserActivity = {
      id: `activity_${Date.now()}`,
      userId: ctx.user?.id || 'unknown',
      userName: ctx.user?.name || 'Unknown',
      userRole: ctx.user?.role || 'customer',
      action: input.action,
      description: input.description,
      timestamp: new Date().toISOString(),
      metadata: input.metadata,
    };

    mockActivities.unshift(activity);

    if (mockActivities.length > 1000) {
      mockActivities.pop();
    }

    return { success: true, activity };
  });

export const updateUserLastActivityProcedure = protectedProcedure
  .input(z.object({
    currentPage: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const user = mockActiveUsers.find(u => u.id === ctx.user?.id);
    
    if (user) {
      user.lastActivityAt = new Date().toISOString();
      if (input.currentPage) {
        user.currentPage = input.currentPage;
      }
    }

    return { success: true };
  });
