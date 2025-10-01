import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Store, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import { useTenant } from '@/hooks/tenant-context';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';

export default function AdminStoresScreen() {
  const { tenants, isLoading, suspendTenant, activateTenant, renewSubscription } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'trial' | 'expired' | 'suspended'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredTenants = useMemo(() => {
    let filtered = tenants;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.storeName.toLowerCase().includes(query) ||
        t.storeNameKurdish.toLowerCase().includes(query) ||
        t.ownerName.toLowerCase().includes(query) ||
        t.ownerPhone.includes(query) ||
        t.city.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [tenants, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      trial: tenants.filter(t => t.status === 'trial').length,
      expired: tenants.filter(t => t.status === 'expired').length,
      suspended: tenants.filter(t => t.status === 'suspended').length,
    };
  }, [tenants]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'trial': return '#3b82f6';
      case 'expired': return '#ef4444';
      case 'suspended': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'trial': return Clock;
      case 'expired': return XCircle;
      case 'suspended': return AlertCircle;
      default: return Store;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'چالاک';
      case 'trial': return 'تاقیکردنەوە';
      case 'expired': return 'بەسەرچووە';
      case 'suspended': return 'ڕاگیراوە';
      default: return status;
    }
  };

  const handleSuspend = (id: string, storeName: string) => {
    Alert.alert(
      'ڕاگرتنی فرۆشگا',
      `دڵنیایت لە ڕاگرتنی ${storeName}؟`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'ڕاگرتن',
          style: 'destructive',
          onPress: async () => {
            try {
              await suspendTenant(id, 'پارەدان نەکراوە');
              Alert.alert('سەرکەوتوو', 'فرۆشگاکە ڕاگیرا');
            } catch {
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
            }
          },
        },
      ]
    );
  };

  const handleActivate = async (id: string) => {
    try {
      await activateTenant(id);
      Alert.alert('سەرکەوتوو', 'فرۆشگاکە چالاککرا');
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
    }
  };

  const handleRenew = (id: string, storeName: string) => {
    Alert.alert(
      'نوێکردنەوەی بەشداریکردن',
      `نوێکردنەوەی بەشداریکردن بۆ ${storeName}`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: '١ مانگ',
          onPress: async () => {
            try {
              await renewSubscription(id, 30);
              Alert.alert('سەرکەوتوو', 'بەشداریکردن نوێکرایەوە بۆ ١ مانگ');
            } catch {
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
            }
          },
        },
        {
          text: '٣ مانگ',
          onPress: async () => {
            try {
              await renewSubscription(id, 90);
              Alert.alert('سەرکەوتوو', 'بەشداریکردن نوێکرایەوە بۆ ٣ مانگ');
            } catch {
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
            }
          },
        },
        {
          text: '١ ساڵ',
          onPress: async () => {
            try {
              await renewSubscription(id, 365);
              Alert.alert('سەرکەوتوو', 'بەشداریکردن نوێکرایەوە بۆ ١ ساڵ');
            } catch {
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
            }
          },
        },
      ]
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Store size={24} color="#3b82f6" />
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>کۆی گشتی</Text>
      </View>
      <View style={styles.statCard}>
        <CheckCircle size={24} color="#10b981" />
        <Text style={styles.statValue}>{stats.active}</Text>
        <Text style={styles.statLabel}>چالاک</Text>
      </View>
      <View style={styles.statCard}>
        <Clock size={24} color="#3b82f6" />
        <Text style={styles.statValue}>{stats.trial}</Text>
        <Text style={styles.statLabel}>تاقیکردنەوە</Text>
      </View>
      <View style={styles.statCard}>
        <XCircle size={24} color="#ef4444" />
        <Text style={styles.statValue}>{stats.expired}</Text>
        <Text style={styles.statLabel}>بەسەرچووە</Text>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContainer}
    >
      {[
        { key: 'all', label: 'هەموو', count: stats.total },
        { key: 'active', label: 'چالاک', count: stats.active },
        { key: 'trial', label: 'تاقیکردنەوە', count: stats.trial },
        { key: 'expired', label: 'بەسەرچووە', count: stats.expired },
        { key: 'suspended', label: 'ڕاگیراوە', count: stats.suspended },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            filterStatus === filter.key && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus(filter.key as any)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterStatus === filter.key && styles.filterButtonTextActive,
            ]}
          >
            {filter.label} ({filter.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTenantCard = (tenant: typeof tenants[0]) => {
    const StatusIcon = getStatusIcon(tenant.status);
    const plan = SUBSCRIPTION_PLANS[tenant.plan];
    const daysUntilExpiry = Math.ceil(
      (new Date(tenant.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
      <View key={tenant.id} style={styles.tenantCard}>
        <View style={styles.tenantHeader}>
          <View style={styles.tenantInfo}>
            <View style={styles.tenantNameRow}>
              <Store size={20} color="#1f2937" />
              <Text style={styles.tenantName}>{tenant.storeNameKurdish}</Text>
            </View>
            <Text style={styles.tenantNameEn}>{tenant.storeName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tenant.status) + '20' }]}>
            <StatusIcon size={16} color={getStatusColor(tenant.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(tenant.status) }]}>
              {getStatusText(tenant.status)}
            </Text>
          </View>
        </View>

        <View style={styles.tenantDetails}>
          <View style={styles.detailRow}>
            <Users size={16} color="#6b7280" />
            <Text style={styles.detailText}>{tenant.ownerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Phone size={16} color="#6b7280" />
            <Text style={styles.detailText}>{tenant.ownerPhone}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.detailText}>{tenant.city}</Text>
          </View>
          <View style={styles.detailRow}>
            <CreditCard size={16} color="#6b7280" />
            <Text style={styles.detailText}>{plan.nameKurdish}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {daysUntilExpiry > 0 
                ? `${daysUntilExpiry} ڕۆژ ماوە` 
                : `${Math.abs(daysUntilExpiry)} ڕۆژ بەسەرچووە`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <TrendingUp size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {tenant.customerCount} کڕیار، {tenant.debtCount} قەرز
            </Text>
          </View>
        </View>

        <View style={styles.tenantActions}>
          {tenant.status === 'suspended' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.activateButton]}
              onPress={() => handleActivate(tenant.id)}
            >
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.actionButtonText}>چالاککردن</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.suspendButton]}
              onPress={() => handleSuspend(tenant.id, tenant.storeNameKurdish)}
            >
              <AlertCircle size={18} color="#fff" />
              <Text style={styles.actionButtonText}>ڕاگرتن</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.renewButton]}
            onPress={() => handleRenew(tenant.id, tenant.storeNameKurdish)}
          >
            <Calendar size={18} color="#fff" />
            <Text style={styles.actionButtonText}>نوێکردنەوە</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی فرۆشگاکان',
          headerBackTitle: 'گەڕانەوە',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCard()}

        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو، ژمارە، شار..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        {renderFilterButtons()}

        <View style={styles.tenantsContainer}>
          {isLoading ? (
            <Text style={styles.emptyText}>چاوەڕوان بە...</Text>
          ) : filteredTenants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Store size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>هیچ فرۆشگایەک نەدۆزرایەوە</Text>
            </View>
          ) : (
            filteredTenants.map(renderTenantCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1f2937',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  tenantsContainer: {
    gap: 16,
  },
  tenantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  tenantNameEn: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 28,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tenantDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
  },
  tenantActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  suspendButton: {
    backgroundColor: '#f59e0b',
  },
  activateButton: {
    backgroundColor: '#10b981',
  },
  renewButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
  },
});
