import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Users, UserX, Clock, AlertTriangle } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

export default function InactiveUsersReportScreen() {
  const [reportType, setReportType] = useState<'customers' | 'employees'>('customers');
  const [minDaysInactive, setMinDaysInactive] = useState<number>(30);

  const mockInactiveCustomers = useMemo(() => [
    {
      customerId: '1',
      customerName: 'ئاکۆ محمد',
      daysSinceLastActivity: 45,
      lastActivityDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      totalDebt: 5000000,
      totalPaid: 3000000,
      remainingDebt: 2000000,
    },
    {
      customerId: '2',
      customerName: 'سارا احمد',
      daysSinceLastActivity: 65,
      lastActivityDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      totalDebt: 8000000,
      totalPaid: 2000000,
      remainingDebt: 6000000,
    },
    {
      customerId: '3',
      customerName: 'کاروان علی',
      daysSinceLastActivity: 25,
      lastActivityDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      totalDebt: 3000000,
      totalPaid: 2500000,
      remainingDebt: 500000,
    },
  ], []);

  const mockInactiveEmployees = useMemo(() => [
    {
      employeeId: '1',
      employeeName: 'ڕێبوار حسن',
      daysSinceLastActivity: 35,
      lastActivityDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      totalDebtsCreated: 15,
      totalPaymentsReceived: 8,
    },
    {
      employeeId: '2',
      employeeName: 'دلنیا کریم',
      daysSinceLastActivity: 70,
      lastActivityDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
      totalDebtsCreated: 5,
      totalPaymentsReceived: 2,
    },
  ], []);

  const inactiveCustomers = useMemo(() => {
    return mockInactiveCustomers.filter(c => c.daysSinceLastActivity >= minDaysInactive);
  }, [mockInactiveCustomers, minDaysInactive]);

  const inactiveEmployees = useMemo(() => {
    return mockInactiveEmployees.filter(e => e.daysSinceLastActivity >= minDaysInactive);
  }, [mockInactiveEmployees, minDaysInactive]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ckb-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const daysOptions = [
    { value: 7, label: '٧ ڕۆژ' },
    { value: 14, label: '١٤ ڕۆژ' },
    { value: 30, label: '٣٠ ڕۆژ' },
    { value: 60, label: '٦٠ ڕۆژ' },
    { value: 90, label: '٩٠ ڕۆژ' },
  ];

  const data = reportType === 'customers' ? inactiveCustomers : inactiveEmployees;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'کڕیار و کارمەندی بێچالاک',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              reportType === 'customers' && styles.typeButtonActive,
            ]}
            onPress={() => setReportType('customers')}
          >
            <Users size={20} color={reportType === 'customers' ? 'white' : '#6B7280'} />
            <KurdishText
              variant="body"
              color={reportType === 'customers' ? 'white' : '#6B7280'}
            >
              کڕیاران
            </KurdishText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              reportType === 'employees' && styles.typeButtonActive,
            ]}
            onPress={() => setReportType('employees')}
          >
            <UserX size={20} color={reportType === 'employees' ? 'white' : '#6B7280'} />
            <KurdishText
              variant="body"
              color={reportType === 'employees' ? 'white' : '#6B7280'}
            >
              کارمەندان
            </KurdishText>
          </TouchableOpacity>
        </View>

        <View style={styles.filterSection}>
          <KurdishText variant="body" color="#1F2937" style={{ marginBottom: 8 }}>
            ماوەی بێچالاکی
          </KurdishText>
          <View style={styles.daysSelector}>
            {daysOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dayButton,
                  minDaysInactive === option.value && styles.dayButtonActive,
                ]}
                onPress={() => setMinDaysInactive(option.value)}
              >
                <KurdishText
                  variant="caption"
                  color={minDaysInactive === option.value ? 'white' : '#6B7280'}
                >
                  {option.label}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsSection}>
          <GradientCard colors={['#F59E0B', '#D97706']}>
            <View style={styles.statsContent}>
              <AlertTriangle size={32} color="#F59E0B" />
              <KurdishText variant="title" color="#1F2937">
                {data?.length || 0}
              </KurdishText>
              <KurdishText variant="body" color="#6B7280">
                {reportType === 'customers' ? 'کڕیاری بێچالاک' : 'کارمەندی بێچالاک'}
              </KurdishText>
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              {reportType === 'customers' ? 'لیستی کڕیارانی بێچالاک' : 'لیستی کارمەندانی بێچالاک'}
            </KurdishText>
            <Clock size={24} color="#F59E0B" />
          </View>

          {data && data.length > 0 ? (
            data.map((item: any, index: number) => (
              <GradientCard key={item.customerId || item.employeeId} style={{ marginBottom: 12 }}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <KurdishText variant="body" color="#1F2937">
                      {item.customerName || item.employeeName}
                    </KurdishText>
                    <View style={styles.infoRow}>
                      <Clock size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280">
                        {item.daysSinceLastActivity} ڕۆژ بێچالاک
                      </KurdishText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.daysSinceLastActivity > 60
                            ? '#EF4444'
                            : item.daysSinceLastActivity > 30
                            ? '#F59E0B'
                            : '#10B981',
                      },
                    ]}
                  >
                    <KurdishText variant="caption" color="white">
                      {item.daysSinceLastActivity > 60
                        ? 'زۆر بێچالاک'
                        : item.daysSinceLastActivity > 30
                        ? 'بێچالاک'
                        : 'کەم چالاک'}
                    </KurdishText>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <KurdishText variant="caption" color="#6B7280">
                      دوا چالاکی
                    </KurdishText>
                    <KurdishText variant="caption" color="#1F2937">
                      {formatDate(item.lastActivityDate)}
                    </KurdishText>
                  </View>

                  {reportType === 'customers' && (
                    <>
                      <View style={styles.detailRow}>
                        <KurdishText variant="caption" color="#6B7280">
                          کۆی قەرز
                        </KurdishText>
                        <KurdishText variant="caption" color="#EF4444">
                          {formatCurrency(item.totalDebt)}
                        </KurdishText>
                      </View>
                      <View style={styles.detailRow}>
                        <KurdishText variant="caption" color="#6B7280">
                          کۆی پارەدان
                        </KurdishText>
                        <KurdishText variant="caption" color="#10B981">
                          {formatCurrency(item.totalPaid)}
                        </KurdishText>
                      </View>
                      <View style={styles.detailRow}>
                        <KurdishText variant="caption" color="#6B7280">
                          قەرزی ماوە
                        </KurdishText>
                        <KurdishText variant="caption" color="#F59E0B">
                          {formatCurrency(item.remainingDebt)}
                        </KurdishText>
                      </View>
                    </>
                  )}

                  {reportType === 'employees' && (
                    <>
                      <View style={styles.detailRow}>
                        <KurdishText variant="caption" color="#6B7280">
                          قەرزی دروستکراو
                        </KurdishText>
                        <KurdishText variant="caption" color="#1F2937">
                          {item.totalDebtsCreated}
                        </KurdishText>
                      </View>
                      <View style={styles.detailRow}>
                        <KurdishText variant="caption" color="#6B7280">
                          پارەی وەرگیراو
                        </KurdishText>
                        <KurdishText variant="caption" color="#1F2937">
                          {item.totalPaymentsReceived}
                        </KurdishText>
                      </View>
                    </>
                  )}
                </View>
              </GradientCard>
            ))
          ) : (
            <GradientCard>
              <View style={styles.emptyState}>
                <Users size={48} color="#9CA3AF" />
                <KurdishText variant="body" color="#6B7280">
                  هیچ {reportType === 'customers' ? 'کڕیارێکی' : 'کارمەندێکی'} بێچالاک نەدۆزرایەوە
                </KurdishText>
              </View>
            </GradientCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  typeButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  filterSection: {
    padding: 16,
    paddingTop: 0,
  },
  daysSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  statsSection: {
    padding: 16,
    paddingTop: 0,
  },
  statsContent: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  itemDetails: {
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
});
