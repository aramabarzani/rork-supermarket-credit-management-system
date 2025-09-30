import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';


interface GlobalSearchBarProps {
  onSearch?: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  showFilters?: boolean;
}

export function GlobalSearchBar({
  onSearch,
  onFilterPress,
  placeholder = 'گەڕان لە هەموو سیستەم...',
  showFilters = true,
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState<string>('');
  const router = useRouter();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    } else {
      router.push('/global-search' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {showFilters && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress || (() => router.push('/global-search' as any))}
          >
            <SlidersHorizontal size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
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
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
});
