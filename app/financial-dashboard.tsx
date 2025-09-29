import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { trpc } from '@/lib/trpc';

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} color="#10B981" />;
    if (trend === 'down') return <TrendingDown size={16} color="#EF4444" />;
    return null;
  };

  return (
    <GradientCard style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        {getTrendIcon()}
      </View>
      <KurdishText style={styles.statTitle}>{title}</KurdishText>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </GradientCard>
  );
};

type TopListItemProps = {
  name: string;
  amount: number;
  subtitle?: string;
  isDebt?: boolean;
};

const TopListItem: React.FC<TopListItemProps> = ({ name, amount, subtitle, isDebt = false }) => (
  <View style={styles.topListItem}>
    <View style={styles.topListInfo}>
      <KurdishText style={styles.topListName}>{name}</KurdishText>
      {subtitle && <Text style={styles.topListSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={[styles.topListAmount, { color: isDebt ? '#EF4444' : '#10B981' }]}>
      {amount.toLocaleString()} د.ع
    </Text>
  </View>
);

export default function FinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const systemBalanceQuery = trpc.financial.balance.system.useQuery({});
  const monthlyReportQuery = trpc.financial.reports.monthly.useQuery({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const topDebtorsQuery = trpc.financial.reports.topDebtors.useQuery({ limit: 5, period: selectedPeriod });
  const topPayersQuery = trpc.financial.reports.topPayers.useQuery({ limit: 5, period: selectedPeriod });
  const irregularPaymentsQuery = trpc.financial.reports.irregularPayments.useQuery({});

  const handleExportReport = async () => {
    if (Platform.OS === 'web') {
      console.log('Export report requested');
    } else {
      Alert.alert('تصدير التقرير', 'سيتم تصدير التقرير قريباً');
    }
  };

  const systemBalance = systemBalanceQuery.data;
  const monthlyReport = monthlyReportQuery.data;
  const topDebtors = topDebtorsQuery.data || [];
  const topPayers = topPayersQuery.data || [];
  const irregularPayments = irregularPaymentsQuery.data;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'لوحة المالية والمحاسبة',
          headerRight: () => (
            <TouchableOpacity onPress={handleExportReport} style={styles.exportButton}>
              <Download size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* System Overview */}
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>نظرة عامة على النظام</KurdishText>
          <View style={styles.statsGrid}>
            <StatCard
              title="إجمالي الديون"
              value={`${systemBalance?.totalDebt?.toLocaleString() || '0'} د.ع`}
              icon={<TrendingUp size={24} color="#EF4444" />}
              color="#EF4444"
              trend="up"
            />
            <StatCard
              title="إجمالي المدفوعات"
              value={`${systemBalance?.totalPayments?.toLocaleString() || '0'} د.ع`}
              icon={<DollarSign size={24} color="#10B981" />}
              color="#10B981"
              trend="up"
            />
            <StatCard
              title="الرصيد المتبقي"
              value={`${systemBalance?.remainingDebt?.toLocaleString() || '0'} د.ع`}
              icon={<BarChart3 size={24} color="#F59E0B" />}
              color="#F59E0B"
              trend={systemBalance?.remainingDebt && systemBalance.remainingDebt > 0 ? 'up' : 'down'}
            />
            <StatCard
              title="العملاء النشطون"
              value={`${systemBalance?.activeCustomers || 0}`}
              subtitle={`من أصل ${systemBalance?.totalCustomers || 0} عميل`}
              icon={<Users size={24} color="#3B82F6" />}
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Monthly Report Summary */}
        {monthlyReport && (
          <View style={styles.section}>
            <KurdishText style={styles.sectionTitle}>
              تقرير شهر {monthlyReport.month}/{monthlyReport.year}
            </KurdishText>
            <GradientCard style={styles.monthlyCard}>
              <View style={styles.monthlyStats}>
                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatValue}>{monthlyReport.totalDebt.toLocaleString()}</Text>
                  <KurdishText style={styles.monthlyStatLabel}>إجمالي الديون</KurdishText>
                </View>
                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatValue}>{monthlyReport.totalPayments.toLocaleString()}</Text>
                  <KurdishText style={styles.monthlyStatLabel}>إجمالي المدفوعات</KurdishText>
                </View>
                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatValue}>{monthlyReport.newCustomers}</Text>
                  <KurdishText style={styles.monthlyStatLabel}>عملاء جدد</KurdishText>
                </View>
              </View>
            </GradientCard>
          </View>
        )}

        {/* Period Toggle */}
        <View style={styles.section}>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'monthly' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('monthly')}
            >
              <KurdishText style={[styles.periodButtonText, selectedPeriod === 'monthly' && styles.periodButtonTextActive]}>
                شهري
              </KurdishText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'yearly' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('yearly')}
            >
              <KurdishText style={[styles.periodButtonText, selectedPeriod === 'yearly' && styles.periodButtonTextActive]}>
                سنوي
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Lists */}
        <View style={styles.section}>
          <View style={styles.topListsContainer}>
            {/* Top Debtors */}
            <View style={styles.topListSection}>
              <KurdishText style={styles.topListTitle}>أكبر المدينين</KurdishText>
              <GradientCard style={styles.topListCard}>
                {topDebtors.map((debtor) => (
                  <TopListItem
                    key={debtor.id}
                    name={debtor.name}
                    amount={debtor.totalDebt}
                    subtitle={`آخر دفعة: ${debtor.lastPayment}`}
                    isDebt
                  />
                ))}
              </GradientCard>
            </View>

            {/* Top Payers */}
            <View style={styles.topListSection}>
              <KurdishText style={styles.topListTitle}>أفضل الدافعين</KurdishText>
              <GradientCard style={styles.topListCard}>
                {topPayers.map((payer) => (
                  <TopListItem
                    key={payer.id}
                    name={payer.name}
                    amount={payer.totalPayments}
                    subtitle={`آخر دفعة: ${payer.lastPayment}`}
                  />
                ))}
              </GradientCard>
            </View>
          </View>
        </View>

        {/* Irregular Payments Alert */}
        {irregularPayments && irregularPayments.irregularPayments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <AlertTriangle size={20} color="#F59E0B" />
                <KurdishText style={styles.alertTitle}>مدفوعات غير منتظمة</KurdishText>
              </View>
              <Text style={styles.alertText}>
                تم العثور على {irregularPayments.irregularPayments.length} مدفوعة غير منتظمة تحتاج إلى مراجعة
              </Text>
              <TouchableOpacity style={styles.alertButton}>
                <KurdishText style={styles.alertButtonText}>عرض التفاصيل</KurdishText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>إجراءات سريعة</KurdishText>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Calendar size={24} color="#3B82F6" />
              <KurdishText style={styles.quickActionText}>تقرير شهري</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <BarChart3 size={24} color="#10B981" />
              <KurdishText style={styles.quickActionText}>تقرير سنوي</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Download size={24} color="#F59E0B" />
              <KurdishText style={styles.quickActionText}>تصدير البيانات</KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  exportButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'right',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'right',
  },
  monthlyCard: {
    padding: 20,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  monthlyStat: {
    alignItems: 'center',
  },
  monthlyStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#1F2937',
    fontWeight: '600' as const,
  },
  topListsContainer: {
    gap: 16,
  },
  topListSection: {
    marginBottom: 16,
  },
  topListTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'right',
  },
  topListCard: {
    padding: 16,
  },
  topListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topListInfo: {
    flex: 1,
  },
  topListName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1F2937',
    textAlign: 'right',
  },
  topListSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  topListAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  alertCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#92400E',
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 12,
    textAlign: 'right',
  },
  alertButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  quickAction: {
    flex: 1,
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
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
});