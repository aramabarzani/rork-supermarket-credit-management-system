import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Users, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar,
  DollarSign,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

interface CustomerReport {
  customerId: string;
  customerName: string;
  phone: string;
  totalDebts: number;
  totalPaid: number;
  remainingDebt: number;
  debtCount: number;
  paymentCount: number;
  lastPaymentDate?: string;
  status: 'good' | 'warning' | 'overdue';
  averagePaymentTime: number; // days
}

export default function CustomerReportsScreen() {
  const { debts, payments, getCustomerDebts, getPaymentsByCustomer } = useDebts();
  const { getCustomers } = useUsers();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'debt' | 'payments' | 'status'>('debt');
  const [filterStatus, setFilterStatus] = useState<'all' | 'good' | 'warning' | 'overdue'>('all');

  const customerReports = useMemo((): CustomerReport[] => {
    const customers = getCustomers();
    
    return customers.map(customer => {
      const customerDebts = getCustomerDebts(customer.id);
      const customerPayments = getPaymentsByCustomer(customer.id);
      
      const totalDebts = customerDebts.reduce((sum, debt) => sum + debt.amount, 0);
      const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingDebt = customerDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
      
      // Calculate average payment time
      let averagePaymentTime = 0;
      if (customerPayments.length > 0) {
        const paymentTimes = customerPayments.map(payment => {
          const debt = customerDebts.find(d => d.id === payment.debtId);
          if (debt) {
            const debtDate = new Date(debt.createdAt);
            const paymentDate = new Date(payment.paymentDate);
            return Math.floor((paymentDate.getTime() - debtDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          return 0;
        });
        averagePaymentTime = paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length;
      }
      
      // Determine status
      let status: 'good' | 'warning' | 'overdue' = 'good';
      const hasOverdueDebts = customerDebts.some(debt => 
        debt.dueDate && new Date(debt.dueDate) < new Date() && debt.status !== 'paid'
      );
      
      if (hasOverdueDebts) {
        status = 'overdue';
      } else if (remainingDebt > 500000) { // High debt threshold
        status = 'warning';
      }
      
      const lastPayment = customerPayments
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
      
      return {
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.phone,
        totalDebts,
        totalPaid,
        remainingDebt,
        debtCount: customerDebts.length,
        paymentCount: customerPayments.length,
        lastPaymentDate: lastPayment?.paymentDate,
        status,
        averagePaymentTime,
      };
    });
  }, [debts, payments, getCustomers, getCustomerDebts, getPaymentsByCustomer]);

  const filteredAndSortedReports = useMemo(() => {
    let filtered = customerReports;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.customerName.toLowerCase().includes(query) ||
        report.phone.includes(query)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.customerName.localeCompare(b.customerName);
        case 'debt':
          return b.remainingDebt - a.remainingDebt;
        case 'payments':
          return b.totalPaid - a.totalPaid;
        case 'status':
          const statusOrder = { overdue: 3, warning: 2, good: 1 };
          return statusOrder[b.status] - statusOrder[a.status];
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [customerReports, searchQuery, sortBy, filterStatus]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'overdue': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'overdue': return AlertTriangle;
      default: return Users;
    }
  };

  const handleExportReport = () => {
    console.log('Exporting customer reports...');
  };

  if (!hasPermission(PERMISSIONS.VIEW_CUSTOMERS)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'ڕاپۆرتی کڕیارەکان' }} />
        <View style={styles.noPermissionContainer}>
          <Users size={64} color="#9CA3AF" />
          <KurdishText variant="title" color="#6B7280">
            دەسەڵاتت نییە
          </KurdishText>
          <KurdishText variant="body" color="#9CA3AF">
            تۆ دەسەڵاتی بینینی کڕیارەکانت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'ڕاپۆرتی کڕیارەکان' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <GradientCard style={styles.statCard} colors={['#10B981', '#059669']}>
            <View style={styles.statContent}>
              <CheckCircle size={24} color="#10B981" />
              <KurdishText variant="body" color="#1F2937">
                {customerReports.filter(r => r.status === 'good').length}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                کڕیاری باش
              </KurdishText>
            </View>
          </GradientCard>

          <GradientCard style={styles.statCard} colors={['#F59E0B', '#D97706']}>
            <View style={styles.statContent}>
              <AlertTriangle size={24} color="#F59E0B" />
              <KurdishText variant="body" color="#1F2937">
                {customerReports.filter(r => r.status === 'warning').length}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                ئاگاداری
              </KurdishText>
            </View>
          </GradientCard>

          <GradientCard style={styles.statCard} colors={['#EF4444', '#DC2626']}>
            <View style={styles.statContent}>
              <AlertTriangle size={24} color="#EF4444" />
              <KurdishText variant="body" color="#1F2937">
                {customerReports.filter(r => r.status === 'overdue').length}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                بەسەرچوو
              </KurdishText>
            </View>
          </GradientCard>

          <GradientCard style={styles.statCard} colors={['#3B82F6', '#2563EB']}>
            <View style={styles.statContent}>
              <DollarSign size={24} color="#3B82F6" />
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(customerReports.reduce((sum, r) => sum + r.remainingDebt, 0))}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                کۆی قەرز
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        {/* Controls */}
        <GradientCard style={styles.controlsCard}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="گەڕان لە کڕیارەکان..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign="right"
              />
            </View>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExportReport}
            >
              <Download size={20} color="#1E3A8A" />
            </TouchableOpacity>
          </View>

          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {[
                  { id: 'all', label: 'هەموو', count: customerReports.length },
                  { id: 'good', label: 'باش', count: customerReports.filter(r => r.status === 'good').length },
                  { id: 'warning', label: 'ئاگاداری', count: customerReports.filter(r => r.status === 'warning').length },
                  { id: 'overdue', label: 'بەسەرچوو', count: customerReports.filter(r => r.status === 'overdue').length },
                ].map(filter => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      filterStatus === filter.id && styles.filterChipSelected,
                    ]}
                    onPress={() => setFilterStatus(filter.id as any)}
                  >
                    <KurdishText 
                      variant="caption" 
                      color={filterStatus === filter.id ? 'white' : '#6B7280'}
                    >
                      {filter.label} ({filter.count})
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.sortContainer}>
            <KurdishText variant="caption" color="#6B7280">
              ڕیزکردن بە پێی:
            </KurdishText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sortChips}>
                {[
                  { id: 'debt', label: 'قەرز' },
                  { id: 'payments', label: 'پارەدان' },
                  { id: 'name', label: 'ناو' },
                  { id: 'status', label: 'دۆخ' },
                ].map(sort => (
                  <TouchableOpacity
                    key={sort.id}
                    style={[
                      styles.sortChip,
                      sortBy === sort.id && styles.sortChipSelected,
                    ]}
                    onPress={() => setSortBy(sort.id as any)}
                  >
                    <KurdishText 
                      variant="caption" 
                      color={sortBy === sort.id ? 'white' : '#6B7280'}
                    >
                      {sort.label}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </GradientCard>

        {/* Customer Reports List */}
        <View style={styles.reportsContainer}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              ڕاپۆرتی کڕیارەکان ({filteredAndSortedReports.length})
            </KurdishText>
          </View>

          {filteredAndSortedReports.map((report) => {
            const StatusIcon = getStatusIcon(report.status);
            return (
              <GradientCard key={report.customerId} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.customerInfo}>
                    <View style={styles.customerName}>
                      <KurdishText variant="subtitle" color="#1F2937">
                        {report.customerName}
                      </KurdishText>
                      <View style={styles.statusBadge}>
                        <StatusIcon size={16} color={getStatusColor(report.status)} />
                      </View>
                    </View>
                    <KurdishText variant="caption" color="#6B7280">
                      {report.phone}
                    </KurdishText>
                  </View>
                  <View style={styles.reportAmount}>
                    <KurdishText variant="title" color="#EF4444">
                      {formatCurrency(report.remainingDebt)}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      قەرزی ماوە
                    </KurdishText>
                  </View>
                </View>

                <View style={styles.reportStats}>
                  <View style={styles.statItem}>
                    <TrendingUp size={16} color="#10B981" />
                    <KurdishText variant="caption" color="#6B7280">
                      کۆی قەرز
                    </KurdishText>
                    <KurdishText variant="body" color="#1F2937">
                      {formatCurrency(report.totalDebts)}
                    </KurdishText>
                  </View>

                  <View style={styles.statItem}>
                    <TrendingDown size={16} color="#3B82F6" />
                    <KurdishText variant="caption" color="#6B7280">
                      کۆی پارەدان
                    </KurdishText>
                    <KurdishText variant="body" color="#1F2937">
                      {formatCurrency(report.totalPaid)}
                    </KurdishText>
                  </View>

                  <View style={styles.statItem}>
                    <Calendar size={16} color="#8B5CF6" />
                    <KurdishText variant="caption" color="#6B7280">
                      دوا پارەدان
                    </KurdishText>
                    <KurdishText variant="body" color="#1F2937">
                      {report.lastPaymentDate 
                        ? new Date(report.lastPaymentDate).toLocaleDateString('ckb-IQ')
                        : 'هیچ'
                      }
                    </KurdishText>
                  </View>
                </View>

                <View style={styles.reportFooter}>
                  <KurdishText variant="caption" color="#6B7280">
                    {report.debtCount} قەرز • {report.paymentCount} پارەدان
                  </KurdishText>
                  {report.averagePaymentTime > 0 && (
                    <KurdishText variant="caption" color="#6B7280">
                      ناوەندی کات: {Math.round(report.averagePaymentTime)} ڕۆژ
                    </KurdishText>
                  )}
                </View>
              </GradientCard>
            );
          })}

          {filteredAndSortedReports.length === 0 && (
            <GradientCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Users size={48} color="#9CA3AF" />
                <KurdishText variant="body" color="#6B7280">
                  هیچ کڕیارێک نەدۆزرایەوە
                </KurdishText>
              </View>
            </GradientCard>
          )}
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
  noPermissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
    gap: 8,
  },
  controlsCard: {
    margin: 16,
    marginTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipSelected: {
    backgroundColor: '#1E3A8A',
  },
  sortContainer: {
    gap: 8,
  },
  sortChips: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  sortChipSelected: {
    backgroundColor: '#7C3AED',
  },
  reportsContainer: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  reportCard: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportAmount: {
    alignItems: 'flex-end',
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
});