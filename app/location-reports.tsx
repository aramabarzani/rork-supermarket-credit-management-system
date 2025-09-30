import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { trpc } from '@/lib/trpc';

export default function LocationReportsScreen() {
  const [selectedCity, setSelectedCity] = useState<string>('هەولێر');
  const [reportType, setReportType] = useState<'debt' | 'payment'>('debt');

  const debtByCityQuery = trpc.financial.advancedReports.debtByCity.useQuery({});
  const paymentByCityQuery = trpc.financial.advancedReports.paymentByCity.useQuery({});
  const debtByLocationQuery = trpc.financial.advancedReports.debtByLocation.useQuery({
    city: selectedCity,
  });
  const paymentByLocationQuery = trpc.financial.advancedReports.paymentByLocation.useQuery({
    city: selectedCity,
  });

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const cities = ['هەولێر', 'سلێمانی', 'دهۆک', 'کەرکوک', 'هەڵەبجە'];

  const isLoading =
    debtByCityQuery.isLoading ||
    paymentByCityQuery.isLoading ||
    debtByLocationQuery.isLoading ||
    paymentByLocationQuery.isLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'ڕاپۆرتی شار و شوێن',
            headerStyle: { backgroundColor: '#1E3A8A' },
            headerTintColor: 'white',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <KurdishText variant="body" color="#6B7280">
            چاوەڕوان بە...
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const cityData = reportType === 'debt' ? debtByCityQuery.data : paymentByCityQuery.data;
  const locationData =
    reportType === 'debt' ? debtByLocationQuery.data : paymentByLocationQuery.data;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ڕاپۆرتی شار و شوێن',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, reportType === 'debt' && styles.typeButtonActive]}
            onPress={() => setReportType('debt')}
          >
            <TrendingUp size={20} color={reportType === 'debt' ? 'white' : '#6B7280'} />
            <KurdishText variant="body" color={reportType === 'debt' ? 'white' : '#6B7280'}>
              قەرز
            </KurdishText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, reportType === 'payment' && styles.typeButtonActive]}
            onPress={() => setReportType('payment')}
          >
            <TrendingDown size={20} color={reportType === 'payment' ? 'white' : '#6B7280'} />
            <KurdishText variant="body" color={reportType === 'payment' ? 'white' : '#6B7280'}>
              پارەدان
            </KurdishText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              {reportType === 'debt' ? 'قەرز بە پێی شار' : 'پارەدان بە پێی شار'}
            </KurdishText>
            <MapPin size={24} color="#1E3A8A" />
          </View>

          {cityData?.map((city, index) => (
            <GradientCard key={city.city} style={{ marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setSelectedCity(city.city || '')}>
                <View style={styles.cityHeader}>
                  <View style={styles.cityInfo}>
                    <KurdishText variant="subtitle" color="#1F2937">
                      {city.city}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {city.customerCount} کڕیار
                    </KurdishText>
                  </View>
                  <View style={styles.cityStats}>
                    <KurdishText
                      variant="body"
                      color={reportType === 'debt' ? '#EF4444' : '#10B981'}
                    >
                      {formatCurrency(city.totalAmount)}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {reportType === 'debt'
                        ? `${'totalDebts' in city ? city.totalDebts : 0} قەرز`
                        : `${'totalPayments' in city ? city.totalPayments : 0} پارەدان`}
                    </KurdishText>
                  </View>
                </View>

                <View style={styles.cityDetails}>
                  <View style={styles.detailRow}>
                    <KurdishText variant="caption" color="#6B7280">
                      ناوەند بۆ هەر کڕیار
                    </KurdishText>
                    <KurdishText variant="caption" color="#1F2937">
                      {formatCurrency(
                        reportType === 'debt'
                          ? ('averageDebtPerCustomer' in city ? city.averageDebtPerCustomer : 0)
                          : ('averagePaymentPerCustomer' in city ? city.averagePaymentPerCustomer : 0)
                      )}
                    </KurdishText>
                  </View>
                </View>

                {(reportType === 'debt' ? ('topCustomers' in city ? city.topCustomers : []) : ('topPayers' in city ? city.topPayers : []))?.length > 0 && (
                  <View style={styles.topCustomers}>
                    <KurdishText variant="caption" color="#6B7280" style={{ marginBottom: 8 }}>
                      {reportType === 'debt' ? 'زۆرترین قەرزدار' : 'زۆرترین پارەدەر'}
                    </KurdishText>
                    {(reportType === 'debt' ? ('topCustomers' in city ? city.topCustomers : []) : ('topPayers' in city ? city.topPayers : []))
                      ?.slice(0, 3)
                      .map((customer: any, idx: number) => (
                        <View key={customer.customerId} style={styles.customerRow}>
                          <View style={styles.rankBadge}>
                            <KurdishText variant="caption" color="white">
                              {idx + 1}
                            </KurdishText>
                          </View>
                          <KurdishText variant="caption" color="#1F2937" style={{ flex: 1 }}>
                            {customer.customerName}
                          </KurdishText>
                          <KurdishText
                            variant="caption"
                            color={reportType === 'debt' ? '#EF4444' : '#10B981'}
                          >
                            {formatCurrency(
                              reportType === 'debt' ? customer.totalDebt : customer.totalPaid
                            )}
                          </KurdishText>
                        </View>
                      ))}
                  </View>
                )}
              </TouchableOpacity>
            </GradientCard>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText variant="subtitle" color="#1F2937">
              {reportType === 'debt' ? 'قەرز بە پێی شوێن' : 'پارەدان بە پێی شوێن'} - {selectedCity}
            </KurdishText>
            <MapPin size={24} color="#8B5CF6" />
          </View>

          <View style={styles.citySelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityButton, selectedCity === city && styles.cityButtonActive]}
                  onPress={() => setSelectedCity(city)}
                >
                  <KurdishText
                    variant="body"
                    color={selectedCity === city ? 'white' : '#6B7280'}
                  >
                    {city}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {locationData?.map((location, index) => (
            <GradientCard key={location.location} style={{ marginBottom: 12 }}>
              <View style={styles.locationHeader}>
                <View style={styles.locationInfo}>
                  <KurdishText variant="body" color="#1F2937">
                    {location.location}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {location.customerCount} کڕیار
                  </KurdishText>
                </View>
                <View style={styles.locationStats}>
                  <KurdishText
                    variant="body"
                    color={reportType === 'debt' ? '#EF4444' : '#10B981'}
                  >
                    {formatCurrency(location.totalAmount)}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {reportType === 'debt'
                      ? `${'totalDebts' in location ? location.totalDebts : 0} قەرز`
                      : `${'totalPayments' in location ? location.totalPayments : 0} پارەدان`}
                  </KurdishText>
                </View>
              </View>

              <View style={styles.locationDetails}>
                <View style={styles.detailRow}>
                  <KurdishText variant="caption" color="#6B7280">
                    ناوەند بۆ هەر کڕیار
                  </KurdishText>
                  <KurdishText variant="caption" color="#1F2937">
                    {formatCurrency(
                      reportType === 'debt'
                        ? ('averageDebtPerCustomer' in location ? location.averageDebtPerCustomer : 0)
                        : ('averagePaymentPerCustomer' in location ? location.averagePaymentPerCustomer : 0)
                    )}
                  </KurdishText>
                </View>
              </View>

              {(reportType === 'debt' ? ('topCustomers' in location ? location.topCustomers : []) : ('topPayers' in location ? location.topPayers : []))?.length >
                0 && (
                <View style={styles.topCustomers}>
                  <KurdishText variant="caption" color="#6B7280" style={{ marginBottom: 8 }}>
                    {reportType === 'debt' ? 'زۆرترین قەرزدار' : 'زۆرترین پارەدەر'}
                  </KurdishText>
                  {(reportType === 'debt' ? ('topCustomers' in location ? location.topCustomers : []) : ('topPayers' in location ? location.topPayers : []))
                    ?.slice(0, 2)
                    .map((customer: any, idx: number) => (
                      <View key={customer.customerId} style={styles.customerRow}>
                        <View style={styles.rankBadge}>
                          <KurdishText variant="caption" color="white">
                            {idx + 1}
                          </KurdishText>
                        </View>
                        <KurdishText variant="caption" color="#1F2937" style={{ flex: 1 }}>
                          {customer.customerName}
                        </KurdishText>
                        <KurdishText
                          variant="caption"
                          color={reportType === 'debt' ? '#EF4444' : '#10B981'}
                        >
                          {formatCurrency(
                            reportType === 'debt' ? customer.totalDebt : customer.totalPaid
                          )}
                        </KurdishText>
                      </View>
                    ))}
                </View>
              )}
            </GradientCard>
          ))}
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
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cityInfo: {
    flex: 1,
  },
  cityStats: {
    alignItems: 'flex-end',
  },
  cityDetails: {
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topCustomers: {
    paddingTop: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  citySelector: {
    marginBottom: 16,
  },
  cityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cityButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationInfo: {
    flex: 1,
  },
  locationStats: {
    alignItems: 'flex-end',
  },
  locationDetails: {
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});
