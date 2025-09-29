import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Download,
  BarChart3,
  PieChart,
  Target,
  Calendar,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

interface BalanceReport {
  totalDebtsIssued: number;
  totalPaymentsReceived: number;
  outstandingBalance: number;
  paidInFull: number;
  partiallyPaid: number;
  unpaidDebts: number;
  overdueAmount: number;
  collectionRate: number; // percentage
  averageDebtSize: number;
  averagePaymentSize: number;
  topDebtors: Array<{
    customerId: string;
    customerName: string;
    outstandingAmount: number;
    percentage: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    debts: number;
    payments: number;
    balance: number;
  }>;
}

export default function BalanceReportScreen() {
  const { debts, payments, getSummary, getHighDebtCustomers, getOverdueDebts } = useDebts();
  const { getCustomers } = useUsers();
  const { hasPermission } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year' | 'all'>('1year');

  const balanceReport = useMemo((): BalanceReport => {
    const summary = getSummary();
    const customers = getCustomers();
    const highDebtors = getHighDebtCustomers(50000);
    const overdueDebts = getOverdueDebts();
    
    // Calculate period-based data
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    const periodDebts = debts.filter(d => new Date(d.createdAt) >= startDate);
    const periodPayments = payments.filter(p => new Date(p.paymentDate) >= startDate);
    
    const totalDebtsIssued = periodDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPaymentsReceived = periodPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = summary.totalRemaining;
    
    // Calculate debt status counts
    const paidInFull = debts.filter(d => d.status === 'paid').length;
    const partiallyPaid = debts.filter(d => d.status === 'partial').length;
    const unpaidDebts = debts.filter(d => d.status === 'active').length;
    
    const overdueAmount = overdueDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const collectionRate = totalDebtsIssued > 0 ? (totalPaymentsReceived / totalDebtsIssued) * 100 : 0;
    
    const averageDebtSize = debts.length > 0 ? summary.totalDebts / debts.length : 0;
    const averagePaymentSize = payments.length > 0 ? summary.totalPaid / payments.length : 0;
    
    // Top debtors with percentages
    const topDebtors = highDebtors.slice(0, 10).map(debtor => ({
      customerId: debtor.customerId,
      customerName: debtor.customerName,
      outstandingAmount: debtor.totalDebt,
      percentage: outstandingBalance > 0 ? (debtor.totalDebt / outstandingBalance) * 100 : 0,
    }));
    
    // Category breakdown
    const categoryMap = new Map<string, number>();
    debts.forEach(debt => {
      const existing = categoryMap.get(debt.category) || 0;
      categoryMap.set(debt.category, existing + debt.remainingAmount);
    });
    
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: outstandingBalance > 0 ? (amount / outstandingBalance) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
    
    // Monthly trend for the last 12 months
    const monthlyTrend: Array<{ month: string; debts: number; payments: number; balance: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthDebts = debts.filter(d => {
        const debtDate = new Date(d.createdAt);
        return debtDate >= monthStart && debtDate <= monthEnd;
      }).reduce((sum, d) => sum + d.amount, 0);
      
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      }).reduce((sum, p) => sum + p.amount, 0);
      
      monthlyTrend.push({
        month: monthDate.toLocaleDateString('ckb-IQ', { month: 'short' }),
        debts: monthDebts,
        payments: monthPayments,
        balance: monthDebts - monthPayments,
      });
    }
    
    return {
      totalDebtsIssued,
      totalPaymentsReceived,
      outstandingBalance,
      paidInFull,
      partiallyPaid,
      unpaidDebts,
      overdueAmount,
      collectionRate,
      averageDebtSize,
      averagePaymentSize,
      topDebtors,
      categoryBreakdown,
      monthlyTrend,
    };
  }, [debts, payments, getSummary, getHighDebtCustomers, getOverdueDebts, getCustomers, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const handleExportReport = () => {
    console.log('Exporting balance report...');
  };

  if (!hasPermission(PERMISSIONS.VIEW_REPORTS)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'ڕاپۆرتی باڵانس' }} />
        <View style={styles.noPermissionContainer}>
          <DollarSign size={64} color="#9CA3AF" />
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
      <Stack.Screen options={{ title: 'ڕاپۆرتی باڵانس' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Controls */}
        <View style={styles.headerSection}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              ڕاپۆرتی باڵانسی گشتی
            </KurdishText>
            <TouchableOpacity onPress={handleExportReport}>
              <Download size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.periodSelector}>
            {[
              { key: '3months', label: '٣ مانگ' },
              { key: '6months', label: '٦ مانگ' },
              { key: '1year', label: '١ ساڵ' },
              { key: 'all', label: 'هەموو' },
            ].map(period => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.key as any)}
              >
                <KurdishText
                  variant="caption"
                  color={selectedPeriod === period.key ? 'white' : '#6B7280'}
                >
                  {period.label}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsGrid}>
            <GradientCard style={styles.metricCard} colors={['#10B981', '#059669']}>
              <View style={styles.metricContent}>
                <TrendingUp size={32} color="#10B981" />
                <KurdishText variant="title" color="#1F2937">
                  {formatCurrency(balanceReport.totalDebtsIssued)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  کۆی قەرزی دراو
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.metricCard} colors={['#3B82F6', '#2563EB']}>
              <View style={styles.metricContent}>
                <TrendingDown size={32} color="#3B82F6" />
                <KurdishText variant="title" color="#1F2937">
                  {formatCurrency(balanceReport.totalPaymentsReceived)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  کۆی پارەی وەرگیراو
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.metricCard} colors={['#EF4444', '#DC2626']}>
              <View style={styles.metricContent}>
                <AlertTriangle size={32} color="#EF4444" />
                <KurdishText variant="title" color="#1F2937">
                  {formatCurrency(balanceReport.outstandingBalance)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  باڵانسی ماوە
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.metricCard} colors={['#8B5CF6', '#7C3AED']}>
              <View style={styles.metricContent}>
                <Target size={32} color="#8B5CF6" />
                <KurdishText variant="title" color="#1F2937">
                  {formatPercentage(balanceReport.collectionRate)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  ڕێژەی کۆکردنەوە
                </KurdishText>
              </View>
            </GradientCard>
          </View>
        </View>

        {/* Debt Status Overview */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            دۆخی قەرزەکان
          </KurdishText>
          
          <View style={styles.statusGrid}>
            <GradientCard style={styles.statusCard}>
              <View style={styles.statusContent}>
                <CheckCircle size={24} color="#10B981" />
                <KurdishText variant="body" color="#1F2937">
                  {balanceReport.paidInFull}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  تەواو پارەدراو
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.statusCard}>
              <View style={styles.statusContent}>
                <PieChart size={24} color="#F59E0B" />
                <KurdishText variant="body" color="#1F2937">
                  {balanceReport.partiallyPaid}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  بەشێک پارەدراو
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.statusCard}>
              <View style={styles.statusContent}>
                <AlertTriangle size={24} color="#EF4444" />
                <KurdishText variant="body" color="#1F2937">
                  {balanceReport.unpaidDebts}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  نەپارەدراو
                </KurdishText>
              </View>
            </GradientCard>
          </View>
        </View>

        {/* Financial Metrics */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            پێوەرە داراییەکان
          </KurdishText>
          
          <GradientCard>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                ناوەندی قەرز
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(balanceReport.averageDebtSize)}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                ناوەندی پارەدان
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(balanceReport.averagePaymentSize)}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                بڕی بەسەرچوو
              </KurdishText>
              <KurdishText variant="body" color="#EF4444">
                {formatCurrency(balanceReport.overdueAmount)}
              </KurdishText>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <KurdishText variant="body" color="#6B7280">
                ڕێژەی کۆکردنەوە
              </KurdishText>
              <KurdishText variant="body" color="#10B981">
                {formatPercentage(balanceReport.collectionRate)}
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        {/* Top Debtors */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            زۆرترین قەرزداران
          </KurdishText>
          
          <GradientCard>
            {balanceReport.topDebtors.slice(0, 5).map((debtor, index) => (
              <View key={debtor.customerId} style={styles.debtorRow}>
                <View style={styles.debtorInfo}>
                  <View style={styles.rankBadge}>
                    <KurdishText variant="caption" color="white">
                      {index + 1}
                    </KurdishText>
                  </View>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {debtor.customerName}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {formatPercentage(debtor.percentage)} لە کۆی گشتی
                    </KurdishText>
                  </View>
                </View>
                <KurdishText variant="body" color="#EF4444">
                  {formatCurrency(debtor.outstandingAmount)}
                </KurdishText>
              </View>
            ))}
          </GradientCard>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            دابەشکردن بە پێی جۆر
          </KurdishText>
          
          <GradientCard>
            {balanceReport.categoryBreakdown.slice(0, 5).map((category, index) => (
              <View key={category.category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[
                    styles.categoryDot, 
                    { backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index] }
                  ]} />
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {category.category}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {formatPercentage(category.percentage)} لە کۆی گشتی
                    </KurdishText>
                  </View>
                </View>
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(category.amount)}
                </KurdishText>
              </View>
            ))}
          </GradientCard>
        </View>

        {/* Monthly Trend */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ڕەوتی مانگانە
          </KurdishText>
          
          <GradientCard>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.trendChart}>
                {balanceReport.monthlyTrend.map((month, index) => (
                  <View key={index} style={styles.trendColumn}>
                    <KurdishText variant="caption" color="#6B7280">
                      {month.month}
                    </KurdishText>
                    <View style={styles.trendBars}>
                      <View style={[
                        styles.trendBar,
                        { 
                          height: Math.max(20, (month.debts / Math.max(...balanceReport.monthlyTrend.map(m => m.debts))) * 60),
                          backgroundColor: '#10B981'
                        }
                      ]} />
                      <View style={[
                        styles.trendBar,
                        { 
                          height: Math.max(20, (month.payments / Math.max(...balanceReport.monthlyTrend.map(m => m.payments))) * 60),
                          backgroundColor: '#3B82F6'
                        }
                      ]} />
                    </View>
                    <KurdishText variant="caption" color="#6B7280">
                      {formatCurrency(Math.abs(month.balance))}
                    </KurdishText>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.trendLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <KurdishText variant="caption" color="#6B7280">
                  قەرز
                </KurdishText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <KurdishText variant="caption" color="#6B7280">
                  پارەدان
                </KurdishText>
              </View>
            </View>
          </GradientCard>
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
  headerSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  metricsSection: {
    padding: 16,
    paddingTop: 0,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
  },
  metricContent: {
    alignItems: 'center',
    gap: 12,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    padding: 16,
  },
  statusContent: {
    alignItems: 'center',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  debtorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  debtorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  trendColumn: {
    alignItems: 'center',
    gap: 8,
    minWidth: 60,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 80,
  },
  trendBar: {
    width: 12,
    borderRadius: 6,
    minHeight: 20,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});