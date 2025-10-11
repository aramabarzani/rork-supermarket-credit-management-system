import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Download,
  Mail,
  UserPlus,
  CreditCard,
  Receipt,
  Bell,
  Settings,
  BarChart3,
  Shield,
  MapPin,
  MessageSquare,
  QrCode,
  Camera,
  Tag,
  AlertCircle,
  Calendar,
  TrendingUpIcon,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { QuickSearchBar } from '@/components/QuickSearchBar';


export default function QuickDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Mock data - backend disabled
  const statsQuery = { data: null, refetch: async () => {} };
  const quickReportsQuery = { data: [], refetch: async () => {} };
  const generateReportMutation = { mutateAsync: async () => {} };
  const exportReportMutation = { mutateAsync: async () => ({ downloadUrl: '' }) };
  const emailReportMutation = { mutateAsync: async () => {} };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([statsQuery.refetch(), quickReportsQuery.refetch()]);
    setRefreshing(false);
  };

  const handleGenerateQuickReport = async (
    type: 'debt' | 'payment' | 'customer' | 'employee' | 'financial' | 'system'
  ) => {
    try {
      await generateReportMutation.mutateAsync({
        type,
        format: 'pdf',
      });
      await quickReportsQuery.refetch();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleExportReport = async (reportId: string, format: 'pdf' | 'excel') => {
    try {
      const result = await exportReportMutation.mutateAsync({
        reportId,
        format,
      });
      console.log('Report exported:', result.downloadUrl);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleEmailReport = async (reportId: string) => {
    try {
      await emailReportMutation.mutateAsync({
        reportId,
        email: 'admin@example.com',
      });
    } catch (error) {
      console.error('Error emailing report:', error);
    }
  };

  const handleSearchResult = (result: any) => {
    console.log('Selected:', result);
    if (result.type === 'customer') {
      router.push(`/customer-detail/${result.id}`);
    }
  };

  const stats = statsQuery.data
    ? {
        activeUsers: statsQuery.data.currentActiveUsers || 0,
        todayDebts: statsQuery.data.todayDebtsCreated || 0,
        todayPayments: statsQuery.data.todayPaymentsProcessed || 0,
        totalCustomers: 0,
      }
    : {
        activeUsers: 0,
        todayDebts: 0,
        todayPayments: 0,
        totalCustomers: 0,
      };

  const reports = quickReportsQuery.data || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'داشبۆردی خێرا',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#FFF',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.searchSection}>
            <QuickSearchBar
              onResultSelect={handleSearchResult}
              placeholder="گەڕانی خێرا..."
            />
          </View>

          <View style={styles.statsSection}>
            <KurdishText style={styles.sectionTitle}>
              ئاماری ڕاستەوخۆ
            </KurdishText>
            <View style={styles.statsGrid}>
              <GradientCard
                colors={['#4CAF50', '#45a049']}
                style={styles.statCard}
              >
                <Users size={32} color="#FFF" />
                <KurdishText style={styles.statValue}>
                  {stats.activeUsers}
                </KurdishText>
                <KurdishText style={styles.statLabel}>
                  بەکارهێنەری چالاک
                </KurdishText>
              </GradientCard>

              <GradientCard
                colors={['#FF9800', '#F57C00']}
                style={styles.statCard}
              >
                <TrendingUp size={32} color="#FFF" />
                <KurdishText style={styles.statValue}>
                  {stats.todayDebts}
                </KurdishText>
                <KurdishText style={styles.statLabel}>قەرزی ئەمڕۆ</KurdishText>
              </GradientCard>

              <GradientCard
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.statCard}
              >
                <TrendingDown size={32} color="#FFF" />
                <KurdishText style={styles.statValue}>
                  {stats.todayPayments}
                </KurdishText>
                <KurdishText style={styles.statLabel}>
                  پارەدانی ئەمڕۆ
                </KurdishText>
              </GradientCard>

              <GradientCard
                colors={['#2196F3', '#1976D2']}
                style={styles.statCard}
              >
                <DollarSign size={32} color="#FFF" />
                <KurdishText style={styles.statValue}>
                  {stats.totalCustomers}
                </KurdishText>
                <KurdishText style={styles.statLabel}>کڕیار</KurdishText>
              </GradientCard>
            </View>
          </View>

          <View style={styles.quickActionsSection}>
            <KurdishText style={styles.sectionTitle}>
              کردارە خێراکان
            </KurdishText>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/add-user')}
              >
                <UserPlus size={24} color="#007AFF" />
                <KurdishText style={styles.actionText}>
                  زیادکردنی کڕیار
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/add-debt')}
              >
                <CreditCard size={24} color="#FF3B30" />
                <KurdishText style={styles.actionText}>
                  زیادکردنی قەرز
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/add-payment')}
              >
                <DollarSign size={24} color="#34C759" />
                <KurdishText style={styles.actionText}>
                  زیادکردنی پارەدان
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/receipts')}
              >
                <Receipt size={24} color="#5856D6" />
                <KurdishText style={styles.actionText}>
                  پسوڵەکان
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/debt-management')}
              >
                <FileText size={24} color="#FF9500" />
                <KurdishText style={styles.actionText}>
                  بەڕێوەبردنی قەرز
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/payments')}
              >
                <TrendingDown size={24} color="#32ADE6" />
                <KurdishText style={styles.actionText}>
                  پارەدانەکان
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/notifications')}
              >
                <Bell size={24} color="#FF2D55" />
                <KurdishText style={styles.actionText}>
                  ئاگادارکردنەوەکان
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/customer-analytics')}
              >
                <BarChart3 size={24} color="#AF52DE" />
                <KurdishText style={styles.actionText}>
                  شیکاری کڕیار
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/financial-dashboard')}
              >
                <TrendingUpIcon size={24} color="#00C7BE" />
                <KurdishText style={styles.actionText}>
                  داشبۆردی دارایی
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/customer-map')}
              >
                <MapPin size={24} color="#FF6482" />
                <KurdishText style={styles.actionText}>
                  نەخشەی کڕیارەکان
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/scan-customer-qr')}
              >
                <Camera size={24} color="#30D158" />
                <KurdishText style={styles.actionText}>
                  سکانی QR Code
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/customer-qr-management')}
              >
                <QrCode size={24} color="#64D2FF" />
                <KurdishText style={styles.actionText}>
                  بەڕێوەبردنی QR
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/blacklist-management')}
              >
                <AlertCircle size={24} color="#FF453A" />
                <KurdishText style={styles.actionText}>
                  لیستی ڕەش
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/credit-scoring')}
              >
                <Shield size={24} color="#FFD60A" />
                <KurdishText style={styles.actionText}>
                  خاڵی قەرز
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/predictive-analytics')}
              >
                <TrendingUp size={24} color="#BF5AF2" />
                <KurdishText style={styles.actionText}>
                  پێشبینی شیکاری
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/whatsapp-sms-integration')}
              >
                <MessageSquare size={24} color="#25D366" />
                <KurdishText style={styles.actionText}>
                  WhatsApp/SMS
                </KurdishText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.reportsSection}>
            <KurdishText style={styles.sectionTitle}>
              ڕاپۆرتە خێراکان
            </KurdishText>
            {reports.map((report: any) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <KurdishText style={styles.reportName}>
                      {report.name}
                    </KurdishText>
                    <KurdishText style={styles.reportDate}>
                      {new Date(report.generatedAt).toLocaleDateString('ar-IQ')}
                    </KurdishText>
                  </View>
                  <View style={styles.reportActions}>
                    <TouchableOpacity
                      onPress={() => handleExportReport(report.id, 'pdf')}
                      style={styles.iconButton}
                    >
                      <Download size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEmailReport(report.id)}
                      style={styles.iconButton}
                    >
                      <Mail size={20} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </View>
                <KurdishText style={styles.reportDescription}>
                  {report.description}
                </KurdishText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  reportsSection: {
    marginBottom: 24,
  },
  reportCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
  },
});
