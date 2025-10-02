import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  BarChart3,
  TrendingDown,
  Calendar,
  MapPin,
  Users,
  Award,
  ChevronRight,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';

export default function AdvancedReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const { debts, payments } = useDebts();

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const debtDate = new Date(debt.createdAt);
      const debtYear = debtDate.getFullYear();
      const debtMonth = debtDate.getMonth() + 1;

      if (selectedPeriod === 'month') {
        return debtYear === selectedYear && debtMonth === selectedMonth;
      }
      return debtYear === selectedYear;
    });
  }, [debts, selectedPeriod, selectedMonth, selectedYear]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth() + 1;

      if (selectedPeriod === 'month') {
        return paymentYear === selectedYear && paymentMonth === selectedMonth;
      }
      return paymentYear === selectedYear;
    });
  }, [payments, selectedPeriod, selectedMonth, selectedYear]);

  const debtByPeriodData = useMemo(() => {
    const totalAmount = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const categories = Object.entries(
      filteredDebts.reduce((acc, debt) => {
        const category = debt.category || 'هیچ';
        if (!acc[category]) {
          acc[category] = { count: 0, amount: 0 };
        }
        acc[category].count++;
        acc[category].amount += debt.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    ).map(([category, data]) => ({
      category,
      count: data.count,
      amount: data.amount,
    }));

    return {
      totalDebts: filteredDebts.length,
      totalAmount,
      averageAmount: filteredDebts.length > 0 ? totalAmount / filteredDebts.length : 0,
      categories,
    };
  }, [filteredDebts]);

  const paymentByPeriodData = useMemo(() => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    return {
      totalPayments: filteredPayments.length,
      totalAmount,
      averageAmount: filteredPayments.length > 0 ? totalAmount / filteredPayments.length : 0,
    };
  }, [filteredPayments]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const months = [
    { value: 1, label: 'کانوونی دووەم' },
    { value: 2, label: 'شوبات' },
    { value: 3, label: 'ئازار' },
    { value: 4, label: 'نیسان' },
    { value: 5, label: 'ئایار' },
    { value: 6, label: 'حوزەیران' },
    { value: 7, label: 'تەمموز' },
    { value: 8, label: 'ئاب' },
    { value: 9, label: 'ئەیلوول' },
    { value: 10, label: 'تشرینی یەکەم' },
    { value: 11, label: 'تشرینی دووەم' },
    { value: 12, label: 'کانوونی یەکەم' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ڕاپۆرتە پێشکەوتووەکان',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <KurdishText
              variant="body"
              color={selectedPeriod === 'month' ? 'white' : '#6B7280'}
            >
              مانگانە
            </KurdishText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'year' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('year')}
          >
            <KurdishText
              variant="body"
              color={selectedPeriod === 'year' ? 'white' : '#6B7280'}
            >
              ساڵانە
            </KurdishText>
          </TouchableOpacity>
        </View>

        {selectedPeriod === 'month' && (
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <KurdishText variant="caption" color="#6B7280">
                مانگ
              </KurdishText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.monthSelector}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.monthButton,
                        selectedMonth === month.value && styles.monthButtonActive,
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <KurdishText
                        variant="caption"
                        color={selectedMonth === month.value ? 'white' : '#6B7280'}
                      >
                        {month.label}
                      </KurdishText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <KurdishText variant="caption" color="#6B7280">
              ساڵ
            </KurdishText>
            <View style={styles.yearSelector}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearButton,
                    selectedYear === year && styles.yearButtonActive,
                  ]}
                  onPress={() => setSelectedYear(year)}
                >
                  <KurdishText
                    variant="body"
                    color={selectedYear === year ? 'white' : '#6B7280'}
                  >
                    {year}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              ڕاپۆرتی قەرز بە ماوە
            </KurdishText>
            <BarChart3 size={24} color="#1E3A8A" />
          </View>

          <GradientCard>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی قەرزەکان
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {debtByPeriodData.totalDebts}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی بڕ
              </KurdishText>
              <KurdishText variant="body" color="#EF4444">
                {formatCurrency(debtByPeriodData.totalAmount)}
              </KurdishText>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <KurdishText variant="body" color="#6B7280">
                ناوەند
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(debtByPeriodData.averageAmount)}
              </KurdishText>
            </View>
          </GradientCard>

          {debtByPeriodData.categories && debtByPeriodData.categories.length > 0 && (
            <View style={styles.categorySection}>
              <KurdishText variant="body" color="#1F2937" style={{ marginBottom: 12 }}>
                قەرز بە پێی جۆر
              </KurdishText>
              <GradientCard>
                {debtByPeriodData.categories.map((cat, index) => (
                  <View key={cat.category} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][
                              index % 5
                            ],
                          },
                        ]}
                      />
                      <View>
                        <KurdishText variant="body" color="#1F2937">
                          {cat.category}
                        </KurdishText>
                        <KurdishText variant="caption" color="#6B7280">
                          {cat.count} قەرز
                        </KurdishText>
                      </View>
                    </View>
                    <KurdishText variant="body" color="#1F2937">
                      {formatCurrency(cat.amount)}
                    </KurdishText>
                  </View>
                ))}
              </GradientCard>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              ڕاپۆرتی پارەدان بە ماوە
            </KurdishText>
            <TrendingDown size={24} color="#10B981" />
          </View>

          <GradientCard>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی پارەدانەکان
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {paymentByPeriodData.totalPayments}
              </KurdishText>
            </View>
            <View style={styles.statRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی بڕ
              </KurdishText>
              <KurdishText variant="body" color="#10B981">
                {formatCurrency(paymentByPeriodData.totalAmount)}
              </KurdishText>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <KurdishText variant="body" color="#6B7280">
                ناوەند
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(paymentByPeriodData.averageAmount)}
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              ڕاپۆرتی کڕیاران بە پلە
            </KurdishText>
            <Award size={24} color="#8B5CF6" />
          </View>

          <GradientCard>
            <View style={{ padding: 16, alignItems: 'center' }}>
              <KurdishText variant="body" color="#6B7280">
                هیچ زانیاریەک نییە
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              ڕاپۆرتی کارمەندان بە پلە
            </KurdishText>
            <Users size={24} color="#06B6D4" />
          </View>

          <GradientCard>
            <View style={{ padding: 16, alignItems: 'center' }}>
              <KurdishText variant="body" color="#6B7280">
                هیچ زانیاریەک نییە
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={{ marginBottom: 12 }}>
            ڕاپۆرتە تایبەتەکان
          </KurdishText>

          <View style={styles.reportGrid}>
            <TouchableOpacity
              style={styles.reportCard}
              onPress={() => router.push('/location-reports' as any)}
            >
              <GradientCard colors={['#3B82F6', '#2563EB']}>
                <View style={styles.reportCardContent}>
                  <MapPin size={32} color="#3B82F6" />
                  <KurdishText variant="body" color="#1F2937">
                    ڕاپۆرتی شار و شوێن
                  </KurdishText>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </GradientCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportCard}
              onPress={() => router.push('/inactive-users-report' as any)}
            >
              <GradientCard colors={['#F59E0B', '#D97706']}>
                <View style={styles.reportCardContent}>
                  <Users size={32} color="#F59E0B" />
                  <KurdishText variant="body" color="#1F2937">
                    کڕیار و کارمەندی بێچالاک
                  </KurdishText>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </GradientCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportCard}
              onPress={() => router.push('/vip-customers-report')}
            >
              <GradientCard colors={['#8B5CF6', '#7C3AED']}>
                <View style={styles.reportCardContent}>
                  <Award size={32} color="#8B5CF6" />
                  <KurdishText variant="body" color="#1F2937">
                    ڕاپۆرتی کڕیارانی VIP
                  </KurdishText>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </GradientCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportCard}
              onPress={() => router.push('/detailed-financial-reports')}
            >
              <GradientCard colors={['#10B981', '#059669']}>
                <View style={styles.reportCardContent}>
                  <Calendar size={32} color="#10B981" />
                  <KurdishText variant="body" color="#1F2937">
                    ڕاپۆرتی تەواو بە بەروار
                  </KurdishText>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </GradientCard>
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterItem: {
    gap: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  yearSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  section: {
    padding: 16,
    paddingTop: 0,
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
  categorySection: {
    marginTop: 16,
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
  reportGrid: {
    gap: 12,
  },
  reportCard: {
    marginBottom: 12,
  },
  reportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
});
