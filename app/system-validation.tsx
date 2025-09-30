import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { KurdishText } from '@/components/KurdishText';
import type { SystemValidationReport, ValidationCategory } from '@/types/validation';

export default function SystemValidationScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<SystemValidationReport | null>(null);

  const validationQuery = trpc.validation.runSystemValidation.useQuery(undefined, {
    enabled: false,
  });

  const statsQuery = trpc.validation.getStats.useQuery();

  const exportMutation = trpc.validation.exportReport.useMutation();

  const runValidation = async () => {
    setIsRunning(true);
    try {
      const result = await validationQuery.refetch();
      if (result.data) {
        setReport(result.data);
      }
    } catch (error) {
      console.error('Validation error:', error);
      Alert.alert('هەڵە', 'کێشەیەک لە پشکنیندا ڕوویدا');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!report) return;

    try {
      const result = await exportMutation.mutateAsync({
        reportId: report.id,
        format,
      });

      if (result.success) {
        Alert.alert('سەرکەوتوو', `ڕاپۆرت بە ${format.toUpperCase()} هەڵگیرا`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('هەڵە', 'کێشەیەک لە هەڵگرتندا ڕوویدا');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
      case 'failed':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const renderCategory = (category: ValidationCategory) => {
    const StatusIcon = getStatusIcon(category.status);
    const statusColor = getStatusColor(category.status);

    return (
      <View key={category.name} style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleRow}>
            <StatusIcon size={24} color={statusColor} />
            <KurdishText style={styles.categoryTitle}>{category.name}</KurdishText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <KurdishText style={[styles.statusText, { color: statusColor }]}>
              {category.status === 'passed' ? 'تێپەڕی' : category.status === 'warning' ? 'ئاگاداری' : 'شکستی'}
            </KurdishText>
          </View>
        </View>

        <View style={styles.checksContainer}>
          {category.checks.map((check) => {
            const CheckIcon = getStatusIcon(check.status);
            const checkColor = getStatusColor(check.status);

            return (
              <View key={check.id} style={styles.checkItem}>
                <CheckIcon size={18} color={checkColor} />
                <View style={styles.checkContent}>
                  <KurdishText style={styles.checkName}>{check.name}</KurdishText>
                  <KurdishText style={styles.checkMessage}>{check.message}</KurdishText>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'پشکنینی سیستەم',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/system-settings')}
              style={styles.headerButton}
            >
              <Settings size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {statsQuery.data && (
          <View style={styles.statsCard}>
            <KurdishText style={styles.statsTitle}>ئامارەکانی پشکنین</KurdishText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <KurdishText style={styles.statValue}>{statsQuery.data.totalValidations}</KurdishText>
                <KurdishText style={styles.statLabel}>کۆی پشکنین</KurdishText>
              </View>
              <View style={styles.statItem}>
                <KurdishText style={[styles.statValue, { color: '#10b981' }]}>
                  {statsQuery.data.successfulValidations}
                </KurdishText>
                <KurdishText style={styles.statLabel}>سەرکەوتوو</KurdishText>
              </View>
              <View style={styles.statItem}>
                <KurdishText style={[styles.statValue, { color: '#ef4444' }]}>
                  {statsQuery.data.failedValidations}
                </KurdishText>
                <KurdishText style={styles.statLabel}>شکستخواردوو</KurdishText>
              </View>
              <View style={styles.statItem}>
                <KurdishText style={[styles.statValue, { color: '#f59e0b' }]}>
                  {statsQuery.data.warningsFound}
                </KurdishText>
                <KurdishText style={styles.statLabel}>ئاگاداری</KurdishText>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionCard}>
          <TouchableOpacity
            style={[styles.runButton, isRunning && styles.runButtonDisabled]}
            onPress={runValidation}
            disabled={isRunning}
          >
            {isRunning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <RefreshCw size={24} color="#fff" />
                <KurdishText style={styles.runButtonText}>کردنەوەی پشکنینی نوێ</KurdishText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {report && (
          <>
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <KurdishText style={styles.reportTitle}>ئەنجامی پشکنین</KurdishText>
                <View
                  style={[
                    styles.overallStatusBadge,
                    { backgroundColor: getStatusColor(report.overallStatus) + '20' },
                  ]}
                >
                  <KurdishText
                    style={[styles.overallStatusText, { color: getStatusColor(report.overallStatus) }]}
                  >
                    {report.overallStatus === 'healthy'
                      ? 'تەندروست'
                      : report.overallStatus === 'warning'
                      ? 'ئاگاداری'
                      : 'گرنگ'}
                  </KurdishText>
                </View>
              </View>

              <View style={styles.reportStats}>
                <View style={styles.reportStatItem}>
                  <KurdishText style={styles.reportStatValue}>{report.totalChecks}</KurdishText>
                  <KurdishText style={styles.reportStatLabel}>کۆی پشکنین</KurdishText>
                </View>
                <View style={styles.reportStatItem}>
                  <KurdishText style={[styles.reportStatValue, { color: '#10b981' }]}>
                    {report.passedChecks}
                  </KurdishText>
                  <KurdishText style={styles.reportStatLabel}>تێپەڕی</KurdishText>
                </View>
                <View style={styles.reportStatItem}>
                  <KurdishText style={[styles.reportStatValue, { color: '#f59e0b' }]}>
                    {report.warningChecks}
                  </KurdishText>
                  <KurdishText style={styles.reportStatLabel}>ئاگاداری</KurdishText>
                </View>
                <View style={styles.reportStatItem}>
                  <KurdishText style={[styles.reportStatValue, { color: '#ef4444' }]}>
                    {report.failedChecks}
                  </KurdishText>
                  <KurdishText style={styles.reportStatLabel}>شکست</KurdishText>
                </View>
              </View>

              <View style={styles.exportButtons}>
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => handleExport('pdf')}
                  disabled={exportMutation.isPending}
                >
                  <Download size={20} color="#1e40af" />
                  <KurdishText style={styles.exportButtonText}>هەڵگرتن بە PDF</KurdishText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => handleExport('excel')}
                  disabled={exportMutation.isPending}
                >
                  <Download size={20} color="#059669" />
                  <KurdishText style={styles.exportButtonText}>هەڵگرتن بە Excel</KurdishText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.categoriesContainer}>
              {report.categories.map((category) => renderCategory(category))}
            </View>


          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    marginRight: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 16,
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
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  runButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  reportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  overallStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  overallStatusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  reportStatItem: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1e40af',
    marginBottom: 4,
  },
  reportStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  exportButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500' as const,
  },
  categoriesContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  checksContainer: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  checkContent: {
    flex: 1,
  },
  checkName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
    marginBottom: 2,
  },
  checkMessage: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e40af',
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '600' as const,
  },
});
