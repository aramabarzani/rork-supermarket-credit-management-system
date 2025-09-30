import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import type { InactivityAlert, InactivitySettings } from "@/types/monitoring";

const mockInactivityAlerts: InactivityAlert[] = [
  {
    id: '1',
    userId: 'customer-5',
    userName: 'سەرهەنگ ئەحمەد',
    userRole: 'customer',
    lastActivityAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    inactiveDays: 45,
    alertSentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
  },
  {
    id: '2',
    userId: 'employee-3',
    userName: 'کارمەند سێ',
    userRole: 'employee',
    lastActivityAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    inactiveDays: 35,
    status: 'pending',
  },
];

let mockInactivitySettings: InactivitySettings = {
  enableAlerts: true,
  inactivityThresholdDays: 30,
  alertAdmins: true,
  alertUser: true,
  autoDisableAfterDays: 90,
};

export const getInactivityAlertsProcedure = protectedProcedure
  .input(z.object({
    status: z.enum(['pending', 'sent', 'resolved']).optional(),
    role: z.enum(['admin', 'employee', 'customer']).optional(),
    limit: z.number().optional().default(50),
  }))
  .query(async ({ input }) => {
    let filtered = [...mockInactivityAlerts];

    if (input.status) {
      filtered = filtered.filter(a => a.status === input.status);
    }

    if (input.role) {
      filtered = filtered.filter(a => a.userRole === input.role);
    }

    return filtered.slice(0, input.limit);
  });

export const getInactivitySettingsProcedure = protectedProcedure.query(async () => {
  return mockInactivitySettings;
});

export const updateInactivitySettingsProcedure = protectedProcedure
  .input(z.object({
    enableAlerts: z.boolean().optional(),
    inactivityThresholdDays: z.number().optional(),
    alertAdmins: z.boolean().optional(),
    alertUser: z.boolean().optional(),
    autoDisableAfterDays: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    mockInactivitySettings = {
      ...mockInactivitySettings,
      ...input,
    };

    return { success: true, settings: mockInactivitySettings };
  });

export const checkInactiveUsersProcedure = protectedProcedure.mutation(async () => {
  const newAlerts: InactivityAlert[] = [];

  return { success: true, newAlerts: newAlerts.length, alerts: newAlerts };
});

export const sendInactivityAlertProcedure = protectedProcedure
  .input(z.object({
    alertId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const alert = mockInactivityAlerts.find(a => a.id === input.alertId);
    
    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }

    alert.status = 'sent';
    alert.alertSentAt = new Date().toISOString();

    return { success: true, alert };
  });

export const resolveInactivityAlertProcedure = protectedProcedure
  .input(z.object({
    alertId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const alert = mockInactivityAlerts.find(a => a.id === input.alertId);
    
    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }

    alert.status = 'resolved';

    return { success: true, alert };
  });

export const getInactivityReportProcedure = protectedProcedure.query(async () => {
  const report = {
    totalAlerts: mockInactivityAlerts.length,
    pendingAlerts: mockInactivityAlerts.filter(a => a.status === 'pending').length,
    sentAlerts: mockInactivityAlerts.filter(a => a.status === 'sent').length,
    resolvedAlerts: mockInactivityAlerts.filter(a => a.status === 'resolved').length,
    byRole: {
      admin: mockInactivityAlerts.filter(a => a.userRole === 'admin').length,
      employee: mockInactivityAlerts.filter(a => a.userRole === 'employee').length,
      customer: mockInactivityAlerts.filter(a => a.userRole === 'customer').length,
    },
    averageInactiveDays: mockInactivityAlerts.reduce((sum, a) => sum + a.inactiveDays, 0) / mockInactivityAlerts.length || 0,
  };

  return report;
});
