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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Search,
  Plus,
  User,
  Phone,
  DollarSign,
  Trash2,
  MapPin,
  CreditCard,
  Mail,
  Users,
  Filter,
  Star,
  Award,
  QrCode,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { getCustomerGroupName, getCustomerGroupColor, CUSTOMER_GROUPS, CustomerGroupId } from '@/constants/customer-groups';
import { getCustomerRatingName, getCustomerRatingColor, CUSTOMER_RATINGS, CustomerRatingId, calculateCustomerRating } from '@/constants/customer-ratings';

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
        <ActivityIndicator size="large" color="#1E3A8A" />
        <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16 }}>
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
    
    // Calculate or use existing customer rating
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
      >
        <GradientCard style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <View style={styles.customerInfo}>
              <View style={styles.customerInfoRow}>
                <View style={styles.avatar}>
                  <User size={24} color="#1E3A8A" />
                </View>
                {hasPermission(PERMISSIONS.GENERATE_CUSTOMER_QR) && (
                  <TouchableOpacity
                    onPress={() => router.push('/customer-qr-management')}
                    style={styles.qrButton}
                  >
                    <QrCode size={20} color="#1E3A8A" />
                  </TouchableOpacity>
                )}
              </View>
              <View>
                <KurdishText variant="subtitle" color="#1F2937">
                  {item.name}
                </KurdishText>
                <View style={styles.customerDetails}>
                  <View style={styles.detailRow}>
                    <Phone size={14} color="#6B7280" />
                    <KurdishText variant="caption" color="#6B7280" style={{ marginLeft: 4 }}>
                      {item.phone}
                    </KurdishText>
                  </View>
                  {item.address && (
                    <View style={styles.detailRow}>
                      <MapPin size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280" style={{ marginLeft: 4 }} numberOfLines={1}>
                        {item.address}
                      </KurdishText>
                    </View>
                  )}
                  {item.nationalId && (
                    <View style={styles.detailRow}>
                      <CreditCard size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280" style={{ marginLeft: 4 }}>
                        {item.nationalId}
                      </KurdishText>
                    </View>
                  )}
                  {item.email && (
                    <View style={styles.detailRow}>
                      <Mail size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280" style={{ marginLeft: 4 }} numberOfLines={1}>
                        {item.email}
                      </KurdishText>
                    </View>
                  )}
                  {item.customerGroup && (
                    <View style={styles.detailRow}>
                      <Users size={14} color={getCustomerGroupColor(item.customerGroup)} />
                      <KurdishText 
                        variant="caption" 
                        color={getCustomerGroupColor(item.customerGroup)} 
                        style={{ marginLeft: 4 }}
                      >
                        {getCustomerGroupName(item.customerGroup)}
                      </KurdishText>
                    </View>
                  )}
                  {/* Customer Rating */}
                  <View style={styles.detailRow}>
                    <Award size={14} color={getCustomerRatingColor(customerRating)} />
                    <KurdishText 
                      variant="caption" 
                      color={getCustomerRatingColor(customerRating)} 
                      style={{ marginLeft: 4 }}
                    >
                      {getCustomerRatingName(customerRating)}
                    </KurdishText>
                  </View>
                </View>
              </View>
            </View>
            {hasPermission(PERMISSIONS.DELETE_CUSTOMER) && (
              <TouchableOpacity
                onPress={() => handleDeleteCustomer(item.id, item.name)}
                style={styles.deleteButton}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.debtInfo}>
            <View style={styles.debtItem}>
              <KurdishText variant="caption" color="#6B7280">
                کۆی قەرز
              </KurdishText>
              <KurdishText variant="body" color="#EF4444">
                {formatCurrency(totalDebt)}
              </KurdishText>
            </View>
            <View style={styles.debtItem}>
              <KurdishText variant="caption" color="#6B7280">
                قەرزی چالاک
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {activeDebts}
              </KurdishText>
            </View>
          </View>
        </GradientCard>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16 }}>
            بارکردنی کڕیاران...
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو، مۆبایل، ئیمەیڵ، گروپ..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        
        {/* Group Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowGroupFilter(!showGroupFilter)}
          >
            <Users size={20} color="#1E3A8A" />
            <KurdishText variant="body" color="#1E3A8A">
              {selectedGroup === 'all' ? 'هەموو گروپەکان' : getCustomerGroupName(selectedGroup)}
            </KurdishText>
          </TouchableOpacity>
        </View>
        
        {/* Rating Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowRatingFilter(!showRatingFilter)}
          >
            <Star size={20} color="#1E3A8A" />
            <KurdishText variant="body" color="#1E3A8A">
              {selectedRating === 'all' ? 'هەموو پلەکان' : getCustomerRatingName(selectedRating)}
            </KurdishText>
          </TouchableOpacity>
        </View>
        
        {showGroupFilter && (
          <View style={styles.groupFilterContainer}>
            <TouchableOpacity
              style={[
                styles.groupFilterButton,
                selectedGroup === 'all' && styles.groupFilterButtonActive,
              ]}
              onPress={() => {
                setSelectedGroup('all');
                setShowGroupFilter(false);
              }}
            >
              <KurdishText 
                variant="caption" 
                color={selectedGroup === 'all' ? 'white' : '#6B7280'}
              >
                هەموو گروپەکان
              </KurdishText>
            </TouchableOpacity>
            {CUSTOMER_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupFilterButton,
                  selectedGroup === group.id && {
                    backgroundColor: group.color,
                    borderColor: group.color,
                  },
                ]}
                onPress={() => {
                  setSelectedGroup(group.id);
                  setShowGroupFilter(false);
                }}
              >
                <KurdishText 
                  variant="caption" 
                  color={selectedGroup === group.id ? 'white' : '#6B7280'}
                >
                  {group.name}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {showRatingFilter && (
          <View style={styles.groupFilterContainer}>
            <TouchableOpacity
              style={[
                styles.groupFilterButton,
                selectedRating === 'all' && styles.groupFilterButtonActive,
              ]}
              onPress={() => {
                setSelectedRating('all');
                setShowRatingFilter(false);
              }}
            >
              <KurdishText 
                variant="caption" 
                color={selectedRating === 'all' ? 'white' : '#6B7280'}
              >
                هەموو پلەکان
              </KurdishText>
            </TouchableOpacity>
            {CUSTOMER_RATINGS.map((rating) => (
              <TouchableOpacity
                key={rating.id}
                style={[
                  styles.groupFilterButton,
                  selectedRating === rating.id && {
                    backgroundColor: rating.color,
                    borderColor: rating.color,
                  },
                ]}
                onPress={() => {
                  setSelectedRating(rating.id);
                  setShowRatingFilter(false);
                }}
              >
                <KurdishText 
                  variant="caption" 
                  color={selectedRating === rating.id ? 'white' : '#6B7280'}
                >
                  {rating.name}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {hasPermission(PERMISSIONS.ADD_CUSTOMER) && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-user')}
          >
            <Plus size={24} color="white" />
            <KurdishText variant="body" color="white">
              کڕیاری نوێ
            </KurdishText>
          </TouchableOpacity>
        )}
      </View>

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
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={48} color="#9CA3AF" />
            <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16, textAlign: 'center' }}>
              هیچ کڕیارێک نەدۆزرایەوە
            </KurdishText>
            <KurdishText variant="caption" color="#9CA3AF" style={{ marginTop: 8, textAlign: 'center' }}>
              گەڕان بە ناو، مۆبایل، ئیمەیڵ، گروپ، پلە یان ناسنامە
            </KurdishText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  customerCard: {
    marginBottom: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrButton: {
    padding: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    marginTop: 4,
    gap: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  debtInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  debtItem: {
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  groupFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  groupFilterButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupFilterButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});