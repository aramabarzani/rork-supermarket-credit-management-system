import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tenant, TenantStats } from '@/types/tenant';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';

export const [TenantProvider, useTenant] = createContextHook(() => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const stored = await AsyncStorage.getItem('tenants');
      if (stored) {
        setTenants(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTenants = async (updatedTenants: Tenant[]) => {
    try {
      await AsyncStorage.setItem('tenants', JSON.stringify(updatedTenants));
      setTenants(updatedTenants);
    } catch (error) {
      console.error('Failed to save tenants:', error);
      throw error;
    }
  };

  const createTenant = useCallback(async (tenant: Omit<Tenant, 'id' | 'createdAt' | 'staffCount' | 'customerCount' | 'debtCount' | 'totalDebtAmount' | 'totalPaidAmount'>) => {
    const plan = SUBSCRIPTION_PLANS[tenant.plan];
    const newTenant: Tenant = {
      ...tenant,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      staffCount: 0,
      customerCount: 0,
      debtCount: 0,
      totalDebtAmount: 0,
      totalPaidAmount: 0,
      features: {
        maxStaff: plan.maxStaff,
        maxCustomers: plan.maxCustomers,
        maxDebts: -1,
        enableAdvancedReports: tenant.plan !== 'basic',
        enableCustomForms: tenant.plan === 'enterprise',
        enableIntegrations: tenant.plan === 'enterprise',
        enableAPI: tenant.plan === 'enterprise',
        enableWhiteLabel: tenant.plan === 'enterprise',
        enableMultiLocation: tenant.plan === 'enterprise',
        enableInventory: tenant.plan !== 'basic',
      },
      settings: {
        language: 'ku',
        currency: 'IQD',
        timezone: 'Asia/Baghdad',
        dateFormat: 'DD/MM/YYYY',
        fiscalYearStart: '01/01',
        enableNotifications: true,
        enableSMS: true,
        enableEmail: tenant.plan !== 'basic',
        autoBackup: tenant.plan !== 'basic',
        backupFrequency: 'weekly',
      },
      branding: {
        primaryColor: '#1E3A8A',
        secondaryColor: '#3B82F6',
      },
    };

    await saveTenants([...tenants, newTenant]);
    return newTenant;
  }, [tenants]);

  const updateTenant = useCallback(async (id: string, updates: Partial<Tenant>) => {
    const updated = tenants.map(t => t.id === id ? { ...t, ...updates } : t);
    await saveTenants(updated);
  }, [tenants]);

  const deleteTenant = useCallback(async (id: string) => {
    const updated = tenants.filter(t => t.id !== id);
    await saveTenants(updated);
  }, [tenants]);

  const suspendTenant = useCallback(async (id: string, reason: string) => {
    const updated = tenants.map(t => 
      t.id === id 
        ? { 
            ...t, 
            status: 'suspended' as const, 
            suspendedAt: new Date().toISOString(),
            suspensionReason: reason 
          }
        : t
    );
    await saveTenants(updated);
  }, [tenants]);

  const activateTenant = useCallback(async (id: string) => {
    const updated = tenants.map(t => 
      t.id === id 
        ? { 
            ...t, 
            status: 'active' as const, 
            suspendedAt: undefined,
            suspensionReason: undefined 
          }
        : t
    );
    await saveTenants(updated);
  }, [tenants]);

  const renewSubscription = useCallback(async (id: string, duration: number) => {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) throw new Error('Tenant not found');

    const newExpiryDate = new Date(tenant.expiryDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + duration);

    const updated = tenants.map(t => 
      t.id === id 
        ? { 
            ...t, 
            expiryDate: newExpiryDate.toISOString(),
            lastRenewedAt: new Date().toISOString(),
            status: 'active' as const
          }
        : t
    );
    await saveTenants(updated);
  }, [tenants]);

  const getTenantById = useCallback((id: string) => {
    return tenants.find(t => t.id === id);
  }, [tenants]);

  const getTenantStats = useCallback((id: string): TenantStats | null => {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return null;

    return {
      tenantId: id,
      totalRevenue: tenant.totalPaidAmount,
      monthlyRevenue: 0,
      activeCustomers: tenant.customerCount,
      pendingDebts: tenant.debtCount,
      overdueDebts: 0,
      collectionRate: tenant.totalDebtAmount > 0 
        ? (tenant.totalPaidAmount / tenant.totalDebtAmount) * 100 
        : 0,
      averageDebtAmount: tenant.debtCount > 0 
        ? tenant.totalDebtAmount / tenant.debtCount 
        : 0,
      topCustomers: [],
      recentActivities: [],
    };
  }, [tenants]);

  const getActiveTenants = useCallback(() => {
    return tenants.filter(t => t.status === 'active');
  }, [tenants]);

  const getExpiredTenants = useCallback(() => {
    return tenants.filter(t => t.status === 'expired');
  }, [tenants]);

  const getSuspendedTenants = useCallback(() => {
    return tenants.filter(t => t.status === 'suspended');
  }, [tenants]);

  const getExpiringTenants = useCallback((days: number = 7) => {
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return tenants.filter(t => {
      const expiryDate = new Date(t.expiryDate);
      return t.status === 'active' && expiryDate <= threshold && expiryDate > now;
    });
  }, [tenants]);

  return useMemo(() => ({
    tenants,
    isLoading,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
    renewSubscription,
    getTenantById,
    getTenantStats,
    getActiveTenants,
    getExpiredTenants,
    getSuspendedTenants,
    getExpiringTenants,
  }), [tenants, isLoading, createTenant, updateTenant, deleteTenant, suspendTenant, activateTenant, renewSubscription, getTenantById, getTenantStats, getActiveTenants, getExpiredTenants, getSuspendedTenants, getExpiringTenants]);
});
