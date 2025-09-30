import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Search,
  Filter,
  FileText,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

import VoiceSearchButton from '@/components/VoiceSearchButton';
import AdvancedSearchModal from '@/components/AdvancedSearchModal';
import { useDebts } from '@/hooks/debt-context';
import { SearchFilters, PaymentFilters, Debt, Payment } from '@/types/debt';

export default function SearchTab() {
  const { 
    searchDebts, 
    searchPayments, 
    searchAllData,
    getNewDebts,
    getNewPayments,
    getDebtsByAmountRange,
  } = useDebts();

  const [searchType, setSearchType] = useState<'debts' | 'payments' | 'all'>('all');
  const [quickSearch, setQuickSearch] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | PaymentFilters>({});
  const [searchResults, setSearchResults] = useState<{
    debts: Debt[];
    payments: Payment[];
  }>({ debts: [], payments: [] });

  // Quick search results
  const quickSearchResults = useMemo(() => {
    if (!quickSearch.trim()) return { debts: [], payments: [] };
    return searchAllData(quickSearch);
  }, [quickSearch, searchAllData]);

  // Advanced search results
  const advancedSearchResults = useMemo(() => {
    if (Object.keys(currentFilters).length === 0) return { debts: [], payments: [] };
    
    if (searchType === 'debts') {
      return { debts: searchDebts(currentFilters as SearchFilters), payments: [] };
    } else if (searchType === 'payments') {
      return { debts: [], payments: searchPayments(currentFilters as PaymentFilters) };
    }
    
    return { debts: [], payments: [] };
  }, [currentFilters, searchType, searchDebts, searchPayments]);

  // Combined results
  const displayResults = useMemo(() => {
    if (quickSearch.trim()) return quickSearchResults;
    if (Object.keys(currentFilters).length > 0) return advancedSearchResults;
    return searchResults;
  }, [quickSearch, quickSearchResults, advancedSearchResults, searchResults]);

  const handleAdvancedSearch = (filters: SearchFilters | PaymentFilters) => {
    if (!filters || typeof filters !== 'object') return;
    setCurrentFilters(filters);
    setQuickSearch('');
  };

  const handleQuickFilter = (type: 'new-debts' | 'new-payments' | 'small-debts' | 'medium-debts' | 'large-debts') => {
    setQuickSearch('');
    setCurrentFilters({});
    
    switch (type) {
      case 'new-debts':
        setSearchResults({ debts: getNewDebts(7), payments: [] });
        break;
      case 'new-payments':
        setSearchResults({ debts: [], payments: getNewPayments(7) });
        break;
      case 'small-debts':
        setSearchResults({ debts: getDebtsByAmountRange('small'), payments: [] });
        break;
      case 'medium-debts':
        setSearchResults({ debts: getDebtsByAmountRange('medium'), payments: [] });
        break;
      case 'large-debts':
        setSearchResults({ debts: getDebtsByAmountRange('large'), payments: [] });
        break;
    }
  };

  const clearAllFilters = () => {
    setQuickSearch('');
    setCurrentFilters({});
    setSearchResults({ debts: [], payments: [] });
  };

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0 د.ع';
    return new Intl.NumberFormat('ku-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ku-IQ');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="گەڕان لە هەموو داتاکان..."
              value={quickSearch}
              onChangeText={setQuickSearch}
              textAlign="right"
            />
          </View>
          <VoiceSearchButton
            onResult={(text) => setQuickSearch(text)}
            language="ku"
            searchType="general"
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowAdvancedSearch(true)}
          >
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Type Selector */}
        <View style={styles.searchTypeContainer}>
          <TouchableOpacity
            style={[styles.searchTypeButton, searchType === 'all' && styles.searchTypeButtonActive]}
            onPress={() => setSearchType('all')}
          >
            <KurdishText style={[styles.searchTypeText, searchType === 'all' && styles.searchTypeTextActive]}>
              هەموو
            </KurdishText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchTypeButton, searchType === 'debts' && styles.searchTypeButtonActive]}
            onPress={() => setSearchType('debts')}
          >
            <KurdishText style={[styles.searchTypeText, searchType === 'debts' && styles.searchTypeTextActive]}>
              قەرزەکان
            </KurdishText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchTypeButton, searchType === 'payments' && styles.searchTypeButtonActive]}
            onPress={() => setSearchType('payments')}
          >
            <KurdishText style={[styles.searchTypeText, searchType === 'payments' && styles.searchTypeTextActive]}>
              پارەدانەکان
            </KurdishText>
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
        <View style={styles.quickFiltersContainer}>
          <KurdishText style={styles.sectionTitle}>فلتەری خێرا</KurdishText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFiltersScroll}>
            <TouchableOpacity
              style={styles.quickFilterChip}
              onPress={() => handleQuickFilter('new-debts')}
            >
              <TrendingUp size={16} color="#1E3A8A" />
              <KurdishText style={styles.quickFilterText}>قەرزە نوێکان</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFilterChip}
              onPress={() => handleQuickFilter('new-payments')}
            >
              <TrendingDown size={16} color="#059669" />
              <KurdishText style={styles.quickFilterText}>پارەدانە نوێکان</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFilterChip}
              onPress={() => handleQuickFilter('small-debts')}
            >
              <DollarSign size={16} color="#DC2626" />
              <KurdishText style={styles.quickFilterText}>قەرزی بچووک</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFilterChip}
              onPress={() => handleQuickFilter('medium-debts')}
            >
              <DollarSign size={16} color="#D97706" />
              <KurdishText style={styles.quickFilterText}>قەرزی ناوەند</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFilterChip}
              onPress={() => handleQuickFilter('large-debts')}
            >
              <DollarSign size={16} color="#7C2D12" />
              <KurdishText style={styles.quickFilterText}>قەرزی گەورە</KurdishText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Clear Filters */}
        {(quickSearch || Object.keys(currentFilters).length > 0 || searchResults.debts.length > 0 || searchResults.payments.length > 0) && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <KurdishText style={styles.clearButtonText}>پاککردنەوەی هەموو فلتەرەکان</KurdishText>
          </TouchableOpacity>
        )}

        {/* Results Summary */}
        {(displayResults.debts.length > 0 || displayResults.payments.length > 0) && (
          <View style={styles.resultsSummary}>
            <KurdishText style={styles.resultsTitle}>ئەنجامەکانی گەڕان</KurdishText>
            <View style={styles.resultsStats}>
              <View style={styles.resultStat}>
                <KurdishText style={styles.resultStatNumber}>{displayResults.debts.length}</KurdishText>
                <KurdishText style={styles.resultStatLabel}>قەرز</KurdishText>
              </View>
              <View style={styles.resultStat}>
                <KurdishText style={styles.resultStatNumber}>{displayResults.payments.length}</KurdishText>
                <KurdishText style={styles.resultStatLabel}>پارەدان</KurdishText>
              </View>
            </View>
          </View>
        )}

        {/* Debt Results */}
        {displayResults.debts.length > 0 && (
          <View style={styles.resultsSection}>
            <KurdishText style={styles.sectionTitle}>قەرزەکان</KurdishText>
            {displayResults.debts.map((debt) => (
              <GradientCard key={debt.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    <KurdishText style={styles.resultCustomer}>{debt.customerName}</KurdishText>
                    <KurdishText style={styles.resultDescription}>{debt.description}</KurdishText>
                  </View>
                  <View style={styles.resultAmount}>
                    <KurdishText style={styles.resultAmountText}>{formatCurrency(debt.amount)}</KurdishText>
                    <KurdishText style={styles.resultRemainingText}>
                      ماوە: {formatCurrency(debt.remainingAmount)}
                    </KurdishText>
                  </View>
                </View>
                <View style={styles.resultFooter}>
                  <View style={styles.resultMeta}>
                    <Calendar size={14} color="#64748B" />
                    <KurdishText style={styles.resultMetaText}>{formatDate(debt.createdAt)}</KurdishText>
                  </View>
                  <View style={styles.resultMeta}>
                    <FileText size={14} color="#64748B" />
                    <KurdishText style={styles.resultMetaText}>{debt.category}</KurdishText>
                  </View>
                  <View style={[styles.statusBadge, styles[`status${debt.status}`]]}>
                    <KurdishText style={styles.statusText}>
                      {debt.status === 'active' ? 'چالاک' : debt.status === 'paid' ? 'پارەدراو' : 'بەشی'}
                    </KurdishText>
                  </View>
                </View>
              </GradientCard>
            ))}
          </View>
        )}

        {/* Payment Results */}
        {displayResults.payments.length > 0 && (
          <View style={styles.resultsSection}>
            <KurdishText style={styles.sectionTitle}>پارەدانەکان</KurdishText>
            {displayResults.payments.map((payment) => (
              <GradientCard key={payment.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    <KurdishText style={styles.resultCustomer}>پارەدان</KurdishText>
                    <KurdishText style={styles.resultDescription}>
                      وەرگیراو لەلایەن: {payment.receivedByName}
                    </KurdishText>
                  </View>
                  <View style={styles.resultAmount}>
                    <KurdishText style={styles.resultAmountText}>{formatCurrency(payment.amount)}</KurdishText>
                  </View>
                </View>
                <View style={styles.resultFooter}>
                  <View style={styles.resultMeta}>
                    <Calendar size={14} color="#64748B" />
                    <KurdishText style={styles.resultMetaText}>{formatDate(payment.paymentDate)}</KurdishText>
                  </View>
                  <View style={styles.resultMeta}>
                    <User size={14} color="#64748B" />
                    <KurdishText style={styles.resultMetaText}>{payment.receivedByName}</KurdishText>
                  </View>
                </View>
              </GradientCard>
            ))}
          </View>
        )}

        {/* No Results */}
        {(quickSearch || Object.keys(currentFilters).length > 0) && 
         displayResults.debts.length === 0 && 
         displayResults.payments.length === 0 && (
          <View style={styles.noResults}>
            <Search size={48} color="#94A3B8" />
            <KurdishText style={styles.noResultsTitle}>هیچ ئەنجامێک نەدۆزرایەوە</KurdishText>
            <KurdishText style={styles.noResultsText}>
              تکایە مەرجەکانی گەڕان بگۆڕە یان فلتەرەکان پاک بکەرەوە
            </KurdishText>
          </View>
        )}

        {/* Default State */}
        {!quickSearch && 
         Object.keys(currentFilters).length === 0 && 
         searchResults.debts.length === 0 && 
         searchResults.payments.length === 0 && (
          <View style={styles.defaultState}>
            <Search size={64} color="#CBD5E1" />
            <KurdishText style={styles.defaultStateTitle}>گەڕان و فلتەری پێشکەوتوو</KurdishText>
            <KurdishText style={styles.defaultStateText}>
              دەتوانیت گەڕان بکەیت لە هەموو قەرز و پارەدانەکان، یان فلتەری پێشکەوتوو بەکاربهێنیت
            </KurdishText>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Search size={20} color="#1E3A8A" />
                <KurdishText style={styles.featureText}>گەڕان لە هەموو فیلدەکان</KurdishText>
              </View>
              <View style={styles.featureItem}>
                <Filter size={20} color="#1E3A8A" />
                <KurdishText style={styles.featureText}>فلتەری پێشکەوتوو</KurdishText>
              </View>
              <View style={styles.featureItem}>
                <FileText size={20} color="#1E3A8A" />
                <KurdishText style={styles.featureText}>گەڕان بە ژمارەی وەسڵ</KurdishText>
              </View>
              <View style={styles.featureItem}>
                <DollarSign size={20} color="#1E3A8A" />
                <KurdishText style={styles.featureText}>فلتەر بە بڕی پارە</KurdishText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearchModal
          visible={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          onSearch={(filters) => {
            handleAdvancedSearch(filters as SearchFilters | PaymentFilters);
            setShowAdvancedSearch(false);
          }}
          searchType={searchType === 'all' ? 'customer' : searchType === 'debts' ? 'debt' : 'payment'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  filterButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 12,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  searchTypeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  searchTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  searchTypeTextActive: {
    color: 'white',
  },
  quickFiltersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickFiltersScroll: {
    marginTop: 12,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  quickFilterText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  clearButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsSummary: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  resultsStats: {
    flexDirection: 'row',
    gap: 24,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  resultStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  resultCard: {
    marginTop: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
    marginRight: 12,
  },
  resultCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  resultAmount: {
    alignItems: 'flex-end',
  },
  resultAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  resultRemainingText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusactive: {
    backgroundColor: '#DBEAFE',
  },
  statuspaid: {
    backgroundColor: '#D1FAE5',
  },
  statuspartial: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  defaultState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  defaultStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
    marginTop: 16,
    marginBottom: 8,
  },
  defaultStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});