import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsability } from '@/hooks/usability-context';

export default function PerformanceMonitoringScreen() {
  const {
    performanceData,
    performanceAlerts,
    optimizations,
    resolveAlert,
  } = useUsability();

  const latestPerformance = performanceData[performanceData.length - 1];
  const unresolvedAlerts = performanceAlerts.filter(a => !a.resolved);
  const recentOptimizations = optimizations.slice(-5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'چاودێری کارایی',
          headerStyle: { backgroundColor: '#EF4444' },
          headerTintColor: '#fff',
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {latestPerformance && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              دۆخی ئێستا
            </KurdishText>
            
            <GradientCard colors={[getStatusColor(latestPerformance.status), getStatusColor(latestPerformance.status)]} intensity="light">
              <View style={styles.statusHeader}>
                <Activity size={32} color={getStatusColor(latestPerformance.status)} />
                <View style={styles.statusInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {latestPerformance.status === 'good' ? 'باش' : latestPerformance.status === 'warning' ? 'ئاگاداری' : 'گرنگ'}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {new Date(latestPerformance.timestamp).toLocaleString('ckb-IQ')}
                  </KurdishText>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Clock size={20} color="#3B82F6" />
                  <KurdishText variant="caption" color="#6B7280">
                    کاتی وەڵام
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {latestPerformance.responseTime}ms
                  </KurdishText>
                </View>

                <View style={styles.statItem}>
                  <Database size={20} color="#8B5CF6" />
                  <KurdishText variant="caption" color="#6B7280">
                    قەبارەی داتابەیس
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {(latestPerformance.databaseSize / 1024 / 1024).toFixed(2)} MB
                  </KurdishText>
                </View>

                <View style={styles.statItem}>
                  <TrendingUp size={20} color="#10B981" />
                  <KurdishText variant="caption" color="#6B7280">
                    پەیوەندیە چالاکەکان
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {latestPerformance.activeConnections}
                  </KurdishText>
                </View>

                <View style={styles.statItem}>
                  <AlertTriangle size={20} color="#EF4444" />
                  <KurdishText variant="caption" color="#6B7280">
                    ڕێژەی هەڵە
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {(latestPerformance.errorRate * 100).toFixed(2)}%
                  </KurdishText>
                </View>
              </View>
            </GradientCard>
          </View>
        )}

        {unresolvedAlerts.length > 0 && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              ئاگاداریە چالاکەکان ({unresolvedAlerts.length})
            </KurdishText>
            
            {unresolvedAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertItem}
                onPress={() => resolveAlert(alert.id)}
              >
                <GradientCard colors={[getSeverityColor(alert.severity), getSeverityColor(alert.severity)]} intensity="light">
                  <View style={styles.alertContent}>
                    <View style={styles.alertLeft}>
                      <AlertTriangle size={24} color={getSeverityColor(alert.severity)} />
                      <View style={styles.alertInfo}>
                        <KurdishText variant="body" color="#1F2937">
                          {alert.message}
                        </KurdishText>
                        <KurdishText variant="caption" color="#6B7280">
                          {new Date(alert.timestamp).toLocaleString('ckb-IQ')}
                        </KurdishText>
                      </View>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                      <KurdishText variant="caption" color="#fff">
                        {alert.severity === 'low' ? 'کەم' : alert.severity === 'medium' ? 'ناوەند' : alert.severity === 'high' ? 'بەرز' : 'گرنگ'}
                      </KurdishText>
                    </View>
                  </View>
                </GradientCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {recentOptimizations.length > 0 && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              ئاپتیمایزکردنە دواییەکان
            </KurdishText>
            
            {recentOptimizations.map((opt) => (
              <View key={opt.id} style={styles.optimizationItem}>
                <GradientCard>
                  <View style={styles.optimizationContent}>
                    <View style={styles.optimizationLeft}>
                      {opt.status === 'completed' ? (
                        <CheckCircle size={24} color="#10B981" />
                      ) : opt.status === 'running' ? (
                        <Zap size={24} color="#F59E0B" />
                      ) : (
                        <Clock size={24} color="#6B7280" />
                      )}
                      <View style={styles.optimizationInfo}>
                        <KurdishText variant="body" color="#1F2937">
                          {opt.type === 'cleanup' ? 'پاککردنەوە' : opt.type === 'index' ? 'ئیندێکس' : opt.type === 'vacuum' ? 'ڤاکیووم' : 'شیکردنەوە'}
                        </KurdishText>
                        {opt.completedAt && (
                          <KurdishText variant="caption" color="#6B7280">
                            {new Date(opt.completedAt).toLocaleString('ckb-IQ')}
                          </KurdishText>
                        )}
                      </View>
                    </View>
                    {opt.status === 'completed' && opt.spaceFreed && (
                      <View style={styles.optimizationStats}>
                        <KurdishText variant="caption" color="#10B981">
                          {(opt.spaceFreed / 1024 / 1024).toFixed(2)} MB ئازادکرا
                        </KurdishText>
                      </View>
                    )}
                  </View>
                </GradientCard>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    gap: 4,
  },
  alertItem: {
    marginBottom: 12,
  },
  alertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alertInfo: {
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optimizationItem: {
    marginBottom: 12,
  },
  optimizationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optimizationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optimizationInfo: {
    flex: 1,
  },
  optimizationStats: {
    alignItems: 'flex-end',
  },
});
