import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Users,
  X,
} from 'lucide-react-native';
import { KurdishText } from './KurdishText';
import { GradientCard } from './GradientCard';
import { trpc } from '@/lib/trpc';

type BalanceAlert = {
  id: string;
  type: 'balance_discrepancy' | 'high_debt' | 'irregular_payment' | 'inactive_customer';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
};

type BalanceMonitorProps = {
  onAlertPress?: (alert: BalanceAlert) => void;
};

const getSeverityColor = (severity: BalanceAlert['severity']) => {
  switch (severity) {
    case 'critical': return '#DC2626';
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
};

const getSeverityIcon = (severity: BalanceAlert['severity']) => {
  const color = getSeverityColor(severity);
  switch (severity) {
    case 'critical':
    case 'high':
      return <AlertTriangle size={20} color={color} />;
    case 'medium':
      return <TrendingDown size={20} color={color} />;
    case 'low':
      return <TrendingUp size={20} color={color} />;
    default:
      return <DollarSign size={20} color={color} />;
  }
};

export const BalanceMonitor: React.FC<BalanceMonitorProps> = ({ onAlertPress }) => {
  const [alerts, setAlerts] = useState<BalanceAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const systemBalanceQuery = trpc.financial.balance.system.useQuery({});
  const irregularPaymentsQuery = trpc.financial.reports.irregularPayments.useQuery({});

  useEffect(() => {
    const checkBalanceDiscrepancies = () => {
      const newAlerts: BalanceAlert[] = [];
      const systemBalance = systemBalanceQuery.data;
      const irregularPayments = irregularPaymentsQuery.data;

      // Check for balance discrepancies
      if (systemBalance) {
        const { totalDebt, totalPayments, remainingDebt } = systemBalance;
        const calculatedBalance = totalDebt - totalPayments;
        
        if (Math.abs(calculatedBalance - remainingDebt) > 1000) {
          newAlerts.push({
            id: 'balance_discrepancy_' + Date.now(),
            type: 'balance_discrepancy',
            severity: 'critical',
            title: 'تضارب في الرصيد',
            message: `هناك تضارب في حسابات الرصيد. الفرق: ${Math.abs(calculatedBalance - remainingDebt).toLocaleString()} د.ع`,
            timestamp: new Date().toISOString(),
            data: { calculatedBalance, remainingDebt, difference: Math.abs(calculatedBalance - remainingDebt) },
          });
        }

        // Check for high debt ratio
        if (remainingDebt > totalPayments * 1.5) {
          newAlerts.push({
            id: 'high_debt_' + Date.now(),
            type: 'high_debt',
            severity: 'high',
            title: 'نسبة ديون عالية',
            message: `إجمالي الديون المتبقية (${remainingDebt.toLocaleString()}) يتجاوز 150% من إجمالي المدفوعات`,
            timestamp: new Date().toISOString(),
            data: { remainingDebt, totalPayments, ratio: (remainingDebt / totalPayments * 100).toFixed(1) },
          });
        }

        // Check for inactive customers
        if (systemBalance.inactiveCustomers > systemBalance.totalCustomers * 0.2) {
          newAlerts.push({
            id: 'inactive_customers_' + Date.now(),
            type: 'inactive_customer',
            severity: 'medium',
            title: 'عملاء غير نشطين',
            message: `عدد كبير من العملاء غير نشطين (${systemBalance.inactiveCustomers} من أصل ${systemBalance.totalCustomers})`,
            timestamp: new Date().toISOString(),
            data: { inactiveCustomers: systemBalance.inactiveCustomers, totalCustomers: systemBalance.totalCustomers },
          });
        }
      }

      // Check for irregular payments
      if (irregularPayments && irregularPayments.irregularPayments.length > 0) {
        newAlerts.push({
          id: 'irregular_payments_' + Date.now(),
          type: 'irregular_payment',
          severity: irregularPayments.irregularPayments.length > 5 ? 'high' : 'medium',
          title: 'مدفوعات غير منتظمة',
          message: `تم العثور على ${irregularPayments.irregularPayments.length} مدفوعة غير منتظمة تحتاج إلى مراجعة`,
          timestamp: new Date().toISOString(),
          data: { count: irregularPayments.irregularPayments.length, totalAmount: irregularPayments.totalIrregularAmount },
        });
      }

      // Filter out dismissed alerts
      const filteredAlerts = newAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
      setAlerts(filteredAlerts);
    };

    if (systemBalanceQuery.data || irregularPaymentsQuery.data) {
      checkBalanceDiscrepancies();
    }
  }, [systemBalanceQuery.data, irregularPaymentsQuery.data, dismissedAlerts]);

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const handleAlertPress = (alert: BalanceAlert) => {
    if (onAlertPress) {
      onAlertPress(alert);
    } else {
      // Default action - show alert details
      if (Platform.OS !== 'web') {
        const { Alert } = require('react-native');
        Alert.alert(alert.title, alert.message);
      } else {
        console.log('Alert:', alert);
      }
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AlertTriangle size={20} color="#F59E0B" />
          <KurdishText style={styles.headerTitle}>تنبيهات النظام</KurdishText>
        </View>
        <Text style={styles.alertCount}>{alerts.length}</Text>
      </View>

      {alerts.map((alert) => (
        <TouchableOpacity
          key={alert.id}
          onPress={() => handleAlertPress(alert)}
          style={styles.alertItem}
        >
          <GradientCard style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
            <View style={styles.alertHeader}>
              <View style={styles.alertInfo}>
                {getSeverityIcon(alert.severity)}
                <View style={styles.alertText}>
                  <KurdishText style={styles.alertTitle}>{alert.title}</KurdishText>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleString('ar-IQ')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDismissAlert(alert.id)}
                style={styles.dismissButton}
              >
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </GradientCard>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#92400E',
  },
  alertCount: {
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  alertItem: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  alertCard: {
    padding: 16,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});
