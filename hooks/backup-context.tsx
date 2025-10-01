import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BackupConfig, BackupRecord, BackupDestination, BackupFrequency } from '@/types/backup';

export const [BackupContext, useBackup] = createContextHook(() => {
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [configData, recordsData] = await Promise.all([
        AsyncStorage.getItem('backup_config'),
        AsyncStorage.getItem('backup_records'),
      ]);
      
      if (configData) setConfig(JSON.parse(configData));
      if (recordsData) setRecords(JSON.parse(recordsData));
    } catch (error) {
      console.error('[Backup] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateConfig = useCallback(async (updates: Partial<BackupConfig>) => {
    const newConfig = { ...config, ...updates } as BackupConfig;
    await AsyncStorage.setItem('backup_config', JSON.stringify(newConfig));
    setConfig(newConfig);
  }, [config]);

  const createBackup = useCallback(async (destination: BackupDestination, type: BackupFrequency = 'manual') => {
    setIsCreatingBackup(true);
    const newRecord: BackupRecord = {
      id: Date.now().toString(),
      destination,
      type,
      status: 'completed',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      size: Math.floor(Math.random() * 10000000),
      createdBy: 'system',
    };
    const updated = [...records, newRecord];
    await AsyncStorage.setItem('backup_records', JSON.stringify(updated));
    setRecords(updated);
    setIsCreatingBackup(false);
  }, [records]);

  const restoreBackup = useCallback(async (backupId: string, options: any) => {
    console.log('Restoring backup:', backupId, options);
  }, []);

  const verifyBackup = useCallback(async (backupId: string) => {
    console.log('Verifying backup:', backupId);
  }, []);

  const deleteBackup = useCallback(async (backupId: string) => {
    const updated = records.filter(r => r.id !== backupId);
    await AsyncStorage.setItem('backup_records', JSON.stringify(updated));
    setRecords(updated);
  }, [records]);

  const generateReport = useCallback(async (period: 'monthly' | 'yearly', startDate: string, endDate: string) => {
    console.log('Generating report:', period, startDate, endDate);
    return { success: true };
  }, []);

  const setSelectedBackup = useCallback(() => {}, []);

  const stats = useMemo(() => ({
    totalBackups: records.length,
    successfulBackups: records.filter(r => r.status === 'completed').length,
    totalSize: records.reduce((sum, r) => sum + r.size, 0),
  }), [records]);

  return useMemo(
    () => ({
      config,
      stats,
      records,
      totalRecords: records.length,
      selectedBackup: null,
      setSelectedBackup,
      isCreatingBackup,
      isLoadingConfig: isLoading,
      isLoadingStats: isLoading,
      isLoadingRecords: isLoading,
      updateConfig,
      createBackup,
      restoreBackup,
      verifyBackup,
      deleteBackup,
      generateReport,
      refetchRecords: loadData,
      refetchStats: loadData,
      refetchConfig: loadData,
    }),
    [config, stats, records, isCreatingBackup, isLoading, updateConfig, createBackup, restoreBackup, verifyBackup, deleteBackup, generateReport, loadData, setSelectedBackup]
  );
});
