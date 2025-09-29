import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Search,
  Filter,
  FileText,
  Plus,
  X,
  Receipt as ReceiptIcon
} from 'lucide-react-native';
import { useReceipts } from '@/hooks/receipt-context';
import { Receipt, ReceiptFilters } from '@/types/debt';
import ReceiptComponent from '@/components/ReceiptComponent';

export default function ReceiptsScreen() {
  const router = useRouter();
  const receiptContext = useReceipts();
  
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (receiptContext?.loadData) {
      receiptContext.loadData();
    }
  }, [receiptContext?.loadData]);
  
  if (!receiptContext) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>چاوەڕوان بە...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    receipts,
    isLoading,
    searchReceipts
  } = receiptContext;

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 د.ع';
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReceipts = searchReceipts({
    ...filters,
    searchText: searchText.trim() || undefined
  });

  const handleReceiptPress = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };

  const handlePrintReceipt = (receipt: Receipt) => {
    console.log('Printing receipt:', receipt.receiptNumber);
    // Implementation for printing would go here
  };

  const handleDownloadReceipt = (receipt: Receipt) => {
    console.log('Downloading receipt:', receipt.receiptNumber);
    // Implementation for PDF download would go here
  };

  const handleEmailReceipt = (receipt: Receipt) => {
    console.log('Emailing receipt:', receipt.receiptNumber);
    // Implementation for email would go here
  };

  const handleShareReceipt = (receipt: Receipt) => {
    console.log('Sharing receipt:', receipt.receiptNumber);
    // Implementation for sharing would go here
  };



  const clearFilters = () => {
    setFilters({
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSearchText('');
    setShowFilters(false);
  };

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      style={styles.receiptItem}
      onPress={() => handleReceiptPress(item)}
    >
      <View style={styles.receiptHeader}>
        <View style={styles.receiptInfo}>
          <View style={styles.receiptTitleRow}>
            <ReceiptIcon size={16} color={item.type === 'debt' ? '#EF4444' : '#10B981'} />
            <Text style={styles.receiptType}>
              {item.type === 'debt' ? 'قەرز' : 'پارەدان'}
            </Text>
            <Text style={styles.receiptNumber}>#{item.receiptNumber}</Text>
          </View>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.receiptDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.receiptAmount}>
          <Text style={[
            styles.amountText,
            { color: item.type === 'debt' ? '#EF4444' : '#10B981' }
          ]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>
      </View>
      {item.notes && (
        <Text style={styles.receiptNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F3F4F6', '#FFFFFF']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>وەسڵەکان</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-debt')}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="گەڕان لە وەسڵەکان..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Filter size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{receipts.length}</Text>
              <Text style={styles.statLabel}>کۆی وەسڵەکان</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {receipts.filter(r => r.type === 'debt').length}
              </Text>
              <Text style={styles.statLabel}>وەسڵی قەرز</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {receipts.filter(r => r.type === 'payment').length}
              </Text>
              <Text style={styles.statLabel}>وەسڵی پارەدان</Text>
            </View>
          </View>

          {/* Receipts List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
            </View>
          ) : filteredReceipts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FileText size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>هیچ وەسڵێک نەدۆزرایەوە</Text>
              <Text style={styles.emptyText}>
                {searchText ? 'هیچ وەسڵێک بە ئەم گەڕانە نەدۆزرایەوە' : 'هێشتا هیچ وەسڵێک دروست نەکراوە'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredReceipts}
              renderItem={renderReceiptItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </LinearGradient>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>فلتەرەکان</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterForm}>
              {/* Type Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>جۆری وەسڵ</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: 'all', label: 'هەموو' },
                    { value: 'debt', label: 'قەرز' },
                    { value: 'payment', label: 'پارەدان' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        filters.type === option.value && styles.activeFilterOption
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, type: option.value as any }))}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.type === option.value && styles.activeFilterOptionText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort Options */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>ڕیزکردن بە پێی</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: 'date', label: 'بەروار' },
                    { value: 'amount', label: 'بڕ' },
                    { value: 'customer', label: 'کڕیار' },
                    { value: 'receiptNumber', label: 'ژمارەی وەسڵ' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        filters.sortBy === option.value && styles.activeFilterOption
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.sortBy === option.value && styles.activeFilterOptionText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort Order */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>ڕیزکردن</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: 'desc', label: 'نوێترین یەکەم' },
                    { value: 'asc', label: 'کۆنترین یەکەم' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        filters.sortOrder === option.value && styles.activeFilterOption
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, sortOrder: option.value as any }))}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.sortOrder === option.value && styles.activeFilterOptionText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>پاککردنەوە</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyButtonText}>جێبەجێکردن</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <Modal
          visible={!!selectedReceipt}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedReceipt(null)}
        >
          <View style={styles.receiptModalOverlay}>
            <ScrollView contentContainerStyle={styles.receiptModalContainer}>
              <ReceiptComponent
                receipt={selectedReceipt}
                onClose={() => setSelectedReceipt(null)}
                onPrint={handlePrintReceipt}
                onDownload={handleDownloadReceipt}
                onEmail={handleEmailReceipt}
                onShare={handleShareReceipt}
              />
            </ScrollView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  receiptItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptInfo: {
    flex: 1,
  },
  receiptTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  receiptType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  receiptNumber: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  receiptAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  receiptNotes: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterForm: {
    maxHeight: 400,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  receiptModalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});