import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp,
  BarChart3,
  Download,
  Filter,
  Search,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

interface PaymentReport {
  period: string;
  totalAmount: number;
  paymentCount: number;
  averagePayment: number;
  topCustomers: {
    name: string;
    amount: number;
    paymentCount: number;
  }[];
}

export default function PaymentReportsScreen() {

  const { payments, debts } = useDebts();
  const { hasPermission } = useAuth();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Generate payment reports based on selected period
  const paymentReports = useMemo(() => {
    const reports: PaymentReport[] = [];

    // Group payments by period
    const groupedPayments = new Map<string, typeof payments>();

    payments.forEach(payment => {
      if (!payment?.paymentDate) return;
      const paymentDate = new Date(payment.paymentDate);
      let periodKey = '';

      switch (selectedPeriod) {
        case 'daily':
          periodKey = paymentDate.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(paymentDate);
          weekStart.setDate(paymentDate.getDate() - paymentDate.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          periodKey = `${paymentDate.getFullYear()}-${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'yearly':
          periodKey = paymentDate.getFullYear().toString();
          break;
      }

      if (!groupedPayments.has(periodKey)) {
        groupedPayments.set(periodKey, []);
      }
      groupedPayments.get(periodKey)!.push(payment);
    });

    // Generate reports for each period
    groupedPayments.forEach((periodPayments, periodKey) => {
      const totalAmount = periodPayments.reduce((sum, p) => sum + p.amount, 0);
      const paymentCount = periodPayments.length;
      const averagePayment = totalAmount / paymentCount;

      // Get top customers for this period
      const customerPayments = new Map<string, { name: string; amount: number; count: number }>();
      
      periodPayments.forEach(payment => {
        const debt = debts.find(d => d.id === payment.debtId);
        const customerName = debt?.customerName || 'نەناسراو';
        
        if (!customerPayments.has(payment.debtId)) {
          customerPayments.set(payment.debtId, {
            name: customerName,
            amount: 0,
            count: 0,
          });
        }
        
        const customer = customerPayments.get(payment.debtId)!;
        customer.amount += payment.amount;
        customer.count += 1;
      });

      const topCustomers = Array.from(customerPayments.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(customer => ({
          name: customer.name,
          amount: customer.amount,
          paymentCount: customer.count,
        }));

      reports.push({
        period: periodKey,
        totalAmount,
        paymentCount,
        averagePayment,
        topCustomers,
      });
    });

    return reports.sort((a, b) => b.period.localeCompare(a.period));
  }, [payments, debts, selectedPeriod]);

  // Filter reports based on search
  const filteredReports = useMemo(() => {
    if (!searchQuery) return paymentReports;
    
    const query = searchQuery.toLowerCase();
    return paymentReports.filter(report =>
      report.period.toLowerCase().includes(query) ||
      report.topCustomers.some(customer => 
        customer.name.toLowerCase().includes(query)
      )
    );
  }, [paymentReports, searchQuery]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPeriod = (period: string) => {
    switch (selectedPeriod) {
      case 'daily':
        return new Date(period).toLocaleDateString('ckb-IQ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'weekly':
        const weekStart = new Date(period);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('ckb-IQ', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('ckb-IQ', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        const [year, month] = period.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ckb-IQ', {
          year: 'numeric',
          month: 'long',
        });
      case 'yearly':
        return period;
      default:
        return period;
    }
  };

  const handleExportReport = () => {
    // In a real app, this would generate and download a PDF report
    console.log('Exporting payment reports...');
  };

  const periodButtons = [
    { id: 'daily', label: 'ڕۆژانە', icon: Calendar },
    { id: 'weekly', label: 'هەفتانە', icon: BarChart3 },
    { id: 'monthly', label: 'مانگانە', icon: TrendingUp },
    { id: 'yearly', label: 'ساڵانە', icon: FileText },
  ];

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCount = payments.length;
    const averagePayment = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // Get current month stats
    const now = new Date();
    const currentMonth = payments.filter(p => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });
    
    const monthlyTotal = currentMonth.reduce((sum, p) => sum + p.amount, 0);
    const monthlyCount = currentMonth.length;

    return {
      totalAmount,
      totalCount,
      averagePayment,
      monthlyTotal,
      monthlyCount,
    };
  }, [payments]);

  if (!hasPermission(PERMISSIONS.VIEW_REPORTS)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.noPermissionContainer}>
          <FileText size={64} color="#9CA3AF" />
          <KurdishText variant="title" color="#6B7280">
            دەسەڵاتت نییە
          </KurdishText>
          <KurdishText variant="body" color="#9CA3AF">
            تۆ دەسەڵاتی بینینی ڕاپۆرتەکانت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Overall Statistics */}
          <View style={styles.statsGrid}>
            <GradientCard style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statIcon}>
                  <DollarSign size={24} color="#10B981" />
                </View>
                <View style={styles.statText}>
                  <KurdishText variant="caption" color="#6B7280">
                    کۆی گشتی
                  </KurdishText>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {formatCurrency(overallStats.totalAmount)}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {overallStats.totalCount} پارەدان
                  </KurdishText>
                </View>
              </View>
            </GradientCard>

            <GradientCard style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statIcon}>
                  <TrendingUp size={24} color="#3B82F6" />
                </View>
                <View style={styles.statText}>
                  <KurdishText variant="caption" color="#6B7280">
                    ئەم مانگە
                  </KurdishText>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {formatCurrency(overallStats.monthlyTotal)}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {overallStats.monthlyCount} پارەدان
                  </KurdishText>
                </View>
              </View>
            </GradientCard>
          </View>

          {/* Period Selection and Search */}
          <GradientCard style={styles.controlsCard}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#6B7280" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="گەڕان لە ڕاپۆرتەکان..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  textAlign="right"
                />
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.periodButtons}>
                    {periodButtons.map(period => {
                      const IconComponent = period.icon;
                      const isSelected = selectedPeriod === period.id;
                      return (
                        <TouchableOpacity
                          key={period.id}
                          style={[
                            styles.periodChip,
                            isSelected && styles.periodChipSelected,
                          ]}
                          onPress={() => setSelectedPeriod(period.id as any)}
                        >
                          <IconComponent 
                            size={16} 
                            color={isSelected ? 'white' : '#6B7280'} 
                          />
                          <KurdishText 
                            variant="caption" 
                            color={isSelected ? 'white' : '#6B7280'}
                          >
                            {period.label}
                          </KurdishText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
          </GradientCard>

          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportReport}
          >
            <Download size={20} color="white" />
            <KurdishText variant="subtitle" color="white">
              دەرهێنانی ڕاپۆرت
            </KurdishText>
          </TouchableOpacity>

          {/* Reports List */}
          <View style={styles.reportsContainer}>
            <View style={styles.sectionHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                ڕاپۆرتی {periodButtons.find(p => p.id === selectedPeriod)?.label} ({filteredReports.length})
              </KurdishText>
            </View>

            {filteredReports.length === 0 ? (
              <GradientCard style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <BarChart3 size={48} color="#9CA3AF" />
                  <KurdishText variant="body" color="#6B7280">
                    هیچ ڕاپۆرتێک نەدۆزرایەوە
                  </KurdishText>
                </View>
              </GradientCard>
            ) : (
              filteredReports.map((report, index) => (
                <GradientCard key={report.period} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportPeriod}>
                      <KurdishText variant="subtitle" color="#1F2937">
                        {formatPeriod(report.period)}
                      </KurdishText>
                      <KurdishText variant="caption" color="#6B7280">
                        {report.paymentCount} پارەدان
                      </KurdishText>
                    </View>
                    <View style={styles.reportAmount}>
                      <KurdishText variant="title" color="#10B981">
                        {formatCurrency(report.totalAmount)}
                      </KurdishText>
                      <KurdishText variant="caption" color="#6B7280">
                        ناوەند: {formatCurrency(report.averagePayment)}
                      </KurdishText>
                    </View>
                  </View>

                  {report.topCustomers.length > 0 && (
                    <View style={styles.topCustomers}>
                      <KurdishText variant="body" color="#1F2937">
                        باشترین کڕیارەکان:
                      </KurdishText>
                      {report.topCustomers.slice(0, 3).map((customer) => (
                        <View key={`${report.period}-${customer.name}`} style={styles.customerRow}>
                          <View style={styles.customerInfo}>
                            <KurdishText variant="caption" color="#1F2937">
                              {customer.name}
                            </KurdishText>
                            <KurdishText variant="caption" color="#6B7280">
                              {customer.paymentCount} پارەدان
                            </KurdishText>
                          </View>
                          <KurdishText variant="caption" color="#10B981">
                            {formatCurrency(customer.amount)}
                          </KurdishText>
                        </View>
                      ))}
                    </View>
                  )}
                </GradientCard>
              ))
            )}
          </View>
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
  content: {
    padding: 16,
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
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    flex: 1,
  },
  controlsCard: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  periodChipSelected: {
    backgroundColor: '#1E3A8A',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  reportsContainer: {
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
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
  reportPeriod: {
    flex: 1,
  },
  reportAmount: {
    alignItems: 'flex-end',
  },
  topCustomers: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  customerInfo: {
    flex: 1,
  },
});