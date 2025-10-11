import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users,
  Plus,
  LogOut,
  FileText,
  Bell,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Receipt,
  Search,
  Settings,
  CreditCard,
  Zap,
  MessageCircle,
  Sparkles,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useDebts } from '@/hooks/debt-context';
import { useUsers } from '@/hooks/users-context';
import { useNotifications } from '@/hooks/notification-context';
import { useSettings } from '@/hooks/settings-context';
import { useTenant } from '@/hooks/tenant-context';
import { KurdishText } from '@/components/KurdishText';
import { COLORS, GRADIENTS, SHADOWS, BORDER_RADIUS, SPACING } from '@/constants/design-system';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const authContext = useAuth();
  const { user, logout, isLoading, isInitialized } = authContext || {};
  const debtContext = useDebts();
  const { debts, payments } = debtContext || {};
  const usersContext = useUsers();
  const { users } = usersContext || {};
  const notificationContext = useNotifications();
  const { notifications } = notificationContext || {};
  const settingsContext = useSettings();
  const tenantContext = useTenant();
  const { currentTenant } = tenantContext || {};

  const [refreshing, setRefreshing] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const currentScreenWidth = screenDimensions.width;

  const handleLogout = async () => {
    Alert.alert(
      'دەرچوون',
      'دڵنیایت لە دەرچوون؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'دەرچوون',
          style: 'destructive',
          onPress: async () => {
            if (logout) {
              await logout();
            }
            router.replace('/login');
          }
        }
      ]
    );
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const allDebts = debts || [];
  const allPayments = payments || [];
  const allCustomers = users?.filter(u => u.role === 'customer') || [];

  const dashboardStats = useMemo(() => {
    const totalDebts = allDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalPayments = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingDebt = allDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const activeDebts = allDebts.filter(debt => debt.status === 'active').length;
    const paidDebts = allDebts.filter(debt => debt.status === 'paid').length;
    const totalCustomers = allCustomers.length;
    
    return {
      totalDebts,
      totalPayments,
      remainingDebt,
      activeDebts,
      paidDebts,
      totalCustomers,
    };
  }, [allDebts, allPayments, allCustomers]);

  const topDebtors = useMemo(() => {
    const customerDebts = allCustomers.map(customer => {
      const customerDebtsData = allDebts.filter(d => d.customerId === customer.id);
      const totalDebt = customerDebtsData.reduce((sum, d) => sum + d.remainingAmount, 0);
      return {
        id: customer.id,
        name: customer.name,
        totalDebt,
        totalPaid: customerDebtsData.reduce((sum, d) => sum + (d.amount - d.remainingAmount), 0),
      };
    });
    return customerDebts
      .filter(c => c.totalDebt > 0)
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, 3);
  }, [allCustomers, allDebts]);

  const bestPayers = useMemo(() => {
    const customerPayments = allCustomers.map(customer => {
      const customerDebtsData = allDebts.filter(d => d.customerId === customer.id);
      const totalPaid = customerDebtsData.reduce((sum, d) => sum + (d.amount - d.remainingAmount), 0);
      return {
        id: customer.id,
        name: customer.name,
        totalDebt: customerDebtsData.reduce((sum, d) => sum + d.remainingAmount, 0),
        totalPaid,
      };
    });
    return customerPayments
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 3);
  }, [allCustomers, allDebts]);

  const recentDebts = useMemo(() => {
    return [...allDebts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [allDebts]);
  
  const recentPayments = useMemo(() => {
    return [...allPayments]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 3);
  }, [allPayments]);

  if (!authContext || !debtContext || !usersContext || !notificationContext) {
    return (
      <View style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={COLORS.primary[600]} />
          <Text style={styles.loadingText}>
            چاوەڕوان بە...
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={COLORS.primary[600]} />
          <Text style={styles.loadingText}>
            چاوەڕوان بە...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.neutral.white]}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary[600]]}
              tintColor={COLORS.primary[600]}
            />
          }
        >
          <LinearGradient
            colors={GRADIENTS.royal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.welcomeRow}>
                  <Sparkles size={20} color={COLORS.warning[400]} />
                  <KurdishText style={styles.welcomeText}>
                    بەخێربێیت
                  </KurdishText>
                </View>
                <KurdishText style={styles.nameText}>
                  {user?.name || 'بەڕێوەبەر'}
                </KurdishText>
                <KurdishText style={styles.storeText}>
                  {user?.storeNameKurdish || user?.storeName || currentTenant?.storeNameKurdish || currentTenant?.storeName || 'سیستەمی بەڕێوەبردنی قەرز'}
                </KurdishText>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => router.push('/notifications')} 
                  style={styles.headerButton}
                >
                  <Bell size={22} color={COLORS.neutral.white} />
                  {notifications && notifications.length > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{notifications.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
                  <LogOut size={22} color={COLORS.neutral.white} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={[styles.statCard, styles.statCardPrimary]}
              onPress={() => router.push('/(tabs)/reports')}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <DollarSign size={28} color={COLORS.neutral.white} />
                </View>
                <KurdishText style={styles.statLabel}>
                  کۆی قەرزەکان
                </KurdishText>
                <Text style={styles.statValue}>
                  {formatCurrency(dashboardStats.totalDebts)}
                </Text>
                <View style={styles.trendContainer}>
                  <TrendingUp size={14} color={COLORS.success[300]} />
                  <Text style={styles.trendText}>+12%</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statCard, styles.statCardSuccess]}
              onPress={() => router.push('/payment-reports')}
            >
              <LinearGradient
                colors={GRADIENTS.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <TrendingUp size={28} color={COLORS.neutral.white} />
                </View>
                <KurdishText style={styles.statLabel}>
                  وەرگیراو
                </KurdishText>
                <Text style={styles.statValue}>
                  {formatCurrency(dashboardStats.totalPayments)}
                </Text>
                <View style={styles.trendContainer}>
                  <TrendingUp size={14} color={COLORS.success[300]} />
                  <Text style={styles.trendText}>+8%</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statCard, styles.statCardDanger]}
              onPress={() => router.push('/debt-management')}
            >
              <LinearGradient
                colors={GRADIENTS.danger}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <TrendingDown size={28} color={COLORS.neutral.white} />
                </View>
                <KurdishText style={styles.statLabel}>
                  ماوە
                </KurdishText>
                <Text style={styles.statValue}>
                  {formatCurrency(dashboardStats.remainingDebt)}
                </Text>
                <View style={styles.trendContainer}>
                  <TrendingDown size={14} color={COLORS.danger[300]} />
                  <Text style={styles.trendText}>-5%</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statCard, styles.statCardInfo]}
              onPress={() => router.push('/(tabs)/customers')}
            >
              <LinearGradient
                colors={GRADIENTS.info}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <View style={styles.statIconContainer}>
                  <Users size={28} color={COLORS.neutral.white} />
                </View>
                <KurdishText style={styles.statLabel}>
                  کڕیارەکان
                </KurdishText>
                <Text style={styles.statValue}>
                  {dashboardStats.totalCustomers}
                </Text>
                <View style={styles.trendContainer}>
                  <TrendingUp size={14} color={COLORS.info[300]} />
                  <Text style={styles.trendText}>+2</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsContainer}>
            <View style={styles.sectionHeader}>
              <Zap size={22} color={COLORS.warning[500]} />
              <KurdishText style={styles.sectionTitle}>
                کردارە خێراکان
              </KurdishText>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/add-debt')}
              >
                <LinearGradient
                  colors={GRADIENTS.success}
                  style={styles.quickActionGradient}
                >
                  <Plus size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>زیادکردنی قەرز</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/add-payment')}
              >
                <LinearGradient
                  colors={GRADIENTS.info}
                  style={styles.quickActionGradient}
                >
                  <CreditCard size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>زیادکردنی پارەدان</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/add-user')}
              >
                <LinearGradient
                  colors={GRADIENTS.purple}
                  style={styles.quickActionGradient}
                >
                  <UserPlus size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>زیادکردنی کڕیار</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/(tabs)/reports')}
              >
                <LinearGradient
                  colors={GRADIENTS.warning}
                  style={styles.quickActionGradient}
                >
                  <FileText size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>ڕاپۆرتەکان</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/(tabs)/search')}
              >
                <LinearGradient
                  colors={GRADIENTS.secondary}
                  style={styles.quickActionGradient}
                >
                  <Search size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>گەڕان</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/(tabs)/customers')}
              >
                <LinearGradient
                  colors={GRADIENTS.royal}
                  style={styles.quickActionGradient}
                >
                  <Users size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>کڕیارەکان</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/receipts')}
              >
                <LinearGradient
                  colors={GRADIENTS.danger}
                  style={styles.quickActionGradient}
                >
                  <Receipt size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>وەسڵەکان</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/(tabs)/settings')}
              >
                <LinearGradient
                  colors={GRADIENTS.elegant}
                  style={styles.quickActionGradient}
                >
                  <Settings size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>ڕێکخستنەکان</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/internal-messaging')}
              >
                <LinearGradient
                  colors={GRADIENTS.pink}
                  style={styles.quickActionGradient}
                >
                  <MessageCircle size={24} color={COLORS.neutral.white} />
                </LinearGradient>
                <KurdishText style={styles.quickActionLabel}>پەیامەکان</KurdishText>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={22} color={COLORS.danger[500]} />
              <KurdishText style={styles.sectionTitle}>
                کڕیارانی زۆر قەرزدار
              </KurdishText>
            </View>
            
            <View style={styles.listContainer}>
              {topDebtors.map((customer, index) => (
                <TouchableOpacity 
                  key={customer.id} 
                  style={styles.listItem}
                  onPress={() => router.push(`/customer-detail/${customer.id}`)}
                >
                  <View style={[styles.rankBadge, styles.rankBadgeDanger]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.listItemContent}>
                    <KurdishText style={styles.listItemName}>{customer.name}</KurdishText>
                    <Text style={[styles.listItemAmount, styles.dangerAmount]}>
                      {formatCurrency(customer.totalDebt)}
                    </Text>
                  </View>
                  <AlertTriangle size={20} color={COLORS.danger[500]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={22} color={COLORS.success[500]} />
              <KurdishText style={styles.sectionTitle}>
                کڕیارانی باشترین پارەدان
              </KurdishText>
            </View>
            
            <View style={styles.listContainer}>
              {bestPayers.map((customer, index) => (
                <TouchableOpacity 
                  key={customer.id} 
                  style={styles.listItem}
                  onPress={() => router.push(`/customer-detail/${customer.id}`)}
                >
                  <View style={[styles.rankBadge, styles.rankBadgeSuccess]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.listItemContent}>
                    <KurdishText style={styles.listItemName}>{customer.name}</KurdishText>
                    <Text style={[styles.listItemAmount, styles.successAmount]}>
                      {formatCurrency(customer.totalPaid)}
                    </Text>
                  </View>
                  <CheckCircle size={20} color={COLORS.success[500]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={22} color={COLORS.primary[500]} />
              <KurdishText style={styles.sectionTitle}>
                قەرزە نوێکان
              </KurdishText>
            </View>
            
            <View style={styles.listContainer}>
              {recentDebts.map((debt) => (
                <View key={debt.id} style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, styles.debtIcon]}>
                    <TrendingUp size={18} color={COLORS.danger[600]} />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionTitle}>{debt.customerName}</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(debt.createdAt).toLocaleDateString('ckb-IQ')}
                    </Text>
                  </View>
                  <Text style={[styles.transactionAmount, styles.dangerAmount]}>
                    {formatCurrency(debt.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <TrendingDown size={22} color={COLORS.success[500]} />
              <KurdishText style={styles.sectionTitle}>
                پارەدانە نوێکان
              </KurdishText>
            </View>
            
            <View style={styles.listContainer}>
              {recentPayments.map((payment) => (
                <View key={payment.id} style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, styles.paymentIcon]}>
                    <TrendingDown size={18} color={COLORS.success[600]} />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionTitle}>پارەدان</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(payment.paymentDate).toLocaleDateString('ckb-IQ')}
                    </Text>
                  </View>
                  <Text style={[styles.transactionAmount, styles.successAmount]}>
                    {formatCurrency(payment.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.lg,
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
    borderBottomLeftRadius: BORDER_RADIUS['3xl'],
    borderBottomRightRadius: BORDER_RADIUS['3xl'],
    ...SHADOWS.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.primary[100],
    fontWeight: '500',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  storeText: {
    fontSize: 14,
    color: COLORS.primary[200],
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger[500],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  badgeText: {
    color: COLORS.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    marginTop: -SPACING['4xl'],
    gap: SPACING.md,
  },
  statCard: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.md) / 2,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  statGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral.white,
    marginBottom: SPACING.sm,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.white,
    opacity: 0.8,
  },
  statCardPrimary: {},
  statCardSuccess: {},
  statCardDanger: {},
  statCardInfo: {},
  quickActionsContainer: {
    paddingVertical: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  quickActionsScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  quickActionCard: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionGradient: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    maxWidth: 80,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  lastSection: {
    paddingBottom: SPACING['3xl'],
  },
  listContainer: {
    gap: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeDanger: {
    backgroundColor: COLORS.danger[500],
  },
  rankBadgeSuccess: {
    backgroundColor: COLORS.success[500],
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  listItemContent: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  listItemAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerAmount: {
    color: COLORS.danger[600],
  },
  successAmount: {
    color: COLORS.success[600],
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtIcon: {
    backgroundColor: COLORS.danger[100],
  },
  paymentIcon: {
    backgroundColor: COLORS.success[100],
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  transactionDate: {
    fontSize: 13,
    color: COLORS.text.tertiary,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
