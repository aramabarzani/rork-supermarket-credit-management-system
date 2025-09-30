import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerSettings, PasswordChangeRequest, ProfileUpdateRequest } from '@/types/customer-settings';
import { useAuth } from './auth-context';

const DEFAULT_SETTINGS: Omit<CustomerSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  language: 'kurdish',
  notificationPreferences: {
    sms: true,
    email: true,
    push: true,
  },
  dashboardLayout: {
    showDebtSummary: true,
    showPaymentHistory: true,
    showUpcomingPayments: true,
    showReceipts: true,
  },
  theme: {
    primaryColor: '#1E3A8A',
    fontSize: 'medium',
    fontFamily: 'default',
  },
  reportPreferences: {
    defaultFormat: 'pdf',
    autoSendEmail: false,
    emailFrequency: 'monthly',
  },
  privacySettings: {
    showActivityLog: true,
    allowDataExport: true,
  },
};

export const [CustomerSettingsProvider, useCustomerSettings] = createContextHook(() => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<CustomerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const stored = await AsyncStorage.getItem(`customer_settings_${user.id}`);
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        const newSettings: CustomerSettings = {
          ...DEFAULT_SETTINGS,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSettings(newSettings);
        await AsyncStorage.setItem(`customer_settings_${user.id}`, JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error('Error loading customer settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(async (updates: Partial<CustomerSettings>) => {
    if (!user || !settings) return;

    const updatedSettings: CustomerSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setSettings(updatedSettings);
    await AsyncStorage.setItem(`customer_settings_${user.id}`, JSON.stringify(updatedSettings));
  }, [user, settings]);

  const changePassword = useCallback(async (request: PasswordChangeRequest): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'بەکارهێنەر نەدۆزرایەوە' };
    }

    if (request.newPassword !== request.confirmPassword) {
      return { success: false, error: 'وشەی نهێنی نوێ یەکسان نین' };
    }

    if (request.newPassword.length < 6) {
      return { success: false, error: 'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت' };
    }

    if (user.password !== request.currentPassword) {
      return { success: false, error: 'وشەی نهێنی ئێستا هەڵەیە' };
    }

    try {
      const allUsers = await AsyncStorage.getItem('users');
      if (allUsers) {
        const users = JSON.parse(allUsers);
        const updatedUsers = users.map((u: any) => 
          u.id === user.id ? { ...u, password: request.newPassword } : u
        );
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        updateUser({ password: request.newPassword });
        return { success: true };
      }
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    }
  }, [user, updateUser]);

  const updateProfile = useCallback(async (request: ProfileUpdateRequest): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'بەکارهێنەر نەدۆزرایەوە' };
    }

    try {
      const allUsers = await AsyncStorage.getItem('users');
      if (allUsers) {
        const users = JSON.parse(allUsers);
        const updatedUsers = users.map((u: any) => 
          u.id === user.id ? { ...u, ...request } : u
        );
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        updateUser(request);
        return { success: true };
      }
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    }
  }, [user, updateUser]);

  return useMemo(() => ({
    settings,
    isLoading,
    updateSettings,
    changePassword,
    updateProfile,
  }), [settings, isLoading, updateSettings, changePassword, updateProfile]);
});
