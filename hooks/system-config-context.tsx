import { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { safeStorage } from '@/utils/storage';
import type {
  SystemConfigUpdate,
  PasswordPolicy,
  NotificationSettings,
  BackupSettings,
  LimitSettings,
} from '@/types/system-config';

const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSymbols: false,
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabledTypes: ['app', 'email'],
  systemEmail: 'system@example.com',
  systemSmsNumber: '+9647501234567',
};

const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  frequency: 'daily',
  location: 'local',
  lastBackup: undefined,
  nextBackup: undefined,
};

const DEFAULT_LIMIT_SETTINGS: LimitSettings = {
  maxEmployees: 50,
  maxCustomers: 1000,
  defaultDebtLimit: 10000000,
  defaultPaymentLimit: 1000,
  searchResultLimit: 100,
};

export const [SystemConfigContext, useSystemConfig] = createContextHook(() => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');
  
  const [config, setConfig] = useState<SystemConfigUpdate | null>(null);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(DEFAULT_PASSWORD_POLICY);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(DEFAULT_BACKUP_SETTINGS);
  const [limitSettings, setLimitSettings] = useState<LimitSettings>(DEFAULT_LIMIT_SETTINGS);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const loadData = async () => {
      try {
        const [storedConfig, storedPasswordPolicy, storedNotificationSettings, storedBackupSettings, storedLimitSettings] = await Promise.all([
          safeStorage.getItem<SystemConfigUpdate>('systemConfig'),
          safeStorage.getItem<PasswordPolicy>('passwordPolicy'),
          safeStorage.getItem<NotificationSettings>('notificationSettings'),
          safeStorage.getItem<BackupSettings>('backupSettings'),
          safeStorage.getItem<LimitSettings>('limitSettings'),
        ]);

        if (storedConfig) setConfig(storedConfig);
        if (storedPasswordPolicy) setPasswordPolicy(storedPasswordPolicy);
        if (storedNotificationSettings) setNotificationSettings(storedNotificationSettings);
        if (storedBackupSettings) setBackupSettings(storedBackupSettings);
        if (storedLimitSettings) setLimitSettings(storedLimitSettings);
      } catch (err) {
        console.error('[System Config] Failed to load data:', err);
        setError('کێشە لە بارکردنی ڕێکخستنەکان');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadData, Platform.OS === 'web' ? 10 : 0);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  const updateSystemConfig = useCallback(
    async (updates: SystemConfigUpdate) => {
      setError(null);
      try {
        const updatedConfig = { ...config, ...updates };
        setConfig(updatedConfig);
        await safeStorage.setItem('systemConfig', updatedConfig);
        console.log('[System Config] Configuration updated successfully');
        return updatedConfig;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update configuration';
        setError(errorMessage);
        console.error('[System Config] Update error:', err);
        throw err;
      }
    },
    [config]
  );

  const resetSystemConfig = useCallback(async () => {
    setError(null);
    try {
      setConfig(null);
      await safeStorage.removeItem('systemConfig');
      console.log('[System Config] Configuration reset successfully');
      return null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset configuration';
      setError(errorMessage);
      console.error('[System Config] Reset error:', err);
      throw err;
    }
  }, []);

  const updatePasswordPolicy = useCallback(
    async (policy: PasswordPolicy) => {
      setError(null);
      try {
        setPasswordPolicy(policy);
        await safeStorage.setItem('passwordPolicy', policy);
        console.log('[System Config] Password policy updated successfully');
        return policy;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update password policy';
        setError(errorMessage);
        console.error('[System Config] Password policy update error:', err);
        throw err;
      }
    },
    []
  );

  const updateNotificationSettings = useCallback(
    async (settings: NotificationSettings) => {
      setError(null);
      try {
        setNotificationSettings(settings);
        await safeStorage.setItem('notificationSettings', settings);
        console.log(
          '[System Config] Notification settings updated successfully'
        );
        return settings;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update notification settings';
        setError(errorMessage);
        console.error(
          '[System Config] Notification settings update error:',
          err
        );
        throw err;
      }
    },
    []
  );

  const updateBackupSettings = useCallback(
    async (settings: Omit<BackupSettings, 'lastBackup' | 'nextBackup'>) => {
      setError(null);
      try {
        const updatedSettings = { ...backupSettings, ...settings };
        setBackupSettings(updatedSettings);
        await safeStorage.setItem('backupSettings', updatedSettings);
        console.log('[System Config] Backup settings updated successfully');
        return updatedSettings;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update backup settings';
        setError(errorMessage);
        console.error('[System Config] Backup settings update error:', err);
        throw err;
      }
    },
    [backupSettings]
  );

  const updateLimitSettings = useCallback(
    async (settings: LimitSettings) => {
      setError(null);
      try {
        setLimitSettings(settings);
        await safeStorage.setItem('limitSettings', settings);
        console.log('[System Config] Limit settings updated successfully');
        return settings;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update limit settings';
        setError(errorMessage);
        console.error('[System Config] Limit settings update error:', err);
        throw err;
      }
    },
    []
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [storedConfig, storedPasswordPolicy, storedNotificationSettings, storedBackupSettings, storedLimitSettings] = await Promise.all([
        safeStorage.getItem<SystemConfigUpdate>('systemConfig'),
        safeStorage.getItem<PasswordPolicy>('passwordPolicy'),
        safeStorage.getItem<NotificationSettings>('notificationSettings'),
        safeStorage.getItem<BackupSettings>('backupSettings'),
        safeStorage.getItem<LimitSettings>('limitSettings'),
      ]);

      if (storedConfig) setConfig(storedConfig);
      if (storedPasswordPolicy) setPasswordPolicy(storedPasswordPolicy);
      if (storedNotificationSettings) setNotificationSettings(storedNotificationSettings);
      if (storedBackupSettings) setBackupSettings(storedBackupSettings);
      if (storedLimitSettings) setLimitSettings(storedLimitSettings);
    } catch (err) {
      console.error('[System Config] Failed to refetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return useMemo(() => ({
    config,
    passwordPolicy,
    notificationSettings,
    backupSettings,
    limitSettings,
    isLoading: isLoading || !isHydrated,
    error,
    updateSystemConfig,
    resetSystemConfig,
    updatePasswordPolicy,
    updateNotificationSettings,
    updateBackupSettings,
    updateLimitSettings,
    refetch,
  }), [
    config,
    passwordPolicy,
    notificationSettings,
    backupSettings,
    limitSettings,
    isLoading,
    isHydrated,
    error,
    updateSystemConfig,
    resetSystemConfig,
    updatePasswordPolicy,
    updateNotificationSettings,
    updateBackupSettings,
    updateLimitSettings,
    refetch,
  ]);
});
