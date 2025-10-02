import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';

const { width } = Dimensions.get('window');

type MonthData = {
  month: string;
  year: number;
  totalDebts: number;
  totalPayments: number;
  newCustomers: number;
  activeCustomers: number;
  netChange: number;
};

export default function MonthlyReportsScreen() {
  const { debts } = useDebts();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = [
    'کانوونی دووەم',
    'شوبات',
    'ئازار',
    'نیسان',
    'ئایار',
    'حوزەیران',
    'تەمموز',
    'ئاب',
    'ئەیلوول',
    'تشرینی یەکەم',
    'تشرینی دووەم',
    'کانوونی یەکەم',
  ];

  const monthlyData = useMemo<MonthData[]>(() => {
    const monthNames = [
      'کانوونی دووەم',
      'شوبات',
      'ئازار',
      'نیسان',
      'ئایار',
      'حوزەیران',
      'تەمموز',
      'ئاب',
      'ئەیلوول',
      'تشرینی یەکەم',
      'تشرینی دووەم',
      'کانوونی یەکەم',
    ];
    
    const data: MonthData[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDebts = debts.filter(debt => {
        const debtDate = new Date(debt.createdAt);
        return debtDate.getMonth() === i && debtDate.getFullYear() === selectedYear;
      });

      const totalDebts = monthDebts.reduce((sum, debt) => sum + debt.amount, 0);
      const totalPayments = monthDebts.reduce((sum, debt) => sum + (debt.amount - debt.remainingAmount), 0);
      const uniqueCustomers = new Set(monthDebts.map(d => d.customerId));

      data.push({
        month: monthNames[i],
        year: selectedYear,
        totalDebts,
        totalPayments,
        newCustomers: uniqueCustomers.size,
        activeCustomers: uniqueCustomers.size,
        netChange: totalDebts - totalPayments,
      });
    }

    return data;
  }, [debts, selectedYear]);

  const currentMonthData = monthlyData[selectedMonth];

  const yearlyTotals = useMemo(() => {
    return {
      totalDebts: monthlyData.reduce((sum, m) => sum + m.totalDebts, 0),
      totalPayments: monthlyData.reduce((sum, m) => sum + m.totalPayments, 0),
      netChange: monthlyData.reduce((sum, m) => sum + m.netChange, 0),
      avgMonthlyDebts: monthlyData.reduce((sum, m) => sum + m.totalDebts, 0) / 12,
    };
  }, [monthlyData]);

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ڕاپۆرتی مانگانە',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          
          <View style={styles.monthDisplay}>
            <KurdishText variant="title" color="#1F2937">
              {months[selectedMonth]}
            </KurdishText>
            <KurdishText variant="body" color="#6B7280">
              {selectedYear.toString()}
            </KurdishText>
          </View>

          <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton}>
            <ChevronRight size={24} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Current Month Stats */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <KurdishText variant="subtitle" color="#1F2937">
              ئاماری مانگی
            </KurdishText>
            <KurdishText variant="subtitle" color="#1F2937">
              {months[selectedMonth]}
            </KurdishText>
          </View>

          <View style={styles.statsGrid}>
            <GradientCard style={styles.statCard}>
              <View style={styles.statIcon}>
                <DollarSign size={24} color="#EF4444" />
              </View>
              <KurdishText variant="caption" color="#6B7280">
                کۆی قەرز
              </KurdishText>
              <View style={styles.amountRow}>
                <KurdishText variant="subtitle" color="#1F2937">
                  {formatCurrency(currentMonthData.totalDebts)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  IQD
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={24} color="#10B981" />
              </View>
              <KurdishText variant="caption" color="#6B7280">
                کۆی پارەدان
              </KurdishText>
              <View style={styles.amountRow}>
                <KurdishText variant="subtitle" color="#1F2937">
                  {formatCurrency(currentMonthData.totalPayments)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  IQD
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard style={styles.statCard}>
              <View style={styles.statIcon}>
                <Users size={24} color="#3B82F6" />
              </View>
              <KurdishText variant="caption" color="#6B7280">
                کڕیاری چالاک
              </KurdishText>
              <KurdishText variant="subtitle" color="#1F2937">
                {currentMonthData.activeCustomers}
              </KurdishText>
            </GradientCard>

            <GradientCard style={styles.statCard}>
              <View style={styles.statIcon}>
                {currentMonthData.netChange >= 0 ? (
                  <TrendingUp size={24} color="#10B981" />
                ) : (
                  <TrendingDown size={24} color="#EF4444" />
                )}
              </View>
              <KurdishText variant="caption" color="#6B7280">
                گۆڕانی خاڵیص
              </KurdishText>
              <View style={styles.amountRow}>
                <KurdishText 
                  variant="subtitle" 
                  color={currentMonthData.netChange >= 0 ? '#10B981' : '#EF4444'}
                >
                  {formatCurrency(Math.abs(currentMonthData.netChange))}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  IQD
                </KurdishText>
              </View>
            </GradientCard>
          </View>
        </View>

        {/* Yearly Summary */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <KurdishText variant="subtitle" color="#1F2937">
              پوختەی ساڵانە -
            </KurdishText>
            <KurdishText variant="subtitle" color="#1F2937">
              {selectedYear.toString()}
            </KurdishText>
          </View>

          <GradientCard>
            <View style={styles.yearlyRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی گشتی قەرز
              </KurdishText>
              <View style={styles.amountRow}>
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(yearlyTotals.totalDebts)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  IQD
                </KurdishText>
              </View>
            </View>

            <View style={styles.yearlyRow}>
              <KurdishText variant="body" color="#6B7280">
                کۆی گشتی پارەدان
              </KurdishText>
              <View style={styles.amountRow}>
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(yearlyTotals.totalPayments)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  IQD
                </KurdishText>
              </View>
            </View>

            <View style={styles.yearlyRow}>
              <KurdishText variant="body" color="#6B7280">
                گۆڕانی خاڵیص
              </KurdishText>
              <View style={styles.amountRow}>
                <KurdishText 
                  variant="body" 
                  color={yearlyTotals.netChange >= 0 ? '#10B981' : '#EF4444'}
                >
                  {formatCurrency(Math.abs(yearlyTotals.netChange))}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  IQD
                </KurdishText>
              </View>
            </View>

            <View style={styles.yearlyRow}>
              <KurdishText variant="body" color="#6B7280">
                مامناوەندی مانگانە
              </KurdishText>
              <View style={styles.amountRow}>
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(yearlyTotals.avgMonthlyDebts)}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  IQD
                </KurdishText>
              </View>
            </View>
          </GradientCard>
        </View>

        {/* Monthly Breakdown */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            وردەکاریەکانی مانگەکان
          </KurdishText>

          {monthlyData.map((data, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedMonth(index)}
            >
              <GradientCard 
                style={[
                  styles.monthCard,
                  selectedMonth === index && styles.monthCardActive
                ]}
              >
                <View style={styles.monthCardHeader}>
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {data.month}
                    </KurdishText>
                    <View style={styles.customerCount}>
                      <KurdishText variant="caption" color="#6B7280">
                        {data.activeCustomers.toString()}
                      </KurdishText>
                      <KurdishText variant="caption" color="#6B7280">
                        کڕیار
                      </KurdishText>
                    </View>
                  </View>
                  <View style={styles.monthCardStats}>
                    <View style={styles.monthCardStat}>
                      <KurdishText variant="caption" color="#EF4444">
                        قەرز
                      </KurdishText>
                      <KurdishText variant="caption" color="#1F2937">
                        {formatCurrency(data.totalDebts)}
                      </KurdishText>
                    </View>
                    <View style={styles.monthCardStat}>
                      <KurdishText variant="caption" color="#10B981">
                        پارەدان
                      </KurdishText>
                      <KurdishText variant="caption" color="#1F2937">
                        {formatCurrency(data.totalPayments)}
                      </KurdishText>
                    </View>
                  </View>
                </View>
              </GradientCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <TouchableOpacity>
            <GradientCard style={styles.exportCard}>
              <Download size={24} color="#1E3A8A" />
              <KurdishText variant="body" color="#1E3A8A">
                داگرتنی ڕاپۆرت
              </KurdishText>
            </GradientCard>
          </TouchableOpacity>
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthButton: {
    padding: 8,
  },
  monthDisplay: {
    alignItems: 'center',
    gap: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerCount: {
    flexDirection: 'row',
    gap: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  yearlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  monthCard: {
    marginBottom: 12,
  },
  monthCardActive: {
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  monthCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthCardStats: {
    gap: 8,
    alignItems: 'flex-end',
  },
  monthCardStat: {
    alignItems: 'flex-end',
    gap: 2,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
});
