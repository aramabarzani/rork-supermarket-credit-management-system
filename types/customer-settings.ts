export interface CustomerSettings {
  userId: string;
  language: 'kurdish' | 'english' | 'arabic';
  notificationPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  dashboardLayout: {
    showDebtSummary: boolean;
    showPaymentHistory: boolean;
    showUpcomingPayments: boolean;
    showReceipts: boolean;
  };
  theme: {
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
  };
  reportPreferences: {
    defaultFormat: 'pdf' | 'excel';
    autoSendEmail: boolean;
    emailFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  privacySettings: {
    showActivityLog: boolean;
    allowDataExport: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPreference {
  id: string;
  userId: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface PasswordChangeRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateRequest {
  userId: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}
