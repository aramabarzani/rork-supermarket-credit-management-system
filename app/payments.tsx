import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Calendar, 
  DollarSign, 
  FileText, 
  Filter,
  Plus,
  Receipt,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { Payment } from '@/types/debt';

export default function PaymentsScreen() {
  const router = useRouter();
  const { payments, debts } = useDebts();
  const { hasPermission } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter payments based on search and date filters
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    // Date filter
    const now = new Date();
    if (selectedFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) >= today
      );
    } else if (selectedFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) >= weekAgo
      );
    } else if (selectedFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) >= monthAgo
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => {
        const debt = debts.find(d => d.id === payment.debtId);
        return (
          debt?.customerName.toLowerCase().includes(query) ||
          payment.receivedByName.toLowerCase().includes(query) ||
          payment.notes?.toLowerCase().includes(query)
        );
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }, [payments, debts, searchQuery, selectedFilter]);

  // Calculate summary statistics
  const paymentSummary = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayPayments = payments.filter(p => new Date(p.paymentDate) >= todayStart);
    const weekPayments = payments.filter(p => new Date(p.paymentDate) >= weekAgo);
    const monthPayments = payments.filter(p => new Date(p.paymentDate) >= monthAgo);

    return {
      todayTotal: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      todayCount: todayPayments.length,
      weekTotal: weekPayments.reduce((sum, p) => sum + p.amount, 0),
      weekCount: weekPayments.length,
      monthTotal: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      monthCount: monthPayments.length,
      totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCustomerName = (debtId: string) => {
    const debt = debts.find(d => d.id === debtId);
    return debt?.customerName || 'نەناسراو';
  };

  const handlePrintReceipt = (payment: Payment) => {
    if (!payment?.id || !payment?.amount || payment.amount <= 0) return;
    // In a real app, this would generate and print a receipt
    console.log('Print receipt for payment:', payment.id, formatCurrency(payment.amount));
  };

  const filterButtons = [
    { id: 'all', label: 'هەموو', icon: FileText },
    { id: 'today', label: 'ئەمڕۆ', icon: Calendar },
    { id: 'week', label: 'ئەم هەفتەیە', icon: TrendingUp },
    { id: 'month', label: 'ئەم مانگە', icon: Users },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <GradientCard style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <View style={styles.summaryIcon}>
                  <Calendar size={24} color="#10B981" />
                </View>
                <View style={styles.summaryText}>
                  <KurdishText variant="caption" color="#6B7280">
                    {'ئەمڕۆ'}
                  </KurdishText>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {formatCurrency(paymentSummary.todayTotal)}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {`${paymentSummary.todayCount} پارەدان`}
                  </KurdishText>
                </View>
              </View>
            </GradientCard>

            <GradientCard style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <View style={styles.summaryIcon}>
                  <TrendingUp size={24} color="#3B82F6" />
                </View>
                <View style={styles.summaryText}>
                  <KurdishText variant="caption" color="#6B7280">
                    {'ئەم مانگە'}
                  </KurdishText>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {formatCurrency(paymentSummary.monthTotal)}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {`${paymentSummary.monthCount} پارەدان`}
                  </KurdishText>
                </View>
              </View>
            </GradientCard>
          </View>

          {/* Search and Filters */}
          <GradientCard style={styles.searchCard}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#6B7280" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="گەڕان بە ناوی کڕیار یان وەرگر..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  textAlign="right"
                />
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterButtons}>
                    {filterButtons.map(filter => {
                      const IconComponent = filter.icon;
                      const isSelected = selectedFilter === filter.id;
                      return (
                        <TouchableOpacity
                          key={filter.id}
                          style={[
                            styles.filterChip,
                            isSelected && styles.filterChipSelected,
                          ]}
                          onPress={() => setSelectedFilter(filter.id as any)}
                        >
                          <IconComponent 
                            size={16} 
                            color={isSelected ? 'white' : '#6B7280'} 
                          />
                          <KurdishText 
                            variant="caption" 
                            color={isSelected ? 'white' : '#6B7280'}
                          >
                            {filter.label}
                          </KurdishText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
          </GradientCard>

          {/* Add Payment Button */}
          {hasPermission(PERMISSIONS.ADD_PAYMENT) && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-payment')}
            >
              <Plus size={20} color="white" />
              <KurdishText variant="subtitle" color="white">
                {'پارەدانی نوێ'}
              </KurdishText>
            </TouchableOpacity>
          )}

          {/* Payments List */}
          <View style={styles.paymentsContainer}>
            <View style={styles.sectionHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                {`لیستی پارەدانەکان (${filteredPayments.length})`}
              </KurdishText>
            </View>

            {filteredPayments.length === 0 ? (
              <GradientCard style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <DollarSign size={48} color="#9CA3AF" />
                  <KurdishText variant="body" color="#6B7280">
                    {'هیچ پارەدانێک نەدۆزرایەوە'}
                  </KurdishText>
                </View>
              </GradientCard>
            ) : (
              filteredPayments.map(payment => (
                <GradientCard key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentInfo}>
                      <KurdishText variant="subtitle" color="#1F2937">
                        {getCustomerName(payment.debtId)}
                      </KurdishText>
                      <KurdishText variant="caption" color="#6B7280">
                        {`وەرگر: ${payment.receivedByName}`}
                      </KurdishText>
                    </View>
                    <View style={styles.paymentAmount}>
                      <KurdishText variant="title" color="#10B981">
                        {formatCurrency(payment.amount)}
                      </KurdishText>
                    </View>
                  </View>

                  <View style={styles.paymentDetails}>
                    <View style={styles.paymentMeta}>
                      <Calendar size={16} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280">
                        {formatDate(payment.paymentDate)}
                      </KurdishText>
                    </View>
                    
                    {payment.notes && (
                      <View style={styles.paymentNotes}>
                        <FileText size={16} color="#6B7280" />
                        <KurdishText variant="caption" color="#6B7280">
                          {payment.notes}
                        </KurdishText>
                      </View>
                    )}
                  </View>

                  <View style={styles.paymentActions}>
                    <TouchableOpacity
                      style={styles.receiptButton}
                      onPress={() => handlePrintReceipt(payment)}
                    >
                      <Receipt size={16} color="#1E3A8A" />
                      <KurdishText variant="caption" color="#1E3A8A">
                        {'چاپی وەسڵ'}
                      </KurdishText>
                    </TouchableOpacity>
                  </View>
                </GradientCard>
              ))
            )}
          </View>
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
  content: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipSelected: {
    backgroundColor: '#1E3A8A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  paymentsContainer: {
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
  paymentCard: {
    padding: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
  },
});