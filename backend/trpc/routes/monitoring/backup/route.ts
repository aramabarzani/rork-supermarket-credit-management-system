import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import type { BackupRecord, BackupSettings } from "@/types/monitoring";

const mockBackupRecords: BackupRecord[] = [
  {
    id: '1',
    type: 'daily',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    size: 15728640,
    status: 'completed',
    location: 'local',
  },
  {
    id: '2',
    type: 'weekly',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    size: 104857600,
    status: 'completed',
    location: 'cloud',
  },
  {
    id: '3',
    type: 'monthly',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    size: 419430400,
    status: 'completed',
    location: 'cloud',
  },
];

let mockBackupSettings: BackupSettings = {
  enableDaily: true,
  enableWeekly: true,
  enableMonthly: true,
  enableYearly: false,
  dailyTime: '02:00',
  weeklyDay: 0,
  monthlyDay: 1,
  yearlyMonth: 0,
  yearlyDay: 1,
  retentionDays: 30,
  autoCleanup: true,
};

export const getBackupRecordsProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'manual']).optional(),
    status: z.enum(['completed', 'failed', 'in_progress']).optional(),
    limit: z.number().optional().default(50),
  }))
  .query(async ({ input }) => {
    let filtered = [...mockBackupRecords];

    if (input.type) {
      filtered = filtered.filter(b => b.type === input.type);
    }

    if (input.status) {
      filtered = filtered.filter(b => b.status === input.status);
    }

    return filtered.slice(0, input.limit);
  });

export const getBackupSettingsProcedure = protectedProcedure.query(async () => {
  return mockBackupSettings;
});

export const updateBackupSettingsProcedure = protectedProcedure
  .input(z.object({
    enableDaily: z.boolean().optional(),
    enableWeekly: z.boolean().optional(),
    enableMonthly: z.boolean().optional(),
    enableYearly: z.boolean().optional(),
    dailyTime: z.string().optional(),
    weeklyDay: z.number().optional(),
    monthlyDay: z.number().optional(),
    yearlyMonth: z.number().optional(),
    yearlyDay: z.number().optional(),
    retentionDays: z.number().optional(),
    autoCleanup: z.boolean().optional(),
  }))
  .mutation(async ({ input }) => {
    mockBackupSettings = {
      ...mockBackupSettings,
      ...input,
    };

    return { success: true, settings: mockBackupSettings };
  });

export const createManualBackupProcedure = protectedProcedure.mutation(async () => {
  const backup: BackupRecord = {
    id: `backup_${Date.now()}`,
    type: 'manual',
    createdAt: new Date().toISOString(),
    size: Math.floor(Math.random() * 100000000) + 10000000,
    status: 'in_progress',
    location: 'local',
  };

  mockBackupRecords.unshift(backup);

  setTimeout(() => {
    backup.status = 'completed';
  }, 3000);

  return { success: true, backup };
});

export const deleteBackupProcedure = protectedProcedure
  .input(z.object({
    backupId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const index = mockBackupRecords.findIndex(b => b.id === input.backupId);
    
    if (index !== -1) {
      mockBackupRecords.splice(index, 1);
      return { success: true };
    }

    return { success: false, error: 'Backup not found' };
  });

export const restoreBackupProcedure = protectedProcedure
  .input(z.object({
    backupId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const backup = mockBackupRecords.find(b => b.id === input.backupId);
    
    if (!backup) {
      return { success: false, error: 'Backup not found' };
    }

    if (backup.status !== 'completed') {
      return { success: false, error: 'Backup is not completed' };
    }

    return { success: true, message: 'Backup restored successfully' };
  });
