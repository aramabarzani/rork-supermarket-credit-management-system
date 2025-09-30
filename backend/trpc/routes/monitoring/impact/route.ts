import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import type { 
  ImpactAnalysis, 
  ImpactStatistics, 
  ImpactChart, 
  ImpactReport,
  UserActivity 
} from "@/types/monitoring";

const mockActivities: UserActivity[] = [
  {
    id: '1',
    userId: 'admin',
    userName: 'بەڕێوەبەر',
    userRole: 'admin',
    action: 'debt_added',
    description: 'زیادکردنی قەرزی نوێ',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { amount: 500000 },
  },
  {
    id: '2',
    userId: 'employee-1',
    userName: 'کارمەند یەک',
    userRole: 'employee',
    action: 'payment_received',
    description: 'وەرگرتنی پارەدان',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { amount: 200000 },
  },
  {
    id: '3',
    userId: 'admin',
    userName: 'بەڕێوەبەر',
    userRole: 'admin',
    action: 'customer_added',
    description: 'زیادکردنی کڕیاری نوێ',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    userId: 'employee-1',
    userName: 'کارمەند یەک',
    userRole: 'employee',
    action: 'debt_added',
    description: 'زیادکردنی قەرزی نوێ',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { amount: 300000 },
  },
  {
    id: '5',
    userId: 'customer-1',
    userName: 'ئەحمەد محەمەد',
    userRole: 'customer',
    action: 'profile_viewed',
    description: 'بینینی پرۆفایل',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function calculateImpact(
  userId: string,
  userName: string,
  userRole: 'admin' | 'employee' | 'customer',
  activities: UserActivity[],
  startDate: Date,
  endDate: Date
): ImpactAnalysis {
  const userActivities = activities.filter(
    a => a.userId === userId && 
    new Date(a.timestamp) >= startDate && 
    new Date(a.timestamp) <= endDate
  );

  const debtActions = userActivities.filter(a => a.action.includes('debt')).length;
  const paymentActions = userActivities.filter(a => a.action.includes('payment')).length;
  const customerActions = userActivities.filter(a => a.action.includes('customer')).length;
  const employeeActions = userActivities.filter(a => a.action.includes('employee')).length;
  const otherActions = userActivities.length - debtActions - paymentActions - customerActions - employeeActions;

  const totalAmount = userActivities.reduce((sum, a) => sum + (a.metadata?.amount || 0), 0);
  const averageAmount = userActivities.length > 0 ? totalAmount / userActivities.length : 0;

  let performance: 'excellent' | 'good' | 'average' | 'poor' = 'poor';
  if (userActivities.length >= 50) performance = 'excellent';
  else if (userActivities.length >= 30) performance = 'good';
  else if (userActivities.length >= 10) performance = 'average';

  const trend: 'increasing' | 'stable' | 'decreasing' = 'stable';

  return {
    userId,
    userName,
    userRole,
    totalActions: userActivities.length,
    debtActions,
    paymentActions,
    customerActions,
    employeeActions,
    otherActions,
    totalAmount,
    averageAmount,
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    performance,
    trend,
  };
}

export const getEmployeeImpactProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const employees = [
      { id: 'employee-1', name: 'کارمەند یەک', role: 'employee' as const },
      { id: 'employee-2', name: 'کارمەند دوو', role: 'employee' as const },
    ];

    return employees.map(emp => 
      calculateImpact(emp.id, emp.name, emp.role, mockActivities, startDate, endDate)
    );
  });

export const getAdminImpactProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const admins = [
      { id: 'admin', name: 'بەڕێوەبەر', role: 'admin' as const },
    ];

    return admins.map(admin => 
      calculateImpact(admin.id, admin.name, admin.role, mockActivities, startDate, endDate)
    );
  });

export const getCustomerImpactProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const customers = [
      { id: 'customer-1', name: 'ئەحمەد محەمەد', role: 'customer' as const },
      { id: 'customer-2', name: 'سارا ئەحمەد', role: 'customer' as const },
    ];

    return customers.map(customer => 
      calculateImpact(customer.id, customer.name, customer.role, mockActivities, startDate, endDate)
    );
  });

