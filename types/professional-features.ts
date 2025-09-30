export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type CustomReportField = {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency';
  source: 'customer' | 'debt' | 'payment' | 'employee' | 'system';
  enabled: boolean;
};

export type CustomReport = {
  id: string;
  name: string;
  description: string;
  format: ReportFormat;
  fields: CustomReportField[];
  filters: Record<string, any>;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    time: string;
    recipients: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type PrintTemplate = {
  id: string;
  name: string;
  type: 'receipt' | 'customer_card' | 'employee_card' | 'manager_card' | 'report';
  template: string;
  settings: {
    paperSize: 'A4' | 'A5' | 'letter' | 'thermal';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    header?: string;
    footer?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type PrintJob = {
  id: string;
  templateId: string;
  data: Record<string, any>;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
};

export type ExternalIntegration = {
  id: string;
  name: string;
  type: 'cloud_storage' | 'local_server' | 'external_api' | 'bank' | 'sms' | 'email' | 'whatsapp' | 'telegram' | 'viber';
  enabled: boolean;
  config: Record<string, any>;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
};

export type CloudStorageConfig = {
  provider: 'aws' | 'azure' | 'google' | 'dropbox';
  credentials: {
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    region?: string;
  };
  autoBackup: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly';
};

export type BankIntegration = {
  bankName: string;
  accountNumber: string;
  apiEndpoint: string;
  apiKey: string;
  enabled: boolean;
};

export type MessagingIntegration = {
  platform: 'sms' | 'email' | 'whatsapp' | 'telegram' | 'viber';
  provider: string;
  apiKey: string;
  apiSecret?: string;
  phoneNumber?: string;
  email?: string;
  enabled: boolean;
};

export type SessionControl = {
  maxSessionDuration: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireTwoFactor: boolean;
  allowedIPs?: string[];
};

export type YearEndReport = {
  id: string;
  year: number;
  totalRevenue: number;
  totalDebts: number;
  totalPayments: number;
  totalCustomers: number;
  totalEmployees: number;
  topCustomers: {
    id: string;
    name: string;
    totalDebt: number;
    totalPayments: number;
  }[];
  monthlyBreakdown: {
    month: number;
    revenue: number;
    debts: number;
    payments: number;
  }[];
  generatedAt: string;
  generatedBy: string;
};

export type SystemReport = {
  id: string;
  type: 'comprehensive' | 'year_end' | 'custom';
  title: string;
  sections: {
    name: string;
    data: Record<string, any>;
  }[];
  generatedAt: string;
  generatedBy: string;
  format: ReportFormat;
};
