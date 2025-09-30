import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Filter,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  X,
  Check,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useAdvancedFilters } from '@/hooks/advanced-filters-context';
import { CustomerFilters } from '@/types/customer';
import { SearchFilters, PaymentFilters, ReceiptFilters } from '@/types/debt';

type FilterType = 'customer' | 'debt' | 'payment' | 'receipt';

export default function AdvancedFiltersScreen() {
  const {
    savedFilters,
    saveCustomerFilters,
    saveDebtFilters,
    savePaymentFilters,
    saveReceiptFilters,
    clearAllFilters,
  } = useAdvancedFilters();

  const [filterType, setFilterType] = useState<FilterType>('customer');
  const [customerFilters, setCustomerFilters] = useState<CustomerFilters>(savedFilters.customer);
  const [debtFilters, setDebtFilters] = useState<SearchFilters>(savedFilters.debt);
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilters>(savedFilters.payment);
  const [receiptFilters, setReceiptFilters] = useState<ReceiptFilters>(savedFilters.receipt);

  const handleApplyFilters = () => {
    switch (filterType) {
      case 'customer':
        saveCustomerFilters(customerFilters);
        break;
      case 'debt':
        saveDebtFilters(debtFilters);
        break;
      case 'payment':
        savePaymentFilters(paymentFilters);
        break;
      case 'receipt':
        saveReceiptFilters(receiptFilters);
        break;
    }
    router.back();
  };

  const handleClearFilters = () => {
    setCustomerFilters({});
    setDebtFilters({});
    setPaymentFilters({});
    setReceiptFilters({});
    clearAllFilters();
  };

  const activeFiltersCount = useMemo(() => {
    switch (filterType) {
      case 'customer':
        return Object.keys(customerFilters).length;
      case 'debt':
        return Object.keys(debtFilters).length;
      case 'payment':
        return Object.keys(paymentFilters).length;
      case 'receipt':
        return Object.keys(receiptFilters).length;
      default:
        return 0;
    }
  }, [filterType, customerFilters, debtFilters, paymentFilters, receiptFilters]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'فلتەری پێشکەوتوو',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterTypeContainer}>
          <TouchableOpacity
            style={[styles.filterTypeButton, filterType === 'customer' && styles.filterTypeButtonActive]}
            onPress={() => setFilterType('customer')}
          >
            <Users size={20} color={filterType === 'customer' ? 'white' : '#64748B'} />
            <KurdishText style={[styles.filterTypeText, filterType === 'customer' && styles.filterTypeTextActive]}>
              کڕیاران
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTypeButton, filterType === 'debt' && styles.filterTypeButtonActive]}
            onPress={() => setFilterType('debt')}
          >
            <TrendingUp size={20} color={filterType === 'debt' ? 'white' : '#64748B'} />
            <KurdishText style={[styles.filterTypeText, filterType === 'debt' && styles.filterTypeTextActive]}>
              قەرزەکان
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTypeButton, filterType === 'payment' && styles.filterTypeButtonActive]}
            onPress={() => setFilterType('payment')}
          >
            <DollarSign size={20} color={filterType === 'payment' ? 'white' : '#64748B'} />
            <KurdishText style={[styles.filterTypeText, filterType === 'payment' && styles.filterTypeTextActive]}>
              پارەدان
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTypeButton, filterType === 'receipt' && styles.filterTypeButtonActive]}
            onPress={() => setFilterType('receipt')}
          >
            <Filter size={20} color={filterType === 'receipt' ? 'white' : '#64748B'} />
            <KurdishText style={[styles.filterTypeText, filterType === 'receipt' && styles.filterTypeTextActive]}>
              وەسڵ
            </KurdishText>
          </TouchableOpacity>
        </View>

        {activeFiltersCount > 0 && (
          <View style={styles.activeFiltersBar}>
            <KurdishText style={styles.activeFiltersText}>
              {activeFiltersCount} فلتەری چالاک
            </KurdishText>
            <TouchableOpacity onPress={handleClearFilters}>
              <KurdishText style={styles.clearText}>پاککردنەوە</KurdishText>
            </TouchableOpacity>
          </View>
        )}

        {filterType === 'customer' && (
          <View style={styles.filtersContainer}>
            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Star size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>فلتەری VIP</KurdishText>
              </View>

              <View style={styles.filterRow}>
                <KurdishText style={styles.filterLabel}>کڕیاری VIP</KurdishText>
                <Switch
                  value={customerFilters.isVIP || false}
                  onValueChange={(value) => setCustomerFilters({ ...customerFilters, isVIP: value })}
                  trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
                  thumbColor={customerFilters.isVIP ? '#3B82F6' : '#CBD5E1'}
                />
              </View>

              {customerFilters.isVIP && (
                <View style={styles.filterRow}>
                  <KurdishText style={styles.filterLabel}>پلەی VIP</KurdishText>
                  <View style={styles.vipLevelContainer}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.vipLevelButton,
                          customerFilters.vipLevel === level && styles.vipLevelButtonActive,
                        ]}
                        onPress={() => setCustomerFilters({ ...customerFilters, vipLevel: level })}
                      >
                        <KurdishText
                          style={[
                            styles.vipLevelText,
                            customerFilters.vipLevel === level && styles.vipLevelTextActive,
                          ]}
                        >
                          {level}
                        </KurdishText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </GradientCard>

            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <MapPin size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>فلتەری شوێن</KurdishText>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>شار</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="ناوی شار بنووسە..."
                  value={customerFilters.city || ''}
                  onChangeText={(text) => setCustomerFilters({ ...customerFilters, city: text })}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>شوێن</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="ناوی شوێن بنووسە..."
                  value={customerFilters.location || ''}
                  onChangeText={(text) => setCustomerFilters({ ...customerFilters, location: text })}
                  textAlign="right"
                />
              </View>
            </GradientCard>

            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Calendar size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>ماوەی بەکارهێنان</KurdishText>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>کەمترین ماوە (ڕۆژ)</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={customerFilters.minUsageDuration?.toString() || ''}
                  onChangeText={(text) => 
                    setCustomerFilters({ 
                      ...customerFilters, 
                      minUsageDuration: text ? parseInt(text) : undefined 
                    })
                  }
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>زۆرترین ماوە (ڕۆژ)</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="365"
                  value={customerFilters.maxUsageDuration?.toString() || ''}
                  onChangeText={(text) => 
                    setCustomerFilters({ 
                      ...customerFilters, 
                      maxUsageDuration: text ? parseInt(text) : undefined 
                    })
                  }
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>
            </GradientCard>

            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <DollarSign size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>فلتەری قەرز و پارەدان</KurdishText>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>کەمترین قەرز</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={customerFilters.minTotalDebt?.toString() || ''}
                  onChangeText={(text) => 
                    setCustomerFilters({ 
                      ...customerFilters, 
                      minTotalDebt: text ? parseInt(text) : undefined 
                    })
                  }
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>زۆرترین قەرز</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="1000000"
                  value={customerFilters.maxTotalDebt?.toString() || ''}
                  onChangeText={(text) => 
                    setCustomerFilters({ 
                      ...customerFilters, 
                      maxTotalDebt: text ? parseInt(text) : undefined 
                    })
                  }
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>
            </GradientCard>
          </View>
        )}

        {filterType === 'debt' && (
          <View style={styles.filtersContainer}>
            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Star size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>فلتەری VIP</KurdishText>
              </View>

              <View style={styles.filterRow}>
                <KurdishText style={styles.filterLabel}>قەرزی کڕیاری VIP</KurdishText>
                <Switch
                  value={debtFilters.isVIP || false}
                  onValueChange={(value) => setDebtFilters({ ...debtFilters, isVIP: value })}
                  trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
                  thumbColor={debtFilters.isVIP ? '#3B82F6' : '#CBD5E1'}
                />
              </View>
            </GradientCard>

            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <MapPin size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>فلتەری شوێن</KurdishText>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>شار</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="ناوی شار بنووسە..."
                  value={debtFilters.city || ''}
                  onChangeText={(text) => setDebtFilters({ ...debtFilters, city: text })}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>شوێن</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="ناوی شوێن بنووسە..."
                  value={debtFilters.location || ''}
                  onChangeText={(text) => setDebtFilters({ ...debtFilters, location: text })}
                  textAlign="right"
                />
              </View>
            </GradientCard>

            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <DollarSign size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>بڕی قەرز</KurdishText>
              </View>

              <View style={styles.amountRangeContainer}>
                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    debtFilters.amountRange === 'small' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setDebtFilters({ ...debtFilters, amountRange: 'small' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      debtFilters.amountRange === 'small' && styles.amountRangeTextActive,
                    ]}
                  >
                    بچووک
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    debtFilters.amountRange === 'medium' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setDebtFilters({ ...debtFilters, amountRange: 'medium' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      debtFilters.amountRange === 'medium' && styles.amountRangeTextActive,
                    ]}
                  >
                    ناوەند
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    debtFilters.amountRange === 'large' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setDebtFilters({ ...debtFilters, amountRange: 'large' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      debtFilters.amountRange === 'large' && styles.amountRangeTextActive,
                    ]}
                  >
                    گەورە
                  </KurdishText>
                </TouchableOpacity>
              </View>
            </GradientCard>
          </View>
        )}

        {filterType === 'payment' && (
          <View style={styles.filtersContainer}>
            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Star size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>فلتەری VIP</KurdishText>
              </View>

              <View style={styles.filterRow}>
                <KurdishText style={styles.filterLabel}>پارەدانی کڕیاری VIP</KurdishText>
                <Switch
                  value={paymentFilters.isVIP || false}
                  onValueChange={(value) => setPaymentFilters({ ...paymentFilters, isVIP: value })}
                  trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
                  thumbColor={paymentFilters.isVIP ? '#3B82F6' : '#CBD5E1'}
                />
              </View>
            </GradientCard>

            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <MapPin size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>فلتەری شوێن</KurdishText>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>شار</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="ناوی شار بنووسە..."
                  value={paymentFilters.city || ''}
                  onChangeText={(text) => setPaymentFilters({ ...paymentFilters, city: text })}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>شوێن</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="ناوی شوێن بنووسە..."
                  value={paymentFilters.location || ''}
                  onChangeText={(text) => setPaymentFilters({ ...paymentFilters, location: text })}
                  textAlign="right"
                />
              </View>
            </GradientCard>

            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <DollarSign size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>بڕی پارەدان</KurdishText>
              </View>

              <View style={styles.amountRangeContainer}>
                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    paymentFilters.amountRange === 'small' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setPaymentFilters({ ...paymentFilters, amountRange: 'small' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      paymentFilters.amountRange === 'small' && styles.amountRangeTextActive,
                    ]}
                  >
                    بچووک
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    paymentFilters.amountRange === 'medium' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setPaymentFilters({ ...paymentFilters, amountRange: 'medium' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      paymentFilters.amountRange === 'medium' && styles.amountRangeTextActive,
                    ]}
                  >
                    ناوەند
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    paymentFilters.amountRange === 'large' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setPaymentFilters({ ...paymentFilters, amountRange: 'large' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      paymentFilters.amountRange === 'large' && styles.amountRangeTextActive,
                    ]}
                  >
                    گەورە
                  </KurdishText>
                </TouchableOpacity>
              </View>
            </GradientCard>
          </View>
        )}

        {filterType === 'receipt' && (
          <View style={styles.filtersContainer}>
            <GradientCard style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <DollarSign size={20} color="#1E3A8A" />
                <KurdishText style={styles.filterTitle}>بڕی وەسڵ</KurdishText>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>کەمترین بڕ</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={receiptFilters.minAmount?.toString() || ''}
                  onChangeText={(text) => 
                    setReceiptFilters({ 
                      ...receiptFilters, 
                      minAmount: text ? parseInt(text) : undefined 
                    })
                  }
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>زۆرترین بڕ</KurdishText>
                <TextInput
                  style={styles.input}
                  placeholder="1000000"
                  value={receiptFilters.maxAmount?.toString() || ''}
                  onChangeText={(text) => 
                    setReceiptFilters({ 
                      ...receiptFilters, 
                      maxAmount: text ? parseInt(text) : undefined 
                    })
                  }
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>

              <View style={styles.amountRangeContainer}>
                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    receiptFilters.amountRange === 'small' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setReceiptFilters({ ...receiptFilters, amountRange: 'small' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      receiptFilters.amountRange === 'small' && styles.amountRangeTextActive,
                    ]}
                  >
                    بچووک
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    receiptFilters.amountRange === 'medium' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setReceiptFilters({ ...receiptFilters, amountRange: 'medium' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      receiptFilters.amountRange === 'medium' && styles.amountRangeTextActive,
                    ]}
                  >
                    ناوەند
                  </KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.amountRangeButton,
                    receiptFilters.amountRange === 'large' && styles.amountRangeButtonActive,
                  ]}
                  onPress={() => setReceiptFilters({ ...receiptFilters, amountRange: 'large' })}
                >
                  <KurdishText
                    style={[
                      styles.amountRangeText,
                      receiptFilters.amountRange === 'large' && styles.amountRangeTextActive,
                    ]}
                  >
                    گەورە
                  </KurdishText>
                </TouchableOpacity>
              </View>
            </GradientCard>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
          <X size={20} color="#DC2626" />
          <KurdishText style={styles.clearButtonText}>پاککردنەوە</KurdishText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Check size={20} color="white" />
          <KurdishText style={styles.applyButtonText}>جێبەجێکردن</KurdishText>
        </TouchableOpacity>
      </View>
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
  filterTypeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterTypeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTypeTextActive: {
    color: 'white',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
  },
  activeFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  filtersContainer: {
    padding: 16,
    gap: 16,
  },
  filterSection: {
    padding: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  vipLevelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  vipLevelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipLevelButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  vipLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  vipLevelTextActive: {
    color: 'white',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'right',
  },
  amountRangeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  amountRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  amountRangeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  amountRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  amountRangeTextActive: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
