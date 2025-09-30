import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { Tenant, TenantDashboardStats, CreateTenantInput } from '@/types/tenant';

const mockTenants: Tenant[] = [];

function generateTenantId(): string {
  return `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const createTenantProcedure = protectedProcedure
  .input(z.object({
    name: z.string(),
    nameKu: z.string(),
    ownerName: z.string(),
    ownerEmail: z.string(),
    ownerPhone: z.string(),
    ownerPassword: z.string(),
    plan: z.enum(['trial', 'basic', 'professional', 'enterprise']),
  }))
  .mutation(async ({ input }): Promise<Tenant> => {
    const now = new Date();
    let expiresAt: string | undefined;
    let maxUsers = 5;
    let maxCustomers = 100;
    let maxStorage = 1024;
    const enabledModules = ['customer_management', 'debt_tracking', 'payment_tracking'];

    if (input.plan === 'trial') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      maxUsers = 3;
      maxCustomers = 50;
      maxStorage = 512;
    } else if (input.plan === 'basic') {
      maxUsers = 5;
      maxCustomers = 100;
      maxStorage = 1024;
    } else if (input.plan === 'professional') {
      maxUsers = 20;
      maxCustomers = 500;
      maxStorage = 5120;
      enabledModules.push('advanced_reports', 'sms_notifications', 'email_notifications', 'backup', 'analytics');
    } else if (input.plan === 'enterprise') {
      maxUsers = -1;
      maxCustomers = -1;
      maxStorage = -1;
      enabledModules.push('advanced_reports', 'sms_notifications', 'email_notifications', 'backup', 'analytics', 'multi_branch', 'custom_fields', 'api_access', 'custom_branding');
    }

    const licenseKey = `${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const tenant: Tenant = {
      id: generateTenantId(),
      name: input.name,
      nameKu: input.nameKu,
      status: input.plan === 'trial' ? 'trial' : 'active',
      licenseKey,
      ownerId: `owner_${Date.now()}`,
      ownerName: input.ownerName,
      ownerEmail: input.ownerEmail,
      ownerPhone: input.ownerPhone,
      createdAt: now.toISOString(),
      activatedAt: now.toISOString(),
      expiresAt,
      settings: {
        maxUsers,
        maxCustomers,
        maxStorage,
        enabledModules,
      },
      stats: {
        totalUsers: 1,
        totalCustomers: 0,
        totalDebts: 0,
        totalPayments: 0,
        storageUsed: 0,
      },
    };

    mockTenants.push(tenant);
    return tenant;
  });

export const getAllTenantsProcedure = protectedProcedure
  .query(async (): Promise<Tenant[]> => {
    return mockTenants;
  });

export const getTenantByIdProcedure = protectedProcedure
  .input(z.object({ tenantId: z.string() }))
  .query(async ({ input }): Promise<Tenant | null> => {
    return mockTenants.find(t => t.id === input.tenantId) || null;
  });

export const getTenantByLicenseProcedure = protectedProcedure
  .input(z.object({ licenseKey: z.string() }))
  .query(async ({ input }): Promise<Tenant | null> => {
    return mockTenants.find(t => t.licenseKey === input.licenseKey) || null;
  });

export const updateTenantStatusProcedure = protectedProcedure
  .input(z.object({
    tenantId: z.string(),
    status: z.enum(['active', 'suspended', 'trial', 'expired']),
  }))
  .mutation(async ({ input }): Promise<Tenant> => {
    const tenant = mockTenants.find(t => t.id === input.tenantId);
    if (!tenant) {
      throw new Error('کڕیار نەدۆزرایەوە');
    }

    tenant.status = input.status;
    return tenant;
  });

