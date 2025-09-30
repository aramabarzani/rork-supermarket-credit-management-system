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
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Plus, Users, DollarSign, AlertCircle, CheckCircle, XCircle, LogOut } from 'lucide-react-native';
import type { TenantSubscription, SubscriptionPlan } from '@/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import { useAuth } from '@/hooks/auth-context';

export default function OwnerDashboardScreen() {
  const { user, logout } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    phone: '',
    password: '',
    plan: 'basic' as SubscriptionPlan,
    duration: 30,
  });

  const { data, isLoading, refetch } = trpc.subscription.owner.getAll.useQuery();
  const createAdminMutation = trpc.subscription.owner.createAdmin.useMutation();
  const suspendMutation = trpc.subscription.owner.suspend.useMutation();
  const activateMutation = trpc.subscription.owner.activate.useMutation();
  const deleteMutation = trpc.subscription.owner.delete.useMutation();

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
      await createAdminMutation.mutateAsync(newAdmin);
      Alert.alert('سەرکەوتوو', 'بەڕێوەبەر بە سەرکەوتوویی دروستکرا');
      setShowCreateModal(false);
      setNewAdmin({
        name: '',
        phone: '',
        password: '',
        plan: 'basic',
        duration: 30,
      });
      refetch();
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
              await suspendMutation.mutateAsync({
                tenantId,
                reason: 'ڕاگیراوە لەلایەن خاوەندارەوە',
              });
              Alert.alert('سەرکەوتوو', 'بەڕێوەبەر ڕاگیرا');
              refetch();
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
      await activateMutation.mutateAsync({ tenantId });
      Alert.alert('سەرکەوتوو', 'بەڕێوەبەر چالاککرایەوە');
      refetch();
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
              await deleteMutation.mutateAsync({ tenantId });
              Alert.alert('سەرکەوتوو', 'بەڕێوەبەر سڕایەوە');
              refetch();
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
        </View>
      </View>
    );
  }

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
            <Text style={styles.descriptionNote}>
              تێبینی: وەک خاوەندار، تەنها دەسەڵاتی بەڕێوەبردنی بەڕێوەبەران و ئابوونەکانیانت هەیە.
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{data?.getAllTenants.length || 0}</Text>
            <Text style={styles.statLabel}>کۆی بەڕێوەبەران</Text>
          </View>

          <View style={styles.statCard}>
            <CheckCircle size={32} color="#10b981" />
            <Text style={styles.statValue}>{data?.getActiveTenants.length || 0}</Text>
            <Text style={styles.statLabel}>چالاک</Text>
          </View>

          <View style={styles.statCard}>
            <XCircle size={32} color="#ef4444" />
            <Text style={styles.statValue}>{data?.getExpiredTenants.length || 0}</Text>
            <Text style={styles.statLabel}>بەسەرچووە</Text>
          </View>

          <View style={styles.statCard}>
            <DollarSign size={32} color="#10b981" />
            <Text style={styles.statValue}>{(data?.getTotalRevenue || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>کۆی داهات</Text>
          </View>
        </View>

        <View style={styles.tenantsContainer}>
          <Text style={styles.sectionTitle}>بەڕێوەبەران</Text>
          {data?.getAllTenants.map((tenant: TenantSubscription) => {
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
                disabled={createAdminMutation.isPending}
              >
                <Text style={styles.modalButtonText}>
                  {createAdminMutation.isPending ? 'چاوەڕوان بە...' : 'دروستکردن'}
                </Text>
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
    fontSize: 16,
    color: '#6b7280',
  },
  headerButton: {
    marginHorizontal: 16,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  welcomeDescription: {
    gap: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  descriptionNote: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
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
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tenantsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tenantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tenantPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tenantDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
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
    minWidth: 80,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
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
    fontWeight: '600',
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
});
