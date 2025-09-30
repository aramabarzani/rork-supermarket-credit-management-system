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
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types/subscription';

export default function SubscriptionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewPlan, setRenewPlan] = useState<SubscriptionPlan>('basic');
  const [renewDuration, setRenewDuration] = useState(30);

  const { data, isLoading, refetch } = trpc.subscription.owner.getDetails.useQuery({ tenantId: id || '' });
  const renewMutation = trpc.subscription.owner.renew.useMutation();

  const handleRenew = async () => {
    try {
      await renewMutation.mutateAsync({
        tenantId: id || '',
        plan: renewPlan,
        duration: renewDuration,
      });
      Alert.alert('سەرکەوتوو', 'ئابوونە بە سەرکەوتوویی نوێکرایەوە');
      setShowRenewModal(false);
      refetch();
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
    }
  };

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'وردەکاری ئابوونە' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      </View>
    );
  }

  const { tenant, daysUntilExpiry, isExpiringSoon, isExpired } = data;

  const getStatusColor = () => {
    if (isExpired) return '#ef4444';
    if (isExpiringSoon) return '#f59e0b';
    return '#10b981';
  };

  const getStatusIcon = () => {
    if (isExpired) return XCircle;
    if (isExpiringSoon) return AlertCircle;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'وردەکاری ئابوونە',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowRenewModal(true)} style={styles.headerButton}>
              <RefreshCw size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <Text style={styles.tenantName}>{tenant.adminName}</Text>
            <Text style={styles.tenantPhone}>{tenant.adminPhone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <StatusIcon size={20} color="#fff" />
            <Text style={styles.statusText}>
              {isExpired ? 'بەسەرچووە' : isExpiringSoon ? 'نزیکە بەسەربچێت' : 'چالاک'}
            </Text>
          </View>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.sectionTitle}>پلانی ئابوونە</Text>
          <View style={styles.planInfo}>
            <View style={styles.planDetail}>
              <Text style={styles.planLabel}>پلان:</Text>
              <Text style={styles.planValue}>{SUBSCRIPTION_PLANS[tenant.plan].nameKurdish}</Text>
            </View>
            <View style={styles.planDetail}>
              <Text style={styles.planLabel}>نرخ:</Text>
              <Text style={styles.planValue}>
                {SUBSCRIPTION_PLANS[tenant.plan].price.toLocaleString()} دینار
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.datesCard}>
          <Text style={styles.sectionTitle}>بەرواری ئابوونە</Text>
          <View style={styles.dateRow}>
            <Calendar size={20} color="#6b7280" />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>دەستپێکردن:</Text>
              <Text style={styles.dateValue}>
                {new Date(tenant.startDate).toLocaleDateString('ar-IQ')}
              </Text>
            </View>
          </View>
          <View style={styles.dateRow}>
            <Clock size={20} color="#6b7280" />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>بەسەرچوون:</Text>
              <Text style={[styles.dateValue, isExpiringSoon && styles.expiringText]}>
                {new Date(tenant.expiryDate).toLocaleDateString('ar-IQ')}
              </Text>
            </View>
          </View>
          <View style={styles.daysRemaining}>
            <Text style={[styles.daysText, isExpired && styles.expiredText]}>
              {isExpired 
                ? `بەسەرچووە لە ${Math.abs(daysUntilExpiry)} ڕۆژ پێش ئێستا`
                : `${daysUntilExpiry} ڕۆژ ماوە`
              }
            </Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>ئامار</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Users size={32} color="#3b82f6" />
              <Text style={styles.statValue}>{tenant.staffCount}</Text>
              <Text style={styles.statLabel}>کارمەندان</Text>
            </View>
            <View style={styles.statItem}>
              <ShoppingCart size={32} color="#10b981" />
              <Text style={styles.statValue}>{tenant.customerCount}</Text>
              <Text style={styles.statLabel}>کڕیاران</Text>
            </View>
          </View>
        </View>

        {tenant.lastRenewedAt && (
          <View style={styles.renewCard}>
            <Text style={styles.sectionTitle}>دوایین نوێکردنەوە</Text>
            <Text style={styles.renewDate}>
              {new Date(tenant.lastRenewedAt).toLocaleDateString('ar-IQ')}
            </Text>
          </View>
        )}

        {tenant.suspensionReason && (
          <View style={styles.suspensionCard}>
            <AlertCircle size={24} color="#f59e0b" />
            <View style={styles.suspensionInfo}>
              <Text style={styles.suspensionTitle}>هۆکاری ڕاگرتن:</Text>
              <Text style={styles.suspensionReason}>{tenant.suspensionReason}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={showRenewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>نوێکردنەوەی ئابوونە</Text>

            <Text style={styles.inputLabel}>پلان:</Text>
            <View style={styles.planButtons}>
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planButton,
                    renewPlan === plan.id && styles.planButtonActive,
                  ]}
                  onPress={() => {
                    setRenewPlan(plan.id);
                    setRenewDuration(plan.duration);
                  }}
                >
                  <Text style={[
                    styles.planButtonText,
                    renewPlan === plan.id && styles.planButtonTextActive,
                  ]}>
                    {plan.nameKurdish}
                  </Text>
                  <Text style={[
                    styles.planButtonPrice,
                    renewPlan === plan.id && styles.planButtonPriceActive,
                  ]}>
                    {plan.price.toLocaleString()} د.ع
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>ماوە (ڕۆژ):</Text>
            <TextInput
              style={styles.input}
              value={renewDuration.toString()}
              onChangeText={(text) => setRenewDuration(parseInt(text) || 0)}
              keyboardType="number-pad"
            />

            <View style={styles.renewSummary}>
              <Text style={styles.summaryText}>
                کۆی نرخ: {(SUBSCRIPTION_PLANS[renewPlan].price).toLocaleString()} دینار
              </Text>
              <Text style={styles.summaryText}>
                ماوە: {renewDuration} ڕۆژ
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRenewModal(false)}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.renewButton]}
                onPress={handleRenew}
                disabled={renewMutation.isPending}
              >
                <Text style={styles.modalButtonText}>
                  {renewMutation.isPending ? 'چاوەڕوان بە...' : 'نوێکردنەوە'}
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
  headerInfo: {
    marginBottom: 12,
  },
  tenantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  tenantPhone: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  planInfo: {
    gap: 12,
  },
  planDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  planValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  datesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dateInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  expiringText: {
    color: '#f59e0b',
  },
  daysRemaining: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  daysText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  expiredText: {
    color: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
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
  renewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  renewDate: {
    fontSize: 16,
    color: '#6b7280',
  },
  suspensionCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  suspensionInfo: {
    flex: 1,
  },
  suspensionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  suspensionReason: {
    fontSize: 14,
    color: '#78350f',
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  planButtons: {
    gap: 8,
    marginBottom: 16,
  },
  planButton: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  planButtonTextActive: {
    color: '#3b82f6',
  },
  planButtonPrice: {
    fontSize: 14,
    color: '#9ca3af',
  },
  planButtonPriceActive: {
    color: '#3b82f6',
  },
  renewSummary: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
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
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  renewButton: {
    backgroundColor: '#3b82f6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