export const updateTenantSettingsProcedure = protectedProcedure
  .input(z.object({
    tenantId: z.string(),
    maxUsers: z.number().optional(),
    maxCustomers: z.number().optional(),
    maxStorage: z.number().optional(),
    enabledModules: z.array(z.string()).optional(),
    customDomain: z.string().optional(),
  }))
  .mutation(async ({ input }): Promise<Tenant> => {
    const tenant = mockTenants.find(t => t.id === input.tenantId);
    if (!tenant) {
      throw new Error('کڕیار نەدۆزرایەوە');
    }

    if (input.maxUsers !== undefined) tenant.settings.maxUsers = input.maxUsers;
    if (input.maxCustomers !== undefined) tenant.settings.maxCustomers = input.maxCustomers;
    if (input.maxStorage !== undefined) tenant.settings.maxStorage = input.maxStorage;
    if (input.enabledModules) tenant.settings.enabledModules = input.enabledModules;
    if (input.customDomain !== undefined) tenant.settings.customDomain = input.customDomain;

    return tenant;
  });

export const updateTenantStatsProcedure = protectedProcedure
  .input(z.object({
    tenantId: z.string(),
    totalUsers: z.number().optional(),
    totalCustomers: z.number().optional(),
    totalDebts: z.number().optional(),
    totalPayments: z.number().optional(),
    storageUsed: z.number().optional(),
  }))
  .mutation(async ({ input }): Promise<Tenant> => {
    const tenant = mockTenants.find(t => t.id === input.tenantId);
    if (!tenant) {
      throw new Error('کڕیار نەدۆزرایەوە');
    }

    if (input.totalUsers !== undefined) tenant.stats.totalUsers = input.totalUsers;
    if (input.totalCustomers !== undefined) tenant.stats.totalCustomers = input.totalCustomers;
    if (input.totalDebts !== undefined) tenant.stats.totalDebts = input.totalDebts;
    if (input.totalPayments !== undefined) tenant.stats.totalPayments = input.totalPayments;
    if (input.storageUsed !== undefined) tenant.stats.storageUsed = input.storageUsed;

    return tenant;
  });

export const deleteTenantProcedure = protectedProcedure
  .input(z.object({ tenantId: z.string() }))
  .mutation(async ({ input }): Promise<{ success: boolean }> => {
    const index = mockTenants.findIndex(t => t.id === input.tenantId);
    if (index === -1) {
      throw new Error('کڕیار نەدۆزرایەوە');
    }

    mockTenants.splice(index, 1);
    return { success: true };
  });

export const getTenantDashboardStatsProcedure = protectedProcedure
  .query(async (): Promise<TenantDashboardStats> => {
    const totalTenants = mockTenants.length;
    const activeTenants = mockTenants.filter(t => t.status === 'active').length;
    const trialTenants = mockTenants.filter(t => t.status === 'trial').length;
    const expiredTenants = mockTenants.filter(t => t.status === 'expired').length;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringLicenses = mockTenants.filter(t => {
      if (!t.expiresAt) return false;
      const expiryDate = new Date(t.expiresAt);
      return expiryDate <= thirtyDaysFromNow && expiryDate > now;
    });

    const recentTenants = [...mockTenants]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      expiredTenants,
      totalRevenue: 0,
      monthlyRevenue: 0,
      recentTenants,
      expiringLicenses,
    };
  });

export const extendTenantLicenseProcedure = protectedProcedure
  .input(z.object({
    tenantId: z.string(),
    durationMonths: z.number(),
  }))
  .mutation(async ({ input }): Promise<Tenant> => {
    const tenant = mockTenants.find(t => t.id === input.tenantId);
    if (!tenant) {
      throw new Error('کڕیار نەدۆزرایەوە');
    }

    const now = new Date();
    const currentExpiry = tenant.expiresAt ? new Date(tenant.expiresAt) : now;
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), now.getTime()) + input.durationMonths * 30 * 24 * 60 * 60 * 1000);

    tenant.expiresAt = newExpiry.toISOString();
    tenant.status = 'active';

    return tenant;
  });

export const recordTenantAccessProcedure = protectedProcedure
  .input(z.object({ tenantId: z.string() }))
  .mutation(async ({ input }): Promise<{ success: boolean }> => {
    const tenant = mockTenants.find(t => t.id === input.tenantId);
    if (!tenant) {
      throw new Error('کڕیار نەدۆزرایەوە');
    }

    tenant.lastAccessAt = new Date().toISOString();
    return { success: true };
  });
