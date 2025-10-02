import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KurdishText } from '@/components/KurdishText';
import { AnalyticsContext, useAnalytics } from '@/hooks/analytics-context';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
} from 'lucide-react-native';

function PredictiveAnalyticsContent() {
  const router = useRouter();
  const { predictions, insights, isLoading, getDebtForecast } = useAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [forecast, setForecast] = useState<any>(null);

  const loadForecast = async () => {
    const data = await getDebtForecast(selectedPeriod);
    setForecast(data);
  };

  React.useEffect(() => {
    loadForecast();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ku', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <KurdishText style={styles.loadingText}>چاوەڕوان بە...</KurdishText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={24} color="#6366f1" />
          <KurdishText style={styles.sectionTitle}>پێشبینی قەرز</KurdishText>
        </View>

        <View style={styles.periodSelector}>
          {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <KurdishText
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'week' && 'هەفتە'}
                {period === 'month' && 'مانگ'}
                {period === 'quarter' && 'چارەک'}
                {period === 'year' && 'ساڵ'}
              </KurdishText>
            </TouchableOpacity>
          ))}
        </View>

        {forecast && (
          <View style={styles.forecastCard}>
            <View style={styles.forecastRow}>
              <View style={styles.forecastItem}>
                <KurdishText style={styles.forecastLabel}>قەرزی نوێ</KurdishText>
                <KurdishText style={styles.forecastValue}>
                  {forecast.predictions.expectedNewDebts.toFixed(0)}
                </KurdishText>
              </View>
              <View style={styles.forecastItem}>
                <KurdishText style={styles.forecastLabel}>پارەدان</KurdishText>
                <KurdishText style={styles.forecastValue}>
                  {formatCurrency(forecast.predictions.expectedPayments)} IQD
                </KurdishText>
              </View>
            </View>
            <View style={styles.forecastRow}>
              <View style={styles.forecastItem}>
                <KurdishText style={styles.forecastLabel}>باڵانسی چاوەڕوانکراو</KurdishText>
                <KurdishText style={styles.forecastValue}>
                  {formatCurrency(forecast.predictions.expectedBalance)} IQD
                </KurdishText>
              </View>
              <View style={styles.forecastItem}>
                <KurdishText style={styles.forecastLabel}>متمانە</KurdishText>
                <KurdishText style={styles.forecastValue}>
                  {forecast.predictions.confidence}%
                </KurdishText>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={24} color="#6366f1" />
          <KurdishText style={styles.sectionTitle}>پێشبینی کڕیاران</KurdishText>
        </View>

        {predictions.slice(0, 10).map((pred) => (
          <TouchableOpacity
            key={pred.customerId}
            style={styles.predictionCard}
            onPress={() => router.push(`/customer-detail/${pred.customerId}`)}
          >
            <View style={styles.predictionHeader}>
              <View style={styles.predictionNameRow}>
                <KurdishText style={styles.predictionName}>{pred.customerName}</KurdishText>
                <View
                  style={[
                    styles.riskBadge,
                    pred.predictions.riskLevel === 'low' && styles.riskLow,
                    pred.predictions.riskLevel === 'medium' && styles.riskMedium,
                    pred.predictions.riskLevel === 'high' && styles.riskHigh,
                  ]}
                >
                  <KurdishText style={styles.riskText}>
                    {pred.predictions.riskLevel === 'low' && 'کەم'}
                    {pred.predictions.riskLevel === 'medium' && 'مامناوەند'}
                    {pred.predictions.riskLevel === 'high' && 'بەرز'}
                  </KurdishText>
                </View>
              </View>
              <ArrowRight size={20} color="#9CA3AF" />
            </View>

            <View style={styles.predictionDetails}>
              <View style={styles.predictionRow}>
                <View style={styles.predictionItem}>
                  <Calendar size={16} color="#6B7280" />
                  <KurdishText style={styles.predictionLabel}>
                    {formatDate(pred.predictions.nextPaymentDate)}
                  </KurdishText>
                </View>
                <View style={styles.predictionItem}>
                  <DollarSign size={16} color="#6B7280" />
                  <KurdishText style={styles.predictionLabel}>
                    {formatCurrency(pred.predictions.nextPaymentAmount)} IQD
                  </KurdishText>
                </View>
              </View>

              <View style={styles.trendRow}>
                {pred.trends.paymentTrend === 'improving' && (
                  <View style={styles.trendBadge}>
                    <TrendingUp size={14} color="#10B981" />
                    <KurdishText style={styles.trendTextPositive}>باشتر دەبێت</KurdishText>
                  </View>
                )}
                {pred.trends.paymentTrend === 'declining' && (
                  <View style={styles.trendBadge}>
                    <TrendingDown size={14} color="#EF4444" />
                    <KurdishText style={styles.trendTextNegative}>خراپتر دەبێت</KurdishText>
                  </View>
                )}
                {pred.trends.paymentTrend === 'stable' && (
                  <View style={styles.trendBadge}>
                    <Info size={14} color="#F59E0B" />
                    <KurdishText style={styles.trendTextNeutral}>جێگیرە</KurdishText>
                  </View>
                )}
              </View>

              <View style={styles.actionRow}>
                <KurdishText style={styles.actionLabel}>کرداری پێشنیارکراو:</KurdishText>
                <KurdishText style={styles.actionText}>
                  {pred.predictions.recommendedAction}
                </KurdishText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={24} color="#6366f1" />
          <KurdishText style={styles.sectionTitle}>تێبینیەکان</KurdishText>
        </View>

        {insights.map((insight) => (
          <View
            key={insight.id}
            style={[
              styles.insightCard,
              insight.type === 'warning' && styles.insightWarning,
              insight.type === 'success' && styles.insightSuccess,
              insight.type === 'info' && styles.insightInfo,
            ]}
          >
            <View style={styles.insightHeader}>
              {insight.type === 'warning' && <AlertTriangle size={20} color="#EF4444" />}
              {insight.type === 'success' && <CheckCircle size={20} color="#10B981" />}
              {insight.type === 'info' && <Info size={20} color="#3B82F6" />}
              <KurdishText style={styles.insightTitle}>{insight.title}</KurdishText>
            </View>
            <KurdishText style={styles.insightDescription}>{insight.description}</KurdishText>
            {insight.suggestedAction && (
              <View style={styles.insightActionRow}>
                <KurdishText style={styles.insightActionLabel}>کرداری پێشنیارکراو:</KurdishText>
                <KurdishText style={styles.insightAction}>{insight.suggestedAction}</KurdishText>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function PredictiveAnalyticsScreen() {
  return (
    <AnalyticsContext>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'ڕاپۆرتی پێشبینی',
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontFamily: 'Rabar_029' },
          }}
        />
        <PredictiveAnalyticsContent />
      </SafeAreaView>
    </AnalyticsContext>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6366f1',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600' as const,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  forecastCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 12,
  },
  forecastItem: {
    flex: 1,
  },
  forecastLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  forecastValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  predictionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  predictionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  predictionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskLow: {
    backgroundColor: '#D1FAE5',
  },
  riskMedium: {
    backgroundColor: '#FEF3C7',
  },
  riskHigh: {
    backgroundColor: '#FEE2E2',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  predictionDetails: {
    gap: 8,
  },
  predictionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  trendTextPositive: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600' as const,
  },
  trendTextNegative: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  trendTextNeutral: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600' as const,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600' as const,
  },
  insightCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  insightWarning: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  insightSuccess: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#10B981',
  },
  insightInfo: {
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#3B82F6',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  insightActionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  insightActionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  insightAction: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600' as const,
  },
});
