import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Settings,
  Users,
  FileText,
  Zap,
  Globe,
  Database,
  Shield,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Search,
  Mic,
  Tag,
  Star,
  FolderOpen,
  Bell,
  Receipt,
  TrendingUp,
  Download,
  HardDrive,
  Activity,
  Lock,
  Languages,
  Palette,
  BarChart3,
  Monitor,
  AlertTriangle,
  RefreshCw,
  StickyNote,
  Share2,
  HelpCircle,
  Mail,
  MessageSquare,
  Sliders,
  Gauge,
  PieChart,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/types/subscription';
import { TenantFeatures } from '@/types/tenant';

interface TenantData {
  id: string;
  adminName: string;
  adminPhone: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'suspended';
  features?: TenantFeatures;
}

export default function TenantFeaturesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [features, setFeatures] = useState<TenantFeatures>({
    maxStaff: 5,
    maxCustomers: 50,
    maxDebts: -1,
    enableAdvancedReports: false,
    enableCustomForms: false,
    enableIntegrations: false,
    enableAPI: false,
    enableWhiteLabel: false,
    enableMultiLocation: false,
    enableInventory: false,
    enableAdvancedSearch: true,
    enableVoiceSearch: false,
    enableCustomerGroups: true,
    enableCustomerRatings: true,
    enableDebtCategories: true,
    enableNotifications: true,
    enableReceipts: true,
    enableBalanceMonitor: true,
    enableExportData: false,
    enableBackupRestore: false,
    enableActivityLog: false,
    enableSecurityFeatures: false,
    enableMultiLanguage: false,
    enableCustomThemes: false,
    enableAnalytics: false,
    enableRealtimeMonitoring: false,
    enableErrorLogging: false,
    enableSystemUpdates: true,
    enableNotes: true,
    enableSharing: false,
    enableGuidance: true,
    enableNewsletter: false,
    enableInternalMessaging: true,
    enableUsabilitySettings: false,
    enablePerformanceMonitoring: false,
    enableUsageStatistics: false,
  });

  useEffect(() => {
    loadTenant();
  }, [id]);

  const loadTenant = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('tenants');
      if (stored) {
        const tenants: TenantData[] = JSON.parse(stored);
        const found = tenants.find(t => t.id === id);
        if (found) {
          setTenant(found);
          if (found.features) {
            setFeatures(found.features);
          } else {
            const plan = SUBSCRIPTION_PLANS[found.plan];
            setFeatures({
              maxStaff: plan.maxStaff,
              maxCustomers: plan.maxCustomers,
              maxDebts: -1,
              enableAdvancedReports: found.plan !== 'basic',
              enableCustomForms: found.plan === 'enterprise',
              enableIntegrations: found.plan === 'enterprise',
              enableAPI: found.plan === 'enterprise',
              enableWhiteLabel: found.plan === 'enterprise',
              enableMultiLocation: found.plan === 'enterprise',
              enableInventory: found.plan !== 'basic',
              enableAdvancedSearch: true,
              enableVoiceSearch: found.plan !== 'basic',
              enableCustomerGroups: true,
              enableCustomerRatings: true,
              enableDebtCategories: true,
              enableNotifications: true,
              enableReceipts: true,
              enableBalanceMonitor: true,
              enableExportData: found.plan !== 'basic',
              enableBackupRestore: found.plan !== 'basic',
              enableActivityLog: found.plan !== 'basic',
              enableSecurityFeatures: found.plan !== 'basic',
              enableMultiLanguage: found.plan === 'enterprise',
              enableCustomThemes: found.plan === 'enterprise',
              enableAnalytics: found.plan !== 'basic',
              enableRealtimeMonitoring: found.plan === 'enterprise',
              enableErrorLogging: found.plan !== 'basic',
              enableSystemUpdates: true,
              enableNotes: true,
              enableSharing: found.plan !== 'basic',
              enableGuidance: true,
              enableNewsletter: found.plan !== 'basic',
              enableInternalMessaging: true,
              enableUsabilitySettings: found.plan !== 'basic',
              enablePerformanceMonitoring: found.plan === 'enterprise',
              enableUsageStatistics: found.plan !== 'basic',
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tenant:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە بارکردنی زانیاریەکان');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tenant) return;

    try {
      setIsSaving(true);
      const stored = await AsyncStorage.getItem('tenants');
      if (stored) {
        const tenants: TenantData[] = JSON.parse(stored);
        const updated = tenants.map(t =>
          t.id === tenant.id ? { ...t, features } : t
        );
        await AsyncStorage.setItem('tenants', JSON.stringify(updated));
        Alert.alert('سەرکەوتوو', 'تایبەتمەندیەکان پاشەکەوتکران', [
          { text: 'باشە', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Failed to save features:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە پاشەکەوتکردنی تایبەتمەندیەکان');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFeature = <K extends keyof TenantFeatures>(
    key: K,
    value: TenantFeatures[K]
  ) => {
    setFeatures(prev => ({ ...prev, [key]: value }));
  };

  const getPlanLimits = () => {
    if (!tenant) return null;
    return SUBSCRIPTION_PLANS[tenant.plan];
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'بەڕێوەبردنی تایبەتمەندیەکان' }} />
        <View style={styles.loadingContainer}>
          <Settings size={48} color="#3b82f6" />
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'بەڕێوەبردنی تایبەتمەندیەکان' }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#ef4444" />
          <Text style={styles.errorText}>بەڕێوەبەر نەدۆزرایەوە</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>گەڕانەوە</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const planLimits = getPlanLimits();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی تایبەتمەندیەکان',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={styles.headerButton}
            >
              <Save size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{tenant.adminName}</Text>
            <Text style={styles.headerPhone}>{tenant.adminPhone}</Text>
            <View style={styles.planBadge}>
              <Package size={16} color="#3b82f6" />
              <Text style={styles.planText}>{planLimits?.nameKurdish}</Text>
            </View>
          </View>
          <View style={styles.headerDescription}>
            <AlertCircle size={20} color="#3b82f6" />
            <Text style={styles.descriptionText}>
              لێرەوە دەتوانیت تایبەتمەندیەکانی سیستەم بۆ ئەم بەڕێوەبەرە دیاری بکەیت بەپێی پلانی کڕدراو
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>سنووری بەکارهێنەران</Text>
          </View>

          <View style={styles.limitCard}>
            <View style={styles.limitHeader}>
              <Text style={styles.limitLabel}>ژمارەی کارمەندان</Text>
              {planLimits && planLimits.maxStaff !== -1 && (
                <Text style={styles.limitHint}>
                  سنووری پلان: {planLimits.maxStaff}
                </Text>
              )}
            </View>
            <TextInput
              style={styles.limitInput}
              value={features.maxStaff === -1 ? 'نامحدود' : features.maxStaff.toString()}
              onChangeText={(text) => {
                if (text === 'نامحدود' || text === '') {
                  updateFeature('maxStaff', -1);
                } else {
                  const num = parseInt(text);
                  if (!isNaN(num)) {
                    updateFeature('maxStaff', num);
                  }
                }
              }}
              keyboardType="number-pad"
              placeholder="ژمارەی کارمەندان"
              placeholderTextColor="#9ca3af"
            />
            {planLimits && planLimits.maxStaff === -1 && (
              <Text style={styles.unlimitedNote}>
                ✓ پلانەکە ڕێگە بە کارمەندی نامحدود دەدات
              </Text>
            )}
          </View>

          <View style={styles.limitCard}>
            <View style={styles.limitHeader}>
              <Text style={styles.limitLabel}>ژمارەی کڕیاران</Text>
              {planLimits && planLimits.maxCustomers !== -1 && (
                <Text style={styles.limitHint}>
                  سنووری پلان: {planLimits.maxCustomers}
                </Text>
              )}
            </View>
            <TextInput
              style={styles.limitInput}
              value={features.maxCustomers === -1 ? 'نامحدود' : features.maxCustomers.toString()}
              onChangeText={(text) => {
                if (text === 'نامحدود' || text === '') {
                  updateFeature('maxCustomers', -1);
                } else {
                  const num = parseInt(text);
                  if (!isNaN(num)) {
                    updateFeature('maxCustomers', num);
                  }
                }
              }}
              keyboardType="number-pad"
              placeholder="ژمارەی کڕیاران"
              placeholderTextColor="#9ca3af"
            />
            {planLimits && planLimits.maxCustomers === -1 && (
              <Text style={styles.unlimitedNote}>
                ✓ پلانەکە ڕێگە بە کڕیاری نامحدود دەدات
              </Text>
            )}
          </View>

          <View style={styles.limitCard}>
            <View style={styles.limitHeader}>
              <Text style={styles.limitLabel}>ژمارەی قەرزەکان</Text>
              <Text style={styles.limitHint}>بنەڕەتی: نامحدود</Text>
            </View>
            <TextInput
              style={styles.limitInput}
              value={features.maxDebts === -1 ? 'نامحدود' : features.maxDebts.toString()}
              onChangeText={(text) => {
                if (text === 'نامحدود' || text === '') {
                  updateFeature('maxDebts', -1);
                } else {
                  const num = parseInt(text);
                  if (!isNaN(num)) {
                    updateFeature('maxDebts', num);
                  }
                }
              }}
              keyboardType="number-pad"
              placeholder="ژمارەی قەرزەکان"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>تایبەتمەندیە پێشکەوتووەکان</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <FileText size={20} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>راپۆرتی پێشکەوتوو</Text>
                <Text style={styles.featureDescription}>
                  دەسەڵاتی دروستکردنی راپۆرتی تایبەت و پێشکەوتوو
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableAdvancedReports}
              onValueChange={(value) => updateFeature('enableAdvancedReports', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={features.enableAdvancedReports ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <FileText size={20} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>فۆڕمی تایبەت</Text>
                <Text style={styles.featureDescription}>
                  دروستکردنی فۆڕمی تایبەت بۆ کۆکردنەوەی زانیاری
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableCustomForms}
              onValueChange={(value) => updateFeature('enableCustomForms', value)}
              trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
              thumbColor={features.enableCustomForms ? '#8b5cf6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Zap size={20} color="#f59e0b" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>یەکخستنەکان</Text>
                <Text style={styles.featureDescription}>
                  یەکخستن لەگەڵ سیستەمە دەرەکیەکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableIntegrations}
              onValueChange={(value) => updateFeature('enableIntegrations', value)}
              trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
              thumbColor={features.enableIntegrations ? '#f59e0b' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Globe size={20} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>API</Text>
                <Text style={styles.featureDescription}>
                  دەسەڵاتی بەکارهێنانی API بۆ یەکخستنەکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableAPI}
              onValueChange={(value) => updateFeature('enableAPI', value)}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={features.enableAPI ? '#10b981' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Shield size={20} color="#ef4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>White Label</Text>
                <Text style={styles.featureDescription}>
                  تایبەتکردنی بەرنامە بە برانڈی خۆیان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableWhiteLabel}
              onValueChange={(value) => updateFeature('enableWhiteLabel', value)}
              trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
              thumbColor={features.enableWhiteLabel ? '#ef4444' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Globe size={20} color="#6366f1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>چەند شوێنێک</Text>
                <Text style={styles.featureDescription}>
                  بەڕێوەبردنی چەند شوێن یان لقێک
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableMultiLocation}
              onValueChange={(value) => updateFeature('enableMultiLocation', value)}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={features.enableMultiLocation ? '#6366f1' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Database size={20} color="#14b8a6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>کۆگا</Text>
                <Text style={styles.featureDescription}>
                  بەڕێوەبردنی کۆگا و کاڵاکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableInventory}
              onValueChange={(value) => updateFeature('enableInventory', value)}
              trackColor={{ false: '#d1d5db', true: '#5eead4' }}
              thumbColor={features.enableInventory ? '#14b8a6' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Search size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>گەڕان و پاڵاوتن</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Search size={20} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>گەڕانی پێشکەوتوو</Text>
                <Text style={styles.featureDescription}>
                  گەڕانی تایبەت و پاڵاوتنی پێشکەوتوو
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableAdvancedSearch}
              onValueChange={(value) => updateFeature('enableAdvancedSearch', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={features.enableAdvancedSearch ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Mic size={20} color="#ef4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>گەڕانی دەنگی</Text>
                <Text style={styles.featureDescription}>
                  گەڕان بە دەنگ و فەرمانی دەنگی
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableVoiceSearch}
              onValueChange={(value) => updateFeature('enableVoiceSearch', value)}
              trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
              thumbColor={features.enableVoiceSearch ? '#ef4444' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={24} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>بەڕێوەبردنی کڕیاران</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Tag size={20} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>کۆمەڵەی کڕیاران</Text>
                <Text style={styles.featureDescription}>
                  دابەشکردنی کڕیاران بۆ کۆمەڵەکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableCustomerGroups}
              onValueChange={(value) => updateFeature('enableCustomerGroups', value)}
              trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
              thumbColor={features.enableCustomerGroups ? '#8b5cf6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Star size={20} color="#f59e0b" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>هەڵسەنگاندنی کڕیاران</Text>
                <Text style={styles.featureDescription}>
                  هەڵسەنگاندن و پلەدانی کڕیاران
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableCustomerRatings}
              onValueChange={(value) => updateFeature('enableCustomerRatings', value)}
              trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
              thumbColor={features.enableCustomerRatings ? '#f59e0b' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FolderOpen size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>بەڕێوەبردنی قەرز</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <FolderOpen size={20} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>جۆرەکانی قەرز</Text>
                <Text style={styles.featureDescription}>
                  دابەشکردنی قەرزەکان بەپێی جۆر
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableDebtCategories}
              onValueChange={(value) => updateFeature('enableDebtCategories', value)}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={features.enableDebtCategories ? '#10b981' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>ئاگادارکردنەوە و پەیوەندی</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Bell size={20} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>ئاگادارکردنەوەکان</Text>
                <Text style={styles.featureDescription}>
                  ناردنی ئاگادارکردنەوە بۆ کڕیاران
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableNotifications}
              onValueChange={(value) => updateFeature('enableNotifications', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={features.enableNotifications ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <MessageSquare size={20} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>پەیامی ناوخۆیی</Text>
                <Text style={styles.featureDescription}>
                  پەیامی ناوخۆیی نێوان کارمەندان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableInternalMessaging}
              onValueChange={(value) => updateFeature('enableInternalMessaging', value)}
              trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
              thumbColor={features.enableInternalMessaging ? '#8b5cf6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Mail size={20} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>نامەی هەواڵ</Text>
                <Text style={styles.featureDescription}>
                  ناردنی نامەی هەواڵ بۆ کڕیاران
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableNewsletter}
              onValueChange={(value) => updateFeature('enableNewsletter', value)}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={features.enableNewsletter ? '#10b981' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Receipt size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>وەسڵ و داتا</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Receipt size={20} color="#ef4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>وەسڵەکان</Text>
                <Text style={styles.featureDescription}>
                  دروستکردن و چاپکردنی وەسڵ
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableReceipts}
              onValueChange={(value) => updateFeature('enableReceipts', value)}
              trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
              thumbColor={features.enableReceipts ? '#ef4444' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Download size={20} color="#6366f1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>هەناردەکردنی داتا</Text>
                <Text style={styles.featureDescription}>
                  هەناردەکردنی داتا بە فۆرماتی جیاواز
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableExportData}
              onValueChange={(value) => updateFeature('enableExportData', value)}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={features.enableExportData ? '#6366f1' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <HardDrive size={20} color="#14b8a6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>پاشەکەوت و گەڕانەوە</Text>
                <Text style={styles.featureDescription}>
                  پاشەکەوتکردن و گەڕاندنەوەی داتا
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableBackupRestore}
              onValueChange={(value) => updateFeature('enableBackupRestore', value)}
              trackColor={{ false: '#d1d5db', true: '#5eead4' }}
              thumbColor={features.enableBackupRestore ? '#14b8a6' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>چاودێری و شیکاری</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <TrendingUp size={20} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>چاودێری باڵانس</Text>
                <Text style={styles.featureDescription}>
                  چاودێری باڵانس و ئاگادارکردنەوە
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableBalanceMonitor}
              onValueChange={(value) => updateFeature('enableBalanceMonitor', value)}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={features.enableBalanceMonitor ? '#10b981' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <BarChart3 size={20} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>شیکاری</Text>
                <Text style={styles.featureDescription}>
                  شیکاری تەواو و راپۆرتی تایبەت
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableAnalytics}
              onValueChange={(value) => updateFeature('enableAnalytics', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={features.enableAnalytics ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Monitor size={20} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>چاودێری ڕاستەوخۆ</Text>
                <Text style={styles.featureDescription}>
                  چاودێری ڕاستەوخۆی سیستەم
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableRealtimeMonitoring}
              onValueChange={(value) => updateFeature('enableRealtimeMonitoring', value)}
              trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
              thumbColor={features.enableRealtimeMonitoring ? '#8b5cf6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <PieChart size={20} color="#f59e0b" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>ئاماری بەکارهێنان</Text>
                <Text style={styles.featureDescription}>
                  ئاماری بەکارهێنانی سیستەم
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableUsageStatistics}
              onValueChange={(value) => updateFeature('enableUsageStatistics', value)}
              trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
              thumbColor={features.enableUsageStatistics ? '#f59e0b' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>تۆمارکردن و پاراستن</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Activity size={20} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>تۆماری چالاکی</Text>
                <Text style={styles.featureDescription}>
                  تۆمارکردنی هەموو چالاکیەکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableActivityLog}
              onValueChange={(value) => updateFeature('enableActivityLog', value)}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={features.enableActivityLog ? '#10b981' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Lock size={20} color="#ef4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>تایبەتمەندیە ئەمنیەکان</Text>
                <Text style={styles.featureDescription}>
                  تایبەتمەندیە پێشکەوتووە ئەمنیەکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableSecurityFeatures}
              onValueChange={(value) => updateFeature('enableSecurityFeatures', value)}
              trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
              thumbColor={features.enableSecurityFeatures ? '#ef4444' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <AlertTriangle size={20} color="#f59e0b" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>تۆماری هەڵەکان</Text>
                <Text style={styles.featureDescription}>
                  تۆمارکردن و چاودێری هەڵەکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableErrorLogging}
              onValueChange={(value) => updateFeature('enableErrorLogging', value)}
              trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
              thumbColor={features.enableErrorLogging ? '#f59e0b' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={24} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>تایبەتکردن</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Languages size={20} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>چەند زمانێک</Text>
                <Text style={styles.featureDescription}>
                  پشتگیری چەند زمانێک
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableMultiLanguage}
              onValueChange={(value) => updateFeature('enableMultiLanguage', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={features.enableMultiLanguage ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Palette size={20} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>ڕووکاری تایبەت</Text>
                <Text style={styles.featureDescription}>
                  تایبەتکردنی ڕووکار و ڕەنگەکان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableCustomThemes}
              onValueChange={(value) => updateFeature('enableCustomThemes', value)}
              trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
              thumbColor={features.enableCustomThemes ? '#8b5cf6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Sliders size={20} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>ڕێکخستنی بەکارهێنان</Text>
                <Text style={styles.featureDescription}>
                  ڕێکخستنی ئاسانکاری بەکارهێنان
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableUsabilitySettings}
              onValueChange={(value) => updateFeature('enableUsabilitySettings', value)}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={features.enableUsabilitySettings ? '#10b981' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <StickyNote size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>یارمەتی و ڕێنمایی</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <StickyNote size={20} color="#f59e0b" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>تێبینیەکان</Text>
                <Text style={styles.featureDescription}>
                  زیادکردنی تێبینی بۆ کڕیاران
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableNotes}
              onValueChange={(value) => updateFeature('enableNotes', value)}
              trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
              thumbColor={features.enableNotes ? '#f59e0b' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Share2 size={20} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>هاوبەشکردن</Text>
                <Text style={styles.featureDescription}>
                  هاوبەشکردنی راپۆرت و زانیاری
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableSharing}
              onValueChange={(value) => updateFeature('enableSharing', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={features.enableSharing ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <HelpCircle size={20} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>ڕێنمایی</Text>
                <Text style={styles.featureDescription}>
                  ڕێنمایی و یارمەتی بەکارهێنەران
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableGuidance}
              onValueChange={(value) => updateFeature('enableGuidance', value)}
              trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
              thumbColor={features.enableGuidance ? '#8b5cf6' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <RefreshCw size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>سیستەم</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <RefreshCw size={20} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>نوێکردنەوەی سیستەم</Text>
                <Text style={styles.featureDescription}>
                  نوێکردنەوەی خۆکار و دەستی
                </Text>
              </View>
            </View>
            <Switch
              value={features.enableSystemUpdates}
              onValueChange={(value) => updateFeature('enableSystemUpdates', value)}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={features.enableSystemUpdates ? '#10b981' : '#f3f4f6'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureInfo}>
              <View style={styles.featureIcon}>
                <Gauge size={20} color="#ef4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>چاودێری کارایی</Text>
                <Text style={styles.featureDescription}>
                  چاودێری کارایی و خێرایی سیستەم
                </Text>
              </View>
            </View>
            <Switch
              value={features.enablePerformanceMonitoring}
              onValueChange={(value) => updateFeature('enablePerformanceMonitoring', value)}
              trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
              thumbColor={features.enablePerformanceMonitoring ? '#ef4444' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <CheckCircle size={24} color="#10b981" />
            <Text style={styles.summaryTitle}>پوختەی تایبەتمەندیەکان</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>کارمەندان:</Text>
              <Text style={styles.summaryValue}>
                {features.maxStaff === -1 ? 'نامحدود' : features.maxStaff}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>کڕیاران:</Text>
              <Text style={styles.summaryValue}>
                {features.maxCustomers === -1 ? 'نامحدود' : features.maxCustomers}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>قەرزەکان:</Text>
              <Text style={styles.summaryValue}>
                {features.maxDebts === -1 ? 'نامحدود' : features.maxDebts}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>تایبەتمەندیە چالاکەکان:</Text>
              <Text style={styles.summaryValue}>
                {Object.values(features).filter(v => v === true).length}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Save size={24} color="#fff" />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'پاشەکەوتکردن...' : 'پاشەکەوتکردنی گۆڕانکاریەکان'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    marginRight: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerInfo: {
    marginBottom: 16,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  headerPhone: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  headerDescription: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  limitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  limitHint: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  limitInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontWeight: '600',
  },
  unlimitedNote: {
    fontSize: 13,
    color: '#10b981',
    marginTop: 8,
    fontWeight: '600',
  },
  featureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
