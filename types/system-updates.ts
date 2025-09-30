export interface SystemUpdate {
  id: string;
  version: string;
  releaseDate: Date;
  description: string;
  features: string[];
  bugFixes: string[];
  isAutoUpdate: boolean;
  isCritical: boolean;
  downloadUrl?: string;
  size?: number;
  status: 'available' | 'downloading' | 'installing' | 'installed' | 'failed';
  createdAt: Date;
  installedAt?: Date;
}

export interface UpdateSettings {
  autoCheck: boolean;
  autoDownload: boolean;
  autoInstall: boolean;
  checkInterval: number;
  notifyAdmin: boolean;
  lastChecked?: Date;
}

export interface UpdateNotification {
  id: string;
  updateId: string;
  version: string;
  message: string;
  type: 'new_version' | 'download_complete' | 'install_complete' | 'install_failed';
  isRead: boolean;
  createdAt: Date;
}

export interface QuickReport {
  id: string;
  name: string;
  type: 'debt' | 'payment' | 'customer' | 'employee' | 'financial' | 'system';
  description: string;
  data: any;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'json';
}

export interface QuickReportTemplate {
  id: string;
  name: string;
  type: string;
  fields: string[];
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isDefault: boolean;
}

export interface QuickSearchResult {
  id: string;
  type: 'customer' | 'employee' | 'debt' | 'payment' | 'receipt';
  title: string;
  subtitle?: string;
  data: any;
  relevance: number;
}

export interface QuickFilter {
  id: string;
  name: string;
  type: 'debt' | 'payment' | 'customer' | 'employee';
  conditions: FilterCondition[];
  isActive: boolean;
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
}
