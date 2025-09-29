import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Globe,
  DollarSign,
  Bell,
  Receipt,
  BarChart3,
  Building,
  MapPin,
  Tag,
  Palette,
  Shield,
  Download,
  Upload,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useSettings } from '@/hooks/settings-context';

export default function SystemSettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, backupSettings } = useSettings();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleBackup = () => {
    const backupData = backupSettings();
    if (backupData) {
      console.log('Backup created successfully');
    }
  };

  const handleRestore = () => {
    console.log('Restore functionality will be implemented');
  };

  const settingsSections = [
    {
      id: 'language',
      icon: Globe,
      title: 'ڕێکخستنی زمان',
      subtitle: 'گۆڕینی زمانی سیستەم',
      color: '#3B82F6',
    },
    {
      id: 'currency',
      icon: DollarSign,
      title: 'ڕێکخستنی نرخەکان',
      subtitle: 'دیاریکردنی جۆری پارە و نرخەکان',
      color: '#10B981',
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'ڕێکخستنی ئاگاداریەکان',
      subtitle: 'بەڕێوەبردنی جۆری ئاگاداریەکان',
      color: '#F59E0B',
    },
    {
      id: 'receipt',
      icon: Receipt,
      title: 'ڕێکخستنی وەسڵەکان',
      subtitle: 'دیزاینی وەسڵ و زانیاری کۆمپانیا',
      color: '#8B5CF6',
    },
    {
      id: 'dashboard',
      icon: BarChart3,
      title: 'ڕێکخستنی داشبۆرد',
      subtitle: 'دیاریکردنی ئەو شتانەی نیشان دەدرێن',
      color: '#EF4444',
    },
    {
      id: 'business',
      icon: Building,
      title: 'زانیاری کۆمپانیا',
      subtitle: 'نوێکردنەوەی زانیاری کۆمپانیا',
      color: '#06B6D4',
    },
    {
      id: 'locations',
      icon: MapPin,
      title: 'ڕێکخستنی شوێنەکان',
      subtitle: 'زیادکردنی پارێزگا و شارەکان',
      color: '#84CC16',
    },
    {
      id: 'categories',
      icon: Tag,
      title: 'جۆرەکانی قەرز',
      subtitle: 'بەڕێوەبردنی جۆرەکانی قەرز',
      color: '#F97316',
    },
    {
      id: 'theme',
      icon: Palette,
      title: 'ڕووکار و ڕەنگەکان',
      subtitle: 'گۆڕینی ڕووکاری سیستەم',
      color: '#EC4899',
    },
    {
      id: 'roles',
      icon: Shield,
      title: 'ڕۆڵەکان و دەسەڵاتەکان',
      subtitle: 'بەڕێوەبردنی دەسەڵاتی بەکارهێنەران',
      color: '#6366F1',
    },
  ];

  const renderLanguageSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        هەڵبژاردنی زمان
      </KurdishText>
      
      {[
        { key: 'kurdish', label: 'کوردی' },
        { key: 'english', label: 'English' },
        { key: 'arabic', label: 'العربية' },
      ].map((lang) => (
        <TouchableOpacity
          key={lang.key}
          style={[
            styles.optionRow,
            settings.language === lang.key && styles.selectedOption
          ]}
          onPress={() => updateSettings({ language: lang.key as any })}
        >
          <KurdishText variant="body" color="#1F2937">
            {lang.label}
          </KurdishText>
          <View style={[
            styles.radio,
            settings.language === lang.key && styles.radioSelected
          ]} />
        </TouchableOpacity>
      ))}
    </GradientCard>
  );

  const renderCurrencySettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی پارە
      </KurdishText>
      
      <View style={styles.inputGroup}>
        <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
          جۆری پارەی سەرەکی
        </KurdishText>
        {[
          { key: 'IQD', label: 'دینار (IQD)' },
          { key: 'USD', label: 'دۆلار (USD)' },
          { key: 'EUR', label: 'یۆرۆ (EUR)' },
        ].map((currency) => (
          <TouchableOpacity
            key={currency.key}
            style={[
              styles.optionRow,
              settings.currency.primary === currency.key && styles.selectedOption
            ]}
            onPress={() => updateSettings({ 
              currency: { ...settings.currency, primary: currency.key as any }
            })}
          >
            <KurdishText variant="body" color="#1F2937">
              {currency.label}
            </KurdishText>
            <View style={[
              styles.radio,
              settings.currency.primary === currency.key && styles.radioSelected
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
          نرخی دۆلار (بە دینار)
        </KurdishText>
        <TextInput
          style={styles.textInput}
          value={settings.currency.exchangeRates.USD.toString()}
          onChangeText={(text) => {
            const rate = parseFloat(text) || 0;
            updateSettings({
              currency: {
                ...settings.currency,
                exchangeRates: { ...settings.currency.exchangeRates, USD: rate }
              }
            });
          }}
          keyboardType="numeric"
          placeholder="نرخی دۆلار"
        />
      </View>
    </GradientCard>
  );

  const renderNotificationSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی ئاگاداریەکان
      </KurdishText>
      
      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          چالاککردنی ئاگاداریەکان
        </KurdishText>
        <Switch
          value={settings.notifications.enabled}
          onValueChange={(value) => updateSettings({
            notifications: { ...settings.notifications, enabled: value }
          })}
        />
      </View>

      {settings.notifications.enabled && (
        <>
          <View style={styles.switchRow}>
            <KurdishText variant="body" color="#1F2937">
              یادەوەریی قەرز
            </KurdishText>
            <Switch
              value={settings.notifications.types.debtReminders}
              onValueChange={(value) => updateSettings({
                notifications: {
                  ...settings.notifications,
                  types: { ...settings.notifications.types, debtReminders: value }
                }
              })}
            />
          </View>

          <View style={styles.switchRow}>
            <KurdishText variant="body" color="#1F2937">
              ئاگاداری پارەدان
            </KurdishText>
            <Switch
              value={settings.notifications.types.paymentAlerts}
              onValueChange={(value) => updateSettings({
                notifications: {
                  ...settings.notifications,
                  types: { ...settings.notifications.types, paymentAlerts: value }
                }
              })}
            />
          </View>
        </>
      )}
    </GradientCard>
  );

  const renderBackupSettings = () => (
    <View style={styles.section}>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        پارێزگاری و گەڕاندنەوەی داتا
      </KurdishText>
      
      <View style={styles.backupButtons}>
        <TouchableOpacity style={styles.backupButton} onPress={handleBackup}>
          <Download size={20} color="#10B981" />
          <KurdishText variant="body" color="#10B981">
            پارێزگاری داتا
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Upload size={20} color="#EF4444" />
          <KurdishText variant="body" color="#EF4444">
            گەڕاندنەوەی داتا
          </KurdishText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          ڕێکخستنی سیستەم
        </KurdishText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeSection === null ? (
          <>
            {settingsSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                onPress={() => setActiveSection(section.id)}
                style={styles.menuItem}
              >
                <GradientCard colors={[section.color, section.color]} intensity="light">
                  <View style={styles.menuContent}>
                    <View style={styles.menuLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
                        <section.icon size={24} color={section.color} />
                      </View>
                      <View>
                        <KurdishText variant="body" color="#1F2937">
                          {section.title}
                        </KurdishText>
                        <KurdishText variant="caption" color="#6B7280">
                          {section.subtitle}
                        </KurdishText>
                      </View>
                    </View>
                  </View>
                </GradientCard>
              </TouchableOpacity>
            ))}

            {renderBackupSettings()}
          </>
        ) : (
          <View style={styles.section}>
            <TouchableOpacity 
              onPress={() => setActiveSection(null)}
              style={styles.backToMenu}
            >
              <ArrowLeft size={20} color="#6B7280" />
              <KurdishText variant="body" color="#6B7280">
                گەڕانەوە بۆ لیست
              </KurdishText>
            </TouchableOpacity>

            {activeSection === 'language' && renderLanguageSettings()}
            {activeSection === 'currency' && renderCurrencySettings()}
            {activeSection === 'notifications' && renderNotificationSettings()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
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
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#EBF8FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  restoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
});