export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'manual';

export type BackupDestination = 
  | 'local'
  | 'google-drive'
  | 'dropbox'
  | 'onedrive'
  | 'internal-server'
  | 'usb';

export type BackupStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface BackupConfig {
  id: string;
  frequency: BackupFrequency;
  destination: BackupDestination[];
  scheduledTime?: string;
  scheduledDays?: number[];
  autoVerify: boolean;
  enabled: boolean;
  retentionDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackupRecord {
  id: string;
  type: BackupFrequency;
  destination: BackupDestination;
  status: BackupStatus;
  size: number;
  startTime: string;
  endTime?: string;
  errorMessage?: string;
  verificationStatus?: 'verified' | 'failed' | 'pending';
  createdBy: string;
  metadata?: {
    customersCount?: number;
    debtsCount?: number;
    paymentsCount?: number;
    receiptsCount?: number;
  };
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  lastBackupDate?: string;
  nextScheduledBackup?: string;
  byDestination: Record<BackupDestination, number>;
  byMonth: {
    month: string;
    count: number;
    size: number;
  }[];
}

export interface RestoreOptions {
  backupId: string;
  restoreCustomers: boolean;
  restoreDebts: boolean;
  restorePayments: boolean;
  restoreReceipts: boolean;
  restoreSettings: boolean;
  overwriteExisting: boolean;
}

export interface BackupReport {
  id: string;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalBackups: number;
  successRate: number;
  failedBackups: BackupRecord[];
  averageSize: number;
  destinations: BackupDestination[];
  generatedAt: string;
}
