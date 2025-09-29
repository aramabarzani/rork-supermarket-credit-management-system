import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  FileText,
  ChevronDown,
} from 'lucide-react-native';
import { SearchFilters, PaymentFilters } from '@/types/debt';
import { KurdishText } from './KurdishText';

interface AdvancedSearchProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters | PaymentFilters) => void;
  searchType: 'debts' | 'payments';
  initialFilters?: SearchFilters | PaymentFilters;
}

export function AdvancedSearch({
  visible,
  onClose,
  onSearch,
  searchType,
  initialFilters = {},
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters | PaymentFilters>(initialFilters);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);

  const categories = [
    'خۆراک',
    'نووت',
    'موبایل',
    'کارەبا',
    'ئاو',
    'گاز',
    'نەوت',
    'پارچە',
    'دەرمان',
    'هیتر',
  ];

  const statusOptions = [
    { value: 'all', label: 'هەموو' },
    { value: 'active', label: 'چالاک' },
    { value: 'paid', label: 'پارەدراو' },
    { value: 'partial', label: 'بەشی' },
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'هەموو' },
    { value: 'complete', label: 'تەواو' },
    { value: 'incomplete', label: 'ناتەواو' },
  ];

  const sortOptions = [
    { value: 'date', label: 'بەروار' },
    { value: 'amount', label: 'بڕ' },
    { value: 'customer', label: 'کڕیار' },
    ...(searchType === 'debts' ? [{ value: 'category', label: 'مۆر' }] : []),
  ];

  const handleApplyFilters = () => {
    onSearch(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText style={styles.title}>گەڕانی پێشکەوتوو</KurdishText>
          <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
            <KurdishText style={styles.clearText}>پاککردنەوە</KurdishText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* General Search */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Search size={20} color="#1E3A8A" />
              <KurdishText style={styles.sectionTitle}>گەڕانی گشتی</KurdishText>
            </View>
            <TextInput
              style={styles.input}
              placeholder="گەڕان لە ناو هەموو فیلدەکان..."
              value={filters.searchText || ''}
              onChangeText={(text) => updateFilter('searchText', text)}
            />
          </View>

          {/* Receipt Number */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#1E3A8A" />
              <KurdishText style={styles.sectionTitle}>ژمارەی وەسڵ</KurdishText>
            </View>
            <TextInput
              style={styles.input}
              placeholder="ژمارەی وەسڵ..."
              value={filters.receiptNumber || ''}
              onChangeText={(text) => updateFilter('receiptNumber', text)}
            />
          </View>

          {/* Amount Range */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color="#1E3A8A" />
              <KurdishText style={styles.sectionTitle}>مەودای بڕ</KurdishText>
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="کەمترین بڕ"
                value={filters.minAmount?.toString() || ''}
                onChangeText={(text) => updateFilter('minAmount', text ? parseFloat(text) : undefined)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="زۆرترین بڕ"
                value={filters.maxAmount?.toString() || ''}
                onChangeText={(text) => updateFilter('maxAmount', text ? parseFloat(text) : undefined)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#1E3A8A" />
              <KurdishText style={styles.sectionTitle}>مەودای بەروار</KurdishText>
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="بەرواری دەستپێک (YYYY-MM-DD)"
                value={filters.startDate || ''}
                onChangeText={(text) => updateFilter('startDate', text)}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="بەرواری کۆتایی (YYYY-MM-DD)"
                value={filters.endDate || ''}
                onChangeText={(text) => updateFilter('endDate', text)}
              />
            </View>
          </View>

          {/* Category (for debts only) */}
          {searchType === 'debts' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Filter size={20} color="#1E3A8A" />
                <KurdishText style={styles.sectionTitle}>مۆری قەرز</KurdishText>
              </View>
              <TouchableOpacity
                style={[styles.input, styles.picker]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <KurdishText style={styles.pickerText}>
                  {(filters as SearchFilters).category || 'هەڵبژاردنی مۆر'}
                </KurdishText>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          {/* Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Filter size={20} color="#1E3A8A" />
              <KurdishText style={styles.sectionTitle}>بارودۆخ</KurdishText>
            </View>
            <TouchableOpacity
              style={[styles.input, styles.picker]}
              onPress={() => setShowStatusPicker(true)}
            >
              <KurdishText style={styles.pickerText}>
                {(searchType === 'debts' ? statusOptions : paymentStatusOptions).find(s => s.value === (filters as any).status)?.label || 'هەڵبژاردنی بارودۆخ'}
              </KurdishText>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
          </View>



          {/* Sorting */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Filter size={20} color="#1E3A8A" />
              <KurdishText style={styles.sectionTitle}>ڕیزکردن</KurdishText>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.input, styles.halfInput, styles.picker]}
                onPress={() => setShowSortPicker(true)}
              >
                <KurdishText style={styles.pickerText}>
                  {sortOptions.find(s => s.value === filters.sortBy)?.label || 'ڕیزکردن بە پێی'}
                </KurdishText>
                <ChevronDown size={16} color="#666" />
              </TouchableOpacity>
              <View style={styles.sortOrderContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    filters.sortOrder === 'asc' && styles.sortOrderButtonActive,
                  ]}
                  onPress={() => updateFilter('sortOrder', 'asc')}
                >
                  <KurdishText
                    style={[
                      styles.sortOrderText,
                      filters.sortOrder === 'asc' && styles.sortOrderTextActive,
                    ]}
                  >
                    بچووکەوە گەورە
                  </KurdishText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    filters.sortOrder === 'desc' && styles.sortOrderButtonActive,
                  ]}
                  onPress={() => updateFilter('sortOrder', 'desc')}
                >
                  <KurdishText
                    style={[
                      styles.sortOrderText,
                      filters.sortOrder === 'desc' && styles.sortOrderTextActive,
                    ]}
                  >
                    گەورەوە بچووک
                  </KurdishText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
            <KurdishText style={styles.applyButtonText}>جێبەجێکردن</KurdishText>
          </TouchableOpacity>
        </View>

        {/* Category Picker Modal */}
        <Modal visible={showCategoryPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <KurdishText style={styles.pickerTitle}>هەڵبژاردنی مۆر</KurdishText>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={() => {
                    updateFilter('category', undefined);
                    setShowCategoryPicker(false);
                  }}
                >
                  <KurdishText style={styles.pickerOptionText}>هەموو مۆرەکان</KurdishText>
                </TouchableOpacity>
                {categories.map((category) => {
                  const sanitizedCategory = category.trim();
                  if (!sanitizedCategory || sanitizedCategory.length > 50) return null;
                  
                  return (
                    <TouchableOpacity
                      key={category}
                      style={styles.pickerOption}
                      onPress={() => {
                        updateFilter('category', sanitizedCategory);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <KurdishText style={styles.pickerOptionText}>{sanitizedCategory}</KurdishText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Status Picker Modal */}
        <Modal visible={showStatusPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <KurdishText style={styles.pickerTitle}>هەڵبژاردنی بارودۆخ</KurdishText>
                <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {(searchType === 'debts' ? statusOptions : paymentStatusOptions).map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      updateFilter('status', option.value);
                      setShowStatusPicker(false);
                    }}
                  >
                    <KurdishText style={styles.pickerOptionText}>{option.label}</KurdishText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Sort Picker Modal */}
        <Modal visible={showSortPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <KurdishText style={styles.pickerTitle}>ڕیزکردن بە پێی</KurdishText>
                <TouchableOpacity onPress={() => setShowSortPicker(false)}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      updateFilter('sortBy', option.value);
                      setShowSortPicker(false);
                    }}
                  >
                    <KurdishText style={styles.pickerOptionText}>{option.label}</KurdishText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    color: '#64748B',
    fontSize: 16,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    color: '#64748B',
    fontSize: 16,
  },
  sortOrderContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortOrderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  sortOrderButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  sortOrderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sortOrderTextActive: {
    color: 'white',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  applyButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '70%',
    minWidth: 280,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  pickerOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'right',
  },
});