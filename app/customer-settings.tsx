import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  Bell,
  Globe,
  Palette,
  FileText,
  Shield,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useAuth } from '@/hooks/auth-context';
import { useCustomerSettings } from '@/hooks/customer-settings-context';

export default function CustomerSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings, updateSettings, changePassword, updateProfile } = useCustomerSettings();
  
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'dashboard' | 'theme' | 'reports' | 'privacy' | 'password' | 'profile'>('general');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  if (!settings) {
    return null;
  }

  const handlePasswordChange = async () => {
    if (!user) return;

    const result = await changePassword({
      userId: user.id,
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (result.success) {
      Alert.alert('سەرکەوتوو', 'وشەی نهێنی بە سەرکەوتوویی گۆڕدرا');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('هەڵە', result.error || 'هەڵەیەک ڕوویدا');
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    const result = await updateProfile({
      userId: user.id,
      name,
      phone,
      email,
      address,
    });

    if (result.success) {
      Alert.alert('سەرکەوتوو', 'زانیاری پرۆفایل بە سەرکەوتوویی نوێکرایەوە');
    } else {
      Alert.alert('هەڵە', result.error || 'هەڵەیەک ڕوویدا');
    }
  };

  const renderGeneralSettings = () => (
    <View style={styles.section}>
      <View style={styles.settingItem}>
        <View style={styles.settingHeader}>
          <Globe size={20} color="#1E3A8A" />
          <KurdishText style={styles.settingLabel}>زمان</KurdishText>
        </View>
        <View style={styles.languageButtons}>
          {['kurdish', 'english', 'arabic'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageButton,
                settings.language === lang && styles.languageButtonActive,
              ]}
              onPress={() => updateSettings({ language: lang as any })}
            >
              <KurdishText
                style={[
                  styles.languageButtonText,
                  settings.language === lang && styles.languageButtonTextActive,
                ]}
              >
                {lang === 'kurdish' ? 'کوردی' : lang === 'english' ? 'English' : 'عربي'}
              </KurdishText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.section}>
      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <View style={styles.settingHeader}>
            <Bell size={20} color="#1E3A8A" />
            <KurdishText style={styles.settingLabel}>SMS</KurdishText>
          </View>
          <Switch
            value={settings.notificationPreferences.sms}
            onValueChange={(value) =>
              updateSettings({
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  sms: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <View style={styles.settingHeader}>
            <Mail size={20} color="#1E3A8A" />
            <KurdishText style={styles.settingLabel}>ئیمەیڵ</KurdishText>
          </View>
          <Switch
            value={settings.notificationPreferences.email}
            onValueChange={(value) =>
              updateSettings({
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  email: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <View style={styles.settingHeader}>
            <Bell size={20} color="#1E3A8A" />
            <KurdishText style={styles.settingLabel}>نۆتیفیکەیشن</KurdishText>
          </View>
          <Switch
            value={settings.notificationPreferences.push}
            onValueChange={(value) =>
              updateSettings({
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  push: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

  const renderDashboardSettings = () => (
    <View style={styles.section}>
      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <KurdishText style={styles.settingLabel}>پوختەی قەرز</KurdishText>
          <Switch
            value={settings.dashboardLayout.showDebtSummary}
            onValueChange={(value) =>
              updateSettings({
                dashboardLayout: {
                  ...settings.dashboardLayout,
                  showDebtSummary: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <KurdishText style={styles.settingLabel}>مێژووی پارەدان</KurdishText>
          <Switch
            value={settings.dashboardLayout.showPaymentHistory}
            onValueChange={(value) =>
              updateSettings({
                dashboardLayout: {
                  ...settings.dashboardLayout,
                  showPaymentHistory: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <KurdishText style={styles.settingLabel}>پارەدانی داهاتوو</KurdishText>
          <Switch
            value={settings.dashboardLayout.showUpcomingPayments}
            onValueChange={(value) =>
              updateSettings({
                dashboardLayout: {
                  ...settings.dashboardLayout,
                  showUpcomingPayments: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <KurdishText style={styles.settingLabel}>وەسڵەکان</KurdishText>
          <Switch
            value={settings.dashboardLayout.showReceipts}
            onValueChange={(value) =>
              updateSettings({
                dashboardLayout: {
                  ...settings.dashboardLayout,
                  showReceipts: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

  const renderThemeSettings = () => (
    <View style={styles.section}>
      <View style={styles.settingItem}>
        <View style={styles.settingHeader}>
          <Palette size={20} color="#1E3A8A" />
          <KurdishText style={styles.settingLabel}>قەبارەی فۆنت</KurdishText>
        </View>
        <View style={styles.languageButtons}>
          {['small', 'medium', 'large'].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.languageButton,
                settings.theme.fontSize === size && styles.languageButtonActive,
              ]}
              onPress={() =>
                updateSettings({
                  theme: { ...settings.theme, fontSize: size as any },
                })
              }
            >
              <KurdishText
                style={[
                  styles.languageButtonText,
                  settings.theme.fontSize === size && styles.languageButtonTextActive,
                ]}
              >
                {size === 'small' ? 'بچووک' : size === 'medium' ? 'ناوەند' : 'گەورە'}
              </KurdishText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderReportSettings = () => (
    <View style={styles.section}>
      <View style={styles.settingItem}>
        <View style={styles.settingHeader}>
          <FileText size={20} color="#1E3A8A" />
          <KurdishText style={styles.settingLabel}>فۆرماتی بنەڕەتی</KurdishText>
        </View>
        <View style={styles.languageButtons}>
          {['pdf', 'excel'].map((format) => (
            <TouchableOpacity
              key={format}
              style={[
                styles.languageButton,
                settings.reportPreferences.defaultFormat === format && styles.languageButtonActive,
              ]}
              onPress={() =>
                updateSettings({
                  reportPreferences: {
                    ...settings.reportPreferences,
                    defaultFormat: format as any,
                  },
                })
              }
            >
              <KurdishText
                style={[
                  styles.languageButtonText,
                  settings.reportPreferences.defaultFormat === format && styles.languageButtonTextActive,
                ]}
              >
                {format.toUpperCase()}
              </KurdishText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <KurdishText style={styles.settingLabel}>ناردنی خۆکار بە ئیمەیڵ</KurdishText>
          <Switch
            value={settings.reportPreferences.autoSendEmail}
            onValueChange={(value) =>
              updateSettings({
                reportPreferences: {
                  ...settings.reportPreferences,
                  autoSendEmail: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.section}>
      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <View style={styles.settingHeader}>
            <Shield size={20} color="#1E3A8A" />
            <KurdishText style={styles.settingLabel}>پیشاندانی تۆماری چالاکی</KurdishText>
          </View>
          <Switch
            value={settings.privacySettings.showActivityLog}
            onValueChange={(value) =>
              updateSettings({
                privacySettings: {
                  ...settings.privacySettings,
                  showActivityLog: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingRow}>
          <View style={styles.settingHeader}>
            <FileText size={20} color="#1E3A8A" />
            <KurdishText style={styles.settingLabel}>ڕێگەدان بە هەناردەی داتا</KurdishText>
          </View>
          <Switch
            value={settings.privacySettings.allowDataExport}
            onValueChange={(value) =>
              updateSettings({
                privacySettings: {
                  ...settings.privacySettings,
                  allowDataExport: value,
                },
              })
            }
            trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

  const renderPasswordSettings = () => (
    <View style={styles.section}>
      <View style={styles.inputGroup}>
        <KurdishText style={styles.inputLabel}>وشەی نهێنی ئێستا</KurdishText>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            placeholder="وشەی نهێنی ئێستا"
            placeholderTextColor="#9CA3AF"
            textAlign="right"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <KurdishText style={styles.inputLabel}>وشەی نهێنی نوێ</KurdishText>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            placeholder="وشەی نهێنی نوێ"
            placeholderTextColor="#9CA3AF"
            textAlign="right"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <KurdishText style={styles.inputLabel}>دووبارەکردنەوەی وشەی نهێنی نوێ</KurdishText>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="دووبارەکردنەوەی وشەی نهێنی نوێ"
            placeholderTextColor="#9CA3AF"
            textAlign="right"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handlePasswordChange}>
        <Lock size={20} color="#FFFFFF" />
        <KurdishText style={styles.saveButtonText}>گۆڕینی وشەی نهێنی</KurdishText>
      </TouchableOpacity>
    </View>
  );

  const renderProfileSettings = () => (
    <View style={styles.section}>
      <View style={styles.inputGroup}>
        <View style={styles.inputHeader}>
          <User size={20} color="#1E3A8A" />
          <KurdishText style={styles.inputLabel}>ناو</KurdishText>
        </View>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="ناو"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputHeader}>
          <Phone size={20} color="#1E3A8A" />
          <KurdishText style={styles.inputLabel}>ژمارەی مۆبایل</KurdishText>
        </View>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="ژمارەی مۆبایل"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputHeader}>
          <Mail size={20} color="#1E3A8A" />
          <KurdishText style={styles.inputLabel}>ئیمەیڵ</KurdishText>
        </View>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ئیمەیڵ"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputHeader}>
          <MapPin size={20} color="#1E3A8A" />
          <KurdishText style={styles.inputLabel}>ناونیشان</KurdishText>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="ناونیشان"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          textAlign="right"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleProfileUpdate}>
        <Save size={20} color="#FFFFFF" />
        <KurdishText style={styles.saveButtonText}>پاشەکەوتکردنی گۆڕانکاریەکان</KurdishText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ڕێکخستنەکانی کڕیار',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'general', label: 'گشتی', icon: Settings },
            { key: 'profile', label: 'پرۆفایل', icon: User },
            { key: 'password', label: 'وشەی نهێنی', icon: Lock },
            { key: 'notifications', label: 'ئاگاداری', icon: Bell },
            { key: 'dashboard', label: 'داشبۆرد', icon: Settings },
            { key: 'theme', label: 'ڕووکار', icon: Palette },
            { key: 'reports', label: 'ڕاپۆرت', icon: FileText },
            { key: 'privacy', label: 'تایبەتی', icon: Shield },
          ].map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.tabActive]}
              onPress={() => setActiveTab(key as any)}
            >
              <Icon size={18} color={activeTab === key ? '#1E3A8A' : '#6B7280'} />
              <KurdishText
                style={[styles.tabText, activeTab === key && styles.tabTextActive]}
              >
                {label}
              </KurdishText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'profile' && renderProfileSettings()}
        {activeTab === 'password' && renderPasswordSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'dashboard' && renderDashboardSettings()}
        {activeTab === 'theme' && renderThemeSettings()}
        {activeTab === 'reports' && renderReportSettings()}
        {activeTab === 'privacy' && renderPrivacySettings()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  settingItem: {
    gap: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  passwordInputContainer: {
    position: 'relative' as const,
  },
  eyeIcon: {
    position: 'absolute' as const,
    left: 12,
    top: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
