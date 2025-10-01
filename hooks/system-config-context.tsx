import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';
import type {
  SystemConfigUpdate,
  PasswordPolicy,
  NotificationSettings,
  BackupSettings,
  LimitSettings,
} from '@/types/system-config';

export const [SystemConfigContext, useSystemConfig] = createContextHook(() => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const configQuery = trpc.system.config.get.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
    onError: (err: Error) => {
      console.error('[System Config] Failed to fetch config:', err.message);
      setError('کێشە لە پەیوەندی بە سێرڤەر. تکایە دووبارە هەوڵ بدەرەوە.');
    },
  });
  const updateConfigMutation = trpc.system.config.update.useMutation();
  const resetConfigMutation = trpc.system.config.reset.useMutation();

  const passwordPolicyQuery = trpc.system.config.passwordPolicy.get.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
    onError: (err: Error) => {
      console.error('[System Config] Failed to fetch password policy:', err.message);
    },
  });
  const updatePasswordPolicyMutation =
    trpc.system.config.passwordPolicy.update.useMutation();

  const notificationSettingsQuery =
    trpc.system.config.notifications.get.useQuery(undefined, {
      retry: 2,
      retryDelay: 1000,
      staleTime: 60000,
      onError: (err: Error) => {
        console.error('[System Config] Failed to fetch notification settings:', err.message);
      },
    });
  const updateNotificationSettingsMutation =
    trpc.system.config.notifications.update.useMutation();

  const backupSettingsQuery = trpc.system.config.backup.get.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
    onError: (err: Error) => {
      console.error('[System Config] Failed to fetch backup settings:', err.message);
    },
  });
  const updateBackupSettingsMutation =
    trpc.system.config.backup.update.useMutation();

  const limitSettingsQuery = trpc.system.config.limits.get.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
    onError: (err: Error) => {
      console.error('[System Config] Failed to fetch limit settings:', err.message);
    },
  });
  const updateLimitSettingsMutation =
    trpc.system.config.limits.update.useMutation();

  const updateSystemConfig = useCallback(
    async (updates: SystemConfigUpdate) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateConfigMutation.mutateAsync(updates);
        await configQuery.refetch();
        console.log('[System Config] Configuration updated successfully');
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update configuration';
        setError(errorMessage);
        console.error('[System Config] Update error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateConfigMutation, configQuery]
  );

  const resetSystemConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await resetConfigMutation.mutateAsync();
      await configQuery.refetch();
      console.log('[System Config] Configuration reset successfully');
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset configuration';
      setError(errorMessage);
      console.error('[System Config] Reset error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [resetConfigMutation, configQuery]);

  const updatePasswordPolicy = useCallback(
    async (policy: PasswordPolicy) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updatePasswordPolicyMutation.mutateAsync(policy);
        await passwordPolicyQuery.refetch();
        console.log('[System Config] Password policy updated successfully');
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update password policy';
        setError(errorMessage);
        console.error('[System Config] Password policy update error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updatePasswordPolicyMutation, passwordPolicyQuery]
  );

  const updateNotificationSettings = useCallback(
    async (settings: NotificationSettings) => {
      setIsLoading(true);
      setError(null);
      try {
        const result =
          await updateNotificationSettingsMutation.mutateAsync(settings);
        await notificationSettingsQuery.refetch();
        console.log(
          '[System Config] Notification settings updated successfully'
        );
        return result;
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
      } finally {
        setIsLoading(false);
      }
    },
    [updateNotificationSettingsMutation, notificationSettingsQuery]
  );

  const updateBackupSettings = useCallback(
    async (settings: Omit<BackupSettings, 'lastBackup' | 'nextBackup'>) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateBackupSettingsMutation.mutateAsync(settings);
        await backupSettingsQuery.refetch();
        console.log('[System Config] Backup settings updated successfully');
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update backup settings';
        setError(errorMessage);
        console.error('[System Config] Backup settings update error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateBackupSettingsMutation, backupSettingsQuery]
  );

  const updateLimitSettings = useCallback(
    async (settings: LimitSettings) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateLimitSettingsMutation.mutateAsync(settings);
        await limitSettingsQuery.refetch();
        console.log('[System Config] Limit settings updated successfully');
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update limit settings';
        setError(errorMessage);
        console.error('[System Config] Limit settings update error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateLimitSettingsMutation, limitSettingsQuery]
  );

  return useMemo(() => ({
    config: configQuery.data,
    passwordPolicy: passwordPolicyQuery.data,
    notificationSettings: notificationSettingsQuery.data,
    backupSettings: backupSettingsQuery.data,
    limitSettings: limitSettingsQuery.data,
    isLoading:
      isLoading ||
      configQuery.isLoading ||
      passwordPolicyQuery.isLoading ||
      notificationSettingsQuery.isLoading ||
      backupSettingsQuery.isLoading ||
      limitSettingsQuery.isLoading,
    error,
    updateSystemConfig,
    resetSystemConfig,
    updatePasswordPolicy,
    updateNotificationSettings,
    updateBackupSettings,
    updateLimitSettings,
    refetch: configQuery.refetch,
  }), [
    configQuery.data,
    configQuery.isLoading,
    configQuery.refetch,
    passwordPolicyQuery.data,
    passwordPolicyQuery.isLoading,
    notificationSettingsQuery.data,
    notificationSettingsQuery.isLoading,
    backupSettingsQuery.data,
    backupSettingsQuery.isLoading,
    limitSettingsQuery.data,
    limitSettingsQuery.isLoading,
    isLoading,
    error,
    updateSystemConfig,
    resetSystemConfig,
    updatePasswordPolicy,
    updateNotificationSettings,
    updateBackupSettings,
    updateLimitSettings,
  ]);
});
