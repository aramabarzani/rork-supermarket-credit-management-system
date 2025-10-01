import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KurdishText } from '@/components/KurdishText';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<TimeRange>('monthly');
  const [isLoading] = useState(false);

  const systemStatsQuery = { data: { totalCustomers: 0, totalDebtAmount: 0, totalPaymentAmount: 0, remainingDebtAmount: 0 } };
  const debtEvalQuery = { data: { totalDebt: 0, averageDebt: 0, maxDebt: 0, minDebt: 0, debtCount: 0 } };
  const paymentEvalQuery = { data: { totalPayment: 0, averagePayment: 0, maxPayment: 0, minPayment: 0, paymentCount: 0 } };
  const customersByRatingQuery = { data: [] };
  const employeesByLevelQuery = { data: [] };
  const comparisonQuery = { data: [] };

  const periods: { value: TimeRange; label: string }[] = [
    { value: 'daily', label: 'ڕۆژانە' },
    { value: 'weekly', label: 'هەفتانە' },
    { value: 'monthly', label: 'مانگانە' },
    { value: 'yearly', label: 'ساڵانە' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: 'ئامار و ئەنالیست',
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#fff',
          }}
        />
        <ActivityIndicator size="large" color="#6366f1" />
        <KurdishText style={styles.loadingText}>چاوەڕوان بە...</KurdishText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ئامار و ئەنالیست',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          <KurdishText style={styles.sectionTitle}>هەڵبژاردنی ماوە</KurdishText>
          <View style={styles.periodButtons}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.value && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <KurdishText
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.value && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
            <Users size={28} color="#fff" />
            <KurdishText style={styles.statValue}>
              {systemStatsQuery.data?.totalCustomers || 0}
            </KurdishText>
            <KurdishText style={styles.statLabel}>کۆی کڕیاران</KurdishText>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
            <DollarSign size={28} color="#fff" />
            <KurdishText style={styles.statValue}>
              {formatCurrency(systemStatsQuery.data?.totalDebtAmount || 0)}
            </KurdishText>
            <KurdishText style={styles.statLabel}>کۆی قەرز</KurdishText>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
            <TrendingUp size={28} color="#fff" />
            <KurdishText style={styles.statValue}>
              {formatCurrency(systemStatsQuery.data?.totalPaymentAmount || 0)}
            </KurdishText>
            <KurdishText style={styles.statLabel}>کۆی پارەدان</KurdishText>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
            <BarChart3 size={28} color="#fff" />
            <KurdishText style={styles.statValue}>
              {formatCurrency(systemStatsQuery.data?.remainingDebtAmount || 0)}
            </KurdishText>
            <KurdishText style={styles.statLabel}>قەرزی ماوە</KurdishText>
          </View>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>هەڵسەنگاندنی قەرز</KurdishText>
          <View style={styles.card}>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>کۆی قەرز</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(debtEvalQuery.data?.totalDebt || 0)}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>تێکڕای قەرز</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(Math.round(debtEvalQuery.data?.averageDebt || 0))}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>بەرزترین قەرز</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(debtEvalQuery.data?.maxDebt || 0)}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>نزمترین قەرز</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(debtEvalQuery.data?.minDebt || 0)}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>ژمارەی قەرزەکان</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {debtEvalQuery.data?.debtCount || 0}
              </KurdishText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>هەڵسەنگاندنی پارەدان</KurdishText>
          <View style={styles.card}>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>کۆی پارەدان</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(paymentEvalQuery.data?.totalPayment || 0)}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>تێکڕای پارەدان</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(Math.round(paymentEvalQuery.data?.averagePayment || 0))}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>بەرزترین پارەدان</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(paymentEvalQuery.data?.maxPayment || 0)}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>نزمترین پارەدان</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {formatCurrency(paymentEvalQuery.data?.minPayment || 0)}
              </KurdishText>
            </View>
            <View style={styles.evaluationRow}>
              <KurdishText style={styles.evaluationLabel}>ژمارەی پارەدانەکان</KurdishText>
              <KurdishText style={styles.evaluationValue}>
                {paymentEvalQuery.data?.paymentCount || 0}
              </KurdishText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>کڕیاران بە پلە</KurdishText>
          {customersByRatingQuery.data && customersByRatingQuery.data.length > 0 ? customersByRatingQuery.data.map((item: any, index: number) => (
            <View key={index} style={styles.card}>
              <View style={styles.ratingHeader}>
                <KurdishText style={styles.ratingTitle}>
                  {item.rating === 'VIP' ? 'VIP' : 'ئاسایی'}
                </KurdishText>
                <View
                  style={[
                    styles.ratingBadge,
                    { backgroundColor: item.rating === 'VIP' ? '#f59e0b' : '#6366f1' },
                  ]}
                >
                  <KurdishText style={styles.ratingBadgeText}>{item.count}</KurdishText>
                </View>
              </View>
              <View style={styles.evaluationRow}>
                <KurdishText style={styles.evaluationLabel}>کۆی قەرز</KurdishText>
                <KurdishText style={styles.evaluationValue}>
                  {formatCurrency(item.totalDebt)}
                </KurdishText>
              </View>
              <View style={styles.evaluationRow}>
                <KurdishText style={styles.evaluationLabel}>کۆی پارەدان</KurdishText>
                <KurdishText style={styles.evaluationValue}>
                  {formatCurrency(item.totalPayment)}
                </KurdishText>
              </View>
              <View style={styles.evaluationRow}>
                <KurdishText style={styles.evaluationLabel}>تێکڕای قەرز</KurdishText>
                <KurdishText style={styles.evaluationValue}>
                  {formatCurrency(Math.round(item.averageDebt))}
                </KurdishText>
              </View>
            </View>
          )) : (
            <View style={styles.card}>
              <KurdishText style={styles.evaluationLabel}>هیچ داتایەک نییە</KurdishText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>کارمەندان بە پلە</KurdishText>
          {employeesByLevelQuery.data && employeesByLevelQuery.data.length > 0 ? employeesByLevelQuery.data.map((item: any, index: number) => (
            <View key={index} style={styles.card}>
              <View style={styles.ratingHeader}>
                <KurdishText style={styles.ratingTitle}>
                  {item.level === 'senior'
                    ? 'بەرز'
                    : item.level === 'mid'
                      ? 'ناوەند'
                      : 'نوێ'}
                </KurdishText>
                <View style={[styles.ratingBadge, { backgroundColor: '#10b981' }]}>
                  <KurdishText style={styles.ratingBadgeText}>{item.count}</KurdishText>
                </View>
              </View>
              <View style={styles.evaluationRow}>
                <KurdishText style={styles.evaluationLabel}>قەرزی دروستکراو</KurdishText>
                <KurdishText style={styles.evaluationValue}>
                  {item.totalDebtsCreated}
                </KurdishText>
              </View>
              <View style={styles.evaluationRow}>
                <KurdishText style={styles.evaluationLabel}>پارەدانی پرۆسێسکراو</KurdishText>
                <KurdishText style={styles.evaluationValue}>
                  {item.totalPaymentsProcessed}
                </KurdishText>
              </View>
              <View style={styles.evaluationRow}>
                <KurdishText style={styles.evaluationLabel}>تێکڕای کارایی</KurdishText>
                <KurdishText style={styles.evaluationValue}>
                  {item.averagePerformance}
                </KurdishText>
              </View>
            </View>
          )) : (
            <View style={styles.card}>
              <KurdishText style={styles.evaluationLabel}>هیچ داتایەک نییە</KurdishText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>بەراوردی قەرز و پارەدان</KurdishText>
          {comparisonQuery.data && comparisonQuery.data.length > 0 ? comparisonQuery.data.map((item: any, index: number) => (
            <View key={index} style={styles.card}>
              <View style={styles.comparisonHeader}>
                <Calendar size={20} color="#6366f1" />
                <KurdishText style={styles.comparisonPeriod}>{item.period}</KurdishText>
              </View>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <KurdishText style={styles.comparisonLabel}>قەرز</KurdishText>
                  <KurdishText style={[styles.comparisonValue, { color: '#ef4444' }]}>
                    {formatCurrency(item.debt)}
                  </KurdishText>
                </View>
                <View style={styles.comparisonItem}>
                  <KurdishText style={styles.comparisonLabel}>پارەدان</KurdishText>
                  <KurdishText style={[styles.comparisonValue, { color: '#10b981' }]}>
                    {formatCurrency(item.payment)}
                  </KurdishText>
                </View>
                <View style={styles.comparisonItem}>
                  <KurdishText style={styles.comparisonLabel}>جیاوازی</KurdishText>
                  <KurdishText style={[styles.comparisonValue, { color: '#f59e0b' }]}>
                    {formatCurrency(item.difference)}
                  </KurdishText>
                </View>
              </View>
            </View>
          )) : (
            <View style={styles.card}>
              <KurdishText style={styles.evaluationLabel}>هیچ داتایەک نییە</KurdishText>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6366f1' }]}
            onPress={() => router.push('/location-reports')}
          >
            <MapPin size={20} color="#fff" />
            <KurdishText style={styles.actionButtonText}>ڕاپۆرتی شوێن</KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => router.push('/realtime-monitoring')}
          >
            <BarChart3 size={20} color="#fff" />
            <KurdishText style={styles.actionButtonText}>چاوەڕوانی سیستەم</KurdishText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6366f1',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600' as const,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  evaluationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  evaluationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  evaluationValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
  },
  comparisonPeriod: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
