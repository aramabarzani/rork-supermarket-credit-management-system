export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive';

export type MessagingPlatform = 'whatsapp' | 'telegram' | 'viber' | 'email' | 'sms';

export interface ExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export interface CloudSyncSettings {
  enabled: boolean;
  provider: CloudProvider;
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSync?: string;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface ShareOptions {
  platform: MessagingPlatform;
  recipients: string[];
  message?: string;
  attachments?: {
    type: 'report' | 'receipt' | 'dashboard' | 'chart';
    format: ExportFormat;
    data: any;
  }[];
}

export interface IntegrationSettings {
  excel: {
    enabled: boolean;
    autoExport: boolean;
    exportPath?: string;
  };
  googleSheets: {
    enabled: boolean;
    autoSync: boolean;
    spreadsheetId?: string;
    credentials?: any;
  };
  googleDrive: {
    enabled: boolean;
    autoBackup: boolean;
    folderId?: string;
    credentials?: any;
  };
  dropbox: {
    enabled: boolean;
    autoBackup: boolean;
    folderPath?: string;
    credentials?: any;
  };
  onedrive: {
    enabled: boolean;
    autoBackup: boolean;
    folderPath?: string;
    credentials?: any;
  };
  email: {
    enabled: boolean;
    autoSendReports: boolean;
    recipients: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  whatsapp: {
    enabled: boolean;
    autoSendNotifications: boolean;
    businessNumber?: string;
  };
  telegram: {
    enabled: boolean;
    autoSendReports: boolean;
    botToken?: string;
    chatId?: string;
  };
  sms: {
    enabled: boolean;
    autoSendAlerts: boolean;
    provider?: string;
    apiKey?: string;
  };
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  data?: string;
  url?: string;
  error?: string;
  timestamp: string;
}

export interface ShareResult {
  success: boolean;
  platform: MessagingPlatform;
  recipients: string[];
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface SyncResult {
  success: boolean;
  provider: CloudProvider;
  itemsUploaded: number;
  itemsFailed: number;
  error?: string;
  timestamp: string;
}
