import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { SystemConfiguration } from '@/types/system-config';

const mockSystemConfig: SystemConfiguration = {
  id: 'config-1',
  maxEmployees: 50,
  maxCustomers: 1000,
  defaultDebtLimit: 5000000,
  defaultPaymentLimit: 10000000,
  passwordMinLength: 8,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  passwordRequireUppercase: true,
  inactivityTimeout: 15,
  profileCustomFields: [],
  defaultReportFormat: 'pdf',
  enabledNotificationTypes: ['sms', 'email', 'app'],
  searchResultLimit: 100,
  theme: 'light',
  systemEmail: 'system@supermarket.com',
  systemSmsNumber: '+9647501234567',
  supportedLanguages: ['ku', 'ar', 'en'],
  timezone: 'Asia/Baghdad',
  backupFrequency: 'daily',
  backupLocation: '/backups',
  monthlyNewsletterEnabled: true,
  systemVersion: '1.0.0',
  allowUserSharing: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const getSystemConfigProcedure = publicProcedure.query(async () => {
  console.log('[System Config] Fetching system configuration');
  return mockSystemConfig;
});

export const updateSystemConfigProcedure = publicProcedure
  .input(
    z.object({
      maxEmployees: z.number().optional(),
      maxCustomers: z.number().optional(),
      defaultDebtLimit: z.number().optional(),
      defaultPaymentLimit: z.number().optional(),
      passwordMinLength: z.number().min(6).max(32).optional(),
      passwordRequireNumbers: z.boolean().optional(),
      passwordRequireSymbols: z.boolean().optional(),
      passwordRequireUppercase: z.boolean().optional(),
      inactivityTimeout: z.number().min(1).max(120).optional(),
      profileCustomFields: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            type: z.enum(['text', 'number', 'date', 'select']),
            required: z.boolean(),
            options: z.array(z.string()).optional(),
          })
        )
        .optional(),
      defaultReportFormat: z.enum(['pdf', 'excel']).optional(),
      enabledNotificationTypes: z
        .array(z.enum(['sms', 'email', 'app', 'whatsapp']))
        .optional(),
      searchResultLimit: z.number().min(10).max(1000).optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      systemEmail: z.string().email().optional(),
      systemSmsNumber: z.string().optional(),
      supportedLanguages: z.array(z.enum(['ku', 'ar', 'en'])).optional(),
      timezone: z.string().optional(),
      backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      backupLocation: z.string().optional(),
      monthlyNewsletterEnabled: z.boolean().optional(),
      systemVersion: z.string().optional(),
      allowUserSharing: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[System Config] Updating system configuration:', input);

    const updatedConfig: SystemConfiguration = {
      ...mockSystemConfig,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    return updatedConfig;
  });

export const getPasswordPolicyProcedure = publicProcedure.query(async () => {
  console.log('[System Config] Fetching password policy');
  return {
    minLength: mockSystemConfig.passwordMinLength,
    requireNumbers: mockSystemConfig.passwordRequireNumbers,
    requireSymbols: mockSystemConfig.passwordRequireSymbols,
    requireUppercase: mockSystemConfig.passwordRequireUppercase,
  };
});

export const updatePasswordPolicyProcedure = publicProcedure
  .input(
    z.object({
      minLength: z.number().min(6).max(32),
      requireNumbers: z.boolean(),
      requireSymbols: z.boolean(),
      requireUppercase: z.boolean(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[System Config] Updating password policy:', input);
    return {
      success: true,
      policy: input,
    };
  });

export const getNotificationSettingsProcedure = publicProcedure.query(
  async () => {
    console.log('[System Config] Fetching notification settings');
    return {
      enabledTypes: mockSystemConfig.enabledNotificationTypes,
      systemEmail: mockSystemConfig.systemEmail,
      systemSmsNumber: mockSystemConfig.systemSmsNumber,
    };
  }
);

export const updateNotificationSettingsProcedure = publicProcedure
  .input(
    z.object({
      enabledTypes: z.array(z.enum(['sms', 'email', 'app', 'whatsapp'])),
      systemEmail: z.string().email(),
      systemSmsNumber: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[System Config] Updating notification settings:', input);
    return {
      success: true,
      settings: input,
    };
  });

export const getBackupSettingsProcedure = publicProcedure.query(async () => {
  console.log('[System Config] Fetching backup settings');
  return {
    frequency: mockSystemConfig.backupFrequency,
    location: mockSystemConfig.backupLocation,
    lastBackup: new Date(Date.now() - 86400000).toISOString(),
    nextBackup: new Date(Date.now() + 86400000).toISOString(),
  };
});

export const updateBackupSettingsProcedure = publicProcedure
  .input(
    z.object({
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      location: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[System Config] Updating backup settings:', input);
    return {
      success: true,
      settings: input,
    };
  });

export const getLimitSettingsProcedure = publicProcedure.query(async () => {
  console.log('[System Config] Fetching limit settings');
  return {
    maxEmployees: mockSystemConfig.maxEmployees,
    maxCustomers: mockSystemConfig.maxCustomers,
    defaultDebtLimit: mockSystemConfig.defaultDebtLimit,
    defaultPaymentLimit: mockSystemConfig.defaultPaymentLimit,
    searchResultLimit: mockSystemConfig.searchResultLimit,
  };
});

export const updateLimitSettingsProcedure = publicProcedure
  .input(
    z.object({
      maxEmployees: z.number().min(1),
      maxCustomers: z.number().min(1),
      defaultDebtLimit: z.number().min(0),
      defaultPaymentLimit: z.number().min(0),
      searchResultLimit: z.number().min(10).max(1000),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[System Config] Updating limit settings:', input);
    return {
      success: true,
      settings: input,
    };
  });

export const resetSystemConfigProcedure = publicProcedure.mutation(
  async () => {
    console.log('[System Config] Resetting system configuration to defaults');
    return {
      success: true,
      config: mockSystemConfig,
    };
  }
);
