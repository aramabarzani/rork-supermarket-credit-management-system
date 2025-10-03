import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    [key: string]: any;
  };
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  size: number;
  itemCount: number;
}

export class BackupManager {
  private static readonly BACKUP_VERSION = '1.0.0';
  private static readonly BACKUP_METADATA_KEY = '@backup_metadata';

  static async createBackup(): Promise<BackupMetadata> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      
      const data: { [key: string]: any } = {};
      stores.forEach(([key, value]) => {
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });

      const backup: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        data,
      };

      const backupString = JSON.stringify(backup, null, 2);
      const backupSize = new Blob([backupString]).size;

      const metadata: BackupMetadata = {
        id: `backup-${Date.now()}`,
        timestamp: backup.timestamp,
        size: backupSize,
        itemCount: Object.keys(data).length,
      };

      await this.saveBackupMetadata(metadata);

      return metadata;
    } catch (error) {
      console.error('Backup creation error:', error);
      throw new Error('هەڵە لە درووستکردنی پاشەکەوت');
    }
  }

  static async exportBackup(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      
      const data: { [key: string]: any } = {};
      stores.forEach(([key, value]) => {
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });

      const backup: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        data,
      };

      const backupString = JSON.stringify(backup, null, 2);
      const fileName = `backup_${Date.now()}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, backupString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'هەناردەکردنی پاشەکەوت',
          });
        }
      }
    } catch (error) {
      console.error('Backup export error:', error);
      throw new Error('هەڵە لە هەناردەکردنی پاشەکەوت');
    }
  }

  static async restoreBackup(backupData: BackupData): Promise<void> {
    try {
      if (backupData.version !== this.BACKUP_VERSION) {
        console.warn('Backup version mismatch');
      }

      const entries = Object.entries(backupData.data);
      const pairs: [string, string][] = entries.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);

      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Backup restore error:', error);
      throw new Error('هەڵە لە گەڕاندنەوەی پاشەکەوت');
    }
  }

  static async importBackup(backupString: string): Promise<void> {
    try {
      const backup: BackupData = JSON.parse(backupString);
      await this.restoreBackup(backup);
    } catch (error) {
      console.error('Backup import error:', error);
      throw new Error('هەڵە لە هاوردەکردنی پاشەکەوت');
    }
  }

  static async getBackupMetadata(): Promise<BackupMetadata[]> {
    try {
      const stored = await AsyncStorage.getItem(this.BACKUP_METADATA_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Get backup metadata error:', error);
      return [];
    }
  }

  private static async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    try {
      const existing = await this.getBackupMetadata();
      const updated = [metadata, ...existing].slice(0, 10);
      await AsyncStorage.setItem(this.BACKUP_METADATA_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Save backup metadata error:', error);
    }
  }

  static async clearOldBackups(keepCount: number = 5): Promise<void> {
    try {
      const metadata = await this.getBackupMetadata();
      const toKeep = metadata.slice(0, keepCount);
      await AsyncStorage.setItem(this.BACKUP_METADATA_KEY, JSON.stringify(toKeep));
    } catch (error) {
      console.error('Clear old backups error:', error);
    }
  }

  static async getBackupSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      stores.forEach(([, value]) => {
        if (value) {
          totalSize += value.length;
        }
      });
      
      return totalSize;
    } catch (error) {
      console.error('Get backup size error:', error);
      return 0;
    }
  }

  static async scheduleAutoBackup(intervalHours: number = 24): Promise<void> {
    const lastBackup = await AsyncStorage.getItem('@last_auto_backup');
    const now = Date.now();
    
    if (!lastBackup || now - parseInt(lastBackup) > intervalHours * 60 * 60 * 1000) {
      await this.createBackup();
      await AsyncStorage.setItem('@last_auto_backup', now.toString());
    }
  }
}

export const backupManager = BackupManager;