export const getImpactStatisticsProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    role: z.enum(['admin', 'employee', 'customer']).optional(),
  }))
  .query(async ({ input }) => {
    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allUsers = [
      { id: 'admin', name: 'بەڕێوەبەر', role: 'admin' as const },
      { id: 'employee-1', name: 'کارمەند یەک', role: 'employee' as const },
      { id: 'employee-2', name: 'کارمەند دوو', role: 'employee' as const },
      { id: 'customer-1', name: 'ئەحمەد محەمەد', role: 'customer' as const },
      { id: 'customer-2', name: 'سارا ئەحمەد', role: 'customer' as const },
    ];

    const impacts = allUsers
      .filter(u => !input.role || u.role === input.role)
      .map(u => calculateImpact(u.id, u.name, u.role, mockActivities, startDate, endDate));

    const byRole = {
      admin: impacts.filter(i => i.userRole === 'admin'),
      employee: impacts.filter(i => i.userRole === 'employee'),
      customer: impacts.filter(i => i.userRole === 'customer'),
    };

    const sorted = [...impacts].sort((a, b) => b.totalActions - a.totalActions);
    const topPerformers = sorted.slice(0, 5);
    const lowPerformers = sorted.slice(-5).reverse();

    const totalActions = impacts.reduce((sum, i) => sum + i.totalActions, 0);
    const totalAmount = impacts.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const averageActionsPerUser = impacts.length > 0 ? totalActions / impacts.length : 0;

    const statistics: ImpactStatistics = {
      byRole,
      topPerformers,
      lowPerformers,
      totalActions,
      totalAmount,
      averageActionsPerUser,
    };

    return statistics;
  });

export const getImpactChartProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userActivities = mockActivities.filter(
      a => a.userId === input.userId && 
      new Date(a.timestamp) >= startDate && 
      new Date(a.timestamp) <= endDate
    );

    const dateMap = new Map<string, { actions: number; amount: number }>();
    
    userActivities.forEach(a => {
      const date = new Date(a.timestamp).toISOString().split('T')[0];
      const existing = dateMap.get(date) || { actions: 0, amount: 0 };
      dateMap.set(date, {
        actions: existing.actions + 1,
        amount: existing.amount + (a.metadata?.amount || 0),
      });
    });

    const data = Array.from(dateMap.entries())
      .map(([date, stats]) => ({
        date,
        actions: stats.actions,
        amount: stats.amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const user = mockActivities.find(a => a.userId === input.userId);

    const chart: ImpactChart = {
      userId: input.userId,
      userName: user?.userName || 'Unknown',
      data,
    };

    return chart;
  });

export const getImpactFilteredProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    city: z.string().optional(),
    location: z.string().optional(),
    role: z.enum(['admin', 'employee', 'customer']).optional(),
    minActions: z.number().optional(),
    maxActions: z.number().optional(),
  }))
  .query(async ({ input }) => {
    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allUsers = [
      { id: 'admin', name: 'بەڕێوەبەر', role: 'admin' as const },
      { id: 'employee-1', name: 'کارمەند یەک', role: 'employee' as const },
      { id: 'employee-2', name: 'کارمەند دوو', role: 'employee' as const },
      { id: 'customer-1', name: 'ئەحمەد محەمەد', role: 'customer' as const },
      { id: 'customer-2', name: 'سارا ئەحمەد', role: 'customer' as const },
    ];

    let impacts = allUsers.map(u => 
      calculateImpact(u.id, u.name, u.role, mockActivities, startDate, endDate)
    );

    if (input.role) {
      impacts = impacts.filter(i => i.userRole === input.role);
    }

    if (input.minActions !== undefined) {
      impacts = impacts.filter(i => i.totalActions >= input.minActions!);
    }

    if (input.maxActions !== undefined) {
      impacts = impacts.filter(i => i.totalActions <= input.maxActions!);
    }

    return impacts;
  });

