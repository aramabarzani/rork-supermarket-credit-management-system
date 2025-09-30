import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { KurdishText } from './KurdishText';
import type { GlobalSearchFilters, SearchEntityType, CustomerType } from '@/types/global-search';

interface SearchFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: GlobalSearchFilters) => void;
  initialFilters?: GlobalSearchFilters;
}

export function SearchFilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: SearchFilterModalProps) {
  const [filters, setFilters] = useState<GlobalSearchFilters>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const entityTypes: { value: SearchEntityType; label: string }[] = [
    { value: 'all', label: 'هەموو' },
    { value: 'customer', label: 'کڕیار' },
    { value: 'employee', label: 'کارمەند' },
    { value: 'debt', label: 'قەرز' },
    { value: 'payment', label: 'پارەدان' },
  ];

  const customerTypes: { value: CustomerType; label: string }[] = [
    { value: 'all', label: 'هەموو' },
    { value: 'VIP', label: 'VIP' },
    { value: 'Normal', label: 'ئاسایی' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            <KurdishText style={styles.title}>فلتەری گەڕان</KurdishText>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <KurdishText style={styles.sectionTitle}>جۆری داتا</KurdishText>
              <View style={styles.chipContainer}>
                {entityTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.chip,
                      filters.entityType === type.value && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, entityType: type.value })
                    }
                  >
                    <KurdishText
                      style={[
                        styles.chipText,
                        filters.entityType === type.value && styles.chipTextActive,
                      ]}
                    >
                      {type.label}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <KurdishText style={styles.sectionTitle}>ناوی کڕیار</KurdishText>
              <TextInput
                style={styles.input}
                value={filters.customerName || ''}
                onChangeText={(text) =>
                  setFilters({ ...filters, customerName: text })
                }
                placeholder="ناوی کڕیار بنووسە..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.section}>
              <KurdishText style={styles.sectionTitle}>ژمارەی مۆبایل</KurdishText>
              <TextInput
                style={styles.input}
                value={filters.customerPhone || ''}
                onChangeText={(text) =>
                  setFilters({ ...filters, customerPhone: text })
                }
                placeholder="ژمارەی مۆبایل بنووسە..."
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.section}>
              <KurdishText style={styles.sectionTitle}>جۆری کڕیار</KurdishText>
              <View style={styles.chipContainer}>
                {customerTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.chip,
                      filters.customerType === type.value && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, customerType: type.value })
                    }
                  >
                    <KurdishText
                      style={[
                        styles.chipText,
                        filters.customerType === type.value && styles.chipTextActive,
                      ]}
                    >
                      {type.label}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <KurdishText style={styles.sectionTitle}>بڕی قەرز/پارەدان</KurdishText>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={filters.amountMin?.toString() || ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, amountMin: Number(text) || undefined })
                  }
                  placeholder="لە"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={filters.amountMax?.toString() || ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, amountMax: Number(text) || undefined })
                  }
                  placeholder="بۆ"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <KurdishText style={styles.sectionTitle}>شار</KurdishText>
              <TextInput
                style={styles.input}
                value={filters.city || ''}
                onChangeText={(text) => setFilters({ ...filters, city: text })}
                placeholder="شار بنووسە..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.section}>
              <KurdishText style={styles.sectionTitle}>شوێن</KurdishText>
              <TextInput
                style={styles.input}
                value={filters.location || ''}
                onChangeText={(text) =>
                  setFilters({ ...filters, location: text })
                }
                placeholder="شوێن بنووسە..."
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <KurdishText style={styles.resetButtonText}>سڕینەوە</KurdishText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <KurdishText style={styles.applyButtonText}>جێبەجێکردن</KurdishText>
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
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600' as const,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#F5F5F5',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
});
