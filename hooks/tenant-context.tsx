import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tenant, TenantStats } from '@/types/tenant';
import { SUBSCRIPTION_PLANS, SubscriptionNotification, SubscriptionNotificationSettings } from '@/types/subscription';

const DEFAULT_NOTIFICATION_SETTINGS: SubscriptionNotificationSettings = {
  enabled: true,
  warningDays: [30, 15, 7, 3, 1],
  channels: ['sms', 'in_app'],
  autoSuspendOnExpiry: false,
};

export const [TenantProvider, useTenant] = createContextHook(() => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionNotifications, setSubscriptionNotifications] = useState<SubscriptionNotification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<SubscriptionNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => {
    loadTenants();
    loadCurrentTenant();
    loadSubscriptionNotifications();
    loadNotificationSettings();
    checkExpiringSubscriptions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkExpiringSubscriptions();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
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

  const loadCurrentTenant = async () => {
    try {
      const stored = await AsyncStorage.getItem('currentTenant');
      if (stored) {
        setCurrentTenant(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load current tenant:', error);
    }
  };

  const setActiveTenant = useCallback(async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      await AsyncStorage.setItem('currentTenant', JSON.stringify(tenant));
      console.log('[Tenant] Active tenant set:', {
        id: tenant.id,
        storeName: tenant.storeNameKurdish,
        ownerName: tenant.ownerName,
      });
    }
  }, [tenants]);

  const loadSubscriptionNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('subscription_notifications');
      if (stored) {
        setSubscriptionNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load subscription notifications:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('subscription_notification_settings');
      if (stored) {
        setNotificationSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSubscriptionNotifications = async (notifications: SubscriptionNotification[]) => {
    try {
      await AsyncStorage.setItem('subscription_notifications', JSON.stringify(notifications));
      setSubscriptionNotifications(notifications);
    } catch (error) {
      console.error('Failed to save subscription notifications:', error);
    }
  };

  const saveNotificationSettings = async (settings: SubscriptionNotificationSettings) => {
    try {
      await AsyncStorage.setItem('subscription_notification_settings', JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
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

  const createTenant = useCallback(async (tenant: Omit<Tenant, 'id' | 'createdAt' | 'staffCount' | 'customerCount' | 'debtCount' | 'totalDebtAmount' | 'totalPaidAmount' | 'features' | 'settings' | 'branding'>) => {
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
        enableAdvancedSearch: true,
        enableVoiceSearch: tenant.plan !== 'basic',
        enableCustomerGroups: true,
        enableCustomerRatings: true,
        enableDebtCategories: true,
        enableNotifications: true,
        enableReceipts: true,
        enableBalanceMonitor: true,
        enableExportData: tenant.plan !== 'basic',
        enableBackupRestore: tenant.plan !== 'basic',
        enableActivityLog: tenant.plan !== 'basic',
        enableSecurityFeatures: tenant.plan !== 'basic',
        enableMultiLanguage: tenant.plan === 'enterprise',
        enableCustomThemes: tenant.plan === 'enterprise',
        enableAnalytics: tenant.plan !== 'basic',
        enableRealtimeMonitoring: tenant.plan === 'enterprise',
        enableErrorLogging: tenant.plan !== 'basic',
        enableSystemUpdates: true,
        enableNotes: true,
        enableSharing: tenant.plan !== 'basic',
        enableGuidance: true,
        enableNewsletter: tenant.plan !== 'basic',
        enableInternalMessaging: true,
        enableUsabilitySettings: tenant.plan !== 'basic',
        enablePerformanceMonitoring: tenant.plan === 'enterprise',
        enableUsageStatistics: tenant.plan !== 'basic',
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
    
    if (currentTenant && currentTenant.id === id) {
      const updatedTenant = { ...currentTenant, ...updates };
      setCurrentTenant(updatedTenant);
      await AsyncStorage.setItem('currentTenant', JSON.stringify(updatedTenant));
      console.log('[Tenant] Current tenant updated:', updatedTenant);
    }
  }, [tenants, currentTenant]);

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

  const sendSubscriptionNotification = async (notification: SubscriptionNotification) => {
    try {
      console.log(`[Notification] Sending ${notification.type} to ${notification.adminName}`);
      
      for (const channel of notification.channels) {
        if (channel === 'sms') {
          console.log(`[SMS] To: ${notification.adminPhone}`);
          console.log(`[SMS] Message: ${notification.message}`);
        } else if (channel === 'email') {
          console.log(`[Email] To: ${notification.adminId}`);
          console.log(`[Email] Subject: ${notification.title}`);
          console.log(`[Email] Body: ${notification.message}`);
        } else if (channel === 'in_app') {
          console.log(`[In-App] Notification created for ${notification.adminName}`);
        }
      }

      const updatedNotifications = subscriptionNotifications.map(n =>
        n.id === notification.id ? { ...n, status: 'sent' as const } : n
      );
      await saveSubscriptionNotifications(updatedNotifications);
    } catch (error) {
      console.error('[Notification] Failed to send:', error);
      const updatedNotifications = subscriptionNotifications.map(n =>
        n.id === notification.id ? { ...n, status: 'failed' as const } : n
      );
      await saveSubscriptionNotifications(updatedNotifications);
    }
  };

  const checkExpiringSubscriptions = useCallback(async () => {
    if (!notificationSettings.enabled) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCheck = notificationSettings.lastCheckDate 
      ? new Date(notificationSettings.lastCheckDate)
      : null;

    if (lastCheck && lastCheck.toDateString() === today.toDateString()) {
      return;
    }

    console.log('[Subscription Check] Checking for expiring subscriptions...');

    const newNotifications: SubscriptionNotification[] = [];

    for (const tenant of tenants) {
      if (tenant.status !== 'active') continue;

      const expiryDate = new Date(tenant.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        const alreadySent = subscriptionNotifications.some(
          n => n.tenantId === tenant.id && n.type === 'expired' && n.status === 'sent'
        );

        if (!alreadySent) {
          const notification: SubscriptionNotification = {
            id: `sub_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tenantId: tenant.id,
            adminId: tenant.adminId,
            adminName: tenant.adminName,
            adminPhone: tenant.adminPhone,
            type: 'expired',
            title: 'ئابوونە بەسەرچووە',
            message: `ئابوونەی ${SUBSCRIPTION_PLANS[tenant.plan].nameKurdish} بۆ ${tenant.adminName} بەسەرچووە. تکایە نوێی بکەرەوە.`,
            sentAt: new Date().toISOString(),
            read: false,
            daysUntilExpiry,
            channels: notificationSettings.channels,
            status: 'pending',
          };
          newNotifications.push(notification);

          if (notificationSettings.autoSuspendOnExpiry) {
            await suspendTenant(tenant.id, 'ئابوونە بەسەرچووە');
          }
        }
      } else if (notificationSettings.warningDays.includes(daysUntilExpiry)) {
        const alreadySent = subscriptionNotifications.some(
          n => n.tenantId === tenant.id && 
          n.type === 'expiry_warning' && 
          n.daysUntilExpiry === daysUntilExpiry &&
          n.status === 'sent'
        );

        if (!alreadySent) {
          const notification: SubscriptionNotification = {
            id: `sub_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tenantId: tenant.id,
            adminId: tenant.adminId,
            adminName: tenant.adminName,
            adminPhone: tenant.adminPhone,
            type: 'expiry_warning',
            title: 'ئاگاداری بەسەرچوونی ئابوونە',
            message: `ئابوونەی ${SUBSCRIPTION_PLANS[tenant.plan].nameKurdish} بۆ ${tenant.adminName} ${daysUntilExpiry} ڕۆژی ماوە بۆ بەسەرچوون. تکایە نوێی بکەرەوە.`,
            sentAt: new Date().toISOString(),
            read: false,
            daysUntilExpiry,
            channels: notificationSettings.channels,
            status: 'pending',
          };
          newNotifications.push(notification);
        }
      }
    }

    if (newNotifications.length > 0) {
      console.log(`[Subscription Check] Created ${newNotifications.length} new notifications`);
      const updatedNotifications = [...subscriptionNotifications, ...newNotifications];
      await saveSubscriptionNotifications(updatedNotifications);

      for (const notification of newNotifications) {
        await sendSubscriptionNotification(notification);
      }
    }

    await saveNotificationSettings({
      ...notificationSettings,
      lastCheckDate: today.toISOString(),
    });
  }, [tenants, subscriptionNotifications, notificationSettings, suspendTenant, saveSubscriptionNotifications, saveNotificationSettings, sendSubscriptionNotification]);

  const updateNotificationSettings = useCallback(async (settings: Partial<SubscriptionNotificationSettings>) => {
    const updated = { ...notificationSettings, ...settings };
    await saveNotificationSettings(updated);
  }, [notificationSettings]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    const updated = subscriptionNotifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    await saveSubscriptionNotifications(updated);
  }, [subscriptionNotifications]);

  const getUnreadNotifications = useCallback(() => {
    return subscriptionNotifications.filter(n => !n.read);
  }, [subscriptionNotifications]);

  return useMemo(() => ({
    tenants,
    currentTenant,
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
    setActiveTenant,
    subscriptionNotifications,
    notificationSettings,
    checkExpiringSubscriptions,
    updateNotificationSettings,
    markNotificationAsRead,
    getUnreadNotifications,
  }), [tenants, currentTenant, isLoading, createTenant, updateTenant, deleteTenant, suspendTenant, activateTenant, renewSubscription, getTenantById, getTenantStats, getActiveTenants, getExpiredTenants, getSuspendedTenants, getExpiringTenants, setActiveTenant, subscriptionNotifications, notificationSettings, checkExpiringSubscriptions, updateNotificationSettings, markNotificationAsRead, getUnreadNotifications]);
});
