import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import { safeStorage } from '@/utils/storage';
import { trpcClient } from '@/lib/trpc';
import type { IntegrationSettings, ExportFormat, CloudProvider, MessagingPlatform } from '@/types/integration';

const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  excel: {
    enabled: true,
    autoExport: false,
  },
  googleSheets: {
    enabled: false,
    autoSync: false,
  },
  googleDrive: {
    enabled: false,
    autoBackup: false,
  },
  dropbox: {
    enabled: false,
    autoBackup: false,
  },
  onedrive: {
    enabled: false,
    autoBackup: false,
  },
  email: {
    enabled: true,
    autoSendReports: false,
    recipients: [],
    frequency: 'monthly',
  },
  whatsapp: {
    enabled: true,
    autoSendNotifications: false,
  },
  telegram: {
    enabled: false,
    autoSendReports: false,
  },
  sms: {
    enabled: true,
    autoSendAlerts: false,
  },
};

export const [IntegrationProvider, useIntegration] = createContextHook(() => {
  const [settings, setSettings] = useState<IntegrationSettings>(DEFAULT_INTEGRATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await safeStorage.getItem<IntegrationSettings>('integrationSettings');
        if (stored) {
          setSettings({ ...DEFAULT_INTEGRATION_SETTINGS, ...stored });
        }
      } catch (error) {
        console.error('Error loading integration settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<IntegrationSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await safeStorage.setItem('integrationSettings', updated);
    } catch (error) {
      console.error('Error updating integration settings:', error);
    }
  }, [settings]);

  const exportToExcel = useCallback(async (type: string, data: any) => {
    try {
      const result = await trpcClient.integration.export.toExcel.mutate({
        type: type as any,
        data,
      });

      if (result.success && result.data) {
        if (Platform.OS === 'web') {
          const blob = new Blob([result.data], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          Alert.alert('سەرکەوتوو', 'داتاکان بە سەرکەوتوویی هاوبەش کران');
        }
      }

      return result;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە هاوبەشکردنی داتا');
      return null;
    }
  }, []);

  const exportToPDF = useCallback(async (type: string, data: any) => {
    try {
      const result = await trpcClient.integration.export.toPDF.mutate({
        type: type as any,
        data,
      });

      if (result.success) {
        Alert.alert('سەرکەوتوو', 'ڕاپۆرت بە PDF هاوبەش کرا');
      }

      return result;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە هاوبەشکردنی ڕاپۆرت');
      return null;
    }
  }, []);

  const shareViaEmail = useCallback(async (recipients: string[], subject: string, body: string, attachments?: any[]) => {
    try {
      const result = await trpcClient.integration.share.viaEmail.mutate({
        recipients,
        subject,
        body,
        attachments,
      });

      if (result.success) {
        Alert.alert('سەرکەوتوو', 'پەیام بە ئیمەیڵ نێردرا');
      }

      return result;
    } catch (error) {
      console.error('Error sharing via email:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە ناردنی ئیمەیڵ');
      return null;
    }
  }, []);

  const shareViaWhatsApp = useCallback(async (recipients: string[], message: string, attachments?: any[]) => {
    try {
      if (Platform.OS !== 'web') {
        const phone = recipients[0];
        const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          await Linking.openURL(url);
          return { success: true, platform: 'whatsapp' as const, recipients, timestamp: new Date().toISOString() };
        }
      }

      const result = await trpcClient.integration.share.viaWhatsApp.mutate({
        recipients,
        message,
        attachments,
      });

      if (result.success) {
        Alert.alert('سەرکەوتوو', 'پەیام بە واتساپ نێردرا');
      }

      return result;
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە ناردنی پەیام');
      return null;
    }
  }, []);

  const shareViaTelegram = useCallback(async (chatId: string, message: string, attachments?: any[]) => {
    try {
      const result = await trpcClient.integration.share.viaTelegram.mutate({
        chatId,
        message,
        attachments,
      });

      if (result.success) {
        Alert.alert('سەرکەوتوو', 'پەیام بە تێلێگرام نێردرا');
      }

      return result;
    } catch (error) {
      console.error('Error sharing via Telegram:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە ناردنی پەیام');
      return null;
    }
  }, []);

  const shareViaSMS = useCallback(async (recipients: string[], message: string) => {
    try {
      if (Platform.OS !== 'web') {
        const url = `sms:${recipients[0]}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          await Linking.openURL(url);
          return { success: true, platform: 'sms' as const, recipients, timestamp: new Date().toISOString() };
        }
      }

      const result = await trpcClient.integration.share.viaSMS.mutate({
        recipients,
        message,
      });

      if (result.success) {
        Alert.alert('سەرکەوتوو', 'پەیام بە SMS نێردرا');
      }

      return result;
    } catch (error) {
      console.error('Error sharing via SMS:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە ناردنی SMS');
      return null;
    }
  }, []);

  const syncToCloud = useCallback(async (provider: CloudProvider, files: any[]) => {
    try {
      let result;
      
      switch (provider) {
        case 'google-drive':
          result = await trpcClient.integration.cloud.syncToGoogleDrive.mutate({ files });
          break;
        case 'dropbox':
          result = await trpcClient.integration.cloud.syncToDropbox.mutate({ files });
          break;
        case 'onedrive':
          result = await trpcClient.integration.cloud.syncToOneDrive.mutate({ files });
          break;
      }

      if (result?.success) {
        Alert.alert('سەرکەوتوو', `داتاکان بە ${provider} هاوبەش کران`);
      }

      return result;
    } catch (error) {
      console.error(`Error syncing to ${provider}:`, error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە هاوبەشکردنی داتا');
      return null;
    }
  }, []);

  const shareReport = useCallback(async (
    reportType: 'monthly' | 'yearly' | 'dashboard' | 'custom',
    platform: MessagingPlatform,
    recipients: string[],
    format: ExportFormat,
    data: any
  ) => {
    try {
      const result = await trpcClient.integration.share.report.mutate({
        reportType,
        platform: platform as any,
        recipients,
        format: format as any,
        data,
      });

      if (result.success) {
        Alert.alert('سەرکەوتوو', 'ڕاپۆرت بە سەرکەوتوویی هاوبەش کرا');
      }

      return result;
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە هاوبەشکردنی ڕاپۆرت');
      return null;
    }
  }, []);

  return useMemo(() => ({
    settings,
    isLoading,
    updateSettings,
    exportToExcel,
    exportToPDF,
    shareViaEmail,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaSMS,
    syncToCloud,
    shareReport,
  }), [
    settings,
    isLoading,
    updateSettings,
    exportToExcel,
    exportToPDF,
    shareViaEmail,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaSMS,
    syncToCloud,
    shareReport,
  ]);
});
