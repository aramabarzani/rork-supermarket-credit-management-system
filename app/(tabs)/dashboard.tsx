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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users,
  Plus,
  LogOut,
  Bell,
  AlertTriangle,
  UserPlus,
  CreditCard,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
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
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);


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
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
          colors={GRADIENTS.sky}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.userSection}>
              <View style={styles.avatarCircle}>
                <LinearGradient
                  colors={GRADIENTS.secondary}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0) || 'ب'}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.greetingText}>
                  بەخێربێیت 👋
                </Text>
                <KurdishText style={styles.userName}>
                  {user?.name || 'بەڕێوەبەر'}
                </KurdishText>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => router.push('/notifications')} 
                style={styles.iconButton}
              >
                <Bell size={20} color={COLORS.neutral.white} />
                {notifications && notifications.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notifications.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                <LogOut size={20} color={COLORS.neutral.white} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCardLarge}
              onPress={() => router.push('/(tabs)/reports')}
            >
              <LinearGradient
                colors={GRADIENTS.modern}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statCardHeader}>
                  <View style={styles.statIconWrapper}>
                    <DollarSign size={24} color={COLORS.neutral.white} />
                  </View>
                  <View style={styles.trendBadge}>
                    <ArrowUpRight size={12} color={COLORS.success[400]} />
                    <Text style={styles.trendBadgeText}>12%</Text>
                  </View>
                </View>
                <KurdishText style={styles.statCardLabel}>
                  کۆی قەرزەکان
                </KurdishText>
                <Text style={styles.statCardValue}>
                  {formatCurrency(dashboardStats.totalDebts)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statCardSmall}
              onPress={() => router.push('/payment-reports')}
            >
              <LinearGradient
                colors={GRADIENTS.mint}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statIconWrapper}>
                  <TrendingUp size={20} color={COLORS.neutral.white} />
                </View>
                <KurdishText style={styles.statCardLabelSmall}>
                  وەرگیراو
                </KurdishText>
                <Text style={styles.statCardValueSmall}>
                  {formatCurrency(dashboardStats.totalPayments)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statCardSmall}
              onPress={() => router.push('/debt-management')}
            >
              <LinearGradient
                colors={GRADIENTS.coral}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statIconWrapper}>
                  <TrendingDown size={20} color={COLORS.neutral.white} />
                </View>
                <KurdishText style={styles.statCardLabelSmall}>
                  ماوە
                </KurdishText>
                <Text style={styles.statCardValueSmall}>
                  {formatCurrency(dashboardStats.remainingDebt)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statCardSmall}
              onPress={() => router.push('/(tabs)/customers')}
            >
              <LinearGradient
                colors={GRADIENTS.lavender}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statIconWrapper}>
                  <Users size={20} color={COLORS.neutral.white} />
                </View>
                <KurdishText style={styles.statCardLabelSmall}>
                  کڕیارەکان
                </KurdishText>
                <Text style={styles.statCardValueSmall}>
                  {dashboardStats.totalCustomers}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Zap size={20} color={COLORS.warning[500]} />
                <KurdishText style={styles.sectionTitle}>
                  کردارە خێراکان
                </KurdishText>
              </View>
            </View>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/add-debt')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success[100] }]}>
                  <Plus size={22} color={COLORS.success[600]} />
                </View>
                <KurdishText style={styles.quickActionLabel}>زیادکردنی قەرز</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/add-payment')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info[100] }]}>
                  <CreditCard size={22} color={COLORS.info[600]} />
                </View>
                <KurdishText style={styles.quickActionLabel}>پارەدان</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/add-user')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.purple[100] }]}>
                  <UserPlus size={22} color={COLORS.purple[600]} />
                </View>
                <KurdishText style={styles.quickActionLabel}>کڕیاری نوێ</KurdishText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/(tabs)/reports')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning[100] }]}>
                  <BarChart3 size={22} color={COLORS.warning[600]} />
                </View>
                <KurdishText style={styles.quickActionLabel}>ڕاپۆرتەکان</KurdishText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <AlertTriangle size={20} color={COLORS.danger[500]} />
                <KurdishText style={styles.sectionTitle}>
                  کڕیارانی زۆر قەرزدار
                </KurdishText>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/customers')}>
                <Text style={styles.seeAllText}>هەموو</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.listCard}>
              {topDebtors.map((customer, index) => (
                <TouchableOpacity 
                  key={customer.id} 
                  style={[styles.listItem, index !== topDebtors.length - 1 && styles.listItemBorder]}
                  onPress={() => router.push(`/customer-detail/${customer.id}`)}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.rankCircle, { backgroundColor: COLORS.danger[100] }]}>
                      <Text style={[styles.rankText, { color: COLORS.danger[600] }]}>{index + 1}</Text>
                    </View>
                    <KurdishText style={styles.listItemName}>{customer.name}</KurdishText>
                  </View>
                  <Text style={[styles.listItemAmount, { color: COLORS.danger[600] }]}>
                    {formatCurrency(customer.totalDebt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Activity size={20} color={COLORS.primary[500]} />
                <KurdishText style={styles.sectionTitle}>
                  چالاکیە نوێکان
                </KurdishText>
              </View>
            </View>
            
            <View style={styles.listCard}>
              {recentDebts.slice(0, 2).map((debt, index) => (
                <View key={debt.id} style={[styles.activityItem, index !== 0 && styles.listItemBorder]}>
                  <View style={[styles.activityIcon, { backgroundColor: COLORS.danger[100] }]}>
                    <ArrowUpRight size={16} color={COLORS.danger[600]} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{debt.customerName}</Text>
                    <Text style={styles.activityDate}>
                      {new Date(debt.createdAt).toLocaleDateString('ckb-IQ')}
                    </Text>
                  </View>
                  <Text style={[styles.activityAmount, { color: COLORS.danger[600] }]}>
                    {formatCurrency(debt.amount)}
                  </Text>
                </View>
              ))}
              {recentPayments.slice(0, 2).map((payment, index) => (
                <View key={payment.id} style={[styles.activityItem, styles.listItemBorder]}>
                  <View style={[styles.activityIcon, { backgroundColor: COLORS.success[100] }]}>
                    <ArrowDownRight size={16} color={COLORS.success[600]} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>پارەدان</Text>
                    <Text style={styles.activityDate}>
                      {new Date(payment.paymentDate).toLocaleDateString('ckb-IQ')}
                    </Text>
                  </View>
                  <Text style={[styles.activityAmount, { color: COLORS.success[600] }]}>
                    {formatCurrency(payment.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
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
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING['4xl'],
    borderBottomLeftRadius: BORDER_RADIUS['3xl'],
    borderBottomRightRadius: BORDER_RADIUS['3xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  userDetails: {
    gap: SPACING.xs,
  },
  greetingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.danger[500],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  badgeText: {
    color: COLORS.neutral.white,
    fontSize: 9,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCardLarge: {
    width: '100%',
    height: 160,
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  statCardSmall: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.md * 2) / 3,
    height: 120,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  statCardGradient: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  statCardLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.neutral.white,
  },
  statCardLabelSmall: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: SPACING.sm,
  },
  statCardValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral.white,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionItem: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.md * 3) / 4,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  listCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  listItemBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  listItemAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
