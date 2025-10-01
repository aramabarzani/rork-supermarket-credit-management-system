import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Search,
  Filter,
  Plus,
  Calendar,
  FileText,
  Edit3,
  Trash2,
  Receipt,
  X,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { 
  DEBT_CATEGORIES, 
  DEBT_FILTERS, 
  DEBT_FILTER_LABELS,
  AMOUNT_RANGES,
  getDebtCategoryById 
} from '@/constants/debt-categories';
import { Debt } from '@/types/debt';

export default function DebtManagementScreen() {
  const router = useRouter();
  const { 
    debts: allDebts,
    searchDebts,
    getOverdueDebts,
    getUnpaidDebts,
  } = useDebts();
  const { hasPermission } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: DEBT_FILTERS.ALL as string,
    category: 'all',
    amountRange: 'all',
    searchQuery: '',
  });

  const filteredDebts = useMemo(() => {
    let debts = [...allDebts];
    
    if (filters.status !== DEBT_FILTERS.ALL) {
      if (filters.status === DEBT_FILTERS.OVERDUE) {
        const now = new Date();
        debts = debts.filter(debt => 
          debt.dueDate && new Date(debt.dueDate) < now && debt.status !== 'paid'
        );
      } else {
        debts = debts.filter(debt => debt.status === filters.status);
      }
    }
    
    if (filters.category !== 'all') {
      debts = debts.filter(debt => debt.category === filters.category);
    }
    
    if (filters.amountRange !== 'all') {
      const range = AMOUNT_RANGES.find(r => r.id === filters.amountRange);
      if (range && range.min !== undefined) {
        debts = debts.filter(debt => debt.amount >= range.min!);
      }
      if (range && range.max !== undefined) {
        debts = debts.filter(debt => debt.amount <= range.max!);
      }
    }
    
    if (searchQuery.trim()) {
      const searchResults = searchDebts({ searchText: searchQuery.trim() });
      debts = debts.filter(debt => 
        searchResults.some(result => result.id === debt.id)
      );
    }
    
    return debts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allDebts, filters, searchDebts, searchQuery]);

  const overdueDebts = useMemo(() => getOverdueDebts(), [getOverdueDebts]);
  const unpaidDebts = useMemo(() => getUnpaidDebts(), [getUnpaidDebts]);

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

  const handleEditDebt = (debt: Debt) => {
    if (!hasPermission(PERMISSIONS.EDIT_DEBT)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی دەستکاری قەرزت نییە');
      return;
    }
    // Navigate to edit debt screen
    router.push(`/edit-debt/${debt.id}`);
  };

  const handleDeleteDebt = (debt: Debt) => {
    if (!hasPermission(PERMISSIONS.DELETE_DEBT)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی سڕینەوەی قەرزت نییە');
      return;
    }

    Alert.alert(
      'دڵنیابوونەوە',
      `دڵنیایت لە سڕینەوەی قەرزی ${debt.customerName}؟`,
      [
        { text: 'نەخێر', style: 'cancel' },
        { 
          text: 'بەڵێ', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete debt:', debt.id);
            Alert.alert('سەرکەوتوو', 'قەرزەکە سڕایەوە');
          }
        },
      ]
    );
  };

  const handleViewReceipt = (debt: Debt) => {
    // Navigate to receipt view
    router.push(`/receipt/${debt.id}`);
  };

  const applyFilter = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: DEBT_FILTERS.ALL,
      category: 'all',
      amountRange: 'all',
      searchQuery: '',
    });
    setSearchQuery('');
  };

  const renderDebtItem = ({ item }: { item: Debt }) => {
    const category = getDebtCategoryById(item.category);
    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'paid';

    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/customer-detail/${item.customerId}`);
        }}
      >
        <GradientCard style={[styles.debtCard, isOverdue && styles.overdueCard]}>
          <View style={styles.debtHeader}>
            <View style={styles.debtInfo}>
              <View style={styles.categoryBadge}>
                <KurdishText variant="caption" color="#1F2937" style={{ fontSize: 16 }}>
                  {category.icon}
                </KurdishText>
              </View>
              <View style={styles.debtDetails}>
                <KurdishText variant="subtitle" color="#1F2937">
                  {item.customerName}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  {category.name} • {formatDate(item.createdAt)}
                </KurdishText>
                {item.receiptNumber && (
                  <KurdishText variant="caption" color="#6B7280">
                    وەسڵ: {item.receiptNumber}
                  </KurdishText>
                )}
              </View>
            </View>
            <View style={styles.debtActions}>
              {hasPermission(PERMISSIONS.EDIT_DEBT) && (
                <TouchableOpacity
                  onPress={() => handleEditDebt(item)}
                  style={styles.actionButton}
                >
                  <Edit3 size={16} color="#3B82F6" />
                </TouchableOpacity>
              )}
              {hasPermission(PERMISSIONS.DELETE_DEBT) && (
                <TouchableOpacity
                  onPress={() => handleDeleteDebt(item)}
                  style={styles.actionButton}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleViewReceipt(item)}
                style={styles.actionButton}
              >
                <Receipt size={16} color="#10B981" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.debtAmount}>
            <View style={styles.amountRow}>
              <KurdishText variant="caption" color="#6B7280">
                کۆی قەرز
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(item.amount)}
              </KurdishText>
            </View>
            <View style={styles.amountRow}>
              <KurdishText variant="caption" color="#6B7280">
                ماوە
              </KurdishText>
              <KurdishText 
                variant="body" 
                color={item.status === 'paid' ? '#10B981' : '#EF4444'}
              >
                {formatCurrency(item.remainingAmount)}
              </KurdishText>
            </View>
          </View>

          {item.description && (
            <View style={styles.debtDescription}>
              <KurdishText variant="caption" color="#6B7280">
                {item.description}
              </KurdishText>
            </View>
          )}

          {item.dueDate && (
            <View style={styles.dueDate}>
              <Calendar size={14} color={isOverdue ? '#EF4444' : '#6B7280'} />
              <KurdishText 
                variant="caption" 
                color={isOverdue ? '#EF4444' : '#6B7280'}
              >
                بەرواری گەڕاندنەوە: {formatDate(item.dueDate)}
              </KurdishText>
            </View>
          )}

          <View style={styles.statusBadge}>
            <KurdishText 
              variant="caption" 
              color={
                item.status === 'paid' ? '#10B981' : 
                item.status === 'partial' ? '#F59E0B' : '#EF4444'
              }
            >
              {item.status === 'paid' ? 'دراوەتەوە' : 
               item.status === 'partial' ? 'بەشی' : 'چالاک'}
            </KurdishText>
          </View>
        </GradientCard>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <KurdishText variant="title" color="#1F2937">
            فلتەرەکان
          </KurdishText>
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={styles.closeButton}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Status Filter */}
          <View style={styles.filterSection}>
            <KurdishText variant="subtitle" color="#1F2937">
              دۆخی قەرز
            </KurdishText>
            <View style={styles.filterOptions}>
              {Object.entries(DEBT_FILTER_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterOption,
                    filters.status === key && styles.filterOptionSelected,
                  ]}
                  onPress={() => applyFilter('status', key)}
                >
                  <KurdishText 
                    variant="body" 
                    color={filters.status === key ? 'white' : '#1F2937'}
                  >
                    {label}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <KurdishText variant="subtitle" color="#1F2937">
              مۆری قەرز
            </KurdishText>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filters.category === 'all' && styles.filterOptionSelected,
                ]}
                onPress={() => applyFilter('category', 'all')}
              >
                <KurdishText 
                  variant="body" 
                  color={filters.category === 'all' ? 'white' : '#1F2937'}
                >
                  هەموو مۆرەکان
                </KurdishText>
              </TouchableOpacity>
              {DEBT_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterOption,
                    filters.category === category.id && styles.filterOptionSelected,
                  ]}
                  onPress={() => applyFilter('category', category.id)}
                >
                  <KurdishText variant="body" style={{ fontSize: 16 }}>
                    {category.icon}
                  </KurdishText>
                  <KurdishText 
                    variant="body" 
                    color={filters.category === category.id ? 'white' : '#1F2937'}
                  >
                    {category.name}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount Range Filter */}
          <View style={styles.filterSection}>
            <KurdishText variant="subtitle" color="#1F2937">
              بڕی قەرز
            </KurdishText>
            <View style={styles.filterOptions}>
              {AMOUNT_RANGES.map(range => (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.filterOption,
                    filters.amountRange === range.id && styles.filterOptionSelected,
                  ]}
                  onPress={() => applyFilter('amountRange', range.id)}
                >
                  <KurdishText 
                    variant="body" 
                    color={filters.amountRange === range.id ? 'white' : '#1F2937'}
                  >
                    {range.label}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <KurdishText variant="body" color="#EF4444">
                پاککردنەوەی فلتەرەکان
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو، وەسف یان ژمارەی وەسڵ..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#1E3A8A" />
          </TouchableOpacity>
          
          {hasPermission(PERMISSIONS.ADD_DEBT) && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-debt')}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <GradientCard style={styles.statCard}>
          <KurdishText variant="caption" color="#6B7280">
            کۆی قەرزەکان
          </KurdishText>
          <KurdishText variant="subtitle" color="#1F2937">
            {filteredDebts.length}
          </KurdishText>
        </GradientCard>
        
        <GradientCard style={styles.statCard}>
          <KurdishText variant="caption" color="#6B7280">
            دواکەوتوو
          </KurdishText>
          <KurdishText variant="subtitle" color="#EF4444">
            {overdueDebts.length}
          </KurdishText>
        </GradientCard>
        
        <GradientCard style={styles.statCard}>
          <KurdishText variant="caption" color="#6B7280">
            نەپارەدراو
          </KurdishText>
          <KurdishText variant="subtitle" color="#F59E0B">
            {unpaidDebts.length}
          </KurdishText>
        </GradientCard>
      </View>

      <FlatList
        data={filteredDebts}
        renderItem={renderDebtItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={48} color="#9CA3AF" />
            <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16 }}>
              هیچ قەرزێک نەدۆزرایەوە
            </KurdishText>
          </View>
        }
      />

      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  debtCard: {
    marginBottom: 12,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  debtInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtDetails: {
    flex: 1,
    gap: 2,
  },
  debtActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  debtAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 8,
  },
  amountRow: {
    alignItems: 'center',
    gap: 4,
  },
  debtDescription: {
    marginBottom: 8,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#1E3A8A',
  },
  modalActions: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});