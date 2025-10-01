import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Calendar, DollarSign, Users, Package, CheckCircle, XCircle, AlertCircle, Edit2, RefreshCw, Settings, Shield } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/types/subscription';

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

export default function SubscriptionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tenant, setTenant] = useState<TenantSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [renewDuration, setRenewDuration] = useState('30');
  const [editData, setEditData] = useState({
    adminName: '',
    adminPhone: '',
    plan: 'basic' as SubscriptionPlan,
  });

  useEffect(() => {
    loadTenant();
  }, [id]);

  const loadTenant = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('tenants');
      if (stored) {
        const tenants: TenantSubscription[] = JSON.parse(stored);
        const found = tenants.find(t => t.id === id);
        if (found) {
          setTenant(found);
          setEditData({
            adminName: found.adminName,
            adminPhone: found.adminPhone,
            plan: found.plan,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load tenant:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە بارکردنی زانیاریەکان');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTenant = async (updatedTenant: TenantSubscription) => {
    try {
      const stored = await AsyncStorage.getItem('tenants');
      if (stored) {
        const tenants: TenantSubscription[] = JSON.parse(stored);
        const updated = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
        await AsyncStorage.setItem('tenants', JSON.stringify(updated));
        setTenant(updatedTenant);
      }
    } catch (error) {
      console.error('Failed to save tenant:', error);
      throw error;
    }
  };

  const handleRenew = async () => {
    if (!tenant) return;

    const days = parseInt(renewDuration);
    if (isNaN(days) || days <= 0) {
      Alert.alert('هەڵە', 'تکایە ژمارەیەکی دروست بنووسە');
      return;
    }

    try {
      const currentExpiry = new Date(tenant.expiryDate);
      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

      const updated: TenantSubscription = {
        ...tenant,
        expiryDate: newExpiry.toISOString(),
        lastRenewedAt: new Date().toISOString(),
        status: 'active',
      };

      await saveTenant(updated);
      setShowRenewModal(false);
      setRenewDuration('30');
      Alert.alert('سەرکەوتوو', 'ئابوونە نوێکرایەوە');
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
    }
  };

  const handleEdit = async () => {
    if (!tenant) return;

    if (!editData.adminName || !editData.adminPhone) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    try {
      const updated: TenantSubscription = {
        ...tenant,
        adminName: editData.adminName,
        adminPhone: editData.adminPhone,
        plan: editData.plan,
      };

      await saveTenant(updated);
      setShowEditModal(false);
      Alert.alert('سەرکەوتوو', 'زانیاریەکان نوێکرانەوە');
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
    }
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

  const getDaysSinceStart = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'وردەکاری ئابوونە' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'وردەکاری ئابوونە' }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#ef4444" />
          <Text style={styles.errorText}>بەڕێوەبەر نەدۆزرایەوە</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>گەڕانەوە</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const StatusIcon = getStatusIcon(tenant.status);
  const daysUntilExpiry = getDaysUntilExpiry(tenant.expiryDate);
  const daysSinceStart = getDaysSinceStart(tenant.startDate);
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const plan = SUBSCRIPTION_PLANS[tenant.plan];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'وردەکاری ئابوونە',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.headerButton}>
              <Edit2 size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{tenant.adminName}</Text>
              <Text style={styles.headerPhone}>{tenant.adminPhone}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tenant.status) }]}>
              <StatusIcon size={20} color="#fff" />
              <Text style={styles.statusText}>{getStatusText(tenant.status)}</Text>
            </View>
          </View>

          {tenant.status === 'suspended' && tenant.suspensionReason && (
            <View style={styles.suspensionAlert}>
              <AlertCircle size={20} color="#f59e0b" />
              <Text style={styles.suspensionText}>{tenant.suspensionReason}</Text>
            </View>
          )}
        </View>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Package size={32} color="#3b82f6" />
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.nameKurdish}</Text>
              <Text style={styles.planPrice}>{plan.price.toLocaleString()} IQD / {plan.duration} ڕۆژ</Text>
            </View>
          </View>

          <View style={styles.planFeatures}>
            <View style={styles.featureRow}>
              <Users size={20} color="#6b7280" />
              <Text style={styles.featureText}>تا {plan.maxStaff} کارمەند</Text>
            </View>
            <View style={styles.featureRow}>
              <Users size={20} color="#6b7280" />
              <Text style={styles.featureText}>تا {plan.maxCustomers} کڕیار</Text>
            </View>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.datesCard}>
          <Text style={styles.sectionTitle}>زانیاری بەروار</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateLabel}>
              <Calendar size={20} color="#6b7280" />
              <Text style={styles.dateLabelText}>دەستپێکردن:</Text>
            </View>
            <View style={styles.dateValue}>
              <Text style={styles.dateValueText}>
                {new Date(tenant.startDate).toLocaleDateString('ar-IQ')}
              </Text>
              <Text style={styles.dateSubtext}>{daysSinceStart} ڕۆژ لەمەوبەر</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateLabel}>
              <Calendar size={20} color="#6b7280" />
              <Text style={styles.dateLabelText}>بەسەرچوون:</Text>
            </View>
            <View style={styles.dateValue}>
              <Text style={[styles.dateValueText, isExpiringSoon && styles.expiringText]}>
                {new Date(tenant.expiryDate).toLocaleDateString('ar-IQ')}
              </Text>
              <Text style={[styles.dateSubtext, isExpiringSoon && styles.expiringText]}>
                {daysUntilExpiry > 0 ? `${daysUntilExpiry} ڕۆژ ماوە` : 'بەسەرچووە'}
              </Text>
            </View>
          </View>

          {tenant.lastRenewedAt && (
            <View style={styles.dateRow}>
              <View style={styles.dateLabel}>
                <RefreshCw size={20} color="#6b7280" />
                <Text style={styles.dateLabelText}>دوا نوێکردنەوە:</Text>
              </View>
              <View style={styles.dateValue}>
                <Text style={styles.dateValueText}>
                  {new Date(tenant.lastRenewedAt).toLocaleDateString('ar-IQ')}
                </Text>
              </View>
            </View>
          )}

          {isExpiringSoon && (
            <View style={styles.expiryWarning}>
              <AlertCircle size={20} color="#f59e0b" />
              <Text style={styles.expiryWarningText}>
                ئابوونەکە بەم زووانە بەسەردەچێت! تکایە نوێی بکەرەوە.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>ئامار</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Users size={32} color="#3b82f6" />
              <Text style={styles.statValue}>{tenant.staffCount}</Text>
              <Text style={styles.statLabel}>کارمەند</Text>
            </View>

            <View style={styles.statItem}>
              <Users size={32} color="#10b981" />
              <Text style={styles.statValue}>{tenant.customerCount}</Text>
              <Text style={styles.statLabel}>کڕیار</Text>
            </View>

            <View style={styles.statItem}>
              <DollarSign size={32} color="#f59e0b" />
              <Text style={styles.statValue}>{plan.price.toLocaleString()}</Text>
              <Text style={styles.statLabel}>نرخ</Text>
            </View>

            <View style={styles.statItem}>
              <Calendar size={32} color="#8b5cf6" />
              <Text style={styles.statValue}>{plan.duration}</Text>
              <Text style={styles.statLabel}>ڕۆژ</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {tenant.status === 'active' && (
            <TouchableOpacity
              style={styles.renewButton}
              onPress={() => setShowRenewModal(true)}
            >
              <RefreshCw size={24} color="#fff" />
              <Text style={styles.renewButtonText}>نوێکردنەوەی ئابوونە</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.featuresButton}
            onPress={() => router.push({ pathname: '/tenant-features', params: { id: tenant.id } })}
          >
            <Settings size={24} color="#fff" />
            <Text style={styles.featuresButtonText}>بەڕێوەبردنی تایبەتمەندیەکان</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showRenewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>نوێکردنەوەی ئابوونە</Text>

            <Text style={styles.inputLabel}>ماوە (بە ڕۆژ):</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              value={renewDuration}
              onChangeText={setRenewDuration}
              keyboardType="number-pad"
            />

            <View style={styles.quickDurations}>
              {[30, 60, 90, 180, 365].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.quickDurationButton,
                    renewDuration === days.toString() && styles.quickDurationButtonActive,
                  ]}
                  onPress={() => setRenewDuration(days.toString())}
                >
                  <Text style={[
                    styles.quickDurationText,
                    renewDuration === days.toString() && styles.quickDurationTextActive,
                  ]}>
                    {days} ڕۆژ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRenewModal(false)}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRenew}
              >
                <Text style={styles.confirmButtonText}>نوێکردنەوە</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>دەستکاریکردنی زانیاری</Text>

            <Text style={styles.inputLabel}>ناوی بەڕێوەبەر:</Text>
            <TextInput
              style={styles.input}
              placeholder="ناوی بەڕێوەبەر"
              value={editData.adminName}
              onChangeText={(text) => setEditData({ ...editData, adminName: text })}
            />

            <Text style={styles.inputLabel}>ژمارەی مۆبایل:</Text>
            <TextInput
              style={styles.input}
              placeholder="ژمارەی مۆبایل"
              value={editData.adminPhone}
              onChangeText={(text) => setEditData({ ...editData, adminPhone: text })}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>پلان:</Text>
            <View style={styles.planButtons}>
              {Object.values(SUBSCRIPTION_PLANS).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.planButton,
                    editData.plan === p.id && styles.planButtonActive,
                  ]}
                  onPress={() => setEditData({ ...editData, plan: p.id })}
                >
                  <Text style={[
                    styles.planButtonText,
                    editData.plan === p.id && styles.planButtonTextActive,
                  ]}>
                    {p.nameKurdish}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleEdit}
              >
                <Text style={styles.confirmButtonText}>پاشەکەوتکردن</Text>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
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
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  suspensionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  suspensionText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  planFeatures: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  datesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabelText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  dateValue: {
    alignItems: 'flex-end',
  },
  dateValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  dateSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  expiringText: {
    color: '#f59e0b',
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  expiryWarningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  renewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  featuresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  featuresButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  quickDurations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickDurationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  quickDurationButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  quickDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  quickDurationTextActive: {
    color: '#3b82f6',
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
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
