import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
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
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,

} from 'lucide-react-native';
import { LineChart, BarChart, PieChart as RNPieChart } from 'react-native-chart-kit';
import { useAuth } from '@/hooks/auth-context';
import { useDebts } from '@/hooks/debt-context';
import { useUsers } from '@/hooks/users-context';
import { useNotifications } from '@/hooks/notification-context';

import { KurdishText } from '@/components/KurdishText';
import { GlobalSearchBar } from '@/components/GlobalSearchBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isLandscape = screenWidth > screenHeight;

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

  
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [refreshing, setRefreshing] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  
  // Update screen dimensions on orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const currentScreenWidth = screenDimensions.width;
  const currentIsTablet = currentScreenWidth > 768;
  const currentIsLandscape = currentScreenWidth > screenDimensions.height;

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
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdateTime(new Date());
    setRefreshing(false);
  };
  
  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    setShowQuickActions(false);
    
    switch (action) {
      case 'add-debt':
        router.push('/add-debt');
        break;
      case 'add-payment':
        router.push('/add-payment');
        break;
      case 'view-customers':
        router.push('/(tabs)/customers');
        break;
      case 'view-reports':
        router.push('/(tabs)/reports');
        break;
      default:
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mock data for demonstration - replace with real data
  const mockDebts = [
    { id: '1', amount: 500000, customerId: '1', customerName: 'ئەحمەد محەمەد', date: '2024-01-15', status: 'active' },
    { id: '2', amount: 750000, customerId: '2', customerName: 'فاتمە ئەحمەد', date: '2024-01-20', status: 'active' },
    { id: '3', amount: 300000, customerId: '3', customerName: 'عەلی حەسەن', date: '2024-01-25', status: 'paid' },
  ];

  const mockPayments = [
    { id: '1', amount: 200000, debtId: '1', date: '2024-01-18' },
    { id: '2', amount: 300000, debtId: '3', date: '2024-01-26' },
    { id: '3', amount: 150000, debtId: '2', date: '2024-01-28' },
  ];

  const mockCustomers = [
    { id: '1', name: 'ئەحمەد محەمەد', totalDebt: 300000, totalPaid: 200000 },
    { id: '2', name: 'فاتمە ئەحمەد', totalDebt: 750000, totalPaid: 150000 },
    { id: '3', name: 'عەلی حەسەن', totalDebt: 0, totalPaid: 300000 },
  ];

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalDebts = mockDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalPayments = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingDebt = totalDebts - totalPayments;
    const activeDebts = mockDebts.filter(debt => debt.status === 'active').length;
    const paidDebts = mockDebts.filter(debt => debt.status === 'paid').length;
    const totalCustomers = mockCustomers.length;
    
    return {
      totalDebts,
      totalPayments,
      remainingDebt,
      activeDebts,
      paidDebts,
      totalCustomers,
    };
  }, []);

  // Chart data - responsive to screen size
  const getChartLabels = () => {
    if (currentScreenWidth < 400) {
      return ['ک٢', 'ش', 'ئا', 'ن', 'ئ', 'ح']; // Short labels for small screens
    }
    return ['کانونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران'];
  };
  
  const chartData = {
    labels: getChartLabels(),
    datasets: [
      {
        data: [500000, 750000, 600000, 800000, 900000, 650000],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [200000, 300000, 400000, 500000, 600000, 550000],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
  
  const getChartWidth = () => {
    const padding = currentIsTablet ? 60 : 40;
    return Math.min(currentScreenWidth - padding, 800);
  };
  
  const getChartHeight = () => {
    return currentIsTablet ? 280 : 220;
  };

  const pieChartData = [
    {
      name: 'قەرزی چالاک',
      population: dashboardStats.remainingDebt,
      color: '#EF4444',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'پارەدراوەتەوە',
      population: dashboardStats.totalPayments,
      color: '#10B981',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  // Top debtors and best payers
  const topDebtors = mockCustomers
    .filter(customer => customer.totalDebt - customer.totalPaid > 0)
    .sort((a, b) => (b.totalDebt - b.totalPaid) - (a.totalDebt - a.totalPaid))
    .slice(0, 3);

  const bestPayers = mockCustomers
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 3);

  // Recent transactions
  const recentDebts = mockDebts.slice(-3).reverse();
  const recentPayments = mockPayments.slice(-3).reverse();
  const recentNotifications = notifications?.slice(-5) || [];

  const generateQuickReport = () => {
    console.log('Generating quick PDF report...');
    // Implementation for PDF generation would go here
  };

  if (!authContext || !debtContext || !usersContext || !notificationContext || isLoading || !isInitialized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>
            چاوەڕوان بە...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F3F4F6', '#FFFFFF']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#1E3A8A']}
                tintColor="#1E3A8A"
              />
            }
          >
            {/* Header */}
            <View style={[styles.header, currentIsTablet && styles.tabletHeader]}>
              <View style={styles.headerContent}>
                <View style={styles.userInfo}>
                  <KurdishText style={[styles.welcomeText, currentIsTablet && styles.tabletWelcomeText]}>
                    بەخێربێیت
                  </KurdishText>
                  <KurdishText style={[styles.nameText, currentIsTablet && styles.tabletNameText]}>
                    {user?.name || 'بەڕێوەبەر'}
                  </KurdishText>
                  <Text style={styles.lastUpdateText}>
                    کۆتا نوێکردنەوە: {lastUpdateTime.toLocaleTimeString('ckb-IQ', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.headerActions}>
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity 
                      style={styles.quickActionButton}
                      onPress={() => setShowQuickActions(true)}
                    >
                      <Plus size={20} color="#10B981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={() => router.push('/notifications')} 
                    style={styles.notificationButton}
                  >
                    <Bell size={20} color="#3B82F6" />
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>3</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.licenseInfo}>
                <KurdishText style={[styles.licenseText, currentIsTablet && styles.tabletLicenseText]}>
                  سوپەرمارکێتی نموونە • {Platform.OS === 'ios' ? 'iOS' : 'Android'}
                </KurdishText>
              </View>
            </View>

            {/* Global Search Bar */}
            <GlobalSearchBar />



            {/* Filter Controls */}
            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={() => setShowFilters(true)}
                >
                  <Filter size={16} color="#3B82F6" />
                  <Text style={styles.filterButtonText}>فلتەر</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterButton, selectedPeriod === 'monthly' && styles.activeFilter]}
                  onPress={() => setSelectedPeriod('monthly')}
                >
                  <Calendar size={16} color={selectedPeriod === 'monthly' ? '#fff' : '#3B82F6'} />
                  <Text style={[styles.filterButtonText, selectedPeriod === 'monthly' && styles.activeFilterText]}>مانگانە</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterButton, selectedPeriod === 'yearly' && styles.activeFilter]}
                  onPress={() => setSelectedPeriod('yearly')}
                >
                  <Calendar size={16} color={selectedPeriod === 'yearly' ? '#fff' : '#3B82F6'} />
                  <Text style={[styles.filterButtonText, selectedPeriod === 'yearly' && styles.activeFilterText]}>ساڵانە</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={generateQuickReport}
                >
                  <Download size={16} color="#10B981" />
                  <Text style={[styles.filterButtonText, { color: '#10B981' }]}>ڕاپۆرتی خێرا</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Stats Cards */}
            <View style={[styles.statsGrid, currentIsTablet && styles.tabletStatsGrid, currentIsLandscape && styles.landscapeStatsGrid]}>
              <TouchableOpacity 
                style={[styles.statCard, styles.greenCard, currentIsTablet && styles.tabletStatCard]}
                onPress={() => router.push('/(tabs)/reports')}
              >
                <View style={styles.statContent}>
                  <DollarSign size={currentIsTablet ? 32 : 24} color="#10B981" />
                  <KurdishText style={[styles.statLabel, currentIsTablet && styles.tabletStatLabel]}>
                    کۆی قەرزەکان
                  </KurdishText>
                  <Text style={[styles.statValue, currentIsTablet && styles.tabletStatValue]}>
                    {formatCurrency(dashboardStats.totalDebts)}
                  </Text>
                  <View style={styles.trendIndicator}>
                    <TrendingUp size={12} color="#10B981" />
                    <Text style={styles.trendText}>+12%</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statCard, styles.orangeCard, currentIsTablet && styles.tabletStatCard]}
                onPress={() => router.push('/payment-reports')}
              >
                <View style={styles.statContent}>
                  <TrendingUp size={currentIsTablet ? 32 : 24} color="#F59E0B" />
                  <KurdishText style={[styles.statLabel, currentIsTablet && styles.tabletStatLabel]}>
                    وەرگیراو
                  </KurdishText>
                  <Text style={[styles.statValue, currentIsTablet && styles.tabletStatValue]}>
                    {formatCurrency(dashboardStats.totalPayments)}
                  </Text>
                  <View style={styles.trendIndicator}>
                    <TrendingUp size={12} color="#F59E0B" />
                    <Text style={styles.trendText}>+8%</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statCard, styles.redCard, currentIsTablet && styles.tabletStatCard]}
                onPress={() => router.push('/debt-management')}
              >
                <View style={styles.statContent}>
                  <TrendingDown size={currentIsTablet ? 32 : 24} color="#EF4444" />
                  <KurdishText style={[styles.statLabel, currentIsTablet && styles.tabletStatLabel]}>
                    ماوە
                  </KurdishText>
                  <Text style={[styles.statValue, currentIsTablet && styles.tabletStatValue]}>
                    {formatCurrency(dashboardStats.remainingDebt)}
                  </Text>
                  <View style={styles.trendIndicator}>
                    <TrendingDown size={12} color="#EF4444" />
                    <Text style={styles.trendText}>-5%</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statCard, styles.blueCard, currentIsTablet && styles.tabletStatCard]}
                onPress={() => router.push('/(tabs)/customers')}
              >
                <View style={styles.statContent}>
                  <Users size={currentIsTablet ? 32 : 24} color="#3B82F6" />
                  <KurdishText style={[styles.statLabel, currentIsTablet && styles.tabletStatLabel]}>
                    کڕیارەکان
                  </KurdishText>
                  <Text style={[styles.statValue, currentIsTablet && styles.tabletStatValue]}>
                    {dashboardStats.totalCustomers}
                  </Text>
                  <View style={styles.trendIndicator}>
                    <TrendingUp size={12} color="#3B82F6" />
                    <Text style={styles.trendText}>+2</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Charts Section */}
            <View style={[styles.section, currentIsTablet && styles.tabletSection]}>
              <View style={styles.sectionHeader}>
                <KurdishText style={[styles.sectionTitle, currentIsTablet && styles.tabletSectionTitle]}>
                  گرافی قەرز و پارەدان
                </KurdishText>
                <View style={styles.chartTypeButtons}>
                  <TouchableOpacity 
                    style={[styles.chartTypeButton, chartType === 'line' && styles.activeChartType]}
                    onPress={() => setChartType('line')}
                  >
                    <Activity size={16} color={chartType === 'line' ? '#fff' : '#3B82F6'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.chartTypeButton, chartType === 'bar' && styles.activeChartType]}
                    onPress={() => setChartType('bar')}
                  >
                    <BarChart3 size={16} color={chartType === 'bar' ? '#fff' : '#3B82F6'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.chartTypeButton, chartType === 'pie' && styles.activeChartType]}
                    onPress={() => setChartType('pie')}
                  >
                    <PieChart size={16} color={chartType === 'pie' ? '#fff' : '#3B82F6'} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={[styles.chartContainer, currentIsTablet && styles.tabletChartContainer]}>
                {chartType === 'line' && (
                  <LineChart
                    data={chartData}
                    width={getChartWidth()}
                    height={getChartHeight()}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: '#3B82F6',
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                )}
                
                {chartType === 'bar' && (
                  <BarChart
                    data={{
                      labels: ['قەرز', 'پارەدان', 'ماوە'],
                      datasets: [{
                        data: [dashboardStats.totalDebts / 1000, dashboardStats.totalPayments / 1000, dashboardStats.remainingDebt / 1000]
                      }]
                    }}
                    width={getChartWidth()}
                    height={getChartHeight()}
                    yAxisLabel=""
                    yAxisSuffix="k"
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    style={styles.chart}
                  />
                )}
                
                {chartType === 'pie' && (
                  <RNPieChart
                    data={pieChartData}
                    width={getChartWidth()}
                    height={getChartHeight()}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    style={styles.chart}
                  />
                )}
              </View>
            </View>

            {/* Top Debtors & Best Payers */}
            <View style={[styles.section, currentIsTablet && styles.tabletSection]}>
              <KurdishText style={[styles.sectionTitle, currentIsTablet && styles.tabletSectionTitle]}>
                کڕیارانی زۆر قەرزدار
              </KurdishText>
              
              <View style={styles.customersList}>
                {topDebtors.map((customer, index) => (
                  <View key={customer.id} style={styles.customerItem}>
                    <View style={styles.customerRank}>
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <KurdishText style={[styles.customerName, currentIsTablet && styles.tabletCustomerName]}>{customer.name}</KurdishText>
                      <Text style={[styles.customerDebt, currentIsTablet && styles.tabletCustomerDebt]}>
                        {formatCurrency(customer.totalDebt - customer.totalPaid)}
                      </Text>
                    </View>
                    <AlertTriangle size={20} color="#EF4444" />
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.section, currentIsTablet && styles.tabletSection]}>
              <KurdishText style={[styles.sectionTitle, currentIsTablet && styles.tabletSectionTitle]}>
                کڕیارانی باشترین پارەدان
              </KurdishText>
              
              <View style={styles.customersList}>
                {bestPayers.map((customer, index) => (
                  <View key={customer.id} style={styles.customerItem}>
                    <View style={[styles.customerRank, styles.goodRank]}>
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <KurdishText style={[styles.customerName, currentIsTablet && styles.tabletCustomerName]}>{customer.name}</KurdishText>
                      <Text style={[styles.customerDebt, styles.goodAmount, currentIsTablet && styles.tabletCustomerDebt]}>
                        {formatCurrency(customer.totalPaid)}
                      </Text>
                    </View>
                    <CheckCircle size={20} color="#10B981" />
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                قەرزە نوێکان
              </Text>
              
              <View style={styles.transactionsList}>
                {recentDebts.map((debt) => (
                  <View key={debt.id} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <TrendingUp size={16} color="#EF4444" />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{debt.customerName}</Text>
                      <Text style={styles.transactionDate}>{debt.date}</Text>
                    </View>
                    <Text style={[styles.transactionAmount, styles.debtAmount]}>
                      {formatCurrency(debt.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                پارەدانە نوێکان
              </Text>
              
              <View style={styles.transactionsList}>
                {recentPayments.map((payment) => (
                  <View key={payment.id} style={styles.transactionItem}>
                    <View style={[styles.transactionIcon, styles.paymentIcon]}>
                      <TrendingDown size={16} color="#10B981" />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>پارەدان</Text>
                      <Text style={styles.transactionDate}>{payment.date}</Text>
                    </View>
                    <Text style={[styles.transactionAmount, styles.paymentAmount]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Notifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                کۆتا ئاگاداریەکان
              </Text>
              
              <View style={styles.notificationsList}>
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification, index) => (
                    <View key={index} style={styles.notificationItem}>
                      <Bell size={16} color="#3B82F6" />
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationText}>
                          ئاگاداری نموونە {index + 1}
                        </Text>
                        <Text style={styles.notificationTime}>
                          <Clock size={12} color="#6B7280" /> ئێستا
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>هیچ ئاگادارییەک نییە</Text>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                کردارە خێراکان
              </Text>
              
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/add-debt')}
                >
                  <View style={styles.actionIcon}>
                    <Plus size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>
                    قەرزی نوێ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/add-payment')}
                >
                  <View style={[styles.actionIcon, styles.actionIconGreen]}>
                    <DollarSign size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>
                    پارەدان
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/debt-management')}
                >
                  <View style={[styles.actionIcon, styles.actionIconPurple]}>
                    <FileText size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>
                    بەڕێوەبردنی قەرز
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/add-user')}
                >
                  <View style={[styles.actionIcon, styles.actionIconOrange]}>
                    <Users size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>
                    کڕیاری نوێ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/receipts')}
                >
                  <View style={[styles.actionIcon, styles.actionIconBlue]}>
                    <FileText size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>
                    وەسڵەکان
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                کورتەی قەرزەکان
              </Text>
              
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    قەرزی چالاک
                  </Text>
                  <Text style={styles.summaryValue}>
                    {dashboardStats.activeDebts}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    قەرزی دراوەتەوە
                  </Text>
                  <Text style={styles.summaryValue}>
                    {dashboardStats.paidDebts}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    باڵانسی گشتی
                  </Text>
                  <Text style={[styles.summaryValue, { color: dashboardStats.remainingDebt > 0 ? '#EF4444' : '#10B981' }]}>
                    {formatCurrency(dashboardStats.remainingDebt)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
      
      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>فلتەرەکان</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterForm}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>بەروار</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="YYYY-MM-DD"
                  value={dateFilter}
                  onChangeText={setDateFilter}
                />
              </View>
              
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>کڕیار</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="ناوی کڕیار"
                  value={customerFilter}
                  onChangeText={setCustomerFilter}
                />
              </View>
              
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>کارمەند</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="ناوی کارمەند"
                  value={employeeFilter}
                  onChangeText={setEmployeeFilter}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.applyFilterButton}
                onPress={() => {
                  console.log('Applying filters:', { dateFilter, customerFilter, employeeFilter });
                  setShowFilters(false);
                }}
              >
                <Text style={styles.applyFilterText}>جێبەجێکردن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  logoutButton: {
    padding: 8,
  },
  licenseInfo: {
    marginTop: 8,
  },
  licenseText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greenCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  orangeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  redCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  blueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  statContent: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconGreen: {
    backgroundColor: '#10B981',
  },
  actionIconOrange: {
    backgroundColor: '#F59E0B',
  },
  actionIconPurple: {
    backgroundColor: '#8B5CF6',
  },
  actionIconBlue: {
    backgroundColor: '#3B82F6',
  },
  actionText: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  // Filter section styles
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 4,
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  // Chart styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chartTypeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChartType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  // Customer list styles
  customersList: {
    gap: 12,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  customerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goodRank: {
    backgroundColor: '#10B981',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerDebt: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  goodAmount: {
    color: '#10B981',
  },
  // Transaction styles
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIcon: {
    backgroundColor: '#D1FAE5',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  debtAmount: {
    color: '#EF4444',
  },
  paymentAmount: {
    color: '#10B981',
  },
  // Notification styles
  notificationsList: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterForm: {
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  applyFilterButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyFilterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Mobile responsive styles
  tabletHeader: {
    padding: 30,
    paddingBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  tabletWelcomeText: {
    fontSize: 16,
  },
  tabletNameText: {
    fontSize: 24,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  quickActionButton: {
    padding: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    marginRight: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabletLicenseText: {
    fontSize: 16,
  },
  tabletStatsGrid: {
    padding: 20,
    gap: 16,
  },
  landscapeStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tabletStatCard: {
    width: isTablet ? '48%' : '48%',
    padding: 20,
  },
  tabletStatLabel: {
    fontSize: 14,
  },
  tabletStatValue: {
    fontSize: 20,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabletSection: {
    padding: 30,
  },
  tabletSectionTitle: {
    fontSize: 22,
  },
  tabletChartContainer: {
    padding: 24,
  },
  tabletCustomerName: {
    fontSize: 18,
  },
  tabletCustomerDebt: {
    fontSize: 16,
  },
  locationCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationCoords: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#6B7280',
  },
});