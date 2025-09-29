import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Filter,
  Calendar,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  BarChart3,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { trpc } from '@/lib/trpc';

type FilterType = {
  dateFrom: string;
  dateTo: string;
  reportType: 'monthly' | 'yearly' | 'custom';
  customerId?: string;
  employeeId?: string;
};

type ReportCardProps = {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  onPress?: () => void;
};

const ReportCard: React.FC<ReportCardProps> = ({ title, value, change, changeType, icon, onPress }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp size={14} color="#10B981" />;
    if (changeType === 'negative') return <TrendingDown size={14} color="#EF4444" />;
    return null;
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <GradientCard style={styles.reportCard}>
        <View style={styles.reportCardHeader}>
          <View style={styles.reportCardIcon}>
            {icon}
          </View>
          {change && (
            <View style={styles.changeContainer}>
              {getChangeIcon()}
              <Text style={[styles.changeText, { color: getChangeColor() }]}>
                {change}
              </Text>
            </View>
          )}
        </View>
        <KurdishText style={styles.reportCardTitle}>{title}</KurdishText>
        <Text style={styles.reportCardValue}>{value}</Text>
      </GradientCard>
    </TouchableOpacity>
  );
};

type TransactionItemProps = {
  customerName: string;
  amount: number;
  date: string;
  type: 'debt' | 'payment';
  employeeName?: string;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ customerName, amount, date, type, employeeName }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionInfo}>
      <KurdishText style={styles.transactionCustomer}>{customerName}</KurdishText>
      <Text style={styles.transactionDate}>{date}</Text>
      {employeeName && <Text style={styles.transactionEmployee}>بواسطة: {employeeName}</Text>}
    </View>
    <View style={styles.transactionAmount}>
      <Text style={[styles.transactionValue, { color: type === 'debt' ? '#EF4444' : '#10B981' }]}>
        {type === 'debt' ? '+' : '-'}{amount.toLocaleString()} د.ع
      </Text>
      <Text style={styles.transactionType}>{type === 'debt' ? 'دين' : 'دفعة'}</Text>
    </View>
  </View>
);

