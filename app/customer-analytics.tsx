import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  UserX, 
  UserPlus, 
  TrendingUp, 
  Award, 
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

const CustomerAnalyticsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'inactive' | 'new' | 'highDebt' | 'bestPaying' | 'yearly'>('overview');

  // Queries
  const statsQuery = trpc.customers.analytics.getStats.useQuery();
  const inactiveQuery = trpc.customers.analytics.getInactive.useQuery();
  const newCustomersQuery = trpc.customers.analytics.getNewThisMonth.useQuery();
  const highDebtQuery = trpc.customers.analytics.getHighDebtThisMonth.useQuery({ minDebt: 100000 });
  const bestPayingQuery = trpc.customers.analytics.getBestPayingThisMonth.useQuery();
  const yearlyQuery = trpc.customers.analytics.getHighestDebtYearly.useQuery({ year: 2024 });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        statsQuery.refetch(),
        inactiveQuery.refetch(),
        newCustomersQuery.refetch(),
        highDebtQuery.refetch(),
        bestPayingQuery.refetch(),
        yearlyQuery.refetch(),
      ]);
    } catch {
      if (Platform.OS !== 'web') {
        Alert.alert('هەڵە', 'نەتوانرا داتاکان نوێ بکرێنەوە');
      }
    }
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('en-US').format(amount) + ' د.ع';
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.statsGrid}>
        <GradientCard
          colors={['#667eea', '#764ba2']}
          style={styles.statCard}
        >
          <Users size={24} color="white" />
          <KurdishText style={styles.statNumber}>
            {statsQuery.data?.totalCustomers || 0}
          </KurdishText>
          <KurdishText style={styles.statLabel}>کۆی کڕیاران</KurdishText>
        </GradientCard>

        <GradientCard
          colors={['#f093fb', '#f5576c']}
          style={styles.statCard}
        >
          <UserX size={24} color="white" />
          <KurdishText style={styles.statNumber}>
            {statsQuery.data?.inactiveCustomers || 0}
          </KurdishText>
          <KurdishText style={styles.statLabel}>کڕیارانی بێکار</KurdishText>
        </GradientCard>

        <GradientCard
          colors={['#4facfe', '#00f2fe']}
          style={styles.statCard}
        >
          <UserPlus size={24} color="white" />
          <KurdishText style={styles.statNumber}>
            {statsQuery.data?.newThisMonth || 0}
          </KurdishText>
          <KurdishText style={styles.statLabel}>نوێی ئەم مانگە</KurdishText>
        </GradientCard>

        <GradientCard
          colors={['#43e97b', '#38f9d7']}
          style={styles.statCard}
        >
          <DollarSign size={24} color="white" />
          <KurdishText style={styles.statNumber}>
            {formatCurrency(statsQuery.data?.averageDebtPerCustomer || 0)}
          </KurdishText>
          <KurdishText style={styles.statLabel}>ناوەندی قەرز</KurdishText>
        </GradientCard>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ff6b6b' }]}
          onPress={() => setSelectedTab('inactive')}
        >
          <UserX size={20} color="white" />
          <KurdishText style={styles.actionText}>کڕیارانی بێکار</KurdishText>
          <KurdishText style={styles.actionCount}>
            ({inactiveQuery.data?.count || 0})
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4ecdc4' }]}
          onPress={() => setSelectedTab('new')}
        >
          <UserPlus size={20} color="white" />
          <KurdishText style={styles.actionText}>نوێی ئەم مانگە</KurdishText>
          <KurdishText style={styles.actionCount}>
            ({newCustomersQuery.data?.count || 0})
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ffa726' }]}
          onPress={() => setSelectedTab('highDebt')}
        >
          <TrendingUp size={20} color="white" />
          <KurdishText style={styles.actionText}>زۆر قەرزدار</KurdishText>
          <KurdishText style={styles.actionCount}>
            ({highDebtQuery.data?.count || 0})
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#66bb6a' }]}
          onPress={() => setSelectedTab('bestPaying')}
        >
          <Award size={20} color="white" />
          <KurdishText style={styles.actionText}>باشترین پارەدان</KurdishText>
          <KurdishText style={styles.actionCount}>
            ({bestPayingQuery.data?.count || 0})
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
          onPress={() => setSelectedTab('yearly')}
        >
          <Calendar size={20} color="white" />
          <KurdishText style={styles.actionText}>زۆرترین قەرز ساڵانە</KurdishText>
          <KurdishText style={styles.actionCount}>
            ({yearlyQuery.data?.count || 0})
          </KurdishText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomerList = (customers: any[], title: string, showDebt = true, showPaid = false, showCreatedDate = false) => (
    <View style={styles.listContainer}>
      <KurdishText style={styles.listTitle}>{title}</KurdishText>
      <KurdishText style={styles.listSubtitle}>
        کۆی کڕیاران: {customers.length}
      </KurdishText>
      {customers.length === 0 ? (
        <View style={styles.emptyState}>
          <KurdishText style={styles.emptyText}>هیچ کڕیارێک نەدۆزرایەوە</KurdishText>
        </View>
      ) : (
        customers.map((customer, index) => (
          <View key={customer.id} style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <KurdishText style={styles.customerName}>{customer.name}</KurdishText>
              <KurdishText style={styles.customerPhone}>{customer.phone}</KurdishText>
              <KurdishText style={styles.customerGroup}>گروپ: {customer.group}</KurdishText>
              {showCreatedDate && (
                <KurdishText style={styles.customerDate}>
                  بەرواری دروستکردن: {new Date(customer.createdAt).toLocaleDateString('ku')}
                </KurdishText>
              )}
              {customer.lastPaymentDate && (
                <KurdishText style={styles.customerDate}>
                  دوایین پارەدان: {new Date(customer.lastPaymentDate).toLocaleDateString('ku')}
                </KurdishText>
              )}
            </View>
            <View style={styles.customerStats}>
              {showDebt && (
                <KurdishText style={styles.debtAmount}>
                  قەرز: {formatCurrency(customer.totalDebt - customer.totalPaid)}
                </KurdishText>
              )}
              {showPaid && (
                <KurdishText style={styles.paidAmount}>
                  پارەدان: {formatCurrency(customer.totalPaid)}
                </KurdishText>
              )}
              <View style={styles.ratingContainer}>
                <KurdishText style={styles.ratingText}>پلەبەندی: {customer.rating}/5</KurdishText>
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: customer.status === 'active' ? '#4caf50' : '#f44336' 
              }]}>
                <KurdishText style={styles.statusText}>
                  {customer.status === 'active' ? 'چالاک' : 'بێکار'}
                </KurdishText>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'inactive':
        return (
          <View>
            {renderCustomerList(
              inactiveQuery.data?.customers || [], 
              'کڕیارانی بێکار (Inactive)',
              true,
              false,
              false
            )}
            <View style={styles.summaryCard}>
              <KurdishText style={styles.summaryTitle}>کورتەی گشتی</KurdishText>
              <KurdishText style={styles.summaryText}>
                کۆی قەرز: {formatCurrency(inactiveQuery.data?.totalDebt || 0)}
              </KurdishText>
              <KurdishText style={styles.summaryDescription}>
                ئەم کڕیارانە بەرەوپێش پارەدان یان قەرزیان نیە لە ماوەی ٣ مانگی ڕابردوودا
              </KurdishText>
            </View>
          </View>
        );
      case 'new':
        return (
          <View>
            {renderCustomerList(
              newCustomersQuery.data?.customers || [], 
              'کڕیارانی نوێی ئەم مانگە',
              true,
              false,
              true
            )}
            <View style={styles.summaryCard}>
              <KurdishText style={styles.summaryTitle}>کورتەی گشتی</KurdishText>
              <KurdishText style={styles.summaryText}>
                کۆی قەرز: {formatCurrency(newCustomersQuery.data?.totalDebt || 0)}
              </KurdishText>
              <KurdishText style={styles.summaryDescription}>
                کڕیارانی نوێ کە لە مانگی ئێستادا زیادکراون
              </KurdishText>
            </View>
          </View>
        );
      case 'highDebt':
        return (
          <View>
            {renderCustomerList(
              highDebtQuery.data?.customers || [], 
              'کڕیارانی زۆر قەرزدار لە ئەم مانگە'
            )}
            <View style={styles.summaryCard}>
              <KurdishText style={styles.summaryTitle}>کورتەی گشتی</KurdishText>
              <KurdishText style={styles.summaryText}>
                کۆی قەرز: {formatCurrency(highDebtQuery.data?.totalDebt || 0)}
              </KurdishText>
              <KurdishText style={styles.summaryDescription}>
                کڕیارانی زۆر قەرزدار کە قەرزیان لە ١٠٠,٠٠٠ د.ع زیاترە لە مانگی ئێستادا
              </KurdishText>
            </View>
          </View>
        );
      case 'bestPaying':
        return (
          <View>
            {renderCustomerList(
              bestPayingQuery.data?.customers || [], 
              'کڕیارانی باشترین پارەدان لە ئەم مانگە',
              false,
              true
            )}
            <View style={styles.summaryCard}>
              <KurdishText style={styles.summaryTitle}>کورتەی گشتی</KurdishText>
              <KurdishText style={styles.summaryText}>
                کۆی پارەدان: {formatCurrency(bestPayingQuery.data?.totalPaid || 0)}
              </KurdishText>
              <KurdishText style={styles.summaryDescription}>
                کڕیارانی باشترین پارەدان لە مانگی ئێستادا
              </KurdishText>
            </View>
          </View>
        );
      case 'yearly':
        return (
          <View>
            {renderCustomerList(
              yearlyQuery.data?.customers || [], 
              'کڕیارانی زۆرترین قەرز بە ساڵانە'
            )}
            <View style={styles.summaryCard}>
              <KurdishText style={styles.summaryTitle}>کورتەی گشتی - ساڵی ٢٠٢٤</KurdishText>
              <KurdishText style={styles.summaryText}>
                کۆی قەرز: {formatCurrency(yearlyQuery.data?.totalDebt || 0)}
              </KurdishText>
              <KurdishText style={styles.summaryDescription}>
                کڕیارانی زۆر قەرزدار بە ڕیزبەندی ساڵانە
              </KurdishText>
            </View>
          </View>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'شیکاری کڕیاران',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'گشتی', icon: BarChart3 },
            { key: 'inactive', label: 'بێکار', icon: UserX },
            { key: 'new', label: 'نوێ', icon: UserPlus },
            { key: 'highDebt', label: 'زۆر قەرز', icon: TrendingUp },
            { key: 'bestPaying', label: 'باشترین', icon: Award },
            { key: 'yearly', label: 'ساڵانە', icon: Calendar },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  selectedTab === tab.key && styles.activeTab
                ]}
                onPress={() => setSelectedTab(tab.key as any)}
              >
                <IconComponent 
                  size={16} 
                  color={selectedTab === tab.key ? 'white' : '#6366f1'} 
                />
                <KurdishText style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}>
                  {tab.label}
                </KurdishText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actionCount: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  customerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  customerGroup: {
    fontSize: 12,
    color: '#6366f1',
  },
  customerStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  debtAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  customerDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  ratingContainer: {
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default CustomerAnalyticsScreen;