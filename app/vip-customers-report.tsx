import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  ArrowLeft,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useAdvancedFilters } from '@/hooks/advanced-filters-context';

const sampleVIPCustomers = [
  {
    id: '1',
    name: 'ئەحمەد محەمەد',
    phone: '0750 123 4567',
    isVIP: true,
    vipLevel: 5,
    totalDebt: 5000000,
    totalPaid: 4500000,
    city: 'هەولێر',
    location: 'ئەنکاوە',
    usageDuration: 365,
  },
  {
    id: '2',
    name: 'فاتیمە ئەحمەد',
    phone: '0770 234 5678',
    isVIP: true,
    vipLevel: 4,
    totalDebt: 3500000,
    totalPaid: 3200000,
    city: 'سلێمانی',
    location: 'سەرچنار',
    usageDuration: 280,
  },
  {
    id: '3',
    name: 'عەلی حەسەن',
    phone: '0751 345 6789',
    isVIP: true,
    vipLevel: 5,
    totalDebt: 6000000,
    totalPaid: 5800000,
    city: 'هەولێر',
    location: 'ئیسکان',
    usageDuration: 420,
  },
  {
    id: '4',
    name: 'زەینەب مەحمود',
    phone: '0771 456 7890',
    isVIP: true,
    vipLevel: 3,
    totalDebt: 2500000,
    totalPaid: 2300000,
    city: 'دهۆک',
    location: 'نۆهادرا',
    usageDuration: 180,
  },
  {
    id: '5',
    name: 'یاسین ئیبراهیم',
    phone: '0752 567 8901',
    isVIP: true,
    vipLevel: 4,
    totalDebt: 4200000,
    totalPaid: 4000000,
    city: 'هەولێر',
    location: 'دریم سیتی',
    usageDuration: 310,
  },
];

