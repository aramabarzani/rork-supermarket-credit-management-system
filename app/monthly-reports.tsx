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
  BarChart3, 
  Search, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  DollarSign,
  Clock,
  Target,
  Users,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

interface MonthlyReport {
  month: string;
  year: number;
  totalDebts: number;
  totalPayments: number;
  netChange: number;
  debtCount: number;
  paymentCount: number;
  averageDebt: number;
  averagePayment: number;
  topCategories: { category: string; amount: number }[];
}

export default function MonthlyReportsScreen() {
  const { debts, payments, filterDebtsByDate, getPaymentsByDateRange } = useDebts();
  const { hasPermission } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const monthlyReports = useMemo((): MonthlyReport[] => {
    const reports: MonthlyReport[] = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(selectedYear, month, 1);
      const endDate = new Date(selectedYear, month + 1, 0);
      
      const monthDebts = filterDebtsByDate(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      const monthPayments = getPaymentsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      const totalDebts = monthDebts.reduce((sum, debt) => sum + debt.amount, 0);
      const totalPayments = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate category breakdown
      const categoryMap = new Map<string, number>();
      monthDebts.forEach(debt => {
        const existing = categoryMap.get(debt.category) || 0;
        categoryMap.set(debt.category, existing + debt.amount);
      });
      
      const topCategories = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);
      
      reports.push({
        month: startDate.toLocaleDateString('ckb-IQ', { month: 'long' }),
        year: selectedYear,
        totalDebts,
        totalPayments,
        netChange: totalPayments - totalDebts,
        debtCount: monthDebts.length,
        paymentCount: monthPayments.length,
        averageDebt: monthDebts.length > 0 ? totalDebts / monthDebts.length : 0,
        averagePayment: monthPayments.length > 0 ? totalPayments / monthPayments.length : 0,
        topCategories,
      });
    }
    
    return reports.reverse(); // Show most recent first
  }, [selectedYear, debts, payments, filterDebtsByDate, getPaymentsByDateRange]);

  const filteredReports = useMemo(() => {
    if (!searchQuery) return monthlyReports;
    
    const query = searchQuery.toLowerCase();
    return monthlyReports.filter(report =>
      report.month.toLowerCase().includes(query) ||
      report.topCategories.some(cat => cat.category.toLowerCase().includes(query))
    );
  }, [monthlyReports, searchQuery]);

  const yearlyTotals = useMemo(() => {
    return monthlyReports.reduce(
      (acc, report) => ({
        totalDebts: acc.totalDebts + report.totalDebts,
        totalPayments: acc.totalPayments + report.totalPayments,
        debtCount: acc.debtCount + report.debtCount,
        paymentCount: acc.paymentCount + report.paymentCount,
      }),
      { totalDebts: 0, totalPayments: 0, debtCount: 0, paymentCount: 0 }
    );
  }, [monthlyReports]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportReport = () => {
    console.log(`Exporting monthly reports for ${selectedYear}...`);
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    debts.forEach(debt => {
      years.add(new Date(debt.createdAt).getFullYear());
    });
    payments.forEach(payment => {
      years.add(new Date(payment.paymentDate).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [debts, payments]);

  if (!hasPermission(PERMISSIONS.VIEW_REPORTS)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'ڕاپۆرتی مانگانە' }} />
        <View style={styles.noPermissionContainer}>
          <BarChart3 size={64} color="#9CA3AF" />
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
      <Stack.Screen options={{ title: 'ڕاپۆرتی مانگانە' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Yearly Summary */}
        <View style={styles.yearlySection}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              کورتەی ساڵی {selectedYear}
            </KurdishText>
            <TouchableOpacity onPress={handleExportReport}>
              <Download size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <GradientCard style={styles.statCard} colors={['#10B981', '#059669']}>
              <View style={styles.statContent}>
                <TrendingUp size={24} color="#10B981" />
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(yearlyTotals.totalDebts)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  کۆی قەرزەکان
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.statCard} colors={['#3B82F6', '#2563EB']}>
              <View style={styles.statContent}>
                <TrendingDown size={24} color="#3B82F6" />
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(yearlyTotals.totalPayments)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  کۆی پارەدانەکان
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.statCard} colors={['#8B5CF6', '#7C3AED']}>
              <View style={styles.statContent}>
                <Target size={24} color="#8B5CF6" />
                <KurdishText variant="body" color="#1F2937">
                  {yearlyTotals.debtCount}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  ژمارەی قەرزەکان
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.statCard} colors={['#F59E0B', '#D97706']}>
              <View style={styles.statContent}>
                <DollarSign size={24} color="#F59E0B" />
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(yearlyTotals.totalPayments - yearlyTotals.totalDebts)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  گۆڕانی خاڵی
                </KurdishText>
              </View>
            </GradientCard>
          </View>
        </View>

        {/* Controls */}
        <GradientCard style={styles.controlsCard}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="گەڕان لە مانگەکان..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.yearSelector}>
            <KurdishText variant="caption" color="#6B7280">
              ساڵ:
            </KurdishText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.yearChips}>
                {availableYears.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearChip,
                      selectedYear === year && styles.yearChipSelected,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <KurdishText 
                      variant="caption" 
                      color={selectedYear === year ? 'white' : '#6B7280'}
                    >
                      {year}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </GradientCard>

        {/* Monthly Reports */}
        <View style={styles.reportsContainer}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              ڕاپۆرتی مانگانە ({filteredReports.length})
            </KurdishText>
          </View>

          {filteredReports.map((report, index) => (
            <GradientCard key={`${report.year}-${index}`} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.monthInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {report.month} {report.year}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {report.debtCount} قەرز • {report.paymentCount} پارەدان
                  </KurdishText>
                </View>
                <View style={styles.netChange}>
                  <KurdishText 
                    variant="title" 
                    color={report.netChange >= 0 ? '#10B981' : '#EF4444'}
                  >
                    {report.netChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(report.netChange))}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    گۆڕانی خاڵی
                  </KurdishText>
                </View>
              </View>

              <View style={styles.reportStats}>
                <View style={styles.statRow}>
                  <KurdishText variant="body" color="#6B7280">
                    کۆی قەرزەکان
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {formatCurrency(report.totalDebts)}
                  </KurdishText>
                </View>
                <View style={styles.statRow}>
                  <KurdishText variant="body" color="#6B7280">
                    کۆی پارەدانەکان
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {formatCurrency(report.totalPayments)}
                  </KurdishText>
                </View>
                <View style={styles.statRow}>
                  <KurdishText variant="body" color="#6B7280">
                    ناوەندی قەرز
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {formatCurrency(report.averageDebt)}
                  </KurdishText>
                </View>
                <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
                  <KurdishText variant="body" color="#6B7280">
                    ناوەندی پارەدان
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {formatCurrency(report.averagePayment)}
                  </KurdishText>
                </View>
              </View>

              {report.topCategories.length > 0 && (
                <View style={styles.categoriesSection}>
                  <KurdishText variant="body" color="#1F2937">
                    جۆرە سەرەکیەکان:
                  </KurdishText>
                  {report.topCategories.map((category, catIndex) => (
                    <View key={category.category} style={styles.categoryRow}>
                      <View style={styles.categoryInfo}>
                        <View style={[
                          styles.categoryDot, 
                          { backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'][catIndex] }
                        ]} />
                        <KurdishText variant="caption" color="#1F2937">
                          {category.category}
                        </KurdishText>
                      </View>
                      <KurdishText variant="caption" color="#6B7280">
                        {formatCurrency(category.amount)}
                      </KurdishText>
                    </View>
                  ))}
                </View>
              )}
            </GradientCard>
          ))}

          {filteredReports.length === 0 && (
            <GradientCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Calendar size={48} color="#9CA3AF" />
                <KurdishText variant="body" color="#6B7280">
                  هیچ ڕاپۆرتێک نەدۆزرایەوە
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
  yearlySection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    marginBottom: 16,
  },
  searchInputContainer: {
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
  yearSelector: {
    gap: 8,
  },
  yearChips: {
    flexDirection: 'row',
    gap: 8,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  yearChipSelected: {
    backgroundColor: '#1E3A8A',
  },
  reportsContainer: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
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
  monthInfo: {
    flex: 1,
  },
  netChange: {
    alignItems: 'flex-end',
  },
  reportStats: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesSection: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
});