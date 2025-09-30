import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Languages,
  Palette,
  Moon,
  Sun,
  Type,
  Fingerprint,
  QrCode,
  Nfc,
  Shield,
  Mic,
  Eye,
  Zap,
  Database,
  Activity,
  ChevronRight,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsability } from '@/hooks/usability-context';
import { useAuth } from '@/hooks/auth-context';

export default function UsabilitySettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    preferences,
    optimizationSettings,
    performanceAlerts,
    optimizations,
    changeLanguage,
    toggleDarkMode,
    changeFontSize,
    updateBiometric,
    updateQRCode,
    updateNFC,
    updateTwoFactor,
    updateVoiceCommands,
    updateAccessibility,
    runOptimization,
    updateOptimizationSettings,
  } = useUsability();

  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    await runOptimization('cleanup');
    setTimeout(() => {
      setIsOptimizing(false);
      Alert.alert('سەرکەوتوو', 'ئاپتیمایزکردنی داتابەیس تەواو بوو');
    }, 3000);
  };

  const languageOptions = [
    { code: 'kurdish' as const, name: 'کوردی', icon: '🇮🇶' },
    { code: 'english' as const, name: 'English', icon: '🇬🇧' },
    { code: 'arabic' as const, name: 'عربي', icon: '🇸🇦' },
  ];

  const fontSizeOptions = [
    { size: 'small' as const, name: 'بچووک' },
    { size: 'medium' as const, name: 'ناوەند' },
    { size: 'large' as const, name: 'گەورە' },
    { size: 'extra-large' as const, name: 'زۆر گەورە' },
  ];

  const unresolvedAlerts = performanceAlerts.filter(a => !a.resolved).length;
  const lastOptimization = optimizations[optimizations.length - 1];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ڕێکخستنی بەکارهێنان',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#fff',
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            زمان و ڕووکار
          </KurdishText>

          <GradientCard>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Languages size={24} color="#3B82F6" />
                <KurdishText variant="body" color="#1F2937">
                  زمانی سیستەم
                </KurdishText>
              </View>
              <View style={styles.languageButtons}>
                {languageOptions.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageButton,
                      preferences.language === lang.code && styles.languageButtonActive,
                    ]}
                    onPress={() => changeLanguage(lang.code)}
                  >
                    <KurdishText
                      variant="caption"
                      color={preferences.language === lang.code ? '#fff' : '#6B7280'}
                    >
                      {lang.icon} {lang.name}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Palette size={24} color="#EC4899" />
                <KurdishText variant="body" color="#1F2937">
                  ڕووکاری تاریک
                </KurdishText>
              </View>
              <View style={styles.settingRight}>
                {preferences.theme.darkMode ? (
                  <Moon size={20} color="#6B7280" />
                ) : (
                  <Sun size={20} color="#F59E0B" />
                )}
                <Switch
                  value={preferences.theme.darkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor={preferences.theme.darkMode ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Type size={24} color="#8B5CF6" />
                <KurdishText variant="body" color="#1F2937">
                  قەبارەی فۆنت
                </KurdishText>
              </View>
              <View style={styles.fontButtons}>
                {fontSizeOptions.map((font) => (
                  <TouchableOpacity
                    key={font.size}
                    style={[
                      styles.fontButton,
                      preferences.theme.fontSize === font.size && styles.fontButtonActive,
                    ]}
                    onPress={() => changeFontSize(font.size)}
                  >
                    <KurdishText
                      variant="caption"
                      color={preferences.theme.fontSize === font.size ? '#fff' : '#6B7280'}
                    >
                      {font.name}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            پاراستن و دڵنیابوون
          </KurdishText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/two-factor-setup')}
          >
            <GradientCard colors={['#10B981', '#10B981']} intensity="light">
              <View style={styles.menuContent}>
                <View style={styles.menuLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#10B98120' }]}>
                    <Shield size={24} color="#10B981" />
                  </View>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      دڵنیابوون بە دوو هەنگاو (2FA)
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {preferences.twoFactor.enabled ? 'چالاک' : 'ناچالاک'}
                    </KurdishText>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </GradientCard>
          </TouchableOpacity>

          <GradientCard>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Fingerprint size={24} color="#F59E0B" />
                <KurdishText variant="body" color="#1F2937">
                  Touch ID / Face ID
                </KurdishText>
              </View>
              <Switch
                value={preferences.biometric.touchIdEnabled || preferences.biometric.faceIdEnabled}
                onValueChange={(value) => updateBiometric({ touchIdEnabled: value, faceIdEnabled: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={preferences.biometric.touchIdEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <QrCode size={24} color="#3B82F6" />
                <KurdishText variant="body" color="#1F2937">
                  چوونەژوورەوە بە QR Code
                </KurdishText>
              </View>
              <Switch
                value={preferences.qrCode.enableLogin}
                onValueChange={(value) => updateQRCode({ enableLogin: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={preferences.qrCode.enableLogin ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Nfc size={24} color="#EC4899" />
                <KurdishText variant="body" color="#1F2937">
                  پارەدان بە NFC
                </KurdishText>
              </View>
              <Switch
                value={preferences.nfc.enablePayment}
                onValueChange={(value) => updateNFC({ enablePayment: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={preferences.nfc.enablePayment ? '#fff' : '#f4f3f4'}
              />
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            تایبەتمەندیە پێشکەوتووەکان
          </KurdishText>

          <GradientCard>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Mic size={24} color="#8B5CF6" />
                <KurdishText variant="body" color="#1F2937">
                  فەرمانی دەنگی
                </KurdishText>
              </View>
              <Switch
                value={preferences.voiceCommands.enabled}
                onValueChange={(value) => updateVoiceCommands({ enabled: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={preferences.voiceCommands.enabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Eye size={24} color="#10B981" />
                <KurdishText variant="body" color="#1F2937">
                  دۆخی کۆنتراستی بەرز
                </KurdishText>
              </View>
              <Switch
                value={preferences.accessibility.highContrast}
                onValueChange={(value) => updateAccessibility({ highContrast: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={preferences.accessibility.highContrast ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Zap size={24} color="#F59E0B" />
                <KurdishText variant="body" color="#1F2937">
                  کەمکردنەوەی جووڵە
                </KurdishText>
              </View>
              <Switch
                value={preferences.accessibility.reduceMotion}
                onValueChange={(value) => updateAccessibility({ reduceMotion: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={preferences.accessibility.reduceMotion ? '#fff' : '#f4f3f4'}
              />
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            کارایی و ئاپتیمایزکردن
          </KurdishText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/performance-monitoring')}
          >
            <GradientCard colors={['#EF4444', '#EF4444']} intensity="light">
              <View style={styles.menuContent}>
                <View style={styles.menuLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#EF444420' }]}>
                    <Activity size={24} color="#EF4444" />
                  </View>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      چاودێری کارایی
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {unresolvedAlerts} ئاگاداری چالاک
                    </KurdishText>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </GradientCard>
          </TouchableOpacity>

          <GradientCard>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Database size={24} color="#3B82F6" />
                <View>
                  <KurdishText variant="body" color="#1F2937">
                    ئاپتیمایزکردنی خۆکار
                  </KurdishText>
                  {lastOptimization && (
                    <KurdishText variant="caption" color="#6B7280">
                      دوایین جار: {new Date(lastOptimization.startedAt || '').toLocaleDateString('ckb-IQ')}
                    </KurdishText>
                  )}
                </View>
              </View>
              <Switch
                value={optimizationSettings.autoOptimize}
                onValueChange={(value) => updateOptimizationSettings({ autoOptimize: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={optimizationSettings.autoOptimize ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.optimizeButton}
              onPress={handleOptimize}
              disabled={isOptimizing}
            >
              <Zap size={20} color="#fff" />
              <KurdishText variant="body" color="#fff">
                {isOptimizing ? 'ئاپتیمایزکردن...' : 'ئاپتیمایزکردنی ئێستا'}
              </KurdishText>
            </TouchableOpacity>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/usage-statistics')}
          >
            <GradientCard colors={['#8B5CF6', '#8B5CF6']} intensity="light">
              <View style={styles.menuContent}>
                <View style={styles.menuLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#8B5CF620' }]}>
                    <Activity size={24} color="#8B5CF6" />
                  </View>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      ئاماری بەکارهێنان
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      بینینی ئاماری بەکارهێنانی سیستەم
                    </KurdishText>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </GradientCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  languageButtonActive: {
    backgroundColor: '#3B82F6',
  },
  fontButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  fontButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  fontButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  menuItem: {
    marginBottom: 12,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
