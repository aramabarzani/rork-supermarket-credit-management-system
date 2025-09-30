export type SharePlatform = 'email' | 'whatsapp' | 'telegram' | 'viber' | 'sms';
export type ShareContentType = 'report' | 'backup' | 'notes' | 'debt' | 'payment' | 'customer' | 'employee';
export type DownloadFormat = 'pdf' | 'excel';

export interface ShareRequest {
  contentType: ShareContentType;
  platform: SharePlatform;
  recipients: string[];
  subject?: string;
  message?: string;
  format?: DownloadFormat;
  data: any;
  scheduled?: boolean;
  scheduleTime?: string;
}

export interface ShareHistory {
  id: string;
  contentType: ShareContentType;
  platform: SharePlatform;
  recipients: string[];
  format?: DownloadFormat;
  status: 'pending' | 'sent' | 'failed';
  sentAt: string;
  sentBy: string;
  error?: string;
}

export interface ScheduledShare {
  id: string;
  contentType: ShareContentType;
  platform: SharePlatform;
  recipients: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  format: DownloadFormat;
  enabled: boolean;
  lastSent?: string;
  nextScheduled: string;
  createdBy: string;
  createdAt: string;
}

export interface DownloadRequest {
  contentType: ShareContentType;
  format: DownloadFormat;
  data: any;
  filters?: Record<string, any>;
}

export interface DownloadHistory {
  id: string;
  contentType: ShareContentType;
  format: DownloadFormat;
  downloadedBy: string;
  downloadedAt: string;
  fileSize?: number;
}

export interface ShareStats {
  totalShares: number;
  sharesByPlatform: Record<SharePlatform, number>;
  sharesByContent: Record<ShareContentType, number>;
  recentShares: ShareHistory[];
  scheduledShares: ScheduledShare[];
}

export interface AutoShareSettings {
  reports: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    platform: SharePlatform;
    recipients: string[];
    format: DownloadFormat;
  };
  backups: {
    enabled: boolean;
    platform: SharePlatform;
    recipients: string[];
  };
  alerts: {
    enabled: boolean;
    platform: SharePlatform;
    recipients: string[];
  };
}
