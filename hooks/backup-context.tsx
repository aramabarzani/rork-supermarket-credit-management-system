import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';
import type { BackupConfig, BackupRecord, BackupDestination, BackupFrequency } from '@/types/backup';

export const [BackupContext, useBackup] = createContextHook(() => {
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);

  const configQuery = trpc.backup.getConfig.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    enabled: false,
  });
  const statsQuery = trpc.backup.getStats.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    enabled: false,
  });
  const recordsQuery = trpc.backup.getRecords.useQuery({}, {
    retry: 1,
    retryDelay: 1000,
    enabled: false,
  });

  const updateConfigMutation = trpc.backup.updateConfig.useMutation({
    onSuccess: () => {
      configQuery.refetch();
    },
  });

  const createBackupMutation = trpc.backup.create.useMutation({
    onSuccess: () => {
      recordsQuery.refetch();
      statsQuery.refetch();
      setIsCreatingBackup(false);
    },
    onError: () => {
      setIsCreatingBackup(false);
    },
  });

  const restoreBackupMutation = trpc.backup.restore.useMutation({
    onSuccess: () => {
      recordsQuery.refetch();
    },
  });

  const verifyBackupMutation = trpc.backup.verify.useMutation({
    onSuccess: () => {
      recordsQuery.refetch();
    },
  });

  const deleteBackupMutation = trpc.backup.delete.useMutation({
    onSuccess: () => {
      recordsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const generateReportMutation = trpc.backup.generateReport.useMutation();

  const updateConfig = useCallback(
    async (config: Partial<BackupConfig>) => {
      if (!configQuery.data) return;

      await updateConfigMutation.mutateAsync({
        frequency: config.frequency || configQuery.data.frequency,
        destination: config.destination || configQuery.data.destination,
        scheduledTime: config.scheduledTime || configQuery.data.scheduledTime,
        autoVerify: config.autoVerify ?? configQuery.data.autoVerify,
        enabled: config.enabled ?? configQuery.data.enabled,
      });
    },
    [configQuery.data, updateConfigMutation]
  );

  const createBackup = useCallback(
    async (destination: BackupDestination, type: BackupFrequency = 'manual') => {
      setIsCreatingBackup(true);
      await createBackupMutation.mutateAsync({ destination, type });
    },
    [createBackupMutation]
  );

  const restoreBackup = useCallback(
    async (
      backupId: string,
      options: {
        restoreCustomers: boolean;
        restoreDebts: boolean;
        restorePayments: boolean;
        restoreReceipts: boolean;
        restoreSettings: boolean;
        overwriteExisting: boolean;
      }
    ) => {
      await restoreBackupMutation.mutateAsync({
        backupId,
        ...options,
      });
    },
    [restoreBackupMutation]
  );

  const verifyBackup = useCallback(
    async (backupId: string) => {
      await verifyBackupMutation.mutateAsync({ backupId });
    },
    [verifyBackupMutation]
  );

  const deleteBackup = useCallback(
    async (backupId: string) => {
      await deleteBackupMutation.mutateAsync({ backupId });
    },
    [deleteBackupMutation]
  );

  const generateReport = useCallback(
    async (period: 'monthly' | 'yearly', startDate: string, endDate: string) => {
      return await generateReportMutation.mutateAsync({
        period,
        startDate,
        endDate,
      });
    },
    [generateReportMutation]
  );

  return useMemo(
    () => ({
      config: configQuery.data,
      stats: statsQuery.data,
      records: recordsQuery.data?.records || [],
      totalRecords: recordsQuery.data?.total || 0,
      selectedBackup,
      setSelectedBackup,
      isCreatingBackup,
      isLoadingConfig: configQuery.isLoading,
      isLoadingStats: statsQuery.isLoading,
      isLoadingRecords: recordsQuery.isLoading,
      updateConfig,
      createBackup,
      restoreBackup,
      verifyBackup,
      deleteBackup,
      generateReport,
      refetchRecords: recordsQuery.refetch,
      refetchStats: statsQuery.refetch,
      refetchConfig: configQuery.refetch,
    }),
    [
      configQuery.data,
      configQuery.isLoading,
      configQuery.refetch,
      statsQuery.data,
      statsQuery.isLoading,
      statsQuery.refetch,
      recordsQuery.data,
      recordsQuery.isLoading,
      recordsQuery.refetch,
      selectedBackup,
      isCreatingBackup,
      updateConfig,
      createBackup,
      restoreBackup,
      verifyBackup,
      deleteBackup,
      generateReport,
    ]
  );
});
