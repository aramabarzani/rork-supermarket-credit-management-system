import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { safeStorage } from '@/utils/storage';

export interface SystemSettings {
  // Language settings (121)
  language: 'kurdish' | 'english' | 'arabic';
  
  // Currency settings (122)
  currency: {
    primary: 'IQD' | 'USD' | 'EUR';
    exchangeRates: {
      USD: number;
      EUR: number;
    };
  };
  
  // Notification settings (123)
  notifications: {
    enabled: boolean;
    types: {
      debtReminders: boolean;
      paymentAlerts: boolean;
      systemUpdates: boolean;
    };
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  
  // Receipt settings (124)
  receipt: {
    logo?: string;
    businessName: string;
    address?: string;
    phone?: string;
    footer?: string;
  };
  
  // Dashboard settings (125)
  dashboard: {
    showCharts: boolean;
    showRecentTransactions: boolean;
    showTopDebtors: boolean;
    showTopPayers: boolean;
    defaultDateRange: 'week' | 'month' | 'year';
  };
  
  // Business info (128)
  businessInfo: {
    name: string;
    type: 'supermarket' | 'company' | 'shop' | 'other';
    ownerName: string;
    phone: string;
    address?: string;
  };
  
  // Locations (129)
  locations: {
    provinces: string[];
    cities: { [province: string]: string[] };
  };
  
  // Debt categories (130)
  debtCategories: string[];
  
  // Theme settings (131)
  theme: {
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    darkMode: boolean;
  };
  
  // Limits (138-140)
  limits: {
    minDebt: number;
    maxDebt: number;
    minPayment: number;
    maxPayment: number;
  };
  
  // Notification count (134)
  notificationCount: number;
  
  // Roles and permissions (135-136)
  roles: {
    admin: string[];
    employee: string[];
    customer: string[];
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  language: 'kurdish',
  currency: {
    primary: 'IQD',
    exchangeRates: {
      USD: 1320,
      EUR: 1450,
    },
  },
  notifications: {
    enabled: true,
    types: {
      debtReminders: true,
      paymentAlerts: true,
      systemUpdates: true,
    },
    frequency: 'daily',
  },
  receipt: {
    businessName: 'سیستەمی بەڕێوەبردنی قەرز',
    phone: '07501234567',
    footer: 'سوپاس بۆ هاوکاریتان',
  },
  dashboard: {
    showCharts: true,
    showRecentTransactions: true,
    showTopDebtors: true,
    showTopPayers: true,
    defaultDateRange: 'month',
  },
  businessInfo: {
    name: 'سیستەمی بەڕێوەبردنی قەرز',
    type: 'supermarket',
    ownerName: 'بەڕێوەبەر',
    phone: '07501234567',
  },
  locations: {
    provinces: ['هەولێر', 'سلێمانی', 'دهۆک', 'کەرکوک', 'بەغدا'],
    cities: {
      'هەولێر': ['هەولێر', 'کۆیە', 'شەقڵاوە', 'چۆمان'],
      'سلێمانی': ['سلێمانی', 'رانیە', 'قەڵادزێ', 'چەمچەماڵ'],
      'دهۆک': ['دهۆک', 'زاخۆ', 'ئامێدی', 'سێمێل'],
      'کەرکوک': ['کەرکوک', 'دەبس', 'حەویجە'],
      'بەغدا': ['بەغدا', 'کاظمیە', 'ئەعظەمیە'],
    },
  },
  debtCategories: ['خواردن', 'کەلوپەل', 'دەرمان', 'جل و بەرگ', 'هیتر'],
  theme: {
    primaryColor: '#3B82F6',
    fontSize: 'medium',
    darkMode: false,
  },
  limits: {
    minDebt: 1000,
    maxDebt: 10000000,
    minPayment: 500,
    maxPayment: 10000000,
  },
  notificationCount: 3,
  roles: {
    admin: ['all'],
    employee: ['view_debts', 'add_debt', 'add_payment', 'view_customers'],
    customer: ['view_own_debts', 'view_own_payments'],
  },
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');

  // Handle web hydration - ensure this runs only on client side
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Ensure we're in browser environment before accessing localStorage
      if (typeof window !== 'undefined') {
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const loadSettings = async () => {
      try {
        const currentTenant = await safeStorage.getItem<any>('currentTenant', null);
        
        if (currentTenant && currentTenant.id) {
          const tenantSettings = await safeStorage.getItem<SystemSettings>(`systemSettings_${currentTenant.id}`, null);
          if (tenantSettings) {
            setSettings({ ...DEFAULT_SETTINGS, ...tenantSettings });
          } else {
            const defaultWithTenantInfo = {
              ...DEFAULT_SETTINGS,
              receipt: {
                ...DEFAULT_SETTINGS.receipt,
                businessName: currentTenant.storeNameKurdish || currentTenant.storeName,
                phone: currentTenant.ownerPhone,
                address: currentTenant.address,
              },
              businessInfo: {
                ...DEFAULT_SETTINGS.businessInfo,
                name: currentTenant.storeNameKurdish || currentTenant.storeName,
                ownerName: currentTenant.ownerName,
                phone: currentTenant.ownerPhone,
                address: currentTenant.address,
              },
            };
            setSettings(defaultWithTenantInfo);
            await safeStorage.setItem(`systemSettings_${currentTenant.id}`, defaultWithTenantInfo);
          }
        } else {
          const storedSettings = await safeStorage.getItem<SystemSettings>('systemSettings', null);
          if (storedSettings) {
            setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadSettings, Platform.OS === 'web' ? 10 : 0);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  const updateSettings = useCallback(async (newSettings: Partial<SystemSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      const currentTenant = await safeStorage.getItem<any>('currentTenant', null);
      if (currentTenant && currentTenant.id) {
        safeStorage.setItem(`systemSettings_${currentTenant.id}`, updatedSettings);
      } else {
        safeStorage.setItem('systemSettings', updatedSettings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      // Don't await storage operations to prevent blocking UI
      safeStorage.setItem('systemSettings', DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }, []);

  const backupSettings = useCallback(() => {
    try {
      const backup = {
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }, [settings]);

  const restoreSettings = useCallback(async (backupData: string) => {
    try {
      const backup = JSON.parse(backupData);
      if (backup.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...backup.settings });
        // Don't await storage operations to prevent blocking UI
        safeStorage.setItem('systemSettings', backup.settings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }, []);

  return useMemo(() => ({
    settings,
    isLoading: isLoading || !isHydrated,
    updateSettings,
    resetSettings,
    backupSettings,
    restoreSettings,
  }), [settings, isLoading, isHydrated, updateSettings, resetSettings, backupSettings, restoreSettings]);
});