export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'trial';
export type LicenseType = 'trial' | 'monthly' | 'yearly' | 'lifetime';

export interface License {
  id: string;
  key: string;
  clientId: string;
  clientName: string;
  businessName: string;
  businessType: 'supermarket' | 'grocery' | 'retail' | 'wholesale' | 'other';
  type: LicenseType;
  status: LicenseStatus;
  maxUsers: number;
  maxCustomers: number;
  maxBranches: number;
  features: string[];
  issuedAt: string;
  expiresAt: string | null;
  lastValidated: string;
  deviceId?: string;
  ipAddress?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address?: string;
  city?: string;
  activationCount: number;
  lastActivationAt?: string;
  hardwareId?: string;
}

export interface LicenseValidation {
  isValid: boolean;
  license?: License;
  message: string;
  remainingDays?: number;
}

export interface CreateLicenseInput {
  clientName: string;
  businessName: string;
  businessType: 'supermarket' | 'grocery' | 'retail' | 'wholesale' | 'other';
  type: LicenseType;
  maxUsers: number;
  maxCustomers: number;
  maxBranches: number;
  features: string[];
  durationMonths?: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address?: string;
  city?: string;
}

export interface ValidateLicenseInput {
  key: string;
  deviceId?: string;
  ipAddress?: string;
}

export type LicenseRole = 'owner' | 'admin' | 'employee';

export interface LicensePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSuspend: boolean;
  canActivate: boolean;
  canRenew: boolean;
  canViewStats: boolean;
  canViewDetails: boolean;
  canExport: boolean;
}
