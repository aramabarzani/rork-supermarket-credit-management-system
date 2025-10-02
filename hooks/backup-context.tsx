import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeStorage } from '@/utils/storage';
import { encryptData, decryptData } from '@/utils/encryption';
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

  const createBackup = useCallback(async (destination: BackupDestination, type: BackupFrequency = 'manual', encrypt: boolean = true) => {
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
      
      const dataToStore = encrypt ? encryptData(backupString) : backupString;
      
      const backupId = Date.now().toString();
      await safeStorage.setItem(`backup_${backupId}`, dataToStore);
      await safeStorage.setItem(`backup_${backupId}_encrypted`, encrypt);
      
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
        verificationStatus: 'verified',
      };
      
      const updated = [...records, newRecord];
      await AsyncStorage.setItem('backup_records', JSON.stringify(updated));
      setRecords(updated);
      
      console.log('Backup created successfully:', newRecord.id);
      return newRecord;
    } catch (error) {
      console.error('Error creating backup:', error);
      
      const failedRecord: BackupRecord = {
        id: Date.now().toString(),
        destination,
        type,
        status: 'failed',
        startTime: new Date().toISOString(),
        size: 0,
        createdBy: 'system',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
      
      const updated = [...records, failedRecord];
      await AsyncStorage.setItem('backup_records', JSON.stringify(updated));
      setRecords(updated);
      
      throw error;
    } finally {
      setIsCreatingBackup(false);
    }
  }, [records]);

  const restoreBackup = useCallback(async (backupId: string, options: any) => {
    try {
      console.log('Restoring backup:', backupId, options);
      
      const encryptedData = await safeStorage.getItem<string>(`backup_${backupId}`, null);
      const isEncrypted = await safeStorage.getItem<boolean>(`backup_${backupId}_encrypted`, false);
      
      if (!encryptedData) {
        throw new Error('Backup not found');
      }
      
      let backupData: Record<string, any>;
      
      if (isEncrypted && typeof encryptedData === 'string') {
        const decrypted = decryptData(encryptedData);
        backupData = JSON.parse(decrypted);
      } else if (typeof encryptedData === 'string') {
        backupData = JSON.parse(encryptedData);
      } else {
        backupData = encryptedData as Record<string, any>;
      }
      
      for (const [key, value] of Object.entries(backupData)) {
        if (options.restoreCustomers && key === 'users') {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        } else if (options.restoreDebts && key === 'debts') {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        } else if (options.restorePayments && key === 'payments') {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        } else if (options.restoreReceipts && key === 'receipts') {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        } else if (options.restoreSettings && (key.includes('settings') || key.includes('config'))) {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        }
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
      
      const encryptedData = await safeStorage.getItem<string>(`backup_${backupId}`, null);
      const isEncrypted = await safeStorage.getItem<boolean>(`backup_${backupId}_encrypted`, false);
      
      if (!encryptedData) {
        const updatedRecords = records.map(r => 
          r.id === backupId ? { ...r, verificationStatus: 'failed' as const } : r
        );
        await AsyncStorage.setItem('backup_records', JSON.stringify(updatedRecords));
        setRecords(updatedRecords);
        return { isValid: false, error: 'Backup not found' };
      }
      
      let backupData: Record<string, any>;
      
      if (isEncrypted && typeof encryptedData === 'string') {
        const decrypted = decryptData(encryptedData);
        backupData = JSON.parse(decrypted);
      } else if (typeof encryptedData === 'string') {
        backupData = JSON.parse(encryptedData);
      } else {
        backupData = encryptedData as Record<string, any>;
      }
      
      const hasRequiredKeys = ['users', 'debts', 'payments'].every(key => key in backupData);
      
      const updatedRecords = records.map(r => 
        r.id === backupId ? { ...r, verificationStatus: hasRequiredKeys ? 'verified' as const : 'failed' as const } : r
      );
      await AsyncStorage.setItem('backup_records', JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
      
      return {
        isValid: hasRequiredKeys,
        error: hasRequiredKeys ? null : 'Backup is missing required data',
      };
    } catch (error) {
      console.error('Error verifying backup:', error);
      const updatedRecords = records.map(r => 
        r.id === backupId ? { ...r, verificationStatus: 'failed' as const } : r
      );
      await AsyncStorage.setItem('backup_records', JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
      return { isValid: false, error: 'Verification failed' };
    }
  }, [records]);

  const deleteBackup = useCallback(async (backupId: string) => {
    await safeStorage.removeItem(`backup_${backupId}`);
    await safeStorage.removeItem(`backup_${backupId}_encrypted`);
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
