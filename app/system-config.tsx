import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Save, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSystemConfig } from '@/hooks/system-config-context';
import { KurdishText } from '@/components/KurdishText';
import type {
  NotificationType,
  ReportFormat,
  BackupFrequency,
  Theme,
} from '@/types/system-config';

export default function SystemConfigScreen() {
  const insets = useSafeAreaInsets();
  const {
    config,
    passwordPolicy,
    notificationSettings,
    backupSettings,
    limitSettings,
    isLoading,
    error,
    updateSystemConfig,
    resetSystemConfig,
    updatePasswordPolicy,
    updateNotificationSettings,
    updateBackupSettings,
    updateLimitSettings,
  } = useSystemConfig();

  const [activeTab, setActiveTab] = useState<
    'general' | 'limits' | 'password' | 'notifications' | 'backup'
  >('general');

  const [localConfig, setLocalConfig] = useState({
    theme: config?.theme || 'light',
    systemEmail: config?.systemEmail || '',
    systemSmsNumber: config?.systemSmsNumber || '',
    timezone: config?.timezone || 'Asia/Baghdad',
    inactivityTimeout: config?.inactivityTimeout || 15,
    defaultReportFormat: config?.defaultReportFormat || 'pdf',
    monthlyNewsletterEnabled: config?.monthlyNewsletterEnabled || false,
    allowUserSharing: config?.allowUserSharing || true,
  });

  const [localLimits, setLocalLimits] = useState({
    maxEmployees: limitSettings?.maxEmployees || 50,
    maxCustomers: limitSettings?.maxCustomers || 1000,
    defaultDebtLimit: limitSettings?.defaultDebtLimit || 5000000,
    defaultPaymentLimit: limitSettings?.defaultPaymentLimit || 10000000,
    searchResultLimit: limitSettings?.searchResultLimit || 100,
  });

  const [localPasswordPolicy, setLocalPasswordPolicy] = useState({
    minLength: passwordPolicy?.minLength || 8,
    requireNumbers: passwordPolicy?.requireNumbers || true,
    requireSymbols: passwordPolicy?.requireSymbols || true,
    requireUppercase: passwordPolicy?.requireUppercase || true,
  });

  const [localNotifications, setLocalNotifications] = useState({
    enabledTypes:
      notificationSettings?.enabledTypes || (['sms', 'email', 'app'] as NotificationType[]),
    systemEmail: notificationSettings?.systemEmail || '',
    systemSmsNumber: notificationSettings?.systemSmsNumber || '',
  });

  const [localBackup, setLocalBackup] = useState({
    frequency: backupSettings?.frequency || ('daily' as BackupFrequency),
    location: backupSettings?.location || '/backups',
  });

  const handleSaveGeneral = async () => {
    try {
      await updateSystemConfig({
        theme: localConfig.theme as Theme,
        systemEmail: localConfig.systemEmail,
        systemSmsNumber: localConfig.systemSmsNumber,
        timezone: localConfig.timezone,
        inactivityTimeout: localConfig.inactivityTimeout,
        defaultReportFormat: localConfig.defaultReportFormat as ReportFormat,
        monthlyNewsletterEnabled: localConfig.monthlyNewsletterEnabled,
        allowUserSharing: localConfig.allowUserSharing,
      });
      Alert.alert('سەرکەوتوو', 'ڕێکخستنەکان بە سەرکەوتوویی نوێکرانەوە');
    } catch {
      Alert.alert('هەڵە', 'نوێکردنەوەی ڕێکخستنەکان سەرکەوتوو نەبوو');
    }
  };

  const handleSaveLimits = async () => {
    try {
      await updateLimitSettings(localLimits);
      Alert.alert('سەرکەوتوو', 'سنوورەکان بە سەرکەوتوویی نوێکرانەوە');
    } catch {
      Alert.alert('هەڵە', 'نوێکردنەوەی سنوورەکان سەرکەوتوو نەبوو');
    }
  };

  const handleSavePasswordPolicy = async () => {
    try {
      await updatePasswordPolicy(localPasswordPolicy);
      Alert.alert('سەرکەوتوو', 'سیاسەتی وشەی تێپەڕ بە سەرکەوتوویی نوێکرایەوە');
    } catch {
      Alert.alert('هەڵە', 'نوێکردنەوەی سیاسەتی وشەی تێپەڕ سەرکەوتوو نەبوو');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotificationSettings(localNotifications);
      Alert.alert('سەرکەوتوو', 'ڕێکخستنەکانی ئاگاداری بە سەرکەوتوویی نوێکرانەوە');
    } catch {
      Alert.alert('هەڵە', 'نوێکردنەوەی ڕێکخستنەکانی ئاگاداری سەرکەوتوو نەبوو');
    }
  };

  const handleSaveBackup = async () => {
    try {
      await updateBackupSettings(localBackup);
      Alert.alert('سەرکەوتوو', 'ڕێکخستنەکانی باکاپ بە سەرکەوتوویی نوێکرانەوە');
    } catch {
      Alert.alert('هەڵە', 'نوێکردنەوەی ڕێکخستنەکانی باکاپ سەرکەوتوو نەبوو');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'دڵنیابوونەوە',
      'ئایا دڵنیایت لە گەڕاندنەوەی ڕێکخستنەکان بۆ بنەڕەت؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'دڵنیام',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSystemConfig();
              Alert.alert('سەرکەوتوو', 'ڕێکخستنەکان گەڕانەوە بۆ بنەڕەت');
            } catch {
              Alert.alert('هەڵە', 'گەڕاندنەوە سەرکەوتوو نەبوو');
            }
          },
        },
      ]
    );
  };

  const toggleNotificationType = (type: NotificationType) => {
    setLocalNotifications((prev) => {
      const types = prev.enabledTypes.includes(type)
        ? prev.enabledTypes.filter((t: NotificationType) => t !== type)
        : [...prev.enabledTypes, type];
      return { ...prev, enabledTypes: types };
    });
  };

  if (isLoading && !config) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <KurdishText style={styles.loadingText}>بارکردنی ڕێکخستنەکان...</KurdishText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ڕێکخستنی سیستەم',
          headerRight: () => (
            <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
              <RotateCcw size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'general' && styles.activeTab]}
            onPress={() => setActiveTab('general')}
          >
            <KurdishText
              style={[
                styles.tabText,
                activeTab === 'general' && styles.activeTabText,
              ]}
            >
              گشتی
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'limits' && styles.activeTab]}
            onPress={() => setActiveTab('limits')}
          >
            <KurdishText
              style={[
                styles.tabText,
                activeTab === 'limits' && styles.activeTabText,
              ]}
            >
              سنوورەکان
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.activeTab]}
            onPress={() => setActiveTab('password')}
          >
            <KurdishText
              style={[
                styles.tabText,
                activeTab === 'password' && styles.activeTabText,
              ]}
            >
              وشەی تێپەڕ
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'notifications' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('notifications')}
          >
            <KurdishText
              style={[
                styles.tabText,
                activeTab === 'notifications' && styles.activeTabText,
              ]}
            >
              ئاگاداری
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'backup' && styles.activeTab]}
            onPress={() => setActiveTab('backup')}
          >
            <KurdishText
              style={[
                styles.tabText,
                activeTab === 'backup' && styles.activeTabText,
              ]}
            >
              باکاپ
            </KurdishText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'general' && (
          <View style={styles.section}>
            <KurdishText style={styles.sectionTitle}>ڕێکخستنە گشتیەکان</KurdishText>

            <View style={styles.field}>
              <KurdishText style={styles.label}>ئیمەیڵی سیستەم</KurdishText>
              <TextInput
                style={styles.input}
                value={localConfig.systemEmail}
                onChangeText={(text) =>
                  setLocalConfig({ ...localConfig, systemEmail: text })
                }
                placeholder="system@example.com"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>ژمارەی SMS</KurdishText>
              <TextInput
                style={styles.input}
                value={localConfig.systemSmsNumber}
                onChangeText={(text) =>
                  setLocalConfig({ ...localConfig, systemSmsNumber: text })
                }
                placeholder="+9647501234567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>ماوەی بێچالاکی (خولەک)</KurdishText>
              <TextInput
                style={styles.input}
                value={String(localConfig.inactivityTimeout)}
                onChangeText={(text) =>
                  setLocalConfig({
                    ...localConfig,
                    inactivityTimeout: parseInt(text) || 15,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>هەواڵنامەی مانگانە چالاک بکە</KurdishText>
              <Switch
                value={localConfig.monthlyNewsletterEnabled}
                onValueChange={(value) =>
                  setLocalConfig({
                    ...localConfig,
                    monthlyNewsletterEnabled: value,
                  })
                }
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>ڕێگە بە هاوبەشی بەکارهێنەر بدە</KurdishText>
              <Switch
                value={localConfig.allowUserSharing}
                onValueChange={(value) =>
                  setLocalConfig({ ...localConfig, allowUserSharing: value })
                }
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveGeneral}
            >
              <Save size={20} color="#FFF" />
              <KurdishText style={styles.saveButtonText}>پاشەکەوتکردن</KurdishText>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'limits' && (
          <View style={styles.section}>
            <KurdishText style={styles.sectionTitle}>ڕێکخستنی سنوورەکان</KurdishText>

            <View style={styles.field}>
              <KurdishText style={styles.label}>زۆرترین ژمارەی کارمەندان</KurdishText>
              <TextInput
                style={styles.input}
                value={String(localLimits.maxEmployees)}
                onChangeText={(text) =>
                  setLocalLimits({
                    ...localLimits,
                    maxEmployees: parseInt(text) || 50,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>زۆرترین ژمارەی کڕیاران</KurdishText>
              <TextInput
                style={styles.input}
                value={String(localLimits.maxCustomers)}
                onChangeText={(text) =>
                  setLocalLimits({
                    ...localLimits,
                    maxCustomers: parseInt(text) || 1000,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>سنووری قەرزی بنەڕەت</KurdishText>
              <TextInput
                style={styles.input}
                value={String(localLimits.defaultDebtLimit)}
                onChangeText={(text) =>
                  setLocalLimits({
                    ...localLimits,
                    defaultDebtLimit: parseInt(text) || 5000000,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>سنووری پارەدانی بنەڕەت</KurdishText>
              <TextInput
                style={styles.input}
                value={String(localLimits.defaultPaymentLimit)}
                onChangeText={(text) =>
                  setLocalLimits({
                    ...localLimits,
                    defaultPaymentLimit: parseInt(text) || 10000000,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>سنووری ئەنجامی گەڕان</KurdishText>
              <TextInput
                style={styles.input}
                value={String(localLimits.searchResultLimit)}
                onChangeText={(text) =>
                  setLocalLimits({
                    ...localLimits,
                    searchResultLimit: parseInt(text) || 100,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveLimits}
            >
              <Save size={20} color="#FFF" />
              <KurdishText style={styles.saveButtonText}>پاشەکەوتکردن</KurdishText>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'password' && (
          <View style={styles.section}>
            <KurdishText style={styles.sectionTitle}>سیاسەتی وشەی تێپەڕ</KurdishText>

            <View style={styles.field}>
              <KurdishText style={styles.label}>کەمترین درێژی وشەی تێپەڕ</KurdishText>
              <TextInput
                style={styles.input}
                value={String(localPasswordPolicy.minLength)}
                onChangeText={(text) =>
                  setLocalPasswordPolicy({
                    ...localPasswordPolicy,
                    minLength: parseInt(text) || 8,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>پێویستی بە ژمارە هەیە</KurdishText>
              <Switch
                value={localPasswordPolicy.requireNumbers}
                onValueChange={(value) =>
                  setLocalPasswordPolicy({
                    ...localPasswordPolicy,
                    requireNumbers: value,
                  })
                }
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>پێویستی بە هێما هەیە</KurdishText>
              <Switch
                value={localPasswordPolicy.requireSymbols}
                onValueChange={(value) =>
                  setLocalPasswordPolicy({
                    ...localPasswordPolicy,
                    requireSymbols: value,
                  })
                }
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>پێویستی بە پیتی گەورە هەیە</KurdishText>
              <Switch
                value={localPasswordPolicy.requireUppercase}
                onValueChange={(value) =>
                  setLocalPasswordPolicy({
                    ...localPasswordPolicy,
                    requireUppercase: value,
                  })
                }
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePasswordPolicy}
            >
              <Save size={20} color="#FFF" />
              <KurdishText style={styles.saveButtonText}>پاشەکەوتکردن</KurdishText>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'notifications' && (
          <View style={styles.section}>
            <KurdishText style={styles.sectionTitle}>ڕێکخستنەکانی ئاگاداری</KurdishText>

            <KurdishText style={styles.subsectionTitle}>جۆرەکانی ئاگاداری چالاککراو</KurdishText>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>SMS</KurdishText>
              <Switch
                value={localNotifications.enabledTypes.includes('sms')}
                onValueChange={() => toggleNotificationType('sms')}
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>ئیمەیڵ</KurdishText>
              <Switch
                value={localNotifications.enabledTypes.includes('email')}
                onValueChange={() => toggleNotificationType('email')}
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>ئاپلیکەیشن</KurdishText>
              <Switch
                value={localNotifications.enabledTypes.includes('app')}
                onValueChange={() => toggleNotificationType('app')}
              />
            </View>

            <View style={styles.switchField}>
              <KurdishText style={styles.label}>واتساپ</KurdishText>
              <Switch
                value={localNotifications.enabledTypes.includes('whatsapp')}
                onValueChange={() => toggleNotificationType('whatsapp')}
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>ئیمەیڵی سیستەم</KurdishText>
              <TextInput
                style={styles.input}
                value={localNotifications.systemEmail}
                onChangeText={(text) =>
                  setLocalNotifications({
                    ...localNotifications,
                    systemEmail: text,
                  })
                }
                placeholder="notifications@example.com"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>ژمارەی SMS</KurdishText>
              <TextInput
                style={styles.input}
                value={localNotifications.systemSmsNumber}
                onChangeText={(text) =>
                  setLocalNotifications({
                    ...localNotifications,
                    systemSmsNumber: text,
                  })
                }
                placeholder="+9647501234567"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveNotifications}
            >
              <Save size={20} color="#FFF" />
              <KurdishText style={styles.saveButtonText}>پاشەکەوتکردن</KurdishText>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'backup' && (
          <View style={styles.section}>
            <KurdishText style={styles.sectionTitle}>ڕێکخستنەکانی باکاپ</KurdishText>

            <View style={styles.field}>
              <KurdishText style={styles.label}>ماوەی باکاپ</KurdishText>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    localBackup.frequency === 'daily' &&
                      styles.pickerOptionActive,
                  ]}
                  onPress={() =>
                    setLocalBackup({ ...localBackup, frequency: 'daily' })
                  }
                >
                  <KurdishText
                    style={[
                      styles.pickerOptionText,
                      localBackup.frequency === 'daily' &&
                        styles.pickerOptionTextActive,
                    ]}
                  >
                    ڕۆژانە
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    localBackup.frequency === 'weekly' &&
                      styles.pickerOptionActive,
                  ]}
                  onPress={() =>
                    setLocalBackup({ ...localBackup, frequency: 'weekly' })
                  }
                >
                  <KurdishText
                    style={[
                      styles.pickerOptionText,
                      localBackup.frequency === 'weekly' &&
                        styles.pickerOptionTextActive,
                    ]}
                  >
                    هەفتانە
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    localBackup.frequency === 'monthly' &&
                      styles.pickerOptionActive,
                  ]}
                  onPress={() =>
                    setLocalBackup({ ...localBackup, frequency: 'monthly' })
                  }
                >
                  <KurdishText
                    style={[
                      styles.pickerOptionText,
                      localBackup.frequency === 'monthly' &&
                        styles.pickerOptionTextActive,
                    ]}
                  >
                    مانگانە
                  </KurdishText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <KurdishText style={styles.label}>شوێنی باکاپ</KurdishText>
              <TextInput
                style={styles.input}
                value={localBackup.location}
                onChangeText={(text) =>
                  setLocalBackup({ ...localBackup, location: text })
                }
                placeholder="/backups"
              />
            </View>

            {backupSettings && (
              <View style={styles.infoBox}>
                <KurdishText style={styles.infoLabel}>دوایین باکاپ:</KurdishText>
                <KurdishText style={styles.infoValue}>
                  {backupSettings.lastBackup
                    ? new Date(backupSettings.lastBackup).toLocaleString('ku')
                    : 'هیچ'}
                </KurdishText>

                <KurdishText style={styles.infoLabel}>باکاپی داهاتوو:</KurdishText>
                <KurdishText style={styles.infoValue}>
                  {backupSettings.nextBackup
                    ? new Date(backupSettings.nextBackup).toLocaleString('ku')
                    : 'هیچ'}
                </KurdishText>
              </View>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveBackup}
            >
              <Save size={20} color="#FFF" />
              <KurdishText style={styles.saveButtonText}>پاشەکەوتکردن</KurdishText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <KurdishText style={styles.errorText}>{error}</KurdishText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#555',
    marginTop: 16,
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextActive: {
    color: '#FFF',
    fontWeight: '600' as const,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600' as const,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
});
