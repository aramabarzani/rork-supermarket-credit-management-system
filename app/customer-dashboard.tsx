import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  DollarSign, 
  TrendingUp,
  LogOut,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useDebts } from '@/hooks/debt-context';
import { useTenant } from '@/hooks/tenant-context';
import { useUsers } from '@/hooks/users-context';
import { KurdishText } from '@/components/KurdishText';

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { debts, payments } = useDebts();
  const { currentTenant } = useTenant();
  const { getAdmins } = useUsers();
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
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleContactAdmin = () => {
    if (!currentTenant) {
      Alert.alert('هەڵە', 'زانیاری بەڕێوەبەر نەدۆزرایەوە');
      return;
    }

    Alert.alert(
      'پەیوەندی بە بەڕێوەبەر',
      `${currentTenant.adminName}\n${currentTenant.adminPhone}`,
      [
        {
          text: 'پەیوەندی تەلەفۆنی',
          onPress: () => {
            Linking.openURL(`tel:${currentTenant.adminPhone}`);
          }
        },
        {
          text: 'نامە لە WhatsApp',
          onPress: () => {
            const message = encodeURIComponent(`سڵاو ${currentTenant.adminName}، من ${user?.name}م`);
            const whatsappUrl = Platform.select({
              ios: `whatsapp://send?phone=${currentTenant.adminPhone}&text=${message}`,
              android: `whatsapp://send?phone=${currentTenant.adminPhone}&text=${message}`,
              default: `https://wa.me/${currentTenant.adminPhone}?text=${message}`
            });
            Linking.openURL(whatsappUrl).catch(() => {
              Alert.alert('هەڵە', 'WhatsApp دانەمەزراوە لەسەر ئامێرەکەت');
            });
          }
        },
        {
          text: 'پاشگەزبوونەوە',
          style: 'cancel'
        }
      ]
    );
  };

  const handleOpenChat = () => {
    const admins = getAdmins();
    const admin = admins.find(a => a.tenantId === user?.tenantId);
    
    if (!admin) {
      Alert.alert('هەڵە', 'بەڕێوەبەر نەدۆزرایەوە');
      return;
    }

    router.push({
      pathname: '/chat',
      params: {
        recipientId: admin.id,
        recipientName: admin.name,
        recipientRole: 'admin',
      },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  const customerDebts = useMemo(() => {
    return debts?.filter(d => d.customerId === user?.id) || [];
  }, [debts, user?.id]);

  const customerPayments = useMemo(() => {
    return payments?.filter(p => {
      const debt = debts?.find(d => d.id === p.debtId);
      return debt?.customerId === user?.id;
    }) || [];
  }, [payments, debts, user?.id]);

  const stats = useMemo(() => {
    const totalDebt = customerDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalPaid = customerDebts.reduce((sum, debt) => sum + (debt.amount - debt.remainingAmount), 0);
    const remainingDebt = customerDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const activeDebts = customerDebts.filter(debt => debt.status === 'active').length;
    const paidDebts = customerDebts.filter(debt => debt.status === 'paid').length;
    
    return {
      totalDebt,
      totalPaid,
      remainingDebt,
      activeDebts,
      paidDebts,
    };
  }, [customerDebts]);

  const recentDebts = useMemo(() => {
    return [...customerDebts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [customerDebts]);

  const recentPayments = useMemo(() => {
    return [...customerPayments]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);
  }, [customerPayments]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'داشبۆردی کڕیار',
          headerStyle: {
            backgroundColor: '#1E3A8A',
          },
          headerTintColor: 'white',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient
        colors={['#F3F4F6', '#FFFFFF']}
        style={styles.gradient}
      >
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
          <View style={styles.header}>
            <View style={styles.userCard}>
              <View style={styles.userIconContainer}>
                <User size={48} color="#1E3A8A" />
              </View>
              <View style={styles.userInfo}>
                <KurdishText style={styles.welcomeText}>بەخێربێیت</KurdishText>
                <KurdishText style={styles.nameText}>
                  {user?.name || 'کڕیار'}
                </KurdishText>
                <Text style={styles.phoneText}>
                  {user?.phone}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.redCard]}>
              <DollarSign size={32} color="#EF4444" />
              <KurdishText style={styles.statLabel}>کۆی قەرزەکانم</KurdishText>
              <Text style={styles.statValue}>
                {formatCurrency(stats.totalDebt)}
              </Text>
            </View>

            <View style={[styles.statCard, styles.greenCard]}>
              <CheckCircle size={32} color="#10B981" />
              <KurdishText style={styles.statLabel}>پارەدراوەتەوە</KurdishText>
              <Text style={styles.statValue}>
                {formatCurrency(stats.totalPaid)}
              </Text>
            </View>

            <View style={[styles.statCard, styles.orangeCard]}>
              <AlertTriangle size={32} color="#F59E0B" />
              <KurdishText style={styles.statLabel}>ماوە</KurdishText>
              <Text style={styles.statValue}>
                {formatCurrency(stats.remainingDebt)}
              </Text>
            </View>

            <View style={[styles.statCard, styles.blueCard]}>
              <FileText size={32} color="#3B82F6" />
              <KurdishText style={styles.statLabel}>قەرزی چالاک</KurdishText>
              <Text style={styles.statValue}>
                {stats.activeDebts}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              قەرزەکانم
            </Text>
            
            {recentDebts.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>هیچ قەرزێکت نییە</Text>
              </View>
            ) : (
              <View style={styles.debtsList}>
                {recentDebts.map((debt) => (
                  <View key={debt.id} style={styles.debtItem}>
                    <View style={styles.debtIcon}>
                      <TrendingUp size={20} color="#EF4444" />
                    </View>
                    <View style={styles.debtInfo}>
                      <Text style={styles.debtAmount}>
                        {formatCurrency(debt.amount)}
                      </Text>
                      <Text style={styles.debtDate}>
                        {new Date(debt.createdAt).toLocaleDateString('ckb-IQ')}
                      </Text>
                      {debt.description && (
                        <Text style={styles.debtDescription}>
                          {debt.description}
                        </Text>
                      )}
                      <View style={styles.createdByContainer}>
                        <User size={14} color="#6B7280" />
                        <Text style={styles.createdByText}>
                          قەرزی پێدراوە لەلایەن: {debt.createdByName}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.debtStatus}>
                      {debt.status === 'paid' ? (
                        <View style={styles.paidBadge}>
                          <CheckCircle size={16} color="#10B981" />
                          <Text style={styles.paidText}>دراوەتەوە</Text>
                        </View>
                      ) : (
                        <View style={styles.activeBadge}>
                          <Clock size={16} color="#F59E0B" />
                          <Text style={styles.activeText}>چالاک</Text>
                        </View>
                      )}
                      <Text style={styles.remainingAmount}>
                        ماوە: {formatCurrency(debt.remainingAmount)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              پارەدانەکانم
            </Text>
            
            {recentPayments.length === 0 ? (
              <View style={styles.emptyState}>
                <DollarSign size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>هیچ پارەدانێکت نییە</Text>
              </View>
            ) : (
              <View style={styles.paymentsList}>
                {recentPayments.map((payment) => (
                  <View key={payment.id} style={styles.paymentItem}>
                    <View style={styles.paymentIcon}>
                      <DollarSign size={20} color="#10B981" />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {new Date(payment.paymentDate).toLocaleDateString('ckb-IQ')}
                      </Text>
                      {payment.notes && (
                        <Text style={styles.paymentNotes}>
                          {payment.notes}
                        </Text>
                      )}
                      <View style={styles.receivedByContainer}>
                        <User size={14} color="#6B7280" />
                        <Text style={styles.receivedByText}>
                          وەرگیراوە لەلایەن: {payment.receivedByName}
                        </Text>
                      </View>
                    </View>
                    <CheckCircle size={24} color="#10B981" />
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <AlertTriangle size={24} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>تێبینی</Text>
              <Text style={styles.infoText}>
                ئەم پەڕەیە تایبەتە بە بینینی قەرز و پارەدانەکانی خۆت. بۆ هەر پرسیارێک پەیوەندی بە بەڕێوەبەر بکە.
              </Text>
            </View>
          </View>

          {currentTenant && (
            <View style={styles.contactSection}>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handleContactAdmin}
              >
                <View style={styles.contactIconContainer}>
                  <Phone size={24} color="#FFFFFF" />
                </View>
                <View style={styles.contactInfo}>
                  <KurdishText style={styles.contactTitle}>پەیوەندی بە بەڕێوەبەر</KurdishText>
                  <Text style={styles.contactSubtitle}>{currentTenant.adminName}</Text>
                  <Text style={styles.contactPhone}>{currentTenant.adminPhone}</Text>
                </View>
                <MessageCircle size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.chatButton}
                onPress={handleOpenChat}
              >
                <View style={styles.chatIconContainer}>
                  <MessageCircle size={24} color="#FFFFFF" />
                </View>
                <View style={styles.chatInfo}>
                  <KurdishText style={styles.chatTitle}>نامەگۆڕینەوە لەگەڵ بەڕێوەبەر</KurdishText>
                  <Text style={styles.chatSubtitle}>{'گفتوگۆی ڕاستەوخۆ'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
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
  header: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 16,
  },
  userIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    marginRight: 8,
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
    alignItems: 'center',
    gap: 8,
  },
  redCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  greenCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  orangeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  blueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  debtsList: {
    gap: 12,
  },
  debtItem: {
    flexDirection: 'row',
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
  debtIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtInfo: {
    flex: 1,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  debtDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  debtDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  debtStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  paymentsList: {
    gap: 12,
  },
  paymentItem: {
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
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  paymentNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  createdByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  createdByText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  receivedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopColor: '#F3F4F6',
    borderTopWidth: 1,
  },
  receivedByText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  contactSection: {
    padding: 20,
    paddingTop: 0,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    gap: 16,
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    gap: 16,
  },
  chatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