export const generateImpactReportProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string(),
    endDate: z.string(),
    role: z.enum(['admin', 'employee', 'customer']).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const endDate = new Date(input.endDate);
    const startDate = new Date(input.startDate);

    const allUsers = [
      { id: 'admin', name: 'بەڕێوەبەر', role: 'admin' as const },
      { id: 'employee-1', name: 'کارمەند یەک', role: 'employee' as const },
      { id: 'employee-2', name: 'کارمەند دوو', role: 'employee' as const },
      { id: 'customer-1', name: 'ئەحمەد محەمەد', role: 'customer' as const },
      { id: 'customer-2', name: 'سارا ئەحمەد', role: 'customer' as const },
    ];

    const impacts = allUsers
      .filter(u => !input.role || u.role === input.role)
      .map(u => calculateImpact(u.id, u.name, u.role, mockActivities, startDate, endDate));

    const byRole = {
      admin: impacts.filter(i => i.userRole === 'admin'),
      employee: impacts.filter(i => i.userRole === 'employee'),
      customer: impacts.filter(i => i.userRole === 'customer'),
    };

    const sorted = [...impacts].sort((a, b) => b.totalActions - a.totalActions);
    const topPerformers = sorted.slice(0, 5);
    const lowPerformers = sorted.slice(-5).reverse();

    const totalActions = impacts.reduce((sum, i) => sum + i.totalActions, 0);
    const totalAmount = impacts.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const averageActionsPerUser = impacts.length > 0 ? totalActions / impacts.length : 0;

    const statistics: ImpactStatistics = {
      byRole,
      topPerformers,
      lowPerformers,
      totalActions,
      totalAmount,
      averageActionsPerUser,
    };

    const charts: ImpactChart[] = allUsers.map(u => {
      const userActivities = mockActivities.filter(
        a => a.userId === u.id && 
        new Date(a.timestamp) >= startDate && 
        new Date(a.timestamp) <= endDate
      );

      const dateMap = new Map<string, { actions: number; amount: number }>();
      
      userActivities.forEach(a => {
        const date = new Date(a.timestamp).toISOString().split('T')[0];
        const existing = dateMap.get(date) || { actions: 0, amount: 0 };
        dateMap.set(date, {
          actions: existing.actions + 1,
          amount: existing.amount + (a.metadata?.amount || 0),
        });
      });

      const data = Array.from(dateMap.entries())
        .map(([date, stats]) => ({
          date,
          actions: stats.actions,
          amount: stats.amount,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        userId: u.id,
        userName: u.name,
        data,
      };
    });

    const report: ImpactReport = {
      id: `impact_report_${Date.now()}`,
      title: `ڕاپۆرتی کاریگەری ${input.role ? input.role : 'گشتی'}`,
      description: `ڕاپۆرتی کاریگەری بەکارهێنەران لە ${startDate.toLocaleDateString('ku')} بۆ ${endDate.toLocaleDateString('ku')}`,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      statistics,
      charts,
      generatedAt: new Date().toISOString(),
      generatedBy: ctx.user?.name || 'Unknown',
    };

    return { success: true, report };
  });

export const exportImpactReportProcedure = protectedProcedure
  .input(z.object({
    reportId: z.string(),
    format: z.enum(['pdf', 'excel']),
  }))
  .mutation(async ({ input }) => {
    return {
      success: true,
      downloadUrl: `https://example.com/reports/${input.reportId}.${input.format}`,
      message: `ڕاپۆرت بە ${input.format.toUpperCase()} دەرهێنرا`,
    };
  });

export const shareImpactReportProcedure = protectedProcedure
  .input(z.object({
    reportId: z.string(),
    method: z.enum(['email', 'whatsapp']),
    recipient: z.string(),
  }))
  .mutation(async ({ input }) => {
    return {
      success: true,
      message: `ڕاپۆرت بە ${input.method} نێردرا بۆ ${input.recipient}`,
    };
  });

export const checkPoorPerformanceProcedure = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    threshold: z.number().optional().default(10),
  }))
  .query(async ({ input }) => {
    const endDate = input.endDate ? new Date(input.endDate) : new Date();
    const startDate = input.startDate ? new Date(input.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allUsers = [
      { id: 'admin', name: 'بەڕێوەبەر', role: 'admin' as const },
      { id: 'employee-1', name: 'کارمەند یەک', role: 'employee' as const },
      { id: 'employee-2', name: 'کارمەند دوو', role: 'employee' as const },
      { id: 'customer-1', name: 'ئەحمەد محەمەد', role: 'customer' as const },
      { id: 'customer-2', name: 'سارا ئەحمەد', role: 'customer' as const },
    ];

    const impacts = allUsers.map(u => 
      calculateImpact(u.id, u.name, u.role, mockActivities, startDate, endDate)
    );

    const poorPerformers = impacts.filter(i => i.totalActions < input.threshold);

    return {
      poorPerformers,
      shouldAlert: poorPerformers.length > 0,
      alertMessage: poorPerformers.length > 0 
        ? `${poorPerformers.length} بەکارهێنەر کاریگەری نزمیان هەیە`
        : 'هەموو بەکارهێنەران کاریگەری باشیان هەیە',
    };
  });
