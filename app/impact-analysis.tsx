import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { 
  BarChart3, 
  Download, 
  AlertTriangle,
} from 'lucide-react-native';
import type { ImpactAnalysis } from '@/types/monitoring';

export default function ImpactAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee' | 'customer' | 'all'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  const startDate = new Date();
  if (dateRange === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (dateRange === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const statisticsQuery = trpc.monitoring.impact.getStatistics.useQuery({
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
    role: selectedRole === 'all' ? undefined : selectedRole,
  });

  const poorPerformanceQuery = trpc.monitoring.impact.checkPoorPerformance.useQuery({
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
    threshold: 10,
  });

  const generateReportMutation = trpc.monitoring.impact.generateReport.useMutation({
    onSuccess: (data) => {
      Alert.alert('سەرکەوتوو', 'ڕاپۆرت بە سەرکەوتوویی دروست کرا');
    },
    onError: (error) => {
      Alert.alert('هەڵە', 'کێشە لە دروستکردنی ڕاپۆرت');
    },
  });

  const exportReportMutation = trpc.monitoring.impact.exportReport.useMutation({
    onSuccess: (data) => {
      Alert.alert('سەرکەوتوو', data.message);
    },
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate({
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      role: selectedRole === 'all' ? undefined : selectedRole,
    });
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    if (generateReportMutation.data?.report) {
      exportReportMutation.mutate({
        reportId: generateReportMutation.data.report.id,
        format,
      });
    } else {
      Alert.alert('هەڵە', 'تکایە سەرەتا ڕاپۆرت دروست بکە');
    }
  };

  const getPerformanceColor = (performance: ImpactAnalysis['performance']) => {
    switch (performance) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'average':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPerformanceLabel = (performance: ImpactAnalysis['performance']) => {
    switch (performance) {
      case 'excellent':
        return 'نایاب';
      case 'good':
        return 'باش';
      case 'average':
        return 'مامناوەند';
      case 'poor':
        return 'لاواز';
      default:
        return 'نەزانراو';
    }
  };

  const renderImpactCard = (impact: ImpactAnalysis) => (
    <View key={impact.userId} style={styles.impactCard}>
      <View style={styles.impactHeader}>
        <View style={styles.impactInfo}>
          <Text style={styles.impactName}>{impact.userName}</Text>
          <Text style={styles.impactRole}>
            {impact.userRole === 'admin' ? 'بەڕێوەبەر' : 
             impact.userRole === 'employee' ? 'کارمەند' : 'کڕیار'}
          </Text>
        </View>
        <View style={[styles.performanceBadge, { backgroundColor: getPerformanceColor(impact.performance) }]}>
          <Text style={styles.performanceText}>{getPerformanceLabel(impact.performance)}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>کۆی کارەکان</Text>
          <Text style={styles.statValue}>{impact.totalActions}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>قەرز</Text>
          <Text style={styles.statValue}>{impact.debtActions}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>پارەدان</Text>
          <Text style={styles.statValue}>{impact.paymentActions}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>کڕیار</Text>
          <Text style={styles.statValue}>{impact.customerActions}</Text>
        </View>
      </View>

      {impact.totalAmount !== undefined && impact.totalAmount > 0 && (
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>کۆی بڕ:</Text>
          <Text style={styles.amountValue}>{impact.totalAmount.toLocaleString()} د.ع</Text>
        </View>
      )}
    </View>
  );

  if (statisticsQuery.isLoading) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: 'هەڵسەنگاندنی کاریگەری' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>بارکردنی زانیاری...</Text>
        </View>
      </View>
    );
  }

  const statistics = statisticsQuery.data;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen 
        options={{ 
          title: 'هەڵسەنگاندنی کاریگەری',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleGenerateReport}
                disabled={generateReportMutation.isPending}
              >
                <BarChart3 size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.filtersSection}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>ماوە:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, dateRange === 'week' && styles.filterButtonActive]}
                onPress={() => setDateRange('week')}
              >
                <Text style={[styles.filterButtonText, dateRange === 'week' && styles.filterButtonTextActive]}>
                  هەفتە
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, dateRange === 'month' && styles.filterButtonActive]}
                onPress={() => setDateRange('month')}
              >
                <Text style={[styles.filterButtonText, dateRange === 'month' && styles.filterButtonTextActive]}>
                  مانگ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, dateRange === 'year' && styles.filterButtonActive]}
                onPress={() => setDateRange('year')}
              >
                <Text style={[styles.filterButtonText, dateRange === 'year' && styles.filterButtonTextActive]}>
                  ساڵ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>رۆڵ:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, selectedRole === 'all' && styles.filterButtonActive]}
                onPress={() => setSelectedRole('all')}
              >
                <Text style={[styles.filterButtonText, selectedRole === 'all' && styles.filterButtonTextActive]}>
                  هەموو
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, selectedRole === 'admin' && styles.filterButtonActive]}
                onPress={() => setSelectedRole('admin')}
              >
                <Text style={[styles.filterButtonText, selectedRole === 'admin' && styles.filterButtonTextActive]}>
                  بەڕێوەبەر
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, selectedRole === 'employee' && styles.filterButtonActive]}
                onPress={() => setSelectedRole('employee')}
              >
                <Text style={[styles.filterButtonText, selectedRole === 'employee' && styles.filterButtonTextActive]}>
                  کارمەند
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, selectedRole === 'customer' && styles.filterButtonActive]}
                onPress={() => setSelectedRole('customer')}
              >
                <Text style={[styles.filterButtonText, selectedRole === 'customer' && styles.filterButtonTextActive]}>
                  کڕیار
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {poorPerformanceQuery.data?.shouldAlert && (
          <View style={styles.alertCard}>
            <AlertTriangle size={24} color="#f59e0b" />
            <Text style={styles.alertText}>{poorPerformanceQuery.data.alertMessage}</Text>
          </View>
        )}

        {statistics && (
          <>
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>کورتەی گشتی</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>کۆی کارەکان</Text>
                  <Text style={styles.summaryValue}>{statistics.totalActions}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>کۆی بڕ</Text>
                  <Text style={styles.summaryValue}>{statistics.totalAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>مامناوەندی کار</Text>
                  <Text style={styles.summaryValue}>{Math.round(statistics.averageActionsPerUser)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>باشترین بەکارهێنەران</Text>
              {statistics.topPerformers.map(renderImpactCard)}
            </View>

            {statistics.lowPerformers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>بەکارهێنەرانی لاواز</Text>
                {statistics.lowPerformers.map(renderImpactCard)}
              </View>
            )}

            <View style={styles.exportSection}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExportReport('pdf')}
                disabled={exportReportMutation.isPending}
              >
                <Download size={20} color="#fff" />
                <Text style={styles.exportButtonText}>داگرتن بە PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exportButton, styles.exportButtonSecondary]}
                onPress={() => handleExportReport('excel')}
                disabled={exportReportMutation.isPending}
              >
                <Download size={20} color="#3b82f6" />
                <Text style={[styles.exportButtonText, styles.exportButtonTextSecondary]}>
                  داگرتن بە Excel
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
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
    color: '#6b7280',
    fontFamily: 'System',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  filtersSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    fontFamily: 'System',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'System',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontFamily: 'System',
  },
  summarySection: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'System',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    fontFamily: 'System',
  },
  section: {
    padding: 16,
    gap: 12,
  },
  impactCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactInfo: {
    flex: 1,
  },
  impactName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'System',
  },
  impactRole: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'System',
  },
  performanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  performanceText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
    fontFamily: 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    fontFamily: 'System',
  },
  amountSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'System',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10b981',
    fontFamily: 'System',
  },
  exportSection: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    fontFamily: 'System',
  },
  exportButtonTextSecondary: {
    color: '#3b82f6',
  },
});
