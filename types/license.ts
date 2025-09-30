export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'trial';
export type LicenseType = 'trial' | 'monthly' | 'yearly' | 'lifetime';

export interface License {
  id: string;
  key: string;
  clientId: string;
  clientName: string;
  type: LicenseType;
  status: LicenseStatus;
  maxUsers: number;
  maxCustomers: number;
  features: string[];
  issuedAt: string;
  expiresAt: string | null;
  lastValidated: string;
  deviceId?: string;
  ipAddress?: string;
}

export interface LicenseValidation {
  isValid: boolean;
  license?: License;
  message: string;
  remainingDays?: number;
}

export interface CreateLicenseInput {
  clientName: string;
  type: LicenseType;
  maxUsers: number;
  maxCustomers: number;
  features: string[];
  durationMonths?: number;
}

export interface ValidateLicenseInput {
  key: string;
  deviceId?: string;
  ipAddress?: string;
}
