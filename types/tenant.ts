export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired';

export interface Tenant {
  id: string;
  name: string;
  nameKu: string;
  status: TenantStatus;
  licenseKey: string;
  subscriptionId?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  lastAccessAt?: string;
  settings: TenantSettings;
  stats: TenantStats;
}

export interface TenantSettings {
  maxUsers: number;
  maxCustomers: number;
  maxStorage: number;
  enabledModules: string[];
  customDomain?: string;
}

export interface TenantStats {
  totalUsers: number;
  totalCustomers: number;
  totalDebts: number;
  totalPayments: number;
  storageUsed: number;
  lastBackup?: string;
}

export interface CreateTenantInput {
  name: string;
  nameKu: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;
  plan: 'trial' | 'basic' | 'professional' | 'enterprise';
}

export interface TenantDashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  expiredTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentTenants: Tenant[];
  expiringLicenses: Tenant[];
}
