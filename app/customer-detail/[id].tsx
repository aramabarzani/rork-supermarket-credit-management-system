import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CreditCard,
  Mail,
  Users,
  Award,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Send,
  Edit,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { getCustomerGroupName, getCustomerGroupColor } from '@/constants/customer-groups';
import { getCustomerRatingName, getCustomerRatingColor, calculateCustomerRating } from '@/constants/customer-ratings';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getCustomers } = useUsers();
  const { getCustomerDebts, getPaymentsByCustomer } = useDebts();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'debts' | 'payments'>('overview');

  const customer = getCustomers().find(c => c.id === id);
  
  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            کڕیار نەدۆزرایەوە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const customerDebts = getCustomerDebts(customer.id);
  const customerPayments = getPaymentsByCustomer(customer.id);

  // Calculate customer statistics
  const totalDebts = customerDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingDebt = customerDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const activeDebtsCount = customerDebts.filter(debt => debt.status !== 'paid').length;
  // const paidDebtsCount = customerDebts.filter(debt => debt.status === 'paid').length;

  // Calculate customer rating
  const customerRating = customer.customerRating || calculateCustomerRating(
    totalDebts,
    totalPaid,
    customer.onTimePayments || 0,
    customer.latePayments || 0,
    activeDebtsCount
  );

  // Get recent payments (last 5)
  const recentPayments = customerPayments
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  // Get active debts
  const activeDebts = customerDebts.filter(debt => debt.status !== 'paid');

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

  const renderDebtItem = ({ item }: { item: any }) => (
    <GradientCard style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <KurdishText variant="body" color="#1F2937">
            {item.description}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            {item.category} • {formatDate(item.createdAt)}
          </KurdishText>
        </View>
        <View style={styles.listItemAmount}>
          <KurdishText variant="body" color="#EF4444">
            {formatCurrency(item.remainingAmount)}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            لە {formatCurrency(item.amount)}
          </KurdishText>
        </View>
      </View>
      {item.dueDate && (
        <View style={styles.dueDateContainer}>
          <Calendar size={14} color="#F59E0B" />
          <KurdishText variant="caption" color="#F59E0B">
            بەروار: {formatDate(item.dueDate)}
          </KurdishText>
        </View>
      )}
    </GradientCard>
  );

  const renderPaymentItem = ({ item }: { item: any }) => (
    <GradientCard style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <KurdishText variant="body" color="#1F2937">
            پارەدان
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            وەرگیراو لەلایەن: {item.receivedByName}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            {formatDate(item.paymentDate)}
          </KurdishText>
        </View>
        <View style={styles.listItemAmount}>
          <KurdishText variant="body" color="#10B981">
            {formatCurrency(item.amount)}
          </KurdishText>
        </View>
      </View>
      {item.notes && (
        <View style={styles.notesContainer}>
          <KurdishText variant="caption" color="#6B7280">
            تێبینی: {item.notes}
          </KurdishText>
        </View>
      )}
    </GradientCard>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Customer Info Card */}
      <GradientCard style={styles.customerInfoCard}>
        <View style={styles.customerHeader}>
          <View style={styles.avatar}>
            <User size={32} color="#1E3A8A" />
          </View>
          <View style={styles.customerBasicInfo}>
            <KurdishText variant="title" color="#1F2937">
              {customer.name}
            </KurdishText>
            <View style={styles.customerMeta}>
              <View style={styles.metaItem}>
                <Phone size={14} color="#6B7280" />
                <KurdishText variant="body" color="#6B7280">
                  {customer.phone}
                </KurdishText>
              </View>
              {customer.email && (
                <View style={styles.metaItem}>
                  <Mail size={14} color="#6B7280" />
                  <KurdishText variant="body" color="#6B7280">
                    {customer.email}
                  </KurdishText>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          {customer.address && (
            <View style={styles.infoRow}>
              <MapPin size={16} color="#6B7280" />
              <KurdishText variant="body" color="#6B7280">
                {customer.address}
              </KurdishText>
            </View>
          )}
          {customer.nationalId && (
            <View style={styles.infoRow}>
              <CreditCard size={16} color="#6B7280" />
              <KurdishText variant="body" color="#6B7280">
                ژمارەی ناسنامە: {customer.nationalId}
              </KurdishText>
            </View>
          )}
          {customer.customerGroup && (
            <View style={styles.infoRow}>
              <Users size={16} color={getCustomerGroupColor(customer.customerGroup)} />
              <KurdishText variant="body" color={getCustomerGroupColor(customer.customerGroup)}>
                گروپ: {getCustomerGroupName(customer.customerGroup)}
              </KurdishText>
            </View>
          )}
          <View style={styles.infoRow}>
            <Award size={16} color={getCustomerRatingColor(customerRating)} />
            <KurdishText variant="body" color={getCustomerRatingColor(customerRating)}>
              پلە: {getCustomerRatingName(customerRating)}
            </KurdishText>
          </View>
        </View>

        {/* Action Buttons */}
        {hasPermission(PERMISSIONS.SEND_NOTIFICATIONS) && customer.email && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/send-notification?customerId=${customer.id}`)}
          >
            <Send size={20} color="#1E3A8A" />
            <KurdishText variant="body" color="#1E3A8A">
              ناردنی ئیمەیڵ
            </KurdishText>
          </TouchableOpacity>
        )}
      </GradientCard>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <GradientCard style={styles.statCard}>
          <TrendingDown size={24} color="#EF4444" />
          <KurdishText variant="body" color="#EF4444">
            {formatCurrency(remainingDebt)}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            قەرزی ماوە
          </KurdishText>
        </GradientCard>
        <GradientCard style={styles.statCard}>
          <TrendingUp size={24} color="#10B981" />
          <KurdishText variant="body" color="#10B981">
            {formatCurrency(totalPaid)}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            کۆی پارەدان
          </KurdishText>
        </GradientCard>
        <GradientCard style={styles.statCard}>
          <FileText size={24} color="#3B82F6" />
          <KurdishText variant="body" color="#1F2937">
            {activeDebtsCount}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            قەرزی چالاک
          </KurdishText>
        </GradientCard>
        <GradientCard style={styles.statCard}>
          <Clock size={24} color="#F59E0B" />
          <KurdishText variant="body" color="#1F2937">
            {recentPayments.length > 0 ? formatDate(recentPayments[0].paymentDate) : 'هیچ'}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            دوایین پارەدان
          </KurdishText>
        </GradientCard>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentSection}>
        <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
          چالاکی نوێ
        </KurdishText>
        {recentPayments.length > 0 ? (
          <FlatList
            data={recentPayments}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <GradientCard style={styles.emptyCard}>
            <Clock size={32} color="#9CA3AF" />
            <KurdishText variant="body" color="#6B7280">
              هیچ پارەدانێک نەکراوە
            </KurdishText>
          </GradientCard>
        )}
      </View>
    </ScrollView>
  );

  const renderDebtsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <KurdishText variant="subtitle" color="#1F2937">
          قەرزەکان ({activeDebts.length})
        </KurdishText>
      </View>
      {activeDebts.length > 0 ? (
        <FlatList
          data={activeDebts}
          renderItem={renderDebtItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FileText size={48} color="#9CA3AF" />
          <KurdishText variant="body" color="#6B7280">
            هیچ قەرزێکی چالاک نییە
          </KurdishText>
        </View>
      )}
    </View>
  );

  const renderPaymentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <KurdishText variant="subtitle" color="#1F2937">
          پارەدانەکان ({customerPayments.length})
        </KurdishText>
      </View>
      {customerPayments.length > 0 ? (
        <FlatList
          data={customerPayments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <DollarSign size={48} color="#9CA3AF" />
          <KurdishText variant="body" color="#6B7280">
            هیچ پارەدانێک نەکراوە
          </KurdishText>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          زانیاری کڕیار
        </KurdishText>
        {hasPermission(PERMISSIONS.EDIT_CUSTOMER) && (
          <TouchableOpacity 
            onPress={() => router.push(`/edit-customer?id=${customer.id}`)}
            style={styles.editButton}
          >
            <Edit size={24} color="#1E3A8A" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setActiveTab('overview')}
        >
          <KurdishText 
            variant="body" 
            color={activeTab === 'overview' ? 'white' : '#6B7280'}
          >
            گشتی
          </KurdishText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'debts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('debts')}
        >
          <KurdishText 
            variant="body" 
            color={activeTab === 'debts' ? 'white' : '#6B7280'}
          >
            قەرزەکان
          </KurdishText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'payments' && styles.tabButtonActive]}
          onPress={() => setActiveTab('payments')}
        >
          <KurdishText 
            variant="body" 
            color={activeTab === 'payments' ? 'white' : '#6B7280'}
          >
            پارەدانەکان
          </KurdishText>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'debts' && renderDebtsTab()}
      {activeTab === 'payments' && renderPaymentsTab()}
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
  editButton: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabHeader: {
    marginBottom: 16,
  },
  customerInfoCard: {
    padding: 20,
    marginBottom: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerBasicInfo: {
    flex: 1,
  },
  customerMeta: {
    marginTop: 8,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  additionalInfo: {
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  recentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  listContainer: {
    paddingBottom: 16,
  },
  listItem: {
    padding: 16,
    marginBottom: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  listItemAmount: {
    alignItems: 'flex-end',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
});