export default function VIPCustomersReportScreen() {
  const { getVIPCustomersReport } = useAdvancedFilters();

  const vipReport = useMemo(() => {
    return getVIPCustomersReport(sampleVIPCustomers as any);
  }, [getVIPCustomersReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ku-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getVIPLevelColor = (level: number) => {
    switch (level) {
      case 5:
        return '#EF4444';
      case 4:
        return '#F59E0B';
      case 3:
        return '#10B981';
      case 2:
        return '#3B82F6';
      case 1:
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getVIPLevelName = (level: number) => {
    switch (level) {
      case 5:
        return 'پلاتینیوم';
      case 4:
        return 'زێڕ';
      case 3:
        return 'زیو';
      case 2:
        return 'برۆنز';
      case 1:
        return 'ئاسایی';
      default:
        return 'نەناسراو';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ڕاپۆرتی کڕیارانی VIP',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <GradientCard style={styles.statCard}>
            <View style={styles.statIcon}>
              <Users size={24} color="#1E3A8A" />
            </View>
            <KurdishText style={styles.statValue}>{vipReport.totalVIPCustomers}</KurdishText>
            <KurdishText style={styles.statLabel}>کڕیاری VIP</KurdishText>
          </GradientCard>

          <GradientCard style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={24} color="#DC2626" />
            </View>
            <KurdishText style={styles.statValue}>{formatCurrency(vipReport.totalVIPDebt)}</KurdishText>
            <KurdishText style={styles.statLabel}>کۆی قەرز</KurdishText>
          </GradientCard>

          <GradientCard style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingDown size={24} color="#059669" />
            </View>
            <KurdishText style={styles.statValue}>{formatCurrency(vipReport.totalVIPPaid)}</KurdishText>
            <KurdishText style={styles.statLabel}>کۆی پارەدان</KurdishText>
          </GradientCard>

          <GradientCard style={styles.statCard}>
            <View style={styles.statIcon}>
              <DollarSign size={24} color="#7C2D12" />
            </View>
            <KurdishText style={styles.statValue}>{formatCurrency(vipReport.averageVIPDebt)}</KurdishText>
            <KurdishText style={styles.statLabel}>ناوەندی قەرز</KurdishText>
          </GradientCard>
        </View>

        <View style={styles.levelBreakdownContainer}>
          <KurdishText style={styles.sectionTitle}>دابەشبوون بەپێی پلە</KurdishText>
          
          {[5, 4, 3, 2, 1].map((level) => {
            const customers = vipReport.byLevel[`level${level}` as keyof typeof vipReport.byLevel];
            const totalDebt = customers.reduce((sum: number, c: any) => sum + c.totalDebt, 0);
            const totalPaid = customers.reduce((sum: number, c: any) => sum + c.totalPaid, 0);

            return (
              <GradientCard key={level} style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  <View style={styles.levelInfo}>
                    <View style={[styles.levelBadge, { backgroundColor: getVIPLevelColor(level) }]}>
                      <Star size={16} color="white" />
                      <KurdishText style={styles.levelBadgeText}>{level}</KurdishText>
                    </View>
                    <KurdishText style={styles.levelName}>{getVIPLevelName(level)}</KurdishText>
                  </View>
                  <KurdishText style={styles.levelCount}>{customers.length} کڕیار</KurdishText>
                </View>

                <View style={styles.levelStats}>
                  <View style={styles.levelStat}>
                    <KurdishText style={styles.levelStatLabel}>قەرز</KurdishText>
                    <KurdishText style={styles.levelStatValue}>{formatCurrency(totalDebt)}</KurdishText>
                  </View>
                  <View style={styles.levelStat}>
                    <KurdishText style={styles.levelStatLabel}>پارەدان</KurdishText>
                    <KurdishText style={styles.levelStatValue}>{formatCurrency(totalPaid)}</KurdishText>
                  </View>
                </View>
              </GradientCard>
            );
          })}
        </View>

        <View style={styles.customersContainer}>
          <KurdishText style={styles.sectionTitle}>کڕیارانی VIP</KurdishText>
          
          {sampleVIPCustomers
            .sort((a, b) => b.vipLevel - a.vipLevel || b.totalDebt - a.totalDebt)
            .map((customer) => (
              <GradientCard key={customer.id} style={styles.customerCard}>
                <View style={styles.customerHeader}>
                  <View style={styles.customerInfo}>
                    <View style={styles.customerNameRow}>
                      <KurdishText style={styles.customerName}>{customer.name}</KurdishText>
                      <View style={[styles.vipBadge, { backgroundColor: getVIPLevelColor(customer.vipLevel) }]}>
                        <Star size={12} color="white" />
                        <KurdishText style={styles.vipBadgeText}>{customer.vipLevel}</KurdishText>
                      </View>
                    </View>
                    <KurdishText style={styles.customerPhone}>{customer.phone}</KurdishText>
                    <KurdishText style={styles.customerLocation}>
                      {customer.city} - {customer.location}
                    </KurdishText>
                  </View>
                </View>

                <View style={styles.customerStats}>
                  <View style={styles.customerStat}>
                    <KurdishText style={styles.customerStatLabel}>قەرز</KurdishText>
                    <KurdishText style={styles.customerStatValue}>
                      {formatCurrency(customer.totalDebt)}
                    </KurdishText>
                  </View>
                  <View style={styles.customerStat}>
                    <KurdishText style={styles.customerStatLabel}>پارەدان</KurdishText>
                    <KurdishText style={styles.customerStatValue}>
                      {formatCurrency(customer.totalPaid)}
                    </KurdishText>
                  </View>
                  <View style={styles.customerStat}>
                    <KurdishText style={styles.customerStatLabel}>ماوە</KurdishText>
                    <KurdishText style={styles.customerStatValue}>
                      {formatCurrency(customer.totalDebt - customer.totalPaid)}
                    </KurdishText>
                  </View>
                </View>

                <View style={styles.customerFooter}>
                  <View style={styles.usageDuration}>
                    <Award size={14} color="#64748B" />
                    <KurdishText style={styles.usageDurationText}>
                      {customer.usageDuration} ڕۆژ بەکارهێنان
                    </KurdishText>
                  </View>
                </View>
              </GradientCard>
            ))}
        </View>
      </ScrollView>
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
  backButton: {
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  levelBreakdownContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  levelCard: {
    padding: 16,
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  levelCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  levelStats: {
    flexDirection: 'row',
    gap: 24,
  },
  levelStat: {
    flex: 1,
  },
  levelStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  levelStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  customersContainer: {
    padding: 16,
  },
  customerCard: {
    padding: 16,
    marginBottom: 12,
  },
  customerHeader: {
    marginBottom: 12,
  },
  customerInfo: {
    gap: 4,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  customerLocation: {
    fontSize: 12,
    color: '#94A3B8',
  },
  customerStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  customerStat: {
    flex: 1,
  },
  customerStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  customerStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  usageDurationText: {
    fontSize: 12,
    color: '#64748B',
  },
});
