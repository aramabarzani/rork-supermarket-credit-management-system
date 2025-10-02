import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeStorage } from '@/utils/storage';
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
      
      if (configData) {
        setConfig(JSON.parse(configData));
      } else {
        const defaultConfig: BackupConfig = {
          id: Date.now().toString(),
          frequency: 'daily',
          destination: ['google-drive'],
          scheduledTime: '02:00',
          autoVerify: true,
          enabled: false,
          retentionDays: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('backup_config', JSON.stringify(defaultConfig));
        setConfig(defaultConfig);
      }
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
    const newConfig = { 
      ...config, 
      ...updates,
      updatedAt: new Date().toISOString() 
    } as BackupConfig;
    await AsyncStorage.setItem('backup_config', JSON.stringify(newConfig));
    setConfig(newConfig);
  }, [config]);

  const createBackup = useCallback(async (destination: BackupDestination, type: BackupFrequency = 'manual') => {
    try {
      setIsCreatingBackup(true);
      const startTime = new Date().toISOString();
      
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);
      
      const backupData: Record<string, any> = {};
      let customersCount = 0;
      let debtsCount = 0;
      let paymentsCount = 0;
      let receiptsCount = 0;
      
      for (const [key, value] of allData) {
        if (value) {
          try {
            const parsed = JSON.parse(value);
            backupData[key] = parsed;
            
            if (key === 'users' && Array.isArray(parsed)) customersCount = parsed.length;
            if (key === 'debts' && Array.isArray(parsed)) debtsCount = parsed.length;
            if (key === 'payments' && Array.isArray(parsed)) paymentsCount = parsed.length;
            if (key === 'receipts' && Array.isArray(parsed)) receiptsCount = parsed.length;
          } catch {
            backupData[key] = value;
          }
        }
      }
      
      const backupString = JSON.stringify(backupData);
      const backupSize = new Blob([backupString]).size;
      
      const backupId = Date.now().toString();
      await safeStorage.setItem(`backup_${backupId}`, backupData);
      
      const newRecord: BackupRecord = {
        id: backupId,
        destination,
        type,
        status: 'completed',
        startTime,
        endTime: new Date().toISOString(),
        size: backupSize,
        createdBy: 'system',
        metadata: {
          customersCount,
          debtsCount,
          paymentsCount,
          receiptsCount,
        },
      };
      
      const updated = [...records, newRecord];
      await AsyncStorage.setItem('backup_records', JSON.stringify(updated));
      setRecords(updated);
      
      console.log('Backup created successfully:', newRecord.id);
      return newRecord;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    } finally {
      setIsCreatingBackup(false);
    }
  }, [records]);

  const restoreBackup = useCallback(async (backupId: string, options: any) => {
    try {
      console.log('Restoring backup:', backupId, options);
      
      const backupData = await safeStorage.getItem<Record<string, any>>(`backup_${backupId}`, null);
      
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      for (const [key, value] of Object.entries(backupData)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
      
      console.log('Backup restored successfully');
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }, []);

  const verifyBackup = useCallback(async (backupId: string) => {
    try {
      console.log('Verifying backup:', backupId);
      
      const backupData = await safeStorage.getItem<Record<string, any>>(`backup_${backupId}`, null);
      
      if (!backupData) {
        return { isValid: false, error: 'Backup not found' };
      }
      
      const hasRequiredKeys = ['users', 'debts', 'payments'].every(key => key in backupData);
      
      return {
        isValid: hasRequiredKeys,
        error: hasRequiredKeys ? null : 'Backup is missing required data',
      };
    } catch (error) {
      console.error('Error verifying backup:', error);
      return { isValid: false, error: 'Verification failed' };
    }
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
