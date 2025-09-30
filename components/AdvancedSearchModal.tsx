import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { KurdishText } from './KurdishText';
import { SearchFilter } from '@/types/voice-search';

interface AdvancedSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilter) => void;
  searchType: 'customer' | 'debt' | 'payment' | 'all';
}

export default function AdvancedSearchModal({
  visible,
  onClose,
  onSearch,
  searchType,
}: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<SearchFilter>({
    language: 'ku',
  });

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({ language: 'ku' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
            <KurdishText variant="subtitle" style={styles.title}>
              گەڕانی پێشکەوتوو
            </KurdishText>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {(searchType === 'customer' || searchType === 'all') && (
              <View style={styles.section}>
                <KurdishText style={styles.label}>ناوی کڕیار</KurdishText>
                <TextInput
                  style={styles.input}
                  value={filters.customerName}
                  onChangeText={(text) => setFilters({ ...filters, customerName: text })}
                  placeholder="ناوی کڕیار بنووسە"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            <View style={styles.section}>
              <KurdishText style={styles.label}>ژمارەی مۆبایل</KurdishText>
              <TextInput
                style={styles.input}
                value={filters.phoneNumber}
                onChangeText={(text) => setFilters({ ...filters, phoneNumber: text })}
                placeholder="ژمارەی مۆبایل بنووسە"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            {(searchType === 'debt' || searchType === 'all') && (
              <View style={styles.section}>
                <KurdishText style={styles.label}>ژمارەی قەرز</KurdishText>
                <TextInput
                  style={styles.input}
                  value={filters.debtNumber}
                  onChangeText={(text) => setFilters({ ...filters, debtNumber: text })}
                  placeholder="ژمارەی قەرز بنووسە"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            <View style={styles.section}>
              <KurdishText style={styles.label}>بەروار</KurdishText>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <KurdishText style={styles.subLabel}>لە</KurdishText>
                  <TextInput
                    style={styles.input}
                    value={filters.dateFrom}
                    onChangeText={(text) => setFilters({ ...filters, dateFrom: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.halfInput}>
                  <KurdishText style={styles.subLabel}>بۆ</KurdishText>
                  <TextInput
                    style={styles.input}
                    value={filters.dateTo}
                    onChangeText={(text) => setFilters({ ...filters, dateTo: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {(searchType === 'payment' || searchType === 'debt' || searchType === 'all') && (
              <View style={styles.section}>
                <KurdishText style={styles.label}>بڕی پارە</KurdishText>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <KurdishText style={styles.subLabel}>لە</KurdishText>
                    <TextInput
                      style={styles.input}
                      value={filters.amountFrom?.toString()}
                      onChangeText={(text) =>
                        setFilters({ ...filters, amountFrom: text ? parseFloat(text) : undefined })
                      }
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <KurdishText style={styles.subLabel}>بۆ</KurdishText>
                    <TextInput
                      style={styles.input}
                      value={filters.amountTo?.toString()}
                      onChangeText={(text) =>
                        setFilters({ ...filters, amountTo: text ? parseFloat(text) : undefined })
                      }
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}

            {(searchType === 'debt' || searchType === 'all') && (
              <View style={styles.section}>
                <KurdishText style={styles.label}>ماوەی قەرز (ڕۆژ)</KurdishText>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <KurdishText style={styles.subLabel}>لە</KurdishText>
                    <TextInput
                      style={styles.input}
                      value={filters.debtDurationFrom?.toString()}
                      onChangeText={(text) =>
                        setFilters({
                          ...filters,
                          debtDurationFrom: text ? parseInt(text) : undefined,
                        })
                      }
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <KurdishText style={styles.subLabel}>بۆ</KurdishText>
                    <TextInput
                      style={styles.input}
                      value={filters.debtDurationTo?.toString()}
                      onChangeText={(text) =>
                        setFilters({ ...filters, debtDurationTo: text ? parseInt(text) : undefined })
                      }
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <KurdishText style={styles.resetButtonText}>سڕینەوە</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Search size={20} color="#fff" />
              <KurdishText style={styles.searchButtonText}>گەڕان</KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FF3B30',
  },
  searchButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
