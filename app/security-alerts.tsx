import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react-native';
import { useSecurity } from '@/hooks/security-context';
import { useAuth } from '@/hooks/auth-context';
import { KurdishText } from '@/components/KurdishText';
import { SecurityAlert } from '@/types/auth';

export default function SecurityAlertsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { securityAlerts, resolveSecurityAlert } = useSecurity();

  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  const filteredAlerts = securityAlerts.filter(alert => {
    if (filter === 'unresolved') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  const handleResolve = (alertId: string) => {
    if (!user) return;

    Alert.alert(
      'چارەسەرکردنی ئاگاداری',
      'دڵنیایت لە چارەسەرکردنی ئەم ئاگادارییە؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'چارەسەر بکە',
          onPress: () => {
            resolveSecurityAlert(alertId, user.id);
            Alert.alert('سەرکەوتوو', 'ئاگاداری چارەسەر کرا');
          },
        },
      ]
    );
  };

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityLabel = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'گرنگی زۆر';
      case 'high': return 'گرنگی بەرز';
      case 'medium': return 'گرنگی مامناوەند';
      case 'low': return 'گرنگی کەم';
      default: return severity;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ئاگاداریەکانی ئاسایش',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unresolved' && styles.filterButtonActive]}
          onPress={() => setFilter('unresolved')}
        >
          <KurdishText style={[
            styles.filterButtonText,
            filter === 'unresolved' && styles.filterButtonTextActive
          ]}>
            چارەسەر نەکراو
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'resolved' && styles.filterButtonActive]}
          onPress={() => setFilter('resolved')}
        >
          <KurdishText style={[
            styles.filterButtonText,
            filter === 'resolved' && styles.filterButtonTextActive
          ]}>
            چارەسەر کراو
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <KurdishText style={[
            styles.filterButtonText,
            filter === 'all' && styles.filterButtonTextActive
          ]}>
            هەموو
          </KurdishText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CheckCircle size={64} color="#22c55e" />
            <KurdishText style={styles.emptyText}>
              هیچ ئاگاداریەک نییە
            </KurdishText>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertTitleRow}>
                  <AlertTriangle size={20} color={getSeverityColor(alert.severity)} />
                  <KurdishText style={styles.alertTitle}>{alert.title}</KurdishText>
                </View>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(alert.severity) + '20' }
                ]}>
                  <KurdishText style={[
                    styles.severityText,
                    { color: getSeverityColor(alert.severity) }
                  ]}>
                    {getSeverityLabel(alert.severity)}
                  </KurdishText>
                </View>
              </View>

              <KurdishText style={styles.alertDescription}>
                {alert.description}
              </KurdishText>

              <View style={styles.alertDetails}>
                <View style={styles.detailRow}>
                  <KurdishText style={styles.detailLabel}>IP:</KurdishText>
                  <Text style={styles.detailValue}>{alert.ipAddress}</Text>
                </View>
                <View style={styles.detailRow}>
                  <KurdishText style={styles.detailLabel}>ئامێر:</KurdishText>
                  <Text style={styles.detailValue}>{alert.deviceInfo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <KurdishText style={styles.detailLabel}>کات:</KurdishText>
                  <Text style={styles.detailValue}>
                    {new Date(alert.timestamp).toLocaleString('en-US')}
                  </Text>
                </View>
              </View>

              {alert.resolved ? (
                <View style={styles.resolvedBanner}>
                  <CheckCircle size={16} color="#22c55e" />
                  <KurdishText style={styles.resolvedText}>
                    چارەسەر کرا لە {new Date(alert.resolvedAt!).toLocaleDateString('en-US')}
                  </KurdishText>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => handleResolve(alert.id)}
                >
                  <KurdishText style={styles.resolveButtonText}>
                    چارەسەرکردن
                  </KurdishText>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1e40af',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600' as const,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  alertDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500' as const,
    fontFamily: 'monospace',
  },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
  },
  resolvedText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500' as const,
  },
  resolveButton: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