export default function DetailedFinancialReports() {
  const [filters, setFilters] = useState<FilterType>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    reportType: 'monthly',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const systemBalanceQuery = trpc.financial.balance.system.useQuery({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const monthlyReportQuery = trpc.financial.reports.monthly.useQuery({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const yearlyReportQuery = trpc.financial.reports.yearly.useQuery({
    year: new Date().getFullYear(),
  });

  const customerBalanceQuery = trpc.financial.balance.customer.useQuery({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const employeeBalanceQuery = trpc.financial.balance.employee.useQuery({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const handleExport = async () => {
    if (Platform.OS === 'web') {
      console.log('Export detailed report');
    } else {
      const { Alert: RNAlert } = require('react-native');
      RNAlert.alert('تصدير', 'سيتم تصدير التقرير المفصل');
    }
  };

  const systemBalance = systemBalanceQuery.data;
  const monthlyReport = monthlyReportQuery.data;
  const yearlyReport = yearlyReportQuery.data;
  const customerBalances = customerBalanceQuery.data || [];
  const employeeBalances = employeeBalanceQuery.data || [];

  // Mock transaction data
  const recentTransactions = [
    {
      customerName: 'أحمد محمد',
      amount: 15000,
      date: '2024-01-20',
      type: 'debt' as const,
      employeeName: 'کارمەند یەکەم',
    },
    {
      customerName: 'فاطمة علي',
      amount: 8000,
      date: '2024-01-19',
      type: 'payment' as const,
      employeeName: 'کارمەند دووەم',
    },
    {
      customerName: 'محمد حسن',
      amount: 12000,
      date: '2024-01-18',
      type: 'debt' as const,
      employeeName: 'کارمەند یەکەم',
    },
  ];

  const filteredTransactions = recentTransactions.filter(transaction =>
    transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'التقارير المالية المفصلة',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.headerButton}>
                <Filter size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
                <Download size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <GradientCard style={styles.filtersCard}>
              <KurdishText style={styles.filtersTitle}>فلاتر التقرير</KurdishText>
              
              <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                  <KurdishText style={styles.filterLabel}>من تاريخ</KurdishText>
                  <TextInput
                    style={styles.filterInput}
                    value={filters.dateFrom}
                    onChangeText={(text) => setFilters({ ...filters, dateFrom: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.filterItem}>
                  <KurdishText style={styles.filterLabel}>إلى تاريخ</KurdishText>
                  <TextInput
                    style={styles.filterInput}
                    value={filters.dateTo}
                    onChangeText={(text) => setFilters({ ...filters, dateTo: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.reportTypeToggle}>
                {(['monthly', 'yearly', 'custom'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.reportTypeButton, filters.reportType === type && styles.reportTypeButtonActive]}
                    onPress={() => setFilters({ ...filters, reportType: type })}
                  >
                    <KurdishText style={[styles.reportTypeText, filters.reportType === type && styles.reportTypeTextActive]}>
                      {type === 'monthly' ? 'شهري' : type === 'yearly' ? 'سنوي' : 'مخصص'}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </GradientCard>
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>ملخص مالي</KurdishText>
          <View style={styles.summaryGrid}>
            <ReportCard
              title="إجمالي الديون"
              value={`${systemBalance?.totalDebt?.toLocaleString() || '0'} د.ع`}
              change="+12%"
              changeType="negative"
              icon={<TrendingUp size={24} color="#EF4444" />}
            />
            <ReportCard
              title="إجمالي المدفوعات"
              value={`${systemBalance?.totalPayments?.toLocaleString() || '0'} د.ع`}
              change="+8%"
              changeType="positive"
              icon={<DollarSign size={24} color="#10B981" />}
            />
            <ReportCard
              title="الرصيد المتبقي"
              value={`${systemBalance?.remainingDebt?.toLocaleString() || '0'} د.ع`}
              change="-5%"
              changeType="positive"
              icon={<BarChart3 size={24} color="#F59E0B" />}
            />
            <ReportCard
              title="العملاء النشطون"
              value={`${systemBalance?.activeCustomers || 0}`}
              change="+3"
              changeType="positive"
              icon={<Users size={24} color="#3B82F6" />}
            />
          </View>
        </View>

        {/* Monthly vs Yearly Comparison */}
        {monthlyReport && yearlyReport && (
          <View style={styles.section}>
            <KurdishText style={styles.sectionTitle}>مقارنة الأداء</KurdishText>
            <GradientCard style={styles.comparisonCard}>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <KurdishText style={styles.comparisonLabel}>هذا الشهر</KurdishText>
                  <Text style={styles.comparisonValue}>{monthlyReport.totalDebt.toLocaleString()}</Text>
                  <Text style={styles.comparisonSubtext}>إجمالي الديون</Text>
                </View>
                <View style={styles.comparisonDivider} />
                <View style={styles.comparisonItem}>
                  <KurdishText style={styles.comparisonLabel}>هذا العام</KurdishText>
                  <Text style={styles.comparisonValue}>{yearlyReport.totalDebt.toLocaleString()}</Text>
                  <Text style={styles.comparisonSubtext}>إجمالي الديون</Text>
                </View>
              </View>
            </GradientCard>
          </View>
        )}

        {/* Search and Transactions */}
        <View style={styles.section}>
          <View style={styles.searchHeader}>
            <KurdishText style={styles.sectionTitle}>المعاملات الأخيرة</KurdishText>
            <View style={styles.searchContainer}>
              <Search size={16} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="البحث في المعاملات..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          
          <GradientCard style={styles.transactionsCard}>
            {filteredTransactions.map((transaction, index) => (
              <TransactionItem
                key={index}
                customerName={transaction.customerName}
                amount={transaction.amount}
                date={transaction.date}
                type={transaction.type}
                employeeName={transaction.employeeName}
              />
            ))}
          </GradientCard>
        </View>

        {/* Customer Balance Summary */}
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>ملخص أرصدة العملاء</KurdishText>
          <GradientCard style={styles.balanceCard}>
            {Array.isArray(customerBalances) && customerBalances.slice(0, 5).map((customer) => (
              <View key={customer.id} style={styles.balanceItem}>
                <KurdishText style={styles.balanceName}>{customer.name}</KurdishText>
                <View style={styles.balanceAmounts}>
                  <Text style={styles.balanceDebt}>دين: {customer.remainingDebt.toLocaleString()}</Text>
                  <Text style={styles.balancePayment}>دفع: {customer.totalPayments.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </GradientCard>
        </View>

        {/* Employee Performance */}
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>أداء الموظفين</KurdishText>
          <GradientCard style={styles.employeeCard}>
            {Array.isArray(employeeBalances) && employeeBalances.map((employee) => (
              <View key={employee.id} style={styles.employeeItem}>
                <KurdishText style={styles.employeeName}>{employee.name}</KurdishText>
                <View style={styles.employeeStats}>
                  <Text style={styles.employeeStat}>{employee.transactionsCount} معاملة</Text>
                  <Text style={styles.employeeStat}>{employee.totalDebtsProcessed.toLocaleString()} د.ع</Text>
                </View>
              </View>
            ))}
          </GradientCard>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filtersCard: {
    padding: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'right',
  },
  reportTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  reportTypeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportTypeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  reportTypeTextActive: {
    color: '#1F2937',
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  reportCardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  reportCardValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'right',
  },
  comparisonCard: {
    padding: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  comparisonSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 200,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  transactionsCard: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1F2937',
    textAlign: 'right',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  transactionEmployee: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
    textAlign: 'right',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  transactionType: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  balanceCard: {
    padding: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  balanceName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  balanceAmounts: {
    alignItems: 'flex-end',
  },
  balanceDebt: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'right',
  },
  balancePayment: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
    textAlign: 'right',
  },
  employeeCard: {
    padding: 16,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  employeeStats: {
    alignItems: 'flex-end',
  },
  employeeStat: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
});
