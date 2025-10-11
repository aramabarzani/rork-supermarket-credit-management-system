import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search,
  Plus,
  User,
  Phone,
  MapPin,
  CreditCard,
  Mail,
  Users,
  Star,
  Award,
  QrCode,
  Trash2,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useUsers } from '@/hooks/users-context';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { getCustomerGroupName, getCustomerGroupColor, CUSTOMER_GROUPS, CustomerGroupId } from '@/constants/customer-groups';
import { getCustomerRatingName, getCustomerRatingColor, CUSTOMER_RATINGS, CustomerRatingId, calculateCustomerRating } from '@/constants/customer-ratings';
import { COLORS, GRADIENTS, SHADOWS, BORDER_RADIUS, SPACING } from '@/constants/design-system';

export default function CustomersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroupId | 'all'>('all');
  const [selectedRating, setSelectedRating] = useState<CustomerRatingId | 'all'>('all');
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const usersContext = useUsers();
  const debtsContext = useDebts();
  const authContext = useAuth();
  
  if (!usersContext || !debtsContext || !authContext) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <KurdishText style={styles.loadingText}>
          چاوەڕوان بە...
        </KurdishText>
      </View>
    );
  }
  
  const { getCustomers, deleteUser, refetchUsers, isLoading: usersLoading } = usersContext;
  const { getCustomerDebts, isLoading: debtsLoading } = debtsContext;
  const { hasPermission } = authContext;

  const isLoading = usersLoading || debtsLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (refetchUsers) {
        await refetchUsers();
      }
    } catch (error) {
      console.error('Error refreshing customers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const customers = getCustomers();
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.nationalId?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerGroupName(customer.customerGroup || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGroup = selectedGroup === 'all' || customer.customerGroup === selectedGroup;
    const matchesRating = selectedRating === 'all' || customer.customerRating === selectedRating;
    
    return matchesSearch && matchesGroup && matchesRating;
  });

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    if (!hasPermission(PERMISSIONS.DELETE_CUSTOMER)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی سڕینەوەی کڕیارت نییە');
      return;
    }

    Alert.alert(
      'دڵنیابوونەوە',
      `دڵنیایت لە سڕینەوەی ${customerName}؟`,
      [
        { text: 'نەخێر', style: 'cancel' },
        { 
          text: 'بەڵێ', 
          style: 'destructive',
          onPress: async () => {
            await deleteUser(customerId);
          }
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderCustomer = ({ item }: { item: any }) => {
    const debts = getCustomerDebts(item.id);
    const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalPaid = totalOriginalDebt - totalDebt;
    const activeDebts = debts.filter(d => d.status !== 'paid').length;
    
    const customerRating = item.customerRating || calculateCustomerRating(
      totalOriginalDebt,
      totalPaid,
      item.onTimePayments || 0,
      item.latePayments || 0,
      activeDebts
    );

    return (
      <TouchableOpacity
        onPress={() => router.push(`/customer-detail/${item.id}`)}
        style={styles.customerCard}
      >
        <LinearGradient
          colors={[COLORS.neutral.white, COLORS.background.secondary]}
          style={styles.customerGradient}
        >
          <View style={styles.customerHeader}>
            <View style={styles.customerMainInfo}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={GRADIENTS.primary}
                  style={styles.avatar}
                >
                  <User size={24} color={COLORS.neutral.white} />
                </LinearGradient>
              </View>
              <View style={styles.customerNameSection}>
                <KurdishText style={styles.customerName}>
                  {item.name}
                </KurdishText>
                <View style={styles.ratingBadge}>
                  <Award size={14} color={getCustomerRatingColor(customerRating)} />
                  <KurdishText style={[styles.ratingText, { color: getCustomerRatingColor(customerRating) }]}>
                    {getCustomerRatingName(customerRating)}
                  </KurdishText>
                </View>
              </View>
            </View>
            <View style={styles.customerActions}>
              {hasPermission(PERMISSIONS.GENERATE_CUSTOMER_QR) && (
                <TouchableOpacity
                  onPress={() => router.push('/customer-qr-management')}
                  style={styles.actionButton}
                >
                  <QrCode size={18} color={COLORS.primary[600]} />
                </TouchableOpacity>
              )}
              {hasPermission(PERMISSIONS.DELETE_CUSTOMER) && (
                <TouchableOpacity
                  onPress={() => handleDeleteCustomer(item.id, item.name)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <Trash2 size={18} color={COLORS.danger[600]} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.customerDetails}>
            <View style={styles.detailRow}>
              <Phone size={14} color={COLORS.text.tertiary} />
              <KurdishText style={styles.detailText}>
                {item.phone}
              </KurdishText>
            </View>
            {item.address && (
              <View style={styles.detailRow}>
                <MapPin size={14} color={COLORS.text.tertiary} />
                <KurdishText style={styles.detailText} numberOfLines={1}>
                  {item.address}
                </KurdishText>
              </View>
            )}
            {item.nationalId && (
              <View style={styles.detailRow}>
                <CreditCard size={14} color={COLORS.text.tertiary} />
                <KurdishText style={styles.detailText}>
                  {item.nationalId}
                </KurdishText>
              </View>
            )}
            {item.email && (
              <View style={styles.detailRow}>
                <Mail size={14} color={COLORS.text.tertiary} />
                <KurdishText style={styles.detailText} numberOfLines={1}>
                  {item.email}
                </KurdishText>
              </View>
            )}
            {item.customerGroup && (
              <View style={styles.detailRow}>
                <Users size={14} color={getCustomerGroupColor(item.customerGroup)} />
                <KurdishText 
                  style={[styles.detailText, { color: getCustomerGroupColor(item.customerGroup) }]}
                >
                  {getCustomerGroupName(item.customerGroup)}
                </KurdishText>
              </View>
            )}
          </View>
          
          <View style={styles.debtInfo}>
            <View style={styles.debtItem}>
              <KurdishText style={styles.debtLabel}>
                کۆی قەرز
              </KurdishText>
              <KurdishText style={[styles.debtValue, styles.debtDanger]}>
                {formatCurrency(totalDebt)}
              </KurdishText>
            </View>
            <View style={styles.debtDivider} />
            <View style={styles.debtItem}>
              <KurdishText style={styles.debtLabel}>
                قەرزی چالاک
              </KurdishText>
              <KurdishText style={styles.debtValue}>
                {activeDebts}
              </KurdishText>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <KurdishText style={styles.loadingText}>
          بارکردنی کڕیاران...
        </KurdishText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.royal}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.neutral.white} />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو، مۆبایل، ئیمەیڵ..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setShowGroupFilter(!showGroupFilter)}
          >
            <Users size={16} color={COLORS.neutral.white} />
            <KurdishText style={styles.filterChipText}>
              {selectedGroup === 'all' ? 'هەموو گروپەکان' : getCustomerGroupName(selectedGroup)}
            </KurdishText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setShowRatingFilter(!showRatingFilter)}
          >
            <Star size={16} color={COLORS.neutral.white} />
            <KurdishText style={styles.filterChipText}>
              {selectedRating === 'all' ? 'هەموو پلەکان' : getCustomerRatingName(selectedRating)}
            </KurdishText>
          </TouchableOpacity>
        </View>
        
        {showGroupFilter && (
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedGroup === 'all' && styles.filterOptionActive,
              ]}
              onPress={() => {
                setSelectedGroup('all');
                setShowGroupFilter(false);
              }}
            >
              <KurdishText 
                style={[
                  styles.filterOptionText,
                  selectedGroup === 'all' && styles.filterOptionTextActive,
                ]}
              >
                هەموو گروپەکان
              </KurdishText>
            </TouchableOpacity>
            {CUSTOMER_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.filterOption,
                  selectedGroup === group.id && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setSelectedGroup(group.id);
                  setShowGroupFilter(false);
                }}
              >
                <KurdishText 
                  style={[
                    styles.filterOptionText,
                    selectedGroup === group.id && styles.filterOptionTextActive,
                  ]}
                >
                  {group.name}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {showRatingFilter && (
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedRating === 'all' && styles.filterOptionActive,
              ]}
              onPress={() => {
                setSelectedRating('all');
                setShowRatingFilter(false);
              }}
            >
              <KurdishText 
                style={[
                  styles.filterOptionText,
                  selectedRating === 'all' && styles.filterOptionTextActive,
                ]}
              >
                هەموو پلەکان
              </KurdishText>
            </TouchableOpacity>
            {CUSTOMER_RATINGS.map((rating) => (
              <TouchableOpacity
                key={rating.id}
                style={[
                  styles.filterOption,
                  selectedRating === rating.id && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setSelectedRating(rating.id);
                  setShowRatingFilter(false);
                }}
              >
                <KurdishText 
                  style={[
                    styles.filterOptionText,
                    selectedRating === rating.id && styles.filterOptionTextActive,
                  ]}
                >
                  {rating.name}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </LinearGradient>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[600]]}
            tintColor={COLORS.primary[600]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={64} color={COLORS.text.tertiary} />
            <KurdishText style={styles.emptyTitle}>
              هیچ کڕیارێک نەدۆزرایەوە
            </KurdishText>
            <KurdishText style={styles.emptySubtitle}>
              گەڕان بە ناو، مۆبایل، ئیمەیڵ، گروپ، پلە یان ناسنامە
            </KurdishText>
          </View>
        }
      />

      {hasPermission(PERMISSIONS.ADD_CUSTOMER) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-user')}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.fabGradient}
          >
            <Plus size={28} color={COLORS.neutral.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['2xl'],
    borderBottomLeftRadius: BORDER_RADIUS['2xl'],
    borderBottomRightRadius: BORDER_RADIUS['2xl'],
    ...SHADOWS.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    height: 48,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral.white,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  filterOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterOptionActive: {
    backgroundColor: COLORS.neutral.white,
  },
  filterOptionText: {
    fontSize: 13,
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: COLORS.primary[600],
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  customerCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  customerGradient: {
    padding: SPACING.lg,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  customerMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  avatarContainer: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerNameSection: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: COLORS.danger[50],
  },
  customerDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
  },
  debtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  debtItem: {
    flex: 1,
    alignItems: 'center',
  },
  debtDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border.medium,
  },
  debtLabel: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.xs,
  },
  debtValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  debtDanger: {
    color: COLORS.danger[600],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['6xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  fab: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    right: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
