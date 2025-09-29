import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Award,
  Mail,
  FileText,
  Download,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { getCustomerGroupName, getCustomerGroupColor, CUSTOMER_GROUPS } from '@/constants/customer-groups';
import { getCustomerRatingName, getCustomerRatingColor, CUSTOMER_RATINGS, calculateCustomerRating } from '@/constants/customer-ratings';

interface CustomerReportData {
  customer: any;
  totalDebts: number;
  totalPaid: number;
  remainingDebt: number;
  activeDebtsCount: number;
  paidDebtsCount: number;
  averageDebtAmount: number;
  lastPaymentDate?: string;
  paymentFrequency: number;
  rating: string;
}

export default function DetailedCustomerReportsScreen() {
  const router = useRouter();
  const { getCustomers } = useUsers();
  const { getAllDebts, getAllPayments } = useDebts();
  const { hasPermission } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'debt' | 'paid' | 'rating' | 'name'>('debt');

  // Check permissions
  if (!hasPermission(PERMISSIONS.VIEW_REPORTS)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            ڕاپۆرتی تایبەتی کڕیاران
          </KurdishText>
        </View>
        <View style={styles.noPermissionContainer}>
          <FileText size={48} color="#9CA3AF" />
          <KurdishText variant="body" color="#6B7280" style={styles.noPermissionText}>
            تۆ دەسەڵاتی بینینی ڕاپۆرتەکانت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const customers = getCustomers();
  const allDebts = getAllDebts();
  const allPayments = getAllPayments();

  // Generate detailed customer reports
  const customerReports: CustomerReportData[] = useMemo(() => {
    return customers.map(customer => {
      const customerDebts = allDebts.filter(debt => debt.customerId === customer.id);
      const customerPayments = allPayments.filter(payment => 
        customerDebts.some(debt => debt.id === payment.debtId)
      );

      const totalDebts = customerDebts.reduce((sum, debt) => sum + debt.amount, 0);
      const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingDebt = customerDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
      const activeDebtsCount = customerDebts.filter(debt => debt.status !== 'paid').length;
      const paidDebtsCount = customerDebts.filter(debt => debt.status === 'paid').length;
      const averageDebtAmount = customerDebts.length > 0 ? totalDebts / customerDebts.length : 0;
      
      const sortedPayments = customerPayments.sort((a, b) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].paymentDate : undefined;
      
      // Calculate payment frequency (payments per month)
      const firstPaymentDate = sortedPayments.length > 0 ? 
        new Date(sortedPayments[sortedPayments.length - 1].paymentDate) : new Date();
      const monthsDiff = Math.max(1, 
        (new Date().getTime() - firstPaymentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const paymentFrequency = customerPayments.length / monthsDiff;

      const rating = customer.customerRating || calculateCustomerRating(
        totalDebts,
        totalPaid,
        customer.onTimePayments || 0,
        customer.latePayments || 0,
        activeDebtsCount
      );

      return {
        customer,
        totalDebts,
        totalPaid,
        remainingDebt,
        activeDebtsCount,
        paidDebtsCount,
        averageDebtAmount,
        lastPaymentDate,
        paymentFrequency,
        rating,
      };
    });
  }, [customers, allDebts, allPayments]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = customerReports.filter(report => {
      const matchesGroup = selectedGroup === 'all' || report.customer.customerGroup === selectedGroup;
      const matchesRating = selectedRating === 'all' || report.rating === selectedRating;
      return matchesGroup && matchesRating;
    });

    // Sort reports
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'debt':
          return b.remainingDebt - a.remainingDebt;
        case 'paid':
          return b.totalPaid - a.totalPaid;
        case 'rating':
          const ratingA = CUSTOMER_RATINGS.find(r => r.id === a.rating)?.priority || 0;
          const ratingB = CUSTOMER_RATINGS.find(r => r.id === b.rating)?.priority || 0;
          return ratingB - ratingA;
        case 'name':
          return a.customer.name.localeCompare(b.customer.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [customerReports, selectedGroup, selectedRating, sortBy]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCustomers = filteredReports.length;
    const totalDebt = filteredReports.reduce((sum, report) => sum + report.remainingDebt, 0);
    const totalPaid = filteredReports.reduce((sum, report) => sum + report.totalPaid, 0);
    const averageDebt = totalCustomers > 0 ? totalDebt / totalCustomers : 0;
    const topDebtors = filteredReports.slice(0, 5);
    const bestPayers = filteredReports
      .filter(r => r.totalPaid > 0)
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    return {
      totalCustomers,
      totalDebt,
      totalPaid,
      averageDebt,
      topDebtors,
      bestPayers,
    };
  }, [filteredReports]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  const renderCustomerReport = ({ item }: { item: CustomerReportData }) => (
    <TouchableOpacity
      onPress={() => router.push(`/customer-detail/${item.customer.id}`)}
    >
      <GradientCard style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.customerInfo}>
            <KurdishText variant="subtitle" color="#1F2937">
              {item.customer.name}
            </KurdishText>
            <View style={styles.customerMeta}>
              <View style={styles.metaItem}>
                <Users size={12} color={getCustomerGroupColor(item.customer.customerGroup)} />
                <KurdishText variant="caption" color="#6B7280">
                  {getCustomerGroupName(item.customer.customerGroup || '')}
                </KurdishText>
              </View>
              <View style={styles.metaItem}>
                <Award size={12} color={getCustomerRatingColor(item.rating)} />
                <KurdishText variant="caption" color={getCustomerRatingColor(item.rating)}>
                  {getCustomerRatingName(item.rating)}
                </KurdishText>
              </View>
            </View>
          </View>
          <View style={styles.debtAmount}>
            <KurdishText variant="body" color="#EF4444">
              {formatCurrency(item.remainingDebt)}
            </KurdishText>
            <KurdishText variant="caption" color="#6B7280">
              قەرزی ماوە
            </KurdishText>
          </View>
        </View>

        <View style={styles.reportStats}>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#6B7280">کۆی قەرز</KurdishText>
            <KurdishText variant="body" color="#1F2937">
              {formatCurrency(item.totalDebts)}
            </KurdishText>
          </View>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#6B7280">پارەی داوە</KurdishText>
            <KurdishText variant="body" color="#10B981">
              {formatCurrency(item.totalPaid)}
            </KurdishText>
          </View>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#6B7280">قەرزی چالاک</KurdishText>
            <KurdishText variant="body" color="#1F2937">
              {item.activeDebtsCount}
            </KurdishText>
          </View>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#6B7280">دوایین پارەدان</KurdishText>
            <KurdishText variant="body" color="#1F2937">
              {item.lastPaymentDate ? formatDate(item.lastPaymentDate) : 'هیچ'}
            </KurdishText>
          </View>
        </View>
      </GradientCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          ڕاپۆرتی تایبەتی کڕیاران
        </KurdishText>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={20} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Statistics */}
        <View style={styles.summarySection}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            کورتەی گشتی
          </KurdishText>
          <View style={styles.summaryGrid}>
            <GradientCard style={styles.summaryCard}>
              <Users size={24} color="#3B82F6" />
              <KurdishText variant="body" color="#1F2937">
                {summaryStats.totalCustomers}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                کڕیار
              </KurdishText>
            </GradientCard>
            <GradientCard style={styles.summaryCard}>
              <TrendingDown size={24} color="#EF4444" />
              <KurdishText variant="body" color="#EF4444">
                {formatCurrency(summaryStats.totalDebt)}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                کۆی قەرز
              </KurdishText>
            </GradientCard>
            <GradientCard style={styles.summaryCard}>
              <TrendingUp size={24} color="#10B981" />
              <KurdishText variant="body" color="#10B981">
                {formatCurrency(summaryStats.totalPaid)}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                کۆی پارەدان
              </KurdishText>
            </GradientCard>
            <GradientCard style={styles.summaryCard}>
              <DollarSign size={24} color="#F59E0B" />
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(summaryStats.averageDebt)}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                ناوەندی قەرز
              </KurdishText>
            </GradientCard>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedGroup === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedGroup('all')}
              >
                <KurdishText 
                  variant="caption" 
                  color={selectedGroup === 'all' ? 'white' : '#6B7280'}
                >
                  هەموو گروپەکان
                </KurdishText>
              </TouchableOpacity>
              {CUSTOMER_GROUPS.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.filterChip,
                    selectedGroup === group.id && { backgroundColor: group.color }
                  ]}
                  onPress={() => setSelectedGroup(group.id)}
                >
                  <KurdishText 
                    variant="caption" 
                    color={selectedGroup === group.id ? 'white' : '#6B7280'}
                  >
                    {group.name}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedRating === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedRating('all')}
              >
                <KurdishText 
                  variant="caption" 
                  color={selectedRating === 'all' ? 'white' : '#6B7280'}
                >
                  هەموو پلەکان
                </KurdishText>
              </TouchableOpacity>
              {CUSTOMER_RATINGS.map(rating => (
                <TouchableOpacity
                  key={rating.id}
                  style={[
                    styles.filterChip,
                    selectedRating === rating.id && { backgroundColor: rating.color }
                  ]}
                  onPress={() => setSelectedRating(rating.id)}
                >
                  <KurdishText 
                    variant="caption" 
                    color={selectedRating === rating.id ? 'white' : '#6B7280'}
                  >
                    {rating.name}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sort Options */}
          <View style={styles.sortRow}>
            <KurdishText variant="caption" color="#6B7280">
              ڕیزکردن بەپێی:
            </KurdishText>
            <View style={styles.sortOptions}>
              {[
                { key: 'debt', label: 'قەرز' },
                { key: 'paid', label: 'پارەدان' },
                { key: 'rating', label: 'پلە' },
                { key: 'name', label: 'ناو' },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortChip,
                    sortBy === option.key && styles.sortChipActive
                  ]}
                  onPress={() => setSortBy(option.key as any)}
                >
                  <KurdishText 
                    variant="caption" 
                    color={sortBy === option.key ? 'white' : '#6B7280'}
                  >
                    {option.label}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Customer Reports List */}
        <View style={styles.reportsSection}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ڕاپۆرتی کڕیاران ({filteredReports.length})
          </KurdishText>
          <FlatList
            data={filteredReports}
            renderItem={renderCustomerReport}
            keyExtractor={(item) => item.customer.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  noPermissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noPermissionText: {
    marginTop: 16,
    textAlign: 'center',
  },
  summarySection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  filtersSection: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  reportsSection: {
    padding: 16,
    paddingTop: 0,
  },
  reportCard: {
    marginBottom: 12,
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  debtAmount: {
    alignItems: 'flex-end',
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
});