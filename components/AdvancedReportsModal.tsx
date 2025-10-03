import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, TrendingUp, TrendingDown, DollarSign, Calendar, Users, BarChart3 } from 'lucide-react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { KurdishText } from './KurdishText';

interface AdvancedReportsModalProps {
  visible: boolean;
  onClose: () => void;
  debts: any[];
  payments: any[];
  customers: any[];
}

const { width: screenWidth } = Dimensions.get('window');

export function AdvancedReportsModal({
  visible,
  onClose,
  debts,
  payments,
  customers,
}: AdvancedReportsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'pie'>('line');

  const statistics = useMemo(() => {
    const totalDebts = debts.reduce((sum, d) => sum + d.amount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const activeCustomers = customers.filter(c => 
      debts.some(d => d.customerId === c.id && d.status === 'active')
    ).length;
    
    const avgDebtPerCustomer = customers.length > 0 ? totalDebts / customers.length : 0;
    const paymentRate = totalDebts > 0 ? (totalPayments / totalDebts) * 100 : 0;
    
    return {
      totalDebts,
      totalPayments,
      remainingDebt,
      activeCustomers,
      avgDebtPerCustomer,
      paymentRate,
    };
  }, [debts, payments, customers]);

  const chartData = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const debtData: number[] = [];
    const paymentData: number[] = [];

    if (selectedPeriod === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('ckb-IQ', { weekday: 'short' }));
        
        const dayDebts = debts.filter(d => {
          const debtDate = new Date(d.createdAt);
          return debtDate.toDateString() === date.toDateString();
        }).reduce((sum, d) => sum + d.amount, 0);
        
        const dayPayments = payments.filter(p => {
          const paymentDate = new Date(p.paymentDate);
          return paymentDate.toDateString() === date.toDateString();
        }).reduce((sum, p) => sum + p.amount, 0);
        
        debtData.push(dayDebts / 1000);
        paymentData.push(dayPayments / 1000);
      }
    } else if (selectedPeriod === 'month') {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('ckb-IQ', { month: 'short' }));
        
        const monthDebts = debts.filter(d => {
          const debtDate = new Date(d.createdAt);
          return debtDate.getMonth() === date.getMonth() && 
                 debtDate.getFullYear() === date.getFullYear();
        }).reduce((sum, d) => sum + d.amount, 0);
        
        const monthPayments = payments.filter(p => {
          const paymentDate = new Date(p.paymentDate);
          return paymentDate.getMonth() === date.getMonth() && 
                 paymentDate.getFullYear() === date.getFullYear();
        }).reduce((sum, p) => sum + p.amount, 0);
        
        debtData.push(monthDebts / 1000);
        paymentData.push(monthPayments / 1000);
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        labels.push(date.getFullYear().toString());
        
        const yearDebts = debts.filter(d => {
          const debtDate = new Date(d.createdAt);
          return debtDate.getFullYear() === date.getFullYear();
        }).reduce((sum, d) => sum + d.amount, 0);
        
        const yearPayments = payments.filter(p => {
          const paymentDate = new Date(p.paymentDate);
          return paymentDate.getFullYear() === date.getFullYear();
        }).reduce((sum, p) => sum + p.amount, 0);
        
        debtData.push(yearDebts / 1000);
        paymentData.push(yearPayments / 1000);
      }
    }

    return {
      labels,
      datasets: [
        {
          data: debtData,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: paymentData,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [debts, payments, selectedPeriod]);

  const pieData = [
    {
      name: 'قەرزی ماوە',
      population: statistics.remainingDebt,
      color: '#EF4444',
      legendFontColor: '#1F2937',
      legendFontSize: 12,
    },
    {
      name: 'پارەدراوەتەوە',
      population: statistics.totalPayments,
      color: '#10B981',
      legendFontColor: '#1F2937',
      legendFontSize: 12,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <KurdishText style={styles.title}>ڕاپۆرتی پێشکەوتوو</KurdishText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'week' && styles.activePeriod]}
                onPress={() => setSelectedPeriod('week')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'week' && styles.activePeriodText]}>
                  هەفتە
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'month' && styles.activePeriod]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'month' && styles.activePeriodText]}>
                  مانگ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'year' && styles.activePeriod]}
                onPress={() => setSelectedPeriod('year')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'year' && styles.activePeriodText]}>
                  ساڵ
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.redCard]}>
                <DollarSign size={24} color="#EF4444" />
                <KurdishText style={styles.statLabel}>کۆی قەرزەکان</KurdishText>
                <Text style={styles.statValue}>{formatCurrency(statistics.totalDebts)}</Text>
              </View>

              <View style={[styles.statCard, styles.greenCard]}>
                <TrendingUp size={24} color="#10B981" />
                <KurdishText style={styles.statLabel}>کۆی پارەدانەکان</KurdishText>
                <Text style={styles.statValue}>{formatCurrency(statistics.totalPayments)}</Text>
              </View>

              <View style={[styles.statCard, styles.orangeCard]}>
                <TrendingDown size={24} color="#F59E0B" />
                <KurdishText style={styles.statLabel}>قەرزی ماوە</KurdishText>
                <Text style={styles.statValue}>{formatCurrency(statistics.remainingDebt)}</Text>
              </View>

              <View style={[styles.statCard, styles.blueCard]}>
                <Users size={24} color="#3B82F6" />
                <KurdishText style={styles.statLabel}>کڕیاری چالاک</KurdishText>
                <Text style={styles.statValue}>{statistics.activeCustomers}</Text>
              </View>
            </View>

            <View style={styles.additionalStats}>
              <View style={styles.additionalStatRow}>
                <KurdishText style={styles.additionalStatLabel}>
                  تێکڕای قەرز بۆ هەر کڕیارێک
                </KurdishText>
                <Text style={styles.additionalStatValue}>
                  {formatCurrency(statistics.avgDebtPerCustomer)}
                </Text>
              </View>
              <View style={styles.additionalStatRow}>
                <KurdishText style={styles.additionalStatLabel}>
                  ڕێژەی پارەدان
                </KurdishText>
                <Text style={[styles.additionalStatValue, { color: '#10B981' }]}>
                  {statistics.paymentRate.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.chartTypeSelector}>
              <TouchableOpacity
                style={[styles.chartTypeButton, selectedChart === 'line' && styles.activeChartType]}
                onPress={() => setSelectedChart('line')}
              >
                <BarChart3 size={20} color={selectedChart === 'line' ? '#fff' : '#3B82F6'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chartTypeButton, selectedChart === 'bar' && styles.activeChartType]}
                onPress={() => setSelectedChart('bar')}
              >
                <BarChart3 size={20} color={selectedChart === 'bar' ? '#fff' : '#3B82F6'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chartTypeButton, selectedChart === 'pie' && styles.activeChartType]}
                onPress={() => setSelectedChart('pie')}
              >
                <Calendar size={20} color={selectedChart === 'pie' ? '#fff' : '#3B82F6'} />
              </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
              {selectedChart === 'line' && (
                <LineChart
                  data={chartData}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: '4', strokeWidth: '2', stroke: '#3B82F6' },
                  }}
                  bezier
                  style={styles.chart}
                />
              )}

              {selectedChart === 'bar' && (
                <BarChart
                  data={chartData}
                  width={screenWidth - 80}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix="k"
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={styles.chart}
                />
              )}

              {selectedChart === 'pie' && (
                <PieChart
                  data={pieData}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              )}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                <KurdishText style={styles.legendText}>قەرزەکان</KurdishText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <KurdishText style={styles.legendText}>پارەدانەکان</KurdishText>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activePeriod: {
    backgroundColor: '#3B82F6',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activePeriodText: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  redCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  greenCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  orangeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  blueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  additionalStats: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  additionalStatLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chartTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  chartTypeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChartType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
