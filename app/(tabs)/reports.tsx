import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Target,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { router } from 'expo-router';

export default function ReportsScreen() {
  const { 
    debts, 
    payments, 
    getSummary, 
    getHighDebtCustomers, 
    getOverdueDebts, 
    getUnpaidDebts, 
    getMonthlyPaymentReport, 
    getYearlyPaymentReport,
    // New financial functions from Section 13
    getIrregularPaymentReport,
    getBestPayingCustomers,
    getFinancialHealthReport,
    exportFinancialData,
    checkBalanceDiscrepancies,
  } = useDebts();
  const { getCustomers, getEmployees } = useUsers();
  const { hasPermission, isInitialized, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');

  const summary = getSummary();
  const customers = getCustomers();
  const employees = getEmployees();
  const highDebtCustomers = getHighDebtCustomers(100000);
  const overdueDebts = getOverdueDebts();
  const unpaidDebts = getUnpaidDebts();

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFilteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredDebts = debts.filter(d => new Date(d.createdAt) >= startDate);
    const filteredPayments = payments.filter(p => new Date(p.paymentDate) >= startDate);

    return {
      debts: filteredDebts,
      payments: filteredPayments,
      totalNewDebts: filteredDebts.reduce((sum, d) => sum + d.amount, 0),
      totalPayments: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [debts, payments, selectedPeriod]);

  const periods = [
    { key: 'day' as const, label: 'ڕۆژانە' },
    { key: 'week' as const, label: 'هەفتانە' },
    { key: 'month' as const, label: 'مانگانە' },
    { key: 'year' as const, label: 'ساڵانە' },
    { key: 'all' as const, label: 'هەمووی' },
  ];

  // Advanced analytics
  const categoryBreakdown = useMemo(() => {
    const breakdown = new Map<string, { amount: number; count: number }>();
    debts.forEach(debt => {
      const existing = breakdown.get(debt.category) || { amount: 0, count: 0 };
      existing.amount += debt.remainingAmount;
      existing.count += 1;
      breakdown.set(debt.category, existing);
    });
    return Array.from(breakdown.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    })).sort((a, b) => b.amount - a.amount);
  }, [debts]);

  const employeePerformance = useMemo(() => {
    const performance = new Map<string, { debtsCreated: number; paymentsReceived: number; totalAmount: number }>();
    
    debts.forEach(debt => {
      const existing = performance.get(debt.createdByName) || { debtsCreated: 0, paymentsReceived: 0, totalAmount: 0 };
      existing.debtsCreated += 1;
      existing.totalAmount += debt.amount;
      performance.set(debt.createdByName, existing);
    });
    
    payments.forEach(payment => {
      const existing = performance.get(payment.receivedByName) || { debtsCreated: 0, paymentsReceived: 0, totalAmount: 0 };
      existing.paymentsReceived += 1;
      performance.set(payment.receivedByName, existing);
    });
    
    return Array.from(performance.entries()).map(([name, data]) => ({
      employeeName: name,
      ...data,
    })).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [debts, payments]);

  // New financial data
  const irregularPayments = getIrregularPaymentReport();
  const bestPayingCustomers = getBestPayingCustomers();
  const financialHealth = getFinancialHealthReport();
  const balanceDiscrepancies = checkBalanceDiscrepancies();

  const handleExportReport = (reportType: string) => {
    if (Platform.OS === 'web') {
      console.log(`Exporting ${reportType} report as PDF...`);
      // Export financial data as CSV
      if (reportType === 'financial') {
        const csvData = exportFinancialData('csv');
        console.log('Financial CSV Data:', csvData);
        // In a real app, this would trigger a download
      }
    } else {
      // On mobile, show a simple alert
      console.log(`ڕاپۆرتی ${reportType} دەرهێنراو. لە ئەپی ڕاستەقینەدا، ئەمە وەک PDF دابەزێنرێت.`);
    }
  };

  const navigateToDetailedReport = (reportType: string) => {
    switch (reportType) {
      case 'payments':
        router.push('/payment-reports');
        break;
      case 'customers':
        router.push('/customer-reports');
        break;
      case 'employees':
        router.push('/employees');
        break;
      case 'monthly':
        router.push('/monthly-reports');
        break;
      case 'balance':
        router.push('/balance-report');
        break;
      case 'customer-analytics':
        router.push('/customer-analytics');
        break;
      default:
        break;
    }
  };

  if (isLoading || !isInitialized) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.noPermissionContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <KurdishText variant="title" color="#6B7280">
            چاوەڕوان بە...
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <KurdishText
                variant="body"
                color={selectedPeriod === period.key ? 'white' : '#6B7280'}
              >
                {period.label}
              </KurdishText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <GradientCard style={styles.summaryCard} colors={['#10B981', '#059669']}>
            <TouchableOpacity 
              style={styles.summaryContent}
              onPress={() => navigateToDetailedReport('debts')}
            >
              <TrendingUp size={32} color="#10B981" />
              <KurdishText variant="caption" color="#6B7280">
                قەرزی نوێ
              </KurdishText>
              <KurdishText variant="subtitle" color="#1F2937">
                {formatCurrency(getFilteredData.totalNewDebts)}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                {getFilteredData.debts.length} دانە
              </KurdishText>
            </TouchableOpacity>
          </GradientCard>

          <GradientCard style={styles.summaryCard} colors={['#3B82F6', '#2563EB']}>
            <TouchableOpacity 
              style={styles.summaryContent}
              onPress={() => navigateToDetailedReport('payments')}
            >
              <TrendingDown size={32} color="#3B82F6" />
              <KurdishText variant="caption" color="#6B7280">
                پارەی وەرگیراو
              </KurdishText>
              <KurdishText variant="subtitle" color="#1F2937">
                {formatCurrency(getFilteredData.totalPayments)}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                {getFilteredData.payments.length} پارەدان
              </KurdishText>
            </TouchableOpacity>
          </GradientCard>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <GradientCard style={styles.quickStatCard} colors={['#EF4444', '#DC2626']}>
            <View style={styles.quickStatContent}>
              <AlertTriangle size={24} color="#EF4444" />
              <KurdishText variant="body" color="#1F2937">
                {overdueDebts.length}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                قەرزی بەسەرچوو
              </KurdishText>
            </View>
          </GradientCard>

          <GradientCard style={styles.quickStatCard} colors={['#F59E0B', '#D97706']}>
            <View style={styles.quickStatContent}>
              <Clock size={24} color="#F59E0B" />
              <KurdishText variant="body" color="#1F2937">
                {unpaidDebts.length}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                قەرزی نەپارەدراو
              </KurdishText>
            </View>
          </GradientCard>

          <GradientCard style={styles.quickStatCard} colors={['#8B5CF6', '#7C3AED']}>
            <TouchableOpacity 
              style={styles.quickStatContent}
              onPress={() => navigateToDetailedReport('customers')}
            >
              <Users size={24} color="#8B5CF6" />
              <KurdishText variant="body" color="#1F2937">
                {customers.length}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                کڕیار
              </KurdishText>
            </TouchableOpacity>
          </GradientCard>

          <GradientCard style={styles.quickStatCard} colors={['#06B6D4', '#0891B2']}>
            <View style={styles.quickStatContent}>
              <Target size={24} color="#06B6D4" />
              <KurdishText variant="body" color="#1F2937">
                {summary.paidDebtsCount}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                قەرزی تەواو
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        {/* Overall Statistics */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ئاماری گشتی
          </KurdishText>
          
          <GradientCard>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی گشتی قەرزەکان
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(summary.totalDebts)}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی پارەی وەرگیراو
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(summary.totalPaid)}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی قەرزی ماوە
              </KurdishText>
              <KurdishText variant="body" color="#EF4444">
                {formatCurrency(summary.totalRemaining)}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                ژمارەی کڕیارەکان
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {customers.length}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                قەرزی چالاک
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {summary.activeDebtsCount}
              </KurdishText>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <KurdishText variant="body" color="#6B7280">
                قەرزی تەواو دراوەتەوە
              </KurdishText>
              <KurdishText variant="body" color="#10B981">
                {summary.paidDebtsCount}
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              قەرز بە پێی جۆر
            </KurdishText>
            <TouchableOpacity onPress={() => handleExportReport('جۆرەکان')}>
              <Download size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <GradientCard>
            {categoryBreakdown.slice(0, 5).map((item, index) => (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryDot, { backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index] }]} />
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {item.category}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {item.count} قەرز
                    </KurdishText>
                  </View>
                </View>
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(item.amount)}
                </KurdishText>
              </View>
            ))}
          </GradientCard>
        </View>

        {/* Top Debtors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              زۆرترین قەرزدار
            </KurdishText>
            <TouchableOpacity onPress={() => handleExportReport('قەرزدارەکان')}>
              <Download size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <GradientCard>
            {highDebtCustomers.slice(0, 5).map((customer, index) => (
              <View key={customer.customerId} style={styles.debtorRow}>
                <View style={styles.debtorInfo}>
                  <View style={styles.rankBadge}>
                    <KurdishText variant="caption" color="white">
                      {index + 1}
                    </KurdishText>
                  </View>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {customer.customerName}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      قەرزی کۆتایی
                    </KurdishText>
                  </View>
                </View>
                <KurdishText variant="body" color="#EF4444">
                  {formatCurrency(customer.totalDebt)}
                </KurdishText>
              </View>
            ))}
          </GradientCard>
        </View>

        {/* Employee Performance */}
        {hasPermission(PERMISSIONS.VIEW_EMPLOYEES) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                کارایی کارمەندان
              </KurdishText>
              <TouchableOpacity onPress={() => navigateToDetailedReport('employees')}>
                <FileText size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <GradientCard>
              {employeePerformance.slice(0, 3).map((employee, index) => (
                <View key={employee.employeeName} style={styles.employeeRow}>
                  <View style={styles.employeeInfo}>
                    <KurdishText variant="body" color="#1F2937">
                      {employee.employeeName}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {employee.debtsCreated} قەرز، {employee.paymentsReceived} پارەدان
                    </KurdishText>
                  </View>
                  <KurdishText variant="body" color="#10B981">
                    {formatCurrency(employee.totalAmount)}
                  </KurdishText>
                </View>
              ))}
            </GradientCard>
          </View>
        )}

        {/* Financial Health Report - New Section 13 Feature */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              تەندروستی دارایی
            </KurdishText>
            <TouchableOpacity onPress={() => handleExportReport('financial')}>
              <Download size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <GradientCard>
            <View style={styles.healthMetrics}>
              <View style={styles.healthMetric}>
                <KurdishText variant="body" color="#6B7280">
                  ڕێژەی کۆکردنەوە
                </KurdishText>
                <KurdishText variant="subtitle" color={financialHealth.collectionRate > 80 ? '#10B981' : financialHealth.collectionRate > 60 ? '#F59E0B' : '#EF4444'}>
                  {financialHealth.collectionRate.toFixed(1)}%
                </KurdishText>
              </View>
              <View style={styles.healthMetric}>
                <KurdishText variant="body" color="#6B7280">
                  ئاستی مەترسی
                </KurdishText>
                <KurdishText variant="subtitle" color={financialHealth.riskLevel === 'منخفض' ? '#10B981' : financialHealth.riskLevel === 'متوسط' ? '#F59E0B' : '#EF4444'}>
                  {financialHealth.riskLevel === 'منخفض' ? 'کەم' : financialHealth.riskLevel === 'متوسط' ? 'ناوەند' : 'بەرز'}
                </KurdishText>
              </View>
            </View>
            {financialHealth.recommendations.length > 0 && (
              <View style={styles.recommendations}>
                <KurdishText variant="body" color="#6B7280" style={{ marginBottom: 8 }}>
                  پێشنیارەکان:
                </KurdishText>
                {financialHealth.recommendations.map((rec, index) => (
                  <KurdishText key={index} variant="caption" color="#EF4444" style={{ marginBottom: 4 }}>
                    • {rec}
                  </KurdishText>
                ))}
              </View>
            )}
          </GradientCard>
        </View>

        {/* Best Paying Customers - New Section 13 Feature */}
        {bestPayingCustomers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                باشترین کڕیارانی پارەدەر
              </KurdishText>
              <TouchableOpacity onPress={() => handleExportReport('best-customers')}>
                <Download size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <GradientCard>
              {bestPayingCustomers.slice(0, 5).map((customer, index) => (
                <View key={customer.customerId} style={styles.customerRow}>
                  <View style={styles.customerInfo}>
                    <View style={[styles.rankBadge, { backgroundColor: '#10B981' }]}>
                      <KurdishText variant="caption" color="white">
                        {index + 1}
                      </KurdishText>
                    </View>
                    <View>
                      <KurdishText variant="body" color="#1F2937">
                        {customer.customerName}
                      </KurdishText>
                      <KurdishText variant="caption" color="#6B7280">
                        {customer.paymentCount} پارەدان - ناوەند: {formatCurrency(customer.averagePayment)}
                      </KurdishText>
                    </View>
                  </View>
                  <KurdishText variant="body" color="#10B981">
                    {formatCurrency(customer.totalPaid)}
                  </KurdishText>
                </View>
              ))}
            </GradientCard>
          </View>
        )}

        {/* Irregular Payments Alert - New Section 13 Feature */}
        {irregularPayments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                پارەدانە نائاساییەکان
              </KurdishText>
              <AlertTriangle size={20} color="#F59E0B" />
            </View>
            
            <GradientCard>
              <KurdishText variant="caption" color="#6B7280" style={{ marginBottom: 12 }}>
                {irregularPayments.length} پارەدانی نائاسایی دۆزرایەوە
              </KurdishText>
              {irregularPayments.slice(0, 3).map((payment, index) => (
                <View key={payment.id} style={styles.irregularPaymentRow}>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {payment.customerName}
                    </KurdishText>
                    <KurdishText variant="caption" color="#F59E0B">
                      {payment.irregularityReason}
                    </KurdishText>
                  </View>
                  <KurdishText variant="body" color="#F59E0B">
                    {formatCurrency(payment.amount)}
                  </KurdishText>
                </View>
              ))}
            </GradientCard>
          </View>
        )}

        {/* Balance Discrepancies Alert - New Section 13 Feature */}
        {balanceDiscrepancies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <KurdishText variant="subtitle" color="#EF4444">
                هەڵەکانی باڵانس
              </KurdishText>
              <AlertTriangle size={20} color="#EF4444" />
            </View>
            
            <GradientCard>
              <KurdishText variant="caption" color="#6B7280" style={{ marginBottom: 12 }}>
                {balanceDiscrepancies.length} هەڵەی باڵانس دۆزرایەوە
              </KurdishText>
              {balanceDiscrepancies.slice(0, 3).map((discrepancy, index) => (
                <View key={index} style={styles.discrepancyRow}>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {discrepancy.customerName}
                    </KurdishText>
                    <KurdishText variant="caption" color="#EF4444">
                      {discrepancy.description}
                    </KurdishText>
                  </View>
                  <KurdishText variant="body" color="#EF4444">
                    {formatCurrency(discrepancy.amount)}
                  </KurdishText>
                </View>
              ))}
            </GradientCard>
          </View>
        )}

        {/* Export Actions */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            دەرهێنانی ڕاپۆرتەکان
          </KurdishText>
          
          <View style={styles.exportGrid}>
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={() => handleExportReport('گشتی')}
            >
              <BarChart3 size={24} color="#1E3A8A" />
              <KurdishText variant="body" color="#1E3A8A">
                ڕاپۆرتی گشتی
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.exportButton}
              onPress={() => navigateToDetailedReport('monthly')}
            >
              <Calendar size={24} color="#7C3AED" />
              <KurdishText variant="body" color="#7C3AED">
                ڕاپۆرتی مانگانە
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.exportButton}
              onPress={() => handleExportReport('financial')}
            >
              <Download size={24} color="#059669" />
              <KurdishText variant="body" color="#059669">
                دەرهێنانی CSV
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.exportButton}
              onPress={() => navigateToDetailedReport('balance')}
            >
              <DollarSign size={24} color="#DC2626" />
              <KurdishText variant="body" color="#DC2626">
                ڕاپۆرتی باڵانس
              </KurdishText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={() => router.push('/detailed-customer-reports')}
            >
              <Users size={24} color="#8B5CF6" />
              <KurdishText variant="body" color="#8B5CF6">
                ڕاپۆرتی تایبەتی کڕیاران
              </KurdishText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={() => navigateToDetailedReport('customer-analytics')}
            >
              <BarChart3 size={24} color="#06B6D4" />
              <KurdishText variant="body" color="#06B6D4">
                شیکاری کڕیاران
              </KurdishText>
            </TouchableOpacity>
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
  noPermissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  summaryGrid: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
  },
  summaryContent: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  quickStatsRow: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  quickStatCard: {
    flex: 1,
  },
  quickStatContent: {
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  employeeInfo: {
    flex: 1,
  },
  exportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  healthMetric: {
    alignItems: 'center',
    gap: 4,
  },
  recommendations: {
    paddingTop: 16,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  irregularPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  discrepancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});