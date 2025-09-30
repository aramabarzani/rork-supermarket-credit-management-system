import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';
import { KurdishText } from './KurdishText';
import { trpc } from '@/lib/trpc';

interface QuickSearchBarProps {
  onResultSelect?: (result: any) => void;
  placeholder?: string;
  types?: ('customer' | 'employee' | 'debt' | 'payment')[];
}

export function QuickSearchBar({
  onResultSelect,
  placeholder = 'گەڕان...',
  types = ['customer'],
}: QuickSearchBarProps) {
  const [query, setQuery] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const searchQuery = trpc.search.quick.useQuery(
    { query, type: types[0] || 'all' },
    { enabled: query.length > 0 }
  );

  const results = searchQuery.data
    ? [
        ...(searchQuery.data.customers || []).map((c: any) => ({
          id: c.id,
          type: 'customer',
          title: c.name,
          subtitle: c.phone,
          data: c,
          relevance: 1,
        })),
        ...(searchQuery.data.employees || []).map((e: any) => ({
          id: e.id,
          type: 'employee',
          title: e.name,
          subtitle: e.phone,
          data: e,
          relevance: 1,
        })),
        ...(searchQuery.data.debts || []).map((d: any) => ({
          id: d.id,
          type: 'debt',
          title: `قەرز: ${d.amount}`,
          subtitle: d.description,
          data: d,
          relevance: 1,
        })),
        ...(searchQuery.data.payments || []).map((p: any) => ({
          id: p.id,
          type: 'payment',
          title: `پارەدان: ${p.amount}`,
          subtitle: p.description,
          data: p,
          relevance: 1,
        })),
      ]
    : [];

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setShowResults(text.length > 0);
  }, []);

  const handleResultSelect = useCallback(
    (result: any) => {
      setShowResults(false);
      setQuery('');
      onResultSelect?.(result);
    },
    [onResultSelect]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setShowResults(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Filter size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {searchQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <KurdishText style={styles.loadingText}>گەڕان...</KurdishText>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleResultSelect(item)}
                >
                  <View style={styles.resultContent}>
                    <KurdishText style={styles.resultTitle}>
                      {item.title}
                    </KurdishText>
                    {item.subtitle && (
                      <KurdishText style={styles.resultSubtitle}>
                        {item.subtitle}
                      </KurdishText>
                    )}
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeColor(item.type) },
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {getTypeLabel(item.type)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <KurdishText style={styles.emptyText}>
                هیچ ئەنجامێک نەدۆزرایەوە
              </KurdishText>
            </View>
          )}
        </View>
      )}

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>فلتەرەکان</KurdishText>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <KurdishText style={styles.comingSoon}>
              بەزووانە دێت...
            </KurdishText>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    customer: '#4CAF50',
    employee: '#2196F3',
    debt: '#FF9800',
    payment: '#9C27B0',
    receipt: '#00BCD4',
  };
  return colors[type] || '#999';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    customer: 'کڕیار',
    employee: 'کارمەند',
    debt: 'قەرز',
    payment: 'پارەدان',
    receipt: 'وەسڵ',
  };
  return labels[type] || type;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative' as const,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  resultsContainer: {
    position: 'absolute' as const,
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  resultsList: {
    maxHeight: 400,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultContent: {
    flex: 1,
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600' as const,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  comingSoon: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
