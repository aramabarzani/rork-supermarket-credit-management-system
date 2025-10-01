import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Users, DollarSign, AlertCircle, CheckCircle, XCircle, LogOut, Store, Clock } from 'lucide-react-native';
import type { SubscriptionPlan } from '@/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import { useAuth } from '@/hooks/auth-context';
import { useStoreRequests } from '@/hooks/store-request-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TenantSubscription {
  id: string;
  adminName: string;
  adminPhone: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'suspended';
  startDate: string;
  expiryDate: string;
  staffCount: number;
  customerCount: number;
  lastRenewedAt?: string;
  suspensionReason?: string;
}

export default function OwnerDashboardScreen() {
  const { user, logout } = useAuth();
  const { requests, getStats } = useStoreRequests();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantSubscription[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    phone: '',
    password: '',
    plan: 'basic' as SubscriptionPlan,
    duration: 30,
  });

  React.useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
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

  const saveTenants = async (updatedTenants: TenantSubscription[]) => {
    try {
      await AsyncStorage.setItem('tenants', JSON.stringify(updatedTenants));
      setTenants(updatedTenants);
    } catch (error) {
      console.error('Failed to save tenants:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'دەرچوون',
      'دڵنیایت لە دەرچوون؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'دەرچوون',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.phone || !newAdmin.password) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    try {
      const newTenant: TenantSubscription = {
        id: Date.now().toString(),
        adminName: newAdmin.name,
        adminPhone: newAdmin.phone,
        plan: newAdmin.plan,
        status: 'active',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + newAdmin.duration * 24 * 60 * 60 * 1000).toISOString(),
        staffCount: 0,
        customerCount: 0,
      };
      await saveTenants([...tenants, newTenant]);
      Alert.alert('سەرکەوتوو', 'بەڕێوەبەر بە سەرکەوتوویی دروستکرا');
      setShowCreateModal(false);
      setNewAdmin({
        name: '',
        phone: '',
        password: '',
        plan: 'basic',
        duration: 30,
      });
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
    }
  };

  const handleSuspend = async (tenantId: string) => {
    Alert.alert(
      'دڵنیایی',
      'دڵنیایت لە ڕاگرتنی ئەم بەڕێوەبەرە؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'ڕاگرتن',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = tenants.map(t => 
                t.id === tenantId 
                  ? { ...t, status: 'suspended' as const, suspensionReason: 'ڕاگیراوە لەلایەن خاوەندارەوە' }
                  : t
              );
              await saveTenants(updated);
              Alert.alert('سەرکەوتوو', 'بەڕێوەبەر ڕاگیرا');
            } catch {
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
            }
          },
        },
      ]
    );
  };

  const handleActivate = async (tenantId: string) => {
    try {
      const updated = tenants.map(t => 
        t.id === tenantId 
          ? { ...t, status: 'active' as const, suspensionReason: undefined }
          : t
      );
      await saveTenants(updated);
      Alert.alert('سەرکەوتوو', 'بەڕێوەبەر چالاککرایەوە');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'کێشەیەک ڕوویدا';
      Alert.alert('هەڵە', errorMessage);
    }
  };

  const handleDelete = async (tenantId: string) => {
    Alert.alert(
      'دڵنیایی',
      'دڵنیایت لە سڕینەوەی ئەم بەڕێوەبەرە؟ ئەم کردارە ناگەڕێتەوە',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = tenants.filter(t => t.id !== tenantId);
              await saveTenants(updated);
              Alert.alert('سەرکەوتوو', 'بەڕێوەبەر سڕایەوە');
            } catch {
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'expired':
        return '#ef4444';
      case 'suspended':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'expired':
        return XCircle;
      case 'suspended':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'چالاک';
      case 'expired':
        return 'بەسەرچووە';
      case 'suspended':
        return 'ڕاگیراوە';
      default:
        return status;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'داشبۆردی خاوەندار' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
          <Text style={styles.loadingSubtext}>داتاکان بارکراوە...</Text>
        </View>
      </View>
    );
  }

  const activeTenants = tenants.filter(t => t.status === 'active');
  const expiredTenants = tenants.filter(t => t.status === 'expired');
  const totalRevenue = tenants.reduce((sum, t) => sum + SUBSCRIPTION_PLANS[t.plan].price, 0);
  const requestStats = getStats();

  const displayData = {
    getAllTenants: tenants,
    getActiveTenants: activeTenants,
    getExpiredTenants: expiredTenants,
    getTotalRevenue: totalRevenue,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'داشبۆردی خاوەندار',
          headerLeft: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <LogOut size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.headerButton}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <Users size={48} color="#1E3A8A" />
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>بەخێربێیت، {user?.name}</Text>
              <Text style={styles.welcomeSubtitle}>پانێڵی بەڕێوەبردنی سیستەمی Multi-Tenant</Text>
            </View>
          </View>
          <View style={styles.welcomeDescription}>
            <Text style={styles.descriptionText}>
              لێرەوە دەتوانیت هەژماری بەڕێوەبەران دروست بکەیت، ئابوونەکانیان بەڕێوەببەیت، و چاودێری کارکردنیان بکەیت.
            </Text>
            <View style={styles.ownerFeatures}>
              <Text style={styles.featureTitle}>تایبەتمەندیەکانی خاوەندار:</Text>
              <Text style={styles.featureItem}>✓ دروستکردنی هەژماری بەڕێوەبەران</Text>
              <Text style={styles.featureItem}>✓ بەڕێوەبردنی ئابوونە و مۆڵەتەکان</Text>
              <Text style={styles.featureItem}>✓ چاودێری کارکردن و ئامار</Text>
              <Text style={styles.featureItem}>✓ ڕاگرتن و چالاککردنەوەی هەژمارەکان</Text>
              <Text style={styles.featureItem}>✓ بینینی کۆی داهات</Text>
              <Text style={styles.featureItem}>✓ بینین و بەڕێوەبردنی داواکاریەکانی فرۆشگا</Text>
              <Text style={styles.featureItem}>✓ پەسەندکردن یان ڕەتکردنەوەی داواکاریەکان</Text>
              <Text style={styles.featureItem}>✓ دروستکردنی هەژماری بەڕێوەبەر بە خۆکار دوای پەسەندکردن</Text>
            </View>
            <Text style={styles.descriptionNote}>
              تێبینی: وەک خاوەندار، تەنها دەسەڵاتی بەڕێوەبردنی بەڕێوەبەران و ئابوونەکانیانت هەیە. ناتوانیت دەستکاری قەرز، کارمەندان، یان کڕیاران بکەیت.
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{displayData.getAllTenants.length}</Text>
            <Text style={styles.statLabel}>کۆی بەڕێوەبەران</Text>
          </View>

          <View style={styles.statCard}>
            <CheckCircle size={32} color="#10b981" />
            <Text style={styles.statValue}>{displayData.getActiveTenants.length}</Text>
            <Text style={styles.statLabel}>چالاک</Text>
          </View>

          <View style={styles.statCard}>
            <XCircle size={32} color="#ef4444" />
            <Text style={styles.statValue}>{displayData.getExpiredTenants.length}</Text>
            <Text style={styles.statLabel}>بەسەرچووە</Text>
          </View>

          <View style={styles.statCard}>
            <DollarSign size={32} color="#10b981" />
            <Text style={styles.statValue}>{displayData.getTotalRevenue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>کۆی داهات</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.requestsCard}
          onPress={() => router.push('/store-requests')}
        >
          <View style={styles.requestsHeader}>
            <View style={styles.requestsHeaderLeft}>
              <Store size={28} color="#3b82f6" />
              <View>
                <Text style={styles.requestsTitle}>داواکاریەکانی فرۆشگا</Text>
                <Text style={styles.requestsSubtitle}>بینین و بەڕێوەبردنی داواکاریەکان</Text>
              </View>
            </View>
          </View>

          <View style={styles.requestsStats}>
            <View style={styles.requestStatItem}>
              <View style={styles.requestStatBadge}>
                <Store size={20} color="#3b82f6" />
                <Text style={styles.requestStatValue}>{requestStats.total}</Text>
              </View>
              <Text style={styles.requestStatLabel}>کۆی گشتی</Text>
            </View>

            <View style={styles.requestStatItem}>
              <View style={[styles.requestStatBadge, { backgroundColor: '#fef3c7' }]}>
                <Clock size={20} color="#f59e0b" />
                <Text style={[styles.requestStatValue, { color: '#f59e0b' }]}>{requestStats.pending}</Text>
              </View>
              <Text style={styles.requestStatLabel}>چاوەڕوانە</Text>
            </View>

            <View style={styles.requestStatItem}>
              <View style={[styles.requestStatBadge, { backgroundColor: '#d1fae5' }]}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={[styles.requestStatValue, { color: '#10b981' }]}>{requestStats.approved}</Text>
              </View>
              <Text style={styles.requestStatLabel}>پەسەندکراوە</Text>
            </View>

            <View style={styles.requestStatItem}>
              <View style={[styles.requestStatBadge, { backgroundColor: '#fee2e2' }]}>
                <XCircle size={20} color="#ef4444" />
                <Text style={[styles.requestStatValue, { color: '#ef4444' }]}>{requestStats.rejected}</Text>
              </View>
              <Text style={styles.requestStatLabel}>ڕەتکراوەتەوە</Text>
            </View>
          </View>

          {requestStats.pending > 0 && (
            <View style={styles.pendingAlert}>
              <AlertCircle size={18} color="#f59e0b" />
              <Text style={styles.pendingAlertText}>
                {requestStats.pending} داواکاری چاوەڕوانی پێداچوونەوەن
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.tenantsContainer}>
          <Text style={styles.sectionTitle}>بەڕێوەبەران</Text>
          {displayData.getAllTenants.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={64} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>هیچ بەڕێوەبەرێک نییە</Text>
              <Text style={styles.emptyStateText}>دەستپێبکە بە دروستکردنی یەکەمین بەڕێوەبەر</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>دروستکردنی بەڕێوەبەر</Text>
              </TouchableOpacity>
            </View>
          )}
          {displayData.getAllTenants.map((tenant: TenantSubscription) => {
            const StatusIcon = getStatusIcon(tenant.status);
            const daysUntilExpiry = getDaysUntilExpiry(tenant.expiryDate);
            const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

            return (
              <View key={tenant.id} style={styles.tenantCard}>
                <View style={styles.tenantHeader}>
                  <View style={styles.tenantInfo}>
                    <Text style={styles.tenantName}>{tenant.adminName}</Text>
                    <Text style={styles.tenantPhone}>{tenant.adminPhone}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tenant.status) }]}>
                    <StatusIcon size={16} color="#fff" />
                    <Text style={styles.statusText}>{getStatusText(tenant.status)}</Text>
                  </View>
                </View>

                <View style={styles.tenantDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>پلان:</Text>
                    <Text style={styles.detailValue}>{SUBSCRIPTION_PLANS[tenant.plan].nameKurdish}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>بەسەرچوون:</Text>
                    <Text style={[styles.detailValue, isExpiringSoon && styles.expiringText]}>
                      {new Date(tenant.expiryDate).toLocaleDateString('ar-IQ')}
                      {isExpiringSoon && ` (${daysUntilExpiry} ڕۆژ)`}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>کارمەندان:</Text>
                    <Text style={styles.detailValue}>{tenant.staffCount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>کڕیاران:</Text>
                    <Text style={styles.detailValue}>{tenant.customerCount}</Text>
                  </View>
                </View>

                <View style={styles.tenantActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push({ pathname: '/subscription-details', params: { id: tenant.id } })}
                  >
                    <Text style={styles.actionButtonText}>وردەکاری</Text>
                  </TouchableOpacity>

                  {tenant.status === 'active' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.suspendButton]}
                      onPress={() => handleSuspend(tenant.id)}
                    >
                      <Text style={styles.actionButtonText}>ڕاگرتن</Text>
                    </TouchableOpacity>
                  )}

                  {tenant.status === 'suspended' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.activateButton]}
                      onPress={() => handleActivate(tenant.id)}
                    >
                      <Text style={styles.actionButtonText}>چالاککردنەوە</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(tenant.id)}
                  >
                    <Text style={styles.actionButtonText}>سڕینەوە</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>دروستکردنی بەڕێوەبەری نوێ</Text>

            <TextInput
              style={styles.input}
              placeholder="ناوی بەڕێوەبەر"
              value={newAdmin.name}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="ژمارەی مۆبایل"
              value={newAdmin.phone}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="وشەی نهێنی"
              value={newAdmin.password}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, password: text })}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>پلان:</Text>
            <View style={styles.planButtons}>
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planButton,
                    newAdmin.plan === plan.id && styles.planButtonActive,
                  ]}
                  onPress={() => setNewAdmin({ ...newAdmin, plan: plan.id, duration: plan.duration })}
                >
                  <Text style={[
                    styles.planButtonText,
                    newAdmin.plan === plan.id && styles.planButtonTextActive,
                  ]}>
                    {plan.nameKurdish}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateAdmin}
              >
                <Text style={styles.modalButtonText}>دروستکردن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorDetailsCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    width: '100%',
    maxWidth: 500,
  },
  errorDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 12,
  },
  errorDetailsText: {
    fontSize: 13,
    color: '#7f1d1d',
    marginBottom: 6,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#6b7280',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    marginHorizontal: 16,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  welcomeDescription: {
    gap: 16,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
    fontWeight: '400',
  },
  ownerFeatures: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    gap: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065f46',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  featureItem: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 22,
    fontWeight: '500',
    paddingLeft: 4,
  },
  descriptionNote: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    lineHeight: 22,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '600',
  },
  tenantsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  tenantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  tenantPhone: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  tenantDetails: {
    gap: 12,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  expiringText: {
    color: '#f59e0b',
  },
  tenantActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  suspendButton: {
    backgroundColor: '#f59e0b',
  },
  activateButton: {
    backgroundColor: '#10b981',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  planButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  planButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  planButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  planButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  planButtonTextActive: {
    color: '#3b82f6',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  createButton: {
    backgroundColor: '#3b82f6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorBannerContent: {
    flex: 1,
  },
  errorBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 4,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 12,
    lineHeight: 20,
  },
  errorBannerCommand: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1f2937',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  errorBannerNote: {
    fontSize: 12,
    color: '#991b1b',
    fontStyle: 'italic',
  },
  errorBannerButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorBannerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requestsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  requestsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  requestsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  requestsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  requestsStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  requestStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  requestStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  requestStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3b82f6',
  },
  requestStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pendingAlertText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
});
