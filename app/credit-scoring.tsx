import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { TrendingUp, TrendingDown, AlertCircle, Search, RefreshCw, Award, AlertTriangle } from 'lucide-react-native';
import { usePrediction } from '@/hooks/prediction-context';
import { RiskLevel } from '@/types/prediction';

const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#DC2626',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'کەم',
  medium: 'مامناوەند',
  high: 'بەرز',
  critical: 'زۆر بەرز',
};

export default function CreditScoring() {
  const {
    creditScores,
    predictions,
    riskAnalyses,
    loading,
    calculateStats,
    analyzeTrends,
    refreshAnalysis,
  } = usePrediction();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');

  const stats = calculateStats();
  const trends = analyzeTrends();

  const filteredScores = creditScores.filter(score => {
    const matchesSearch = score.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         score.customerId.includes(searchQuery);
    const matchesRisk = filterRisk === 'all' || score.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable' | 'improving' | 'declining') => {
    if (trend === 'increasing' || trend === 'improving') {
      return <TrendingUp size={16} color="#10B981" />;
    } else if (trend === 'decreasing' || trend === 'declining') {
      return <TrendingDown size={16} color="#DC2626" />;
    }
    return null;
  };

  const getTrendText = (trend: 'increasing' | 'decreasing' | 'stable' | 'improving' | 'declining') => {
    const labels = {
      increasing: 'زیادبوون',
      decreasing: 'کەمبوون',
      stable: 'جێگیر',
      improving: 'باشبوون',
      declining: 'خراپبوون',
    };
    return labels[trend];
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'سکۆری کڕیار و پێشبینی',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#FFFFFF',
        }}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshAnalysis} />
        }
      >
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCustomersAnalyzed}</Text>
              <Text style={styles.statLabel}>کڕیاری شیکراو</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.averageCreditScore}</Text>
              <Text style={styles.statLabel}>ناوەندی سکۆر</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#DC2626' }]}>{stats.highRiskCustomers}</Text>
              <Text style={styles.statLabel}>مەترسی بەرز</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.predictedDefaultsThisMonth}</Text>
              <Text style={styles.statLabel}>پێشبینی شکست</Text>
            </View>
          </View>

          <View style={styles.trendsCard}>
            <Text style={styles.trendsTitle}>شیکاری ڕەوت</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendLabel}>قەرز:</Text>
              <View style={styles.trendValue}>
                {getTrendIcon(trends.totalDebtTrend)}
                <Text style={styles.trendText}>{getTrendText(trends.totalDebtTrend)}</Text>
              </View>
            </View>
            <View style={styles.trendRow}>
              <Text style={styles.trendLabel}>پارەدان:</Text>
              <View style={styles.trendValue}>
                {getTrendIcon(trends.paymentRateTrend)}
                <Text style={styles.trendText}>{getTrendText(trends.paymentRateTrend)}</Text>
              </View>
            </View>
            <View style={styles.predictionBox}>
              <Text style={styles.predictionTitle}>پێشبینی مانگی داهاتوو</Text>
              <Text style={styles.predictionText}>
                قەرز: {(trends.predictions.nextMonthDebt / 1000).toFixed(0)}K IQD
              </Text>
              <Text style={styles.predictionText}>
                پارەدان: {trends.predictions.nextMonthPayments}
              </Text>
              <Text style={styles.predictionText}>
                ڕێژەی شکست: {trends.predictions.expectedDefaultRate}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="گەڕان بە ناو یان کۆد..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterButton, filterRisk === 'all' && styles.activeFilter]}
              onPress={() => setFilterRisk('all')}
            >
              <Text style={[styles.filterText, filterRisk === 'all' && styles.activeFilterText]}>
                هەموو
              </Text>
            </TouchableOpacity>
            {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map(risk => (
              <TouchableOpacity
                key={risk}
                style={[
                  styles.filterButton,
                  filterRisk === risk && styles.activeFilter,
                  { borderColor: RISK_COLORS[risk] },
                ]}
                onPress={() => setFilterRisk(risk)}
              >
                <Text style={[
                  styles.filterText,
                  filterRisk === risk && styles.activeFilterText,
                ]}>
                  {RISK_LABELS[risk]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.scoresList}>
          {filteredScores.map(score => {
            const prediction = predictions.find(p => p.customerId === score.customerId);
            const risk = riskAnalyses.find(r => r.customerId === score.customerId);

            return (
              <View key={score.customerId} style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{score.customerName}</Text>
                    <Text style={styles.customerId}>کۆد: {score.customerId}</Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: RISK_COLORS[score.riskLevel] }]}>
                    <Text style={styles.scoreValue}>{score.score}</Text>
                  </View>
                </View>

                <View style={[styles.riskBadge, { backgroundColor: `${RISK_COLORS[score.riskLevel]}20` }]}>
                  <AlertCircle size={16} color={RISK_COLORS[score.riskLevel]} />
                  <Text style={[styles.riskText, { color: RISK_COLORS[score.riskLevel] }]}>
                    مەترسی {RISK_LABELS[score.riskLevel]}
                  </Text>
                </View>

                <View style={styles.factorsGrid}>
                  <View style={styles.factorItem}>
                    <Text style={styles.factorLabel}>مێژووی پارەدان</Text>
                    <View style={styles.factorBar}>
                      <View style={[styles.factorFill, { width: `${score.factors.paymentHistory}%` }]} />
                    </View>
                    <Text style={styles.factorValue}>{score.factors.paymentHistory}%</Text>
                  </View>

                  <View style={styles.factorItem}>
                    <Text style={styles.factorLabel}>بڕی قەرز</Text>
                    <View style={styles.factorBar}>
                      <View style={[styles.factorFill, { width: `${score.factors.debtAmount}%` }]} />
                    </View>
                    <Text style={styles.factorValue}>{score.factors.debtAmount}%</Text>
                  </View>

                  <View style={styles.factorItem}>
                    <Text style={styles.factorLabel}>ڕێژەی دواکەوتن</Text>
                    <View style={styles.factorBar}>
                      <View style={[styles.factorFill, { width: `${score.factors.overdueRate}%` }]} />
                    </View>
                    <Text style={styles.factorValue}>{score.factors.overdueRate}%</Text>
                  </View>
                </View>

                {prediction && (
                  <View style={styles.predictionSection}>
                    <Text style={styles.sectionTitle}>پێشبینی پارەدانی داهاتوو</Text>
                    <View style={styles.predictionInfo}>
                      <Text style={styles.predictionLabel}>بەروار:</Text>
                      <Text style={styles.predictionValue}>
                        {new Date(prediction.predictedPaymentDate).toLocaleDateString('ku')}
                      </Text>
                    </View>
                    <View style={styles.predictionInfo}>
                      <Text style={styles.predictionLabel}>بڕ:</Text>
                      <Text style={styles.predictionValue}>
                        {prediction.amount.toLocaleString()} IQD
                      </Text>
                    </View>
                    <View style={styles.predictionInfo}>
                      <Text style={styles.predictionLabel}>دڵنیایی:</Text>
                      <Text style={styles.predictionValue}>{prediction.confidence}%</Text>
                    </View>
                  </View>
                )}

                {risk && (
                  <View style={styles.riskSection}>
                    <Text style={styles.sectionTitle}>شیکاری مەترسی</Text>
                    <View style={styles.riskInfo}>
                      <Text style={styles.riskLabel}>ئەگەری شکست:</Text>
                      <Text style={[styles.riskValue, { color: RISK_COLORS[risk.riskLevel] }]}>
                        {risk.probabilityOfDefault}%
                      </Text>
                    </View>
                    <View style={styles.riskInfo}>
                      <Text style={styles.riskLabel}>سنووری پێشنیارکراو:</Text>
                      <Text style={styles.riskValue}>
                        {(risk.recommendedCreditLimit / 1000).toFixed(0)}K IQD
                      </Text>
                    </View>

                    {risk.warnings.length > 0 && (
                      <View style={styles.warningsBox}>
                        <View style={styles.warningsHeader}>
                          <AlertTriangle size={16} color="#F59E0B" />
                          <Text style={styles.warningsTitle}>ئاگاداری</Text>
                        </View>
                        {risk.warnings.map((warning, index) => (
                          <Text key={index} style={styles.warningText}>• {warning}</Text>
                        ))}
                      </View>
                    )}

                    {risk.strengths.length > 0 && (
                      <View style={styles.strengthsBox}>
                        <View style={styles.strengthsHeader}>
                          <Award size={16} color="#10B981" />
                          <Text style={styles.strengthsTitle}>خاڵی بەهێز</Text>
                        </View>
                        {risk.strengths.map((strength, index) => (
                          <Text key={index} style={styles.strengthText}>• {strength}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {score.recommendations.length > 0 && (
                  <View style={styles.recommendationsBox}>
                    <Text style={styles.recommendationsTitle}>پێشنیارەکان</Text>
                    {score.recommendations.map((rec, index) => (
                      <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {filteredScores.length === 0 && (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>هیچ زانیارییەک نەدۆزرایەوە</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshAnalysis}
        disabled={loading}
      >
        <RefreshCw size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  trendsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  predictionBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  searchSection: {
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scoresList: {
    padding: 16,
    gap: 16,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerId: {
    fontSize: 12,
    color: '#6B7280',
  },
  scoreBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  factorsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  factorItem: {
    gap: 4,
  },
  factorLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  factorBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
  },
  factorValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  predictionSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  predictionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  predictionValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  riskSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  riskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  riskLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  riskValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  warningsBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  warningsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  warningText: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 8,
  },
  strengthsBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
  },
  strengthsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  strengthsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  strengthText: {
    fontSize: 11,
    color: '#065F46',
    marginLeft: 8,
  },
  recommendationsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
