import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, User, FileText, DollarSign, Users, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KurdishText } from '@/components/KurdishText';
import { SearchFilterModal } from '@/components/SearchFilterModal';
import { trpc } from '@/lib/trpc';
import type { GlobalSearchFilters, SearchResult } from '@/types/global-search';

export default function GlobalSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<GlobalSearchFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const searchQuery = trpc.search.global.useQuery(
    { ...filters, query },
    { enabled: query.length > 0 || Object.keys(filters).length > 0 }
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <User size={20} color="#007AFF" />;
      case 'employee':
        return <Users size={20} color="#34C759" />;
      case 'debt':
        return <FileText size={20} color="#FF3B30" />;
      case 'payment':
        return <DollarSign size={20} color="#FF9500" />;
      default:
        return <Search size={20} color="#666" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'customer':
        return 'کڕیار';
      case 'employee':
        return 'کارمەند';
      case 'debt':
        return 'قەرز';
      case 'payment':
        return 'پارەدان';
      default:
        return '';
    }
  };

  const handleResultPress = (result: SearchResult) => {
    console.log('[Global Search] Result pressed:', result);
    
    switch (result.type) {
      case 'customer':
        router.push(`/customer-detail/${result.id}` as any);
        break;
      case 'debt':
        router.push('/debt-management' as any);
        break;
      case 'payment':
        router.push('/payments' as any);
        break;
      case 'employee':
        router.push('/employees' as any);
        break;
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US').format(amount) + ' IQD';
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultIcon}>{getIcon(item.type)}</View>
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <KurdishText style={styles.resultTitle}>{item.title}</KurdishText>
          <View style={styles.typeBadge}>
            <KurdishText style={styles.typeBadgeText}>
              {getTypeLabel(item.type)}
            </KurdishText>
          </View>
        </View>
        {item.subtitle && (
          <KurdishText style={styles.resultSubtitle}>{item.subtitle}</KurdishText>
        )}
        {item.description && (
          <KurdishText style={styles.resultDescription}>
            {item.description}
          </KurdishText>
        )}
        {item.amount && (
          <KurdishText style={styles.resultAmount}>
            {formatAmount(item.amount)}
          </KurdishText>
        )}
      </View>
      <ChevronRight size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (searchQuery.isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <KurdishText style={styles.emptyText}>گەڕان...</KurdishText>
        </View>
      );
    }

    if (query.length === 0 && Object.keys(filters).length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Search size={64} color="#CCC" />
          <KurdishText style={styles.emptyText}>
            دەستپێبکە بە گەڕان لە هەموو سیستەم
          </KurdishText>
          <KurdishText style={styles.emptySubtext}>
            دەتوانیت بە ناو، ژمارە، یان هەر زانیاریەکی تر بگەڕێیت
          </KurdishText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Search size={64} color="#CCC" />
        <KurdishText style={styles.emptyText}>هیچ ئەنجامێک نەدۆزرایەوە</KurdishText>
        <KurdishText style={styles.emptySubtext}>
          تکایە گەڕانەکەت بگۆڕە یان فلتەرەکان ڕێکبخە
        </KurdishText>
      </View>
    );
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof GlobalSearchFilters] !== undefined
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'گەڕانی گشتی',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              style={styles.filterButton}
            >
              <KurdishText style={styles.filterButtonText}>
                فلتەر {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </KurdishText>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="گەڕان لە کڕیار، قەرز، پارەدان..."
          placeholderTextColor="#999"
          autoFocus
        />
      </View>

      <FlatList
        data={searchQuery.data?.results || []}
        renderItem={renderResult}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      <SearchFilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(newFilters) => {
          console.log('[Global Search] Applying filters:', newFilters);
          setFilters(newFilters);
        }}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  resultAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
