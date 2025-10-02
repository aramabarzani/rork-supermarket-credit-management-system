import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Search,
  Filter,
  Plus,
  Calendar,
  FileText,
  Edit3,
  Trash2,
  Receipt,
  X,
  Split,
  ArrowRightLeft,
  History,
  Settings,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { 
  DEBT_CATEGORIES, 
  DEBT_FILTERS, 
  DEBT_FILTER_LABELS,
  AMOUNT_RANGES,
  getDebtCategoryById 
} from '@/constants/debt-categories';
import { Debt, DebtHistory } from '@/types/debt';

export default function DebtManagementScreen() {
  const router = useRouter();
  const { 
    debts: allDebts,
    searchDebts,
    getOverdueDebts,
    getUnpaidDebts,
    updateDebt,
    deleteDebt,
    splitDebt,
    transferDebt,
    getDebtHistory,
  } = useDebts();
  const { hasPermission } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'advanced'>('list');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: DEBT_FILTERS.ALL as string,
    category: 'all',
    amountRange: 'all',
    searchQuery: '',
  });

  const [updateForm, setUpdateForm] = useState({
    amount: '',
    description: '',
    category: '',
    notes: '',
    dueDate: '',
  });

  const [splitForm, setSplitForm] = useState({
    split1Amount: '',
    split1Description: '',
    split2Amount: '',
    split2Description: '',
  });

  const [transferForm, setTransferForm] = useState({
    newCustomerId: '',
    newCustomerName: '',
    reason: '',
  });

  const [deleteReason, setDeleteReason] = useState('');

  const filteredDebts = useMemo(() => {
    let debts = [...allDebts];
    
    if (filters.status !== DEBT_FILTERS.ALL) {
      if (filters.status === DEBT_FILTERS.OVERDUE) {
        const now = new Date();
        debts = debts.filter(debt => 
          debt.dueDate && new Date(debt.dueDate) < now && debt.status !== 'paid'
        );
      } else {
        debts = debts.filter(debt => debt.status === filters.status);
      }
    }
    
    if (filters.category !== 'all') {
      debts = debts.filter(debt => debt.category === filters.category);
    }
    
    if (filters.amountRange !== 'all') {
      const range = AMOUNT_RANGES.find(r => r.id === filters.amountRange);
      if (range && range.min !== undefined) {
        debts = debts.filter(debt => debt.amount >= range.min!);
      }
      if (range && range.max !== undefined) {
        debts = debts.filter(debt => debt.amount <= range.max!);
      }
    }
    
    if (searchQuery.trim()) {
      const searchResults = searchDebts({ searchText: searchQuery.trim() });
      debts = debts.filter(debt => 
        searchResults.some(result => result.id === debt.id)
      );
    }
    
    return debts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allDebts, filters, searchDebts, searchQuery]);

  const overdueDebts = useMemo(() => getOverdueDebts(), [getOverdueDebts]);
  const unpaidDebts = useMemo(() => getUnpaidDebts(), [getUnpaidDebts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  const handleEditDebt = (debt: Debt) => {
    if (!hasPermission(PERMISSIONS.EDIT_DEBT)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی دەستکاری قەرزت نییە');
      return;
    }
    // Navigate to edit debt screen
    router.push(`/edit-debt/${debt.id}`);
  };

  const handleDeleteDebt = (debt: Debt) => {
    if (!hasPermission(PERMISSIONS.DELETE_DEBT)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی سڕینەوەی قەرزت نییە');
      return;
    }

    Alert.alert(
      'دڵنیابوونەوە',
      `دڵنیایت لە سڕینەوەی قەرزی ${debt.customerName}؟`,
      [
        { text: 'نەخێر', style: 'cancel' },
        { 
          text: 'بەڵێ', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete debt:', debt.id);
            Alert.alert('سەرکەوتوو', 'قەرزەکە سڕایەوە');
          }
        },
      ]
    );
  };

  const handleViewReceipt = (debt: Debt) => {
    router.push(`/receipt/${debt.id}`);
  };

  const handleSelectDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setUpdateForm({
      amount: debt.amount.toString(),
      description: debt.description,
      category: debt.category,
      notes: debt.notes || '',
      dueDate: debt.dueDate || '',
    });
  };

  const handleUpdateDebt = async () => {
    if (!selectedDebt) return;

    try {
      setIsLoading(true);
      await updateDebt(selectedDebt.id, {
        amount: parseFloat(updateForm.amount),
        description: updateForm.description,
        category: updateForm.category,
        notes: updateForm.notes,
        dueDate: updateForm.dueDate,
      });
      Alert.alert('سەرکەوتوو', 'قەرزەکە بە سەرکەوتوویی نوێکرایەوە');
      setShowUpdateModal(false);
      setSelectedDebt(null);
    } catch (error: any) {
      Alert.alert('هەڵە', error.message || 'نەتوانرا قەرزەکە نوێ بکرێتەوە');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDebtAdvanced = async () => {
    if (!selectedDebt) return;

    try {
      setIsLoading(true);
      await deleteDebt(selectedDebt.id, deleteReason);
      Alert.alert('سەرکەوتوو', 'قەرزەکە بە سەرکەوتوویی سڕایەوە');
      setShowDeleteModal(false);
      setSelectedDebt(null);
      setDeleteReason('');
    } catch (error: any) {
      Alert.alert('هەڵە', error.message || 'نەتوانرا قەرزەکە بسڕێتەوە');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitDebt = async () => {
    if (!selectedDebt) return;

    const split1 = parseFloat(splitForm.split1Amount);
    const split2 = parseFloat(splitForm.split2Amount);

    if (isNaN(split1) || isNaN(split2)) {
      Alert.alert('هەڵە', 'تکایە بڕەکان بە دروستی بنووسە');
      return;
    }

    if (split1 + split2 !== selectedDebt.remainingAmount) {
      Alert.alert(
        'هەڵە',
        `کۆی بڕەکان دەبێ یەکسان بێت لەگەڵ بڕی ماوە: ${formatCurrency(selectedDebt.remainingAmount)}`
      );
      return;
    }

    try {
      setIsLoading(true);
      await splitDebt(selectedDebt.id, [
        { amount: split1, description: splitForm.split1Description },
        { amount: split2, description: splitForm.split2Description },
      ]);
      Alert.alert('سەرکەوتوو', 'قەرزەکە بە سەرکەوتوویی پشکنین کرا');
      setShowSplitModal(false);
      setSelectedDebt(null);
      setSplitForm({
        split1Amount: '',
        split1Description: '',
        split2Amount: '',
        split2Description: '',
      });
    } catch (error: any) {
      Alert.alert('هەڵە', error.message || 'نەتوانرا قەرزەکە پشکنین بکرێت');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferDebt = async () => {
    if (!selectedDebt) return;

    if (!transferForm.newCustomerId || !transferForm.newCustomerName) {
      Alert.alert('هەڵە', 'تکایە زانیاری کڕیاری نوێ بنووسە');
      return;
    }

    try {
      setIsLoading(true);
      await transferDebt(
        selectedDebt.id,
        transferForm.newCustomerId,
        transferForm.newCustomerName,
        transferForm.reason
      );
      Alert.alert('سەرکەوتوو', 'قەرزەکە بە سەرکەوتوویی گواسترایەوە');
      setShowTransferModal(false);
      setSelectedDebt(null);
      setTransferForm({
        newCustomerId: '',
        newCustomerName: '',
        reason: '',
      });
    } catch (error: any) {
      Alert.alert('هەڵە', error.message || 'نەتوانرا قەرزەکە بگوێزرێتەوە');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowHistoryModal(true);
  };

  const getActionIcon = (action: DebtHistory['action']) => {
    switch (action) {
      case 'created':
        return <CheckCircle size={16} color="#10B981" />;
      case 'updated':
        return <Edit3 size={16} color="#3B82F6" />;
      case 'deleted':
        return <Trash2 size={16} color="#EF4444" />;
      case 'split':
        return <Split size={16} color="#F59E0B" />;
      case 'transferred':
        return <ArrowRightLeft size={16} color="#8B5CF6" />;
      case 'payment_added':
        return <TrendingUp size={16} color="#10B981" />;
      case 'payment_refunded':
        return <TrendingDown size={16} color="#EF4444" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getActionText = (action: DebtHistory['action']) => {
    const actions: Record<DebtHistory['action'], string> = {
      created: 'درووستکرا',
      updated: 'نوێکرایەوە',
      deleted: 'سڕایەوە',
      split: 'پشکنین کرا',
      transferred: 'گواسترایەوە',
      payment_added: 'پارەدان زیادکرا',
      payment_updated: 'پارەدان نوێکرایەوە',
      payment_deleted: 'پارەدان سڕایەوە',
      payment_refunded: 'پارەدان گەڕایەوە',
    };
    return actions[action] || action;
  };

  const debtHistoryData = selectedDebt ? getDebtHistory(selectedDebt.id) : [];

  const applyFilter = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: DEBT_FILTERS.ALL,
      category: 'all',
      amountRange: 'all',
      searchQuery: '',
    });
    setSearchQuery('');
  };

  const renderDebtItem = ({ item }: { item: Debt }) => {
    const category = getDebtCategoryById(item.category);
    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'paid';

    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/customer-detail/${item.customerId}`);
        }}
      >
        <GradientCard style={[styles.debtCard, isOverdue && styles.overdueCard]}>
          <View style={styles.debtHeader}>
            <View style={styles.debtInfo}>
              <View style={styles.categoryBadge}>
                <KurdishText variant="caption" color="#1F2937" style={{ fontSize: 16 }}>
                  {category.icon}
                </KurdishText>
              </View>
              <View style={styles.debtDetails}>
                <KurdishText variant="subtitle" color="#1F2937">
                  {item.customerName}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  {category.name} • {formatDate(item.createdAt)}
                </KurdishText>
                {item.receiptNumber && (
                  <KurdishText variant="caption" color="#6B7280">
                    وەسڵ: {item.receiptNumber}
                  </KurdishText>
                )}
              </View>
            </View>
            <View style={styles.debtActions}>
              {hasPermission(PERMISSIONS.EDIT_DEBT) && (
                <TouchableOpacity
                  onPress={() => handleEditDebt(item)}
                  style={styles.actionButton}
                >
                  <Edit3 size={16} color="#3B82F6" />
                </TouchableOpacity>
              )}
              {hasPermission(PERMISSIONS.DELETE_DEBT) && (
                <TouchableOpacity
                  onPress={() => handleDeleteDebt(item)}
                  style={styles.actionButton}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleViewReceipt(item)}
                style={styles.actionButton}
              >
                <Receipt size={16} color="#10B981" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.debtAmount}>
            <View style={styles.amountRow}>
              <KurdishText variant="caption" color="#6B7280">
                کۆی قەرز
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {formatCurrency(item.amount)}
              </KurdishText>
            </View>
            <View style={styles.amountRow}>
              <KurdishText variant="caption" color="#6B7280">
                ماوە
              </KurdishText>
              <KurdishText 
                variant="body" 
                color={item.status === 'paid' ? '#10B981' : '#EF4444'}
              >
                {formatCurrency(item.remainingAmount)}
              </KurdishText>
            </View>
          </View>

          {item.description && (
            <View style={styles.debtDescription}>
              <KurdishText variant="caption" color="#6B7280">
                {item.description}
              </KurdishText>
            </View>
          )}

          {item.dueDate && (
            <View style={styles.dueDate}>
              <Calendar size={14} color={isOverdue ? '#EF4444' : '#6B7280'} />
              <KurdishText 
                variant="caption" 
                color={isOverdue ? '#EF4444' : '#6B7280'}
              >
                بەرواری گەڕاندنەوە: {formatDate(item.dueDate)}
              </KurdishText>
            </View>
          )}

          <View style={styles.statusBadge}>
            <KurdishText 
              variant="caption" 
              color={
                item.status === 'paid' ? '#10B981' : 
                item.status === 'partial' ? '#F59E0B' : '#EF4444'
              }
            >
              {item.status === 'paid' ? 'دراوەتەوە' : 
               item.status === 'partial' ? 'بەشی' : 'چالاک'}
            </KurdishText>
          </View>
        </GradientCard>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <KurdishText variant="title" color="#1F2937">
            فلتەرەکان
          </KurdishText>
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={styles.closeButton}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Status Filter */}
          <View style={styles.filterSection}>
            <KurdishText variant="subtitle" color="#1F2937">
              دۆخی قەرز
            </KurdishText>
            <View style={styles.filterOptions}>
              {Object.entries(DEBT_FILTER_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterOption,
                    filters.status === key && styles.filterOptionSelected,
                  ]}
                  onPress={() => applyFilter('status', key)}
                >
                  <KurdishText 
                    variant="body" 
                    color={filters.status === key ? 'white' : '#1F2937'}
                  >
                    {label}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <KurdishText variant="subtitle" color="#1F2937">
              مۆری قەرز
            </KurdishText>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filters.category === 'all' && styles.filterOptionSelected,
                ]}
                onPress={() => applyFilter('category', 'all')}
              >
                <KurdishText 
                  variant="body" 
                  color={filters.category === 'all' ? 'white' : '#1F2937'}
                >
                  هەموو مۆرەکان
                </KurdishText>
              </TouchableOpacity>
              {DEBT_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterOption,
                    filters.category === category.id && styles.filterOptionSelected,
                  ]}
                  onPress={() => applyFilter('category', category.id)}
                >
                  <KurdishText variant="body" style={{ fontSize: 16 }}>
                    {category.icon}
                  </KurdishText>
                  <KurdishText 
                    variant="body" 
                    color={filters.category === category.id ? 'white' : '#1F2937'}
                  >
                    {category.name}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount Range Filter */}
          <View style={styles.filterSection}>
            <KurdishText variant="subtitle" color="#1F2937">
              بڕی قەرز
            </KurdishText>
            <View style={styles.filterOptions}>
              {AMOUNT_RANGES.map(range => (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.filterOption,
                    filters.amountRange === range.id && styles.filterOptionSelected,
                  ]}
                  onPress={() => applyFilter('amountRange', range.id)}
                >
                  <KurdishText 
                    variant="body" 
                    color={filters.amountRange === range.id ? 'white' : '#1F2937'}
                  >
                    {range.label}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <KurdishText variant="body" color="#EF4444">
                پاککردنەوەی فلتەرەکان
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderAdvancedDebtItem = ({ item }: { item: Debt }) => (
    <View style={styles.advancedDebtCard}>
      <View style={styles.debtHeader}>
        <View style={styles.debtInfo}>
          <KurdishText style={styles.advancedCustomerName}>
            {item.customerName}
          </KurdishText>
          <Text style={styles.advancedReceiptNumber}>
            وەسڵ: {item.receiptNumber}
          </Text>
          <Text style={styles.advancedCategory}>پۆل: {item.category}</Text>
        </View>
        <View
          style={[
            styles.advancedStatusBadge,
            item.status === 'paid' && styles.advancedPaidBadge,
            item.status === 'active' && styles.advancedActiveBadge,
          ]}
        >
          <Text style={styles.advancedStatusText}>
            {item.status === 'paid' ? 'دراوەتەوە' : 'چالاک'}
          </Text>
        </View>
      </View>

      <View style={styles.advancedDebtDetails}>
        <View style={styles.advancedDetailRow}>
          <Text style={styles.advancedDetailLabel}>بڕی قەرز:</Text>
          <Text style={styles.advancedDetailValue}>
            {formatCurrency(item.amount)}
          </Text>
        </View>
        <View style={styles.advancedDetailRow}>
          <Text style={styles.advancedDetailLabel}>ماوە:</Text>
          <Text style={[styles.advancedDetailValue, { color: '#EF4444' }]}>
            {formatCurrency(item.remainingAmount)}
          </Text>
        </View>
        {item.dueDate && (
          <View style={styles.advancedDetailRow}>
            <Text style={styles.advancedDetailLabel}>بەرواری کۆتایی:</Text>
            <Text style={styles.advancedDetailValue}>
              {formatDate(item.dueDate)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.advancedActionButtons}>
        <TouchableOpacity
          style={[styles.advancedActionBtn, styles.advancedUpdateBtn]}
          onPress={() => {
            handleSelectDebt(item);
            setShowUpdateModal(true);
          }}
        >
          <Edit3 size={16} color="#fff" />
          <Text style={styles.advancedActionBtnText}>دەستکاری</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.advancedActionBtn, styles.advancedDeleteBtn]}
          onPress={() => {
            handleSelectDebt(item);
            setShowDeleteModal(true);
          }}
          disabled={item.remainingAmount < item.amount}
        >
          <Trash2 size={16} color="#fff" />
          <Text style={styles.advancedActionBtnText}>سڕینەوە</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.advancedActionBtn, styles.advancedSplitBtn]}
          onPress={() => {
            handleSelectDebt(item);
            setSplitForm({
              split1Amount: (item.remainingAmount / 2).toString(),
              split1Description: `${item.description} - بەشی ١`,
              split2Amount: (item.remainingAmount / 2).toString(),
              split2Description: `${item.description} - بەشی ٢`,
            });
            setShowSplitModal(true);
          }}
          disabled={item.remainingAmount === 0}
        >
          <Split size={16} color="#fff" />
          <Text style={styles.advancedActionBtnText}>پشکنین</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.advancedActionBtn, styles.advancedTransferBtn]}
          onPress={() => {
            handleSelectDebt(item);
            setShowTransferModal(true);
          }}
        >
          <ArrowRightLeft size={16} color="#fff" />
          <Text style={styles.advancedActionBtnText}>گواستنەوە</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.advancedActionBtn, styles.advancedHistoryBtn]}
          onPress={() => handleViewHistory(item)}
        >
          <History size={16} color="#fff" />
          <Text style={styles.advancedActionBtnText}>مێژوو</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <FileText size={20} color={activeTab === 'list' ? '#1E3A8A' : '#6B7280'} />
          <KurdishText
            variant="body"
            color={activeTab === 'list' ? '#1E3A8A' : '#6B7280'}
          >
            لیستی قەرزەکان
          </KurdishText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'advanced' && styles.activeTab]}
          onPress={() => setActiveTab('advanced')}
        >
          <Settings size={20} color={activeTab === 'advanced' ? '#1E3A8A' : '#6B7280'} />
          <KurdishText
            variant="body"
            color={activeTab === 'advanced' ? '#1E3A8A' : '#6B7280'}
          >
            بەڕێوەبردنی پێشکەوتوو
          </KurdishText>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        <>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو، وەسف یان ژمارەی وەسڵ..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#1E3A8A" />
          </TouchableOpacity>
          
          {hasPermission(PERMISSIONS.ADD_DEBT) && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-debt')}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <GradientCard style={styles.statCard}>
          <KurdishText variant="caption" color="#6B7280">
            کۆی قەرزەکان
          </KurdishText>
          <KurdishText variant="subtitle" color="#1F2937">
            {filteredDebts.length}
          </KurdishText>
        </GradientCard>
        
        <GradientCard style={styles.statCard}>
          <KurdishText variant="caption" color="#6B7280">
            دواکەوتوو
          </KurdishText>
          <KurdishText variant="subtitle" color="#EF4444">
            {overdueDebts.length}
          </KurdishText>
        </GradientCard>
        
        <GradientCard style={styles.statCard}>
          <KurdishText variant="caption" color="#6B7280">
            نەپارەدراو
          </KurdishText>
          <KurdishText variant="subtitle" color="#F59E0B">
            {unpaidDebts.length}
          </KurdishText>
        </GradientCard>
      </View>

      <FlatList
        data={filteredDebts}
        renderItem={renderDebtItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={48} color="#9CA3AF" />
            <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16 }}>
              هیچ قەرزێک نەدۆزرایەوە
            </KurdishText>
          </View>
        }
      />

      {renderFilterModal()}
        </>
      ) : (
        <View style={styles.advancedContainer}>
          <FlatList
            data={filteredDebts}
            renderItem={renderAdvancedDebtItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.advancedListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <AlertTriangle size={48} color="#9CA3AF" />
                <Text style={styles.advancedEmptyText}>هیچ قەرزێک نەدۆزرایەوە</Text>
              </View>
            }
          />
        </View>
      )}

      <Modal
        visible={showUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.advancedModalContent}>
            <View style={styles.advancedModalHeader}>
              <KurdishText style={styles.advancedModalTitle}>دەستکاریکردنی قەرز</KurdishText>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.advancedModalBody}>
              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>بڕی قەرز</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={updateForm.amount}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, amount: text })
                  }
                  keyboardType="numeric"
                  placeholder="بڕی قەرز"
                />
              </View>

              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>وەسف</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={updateForm.description}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, description: text })
                  }
                  placeholder="وەسفی قەرز"
                />
              </View>

              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>پۆل</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={updateForm.category}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, category: text })
                  }
                  placeholder="پۆلی قەرز"
                />
              </View>

              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>تێبینی</Text>
                <TextInput
                  style={[styles.advancedInput, styles.advancedTextArea]}
                  value={updateForm.notes}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, notes: text })
                  }
                  placeholder="تێبینی"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.advancedSubmitButton}
                onPress={handleUpdateDebt}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.advancedSubmitButtonText}>نوێکردنەوە</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.advancedModalContent, { maxHeight: 300 }]}>
            <View style={styles.advancedModalHeader}>
              <KurdishText style={styles.advancedModalTitle}>
                سڕینەوەی قەرز
              </KurdishText>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.advancedModalBody}>
              <AlertTriangle size={48} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.advancedWarningText}>
                دڵنیایت لە سڕینەوەی ئەم قەرزە؟ ئەم کردارە ناگەڕێتەوە!
              </Text>

              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>هۆکاری سڕینەوە</Text>
                <TextInput
                  style={[styles.advancedInput, styles.advancedTextArea]}
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  placeholder="هۆکار بنووسە..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.advancedButtonRow}>
                <TouchableOpacity
                  style={[styles.advancedButton, styles.advancedCancelButton]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.advancedCancelButtonText}>پاشگەزبوونەوە</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.advancedButton, styles.advancedDeleteButton]}
                  onPress={handleDeleteDebtAdvanced}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.advancedDeleteButtonText}>سڕینەوە</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSplitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSplitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.advancedModalContent}>
            <View style={styles.advancedModalHeader}>
              <KurdishText style={styles.advancedModalTitle}>
                پشکنینی قەرز
              </KurdishText>
              <TouchableOpacity onPress={() => setShowSplitModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.advancedModalBody}>
              <Text style={styles.advancedInfoText}>
                بڕی ماوە: {selectedDebt && formatCurrency(selectedDebt.remainingAmount)}
              </Text>

              <View style={styles.advancedSplitSection}>
                <Text style={styles.advancedSectionTitle}>بەشی یەکەم</Text>
                <View style={styles.advancedFormGroup}>
                  <Text style={styles.advancedLabel}>بڕ</Text>
                  <TextInput
                    style={styles.advancedInput}
                    value={splitForm.split1Amount}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split1Amount: text })
                    }
                    keyboardType="numeric"
                    placeholder="بڕی بەشی یەکەم"
                  />
                </View>
                <View style={styles.advancedFormGroup}>
                  <Text style={styles.advancedLabel}>وەسف</Text>
                  <TextInput
                    style={styles.advancedInput}
                    value={splitForm.split1Description}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split1Description: text })
                    }
                    placeholder="وەسفی بەشی یەکەم"
                  />
                </View>
              </View>

              <View style={styles.advancedSplitSection}>
                <Text style={styles.advancedSectionTitle}>بەشی دووەم</Text>
                <View style={styles.advancedFormGroup}>
                  <Text style={styles.advancedLabel}>بڕ</Text>
                  <TextInput
                    style={styles.advancedInput}
                    value={splitForm.split2Amount}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split2Amount: text })
                    }
                    keyboardType="numeric"
                    placeholder="بڕی بەشی دووەم"
                  />
                </View>
                <View style={styles.advancedFormGroup}>
                  <Text style={styles.advancedLabel}>وەسف</Text>
                  <TextInput
                    style={styles.advancedInput}
                    value={splitForm.split2Description}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split2Description: text })
                    }
                    placeholder="وەسفی بەشی دووەم"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.advancedSubmitButton}
                onPress={handleSplitDebt}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.advancedSubmitButtonText}>پشکنین</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTransferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.advancedModalContent, { maxHeight: 400 }]}>
            <View style={styles.advancedModalHeader}>
              <KurdishText style={styles.advancedModalTitle}>گواستنەوەی قەرز</KurdishText>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.advancedModalBody}>
              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>ناسنامەی کڕیاری نوێ</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={transferForm.newCustomerId}
                  onChangeText={(text) =>
                    setTransferForm({ ...transferForm, newCustomerId: text })
                  }
                  placeholder="ناسنامەی کڕیار"
                />
              </View>

              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>ناوی کڕیاری نوێ</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={transferForm.newCustomerName}
                  onChangeText={(text) =>
                    setTransferForm({ ...transferForm, newCustomerName: text })
                  }
                  placeholder="ناوی کڕیار"
                />
              </View>

              <View style={styles.advancedFormGroup}>
                <Text style={styles.advancedLabel}>هۆکاری گواستنەوە</Text>
                <TextInput
                  style={[styles.advancedInput, styles.advancedTextArea]}
                  value={transferForm.reason}
                  onChangeText={(text) =>
                    setTransferForm({ ...transferForm, reason: text })
                  }
                  placeholder="هۆکار بنووسە..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.advancedSubmitButton}
                onPress={handleTransferDebt}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.advancedSubmitButtonText}>گواستنەوە</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHistoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.advancedModalContent}>
            <View style={styles.advancedModalHeader}>
              <KurdishText style={styles.advancedModalTitle}>مێژووی گۆڕانکاریەکان</KurdishText>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.advancedModalBody}>
              {debtHistoryData.length > 0 ? (
                debtHistoryData.map((history) => (
                  <View key={history.id} style={styles.advancedHistoryItem}>
                    <View style={styles.advancedHistoryIcon}>
                      {getActionIcon(history.action)}
                    </View>
                    <View style={styles.advancedHistoryContent}>
                      <Text style={styles.advancedHistoryAction}>
                        {getActionText(history.action)}
                      </Text>
                      <Text style={styles.advancedHistoryPerformer}>
                        لەلایەن: {history.performedByName}
                      </Text>
                      <Text style={styles.advancedHistoryDate}>
                        {formatDate(history.performedAt)}
                      </Text>
                      {history.notes && (
                        <Text style={styles.advancedHistoryNotes}>{history.notes}</Text>
                      )}
                      {history.changes && history.changes.length > 0 && (
                        <View style={styles.advancedChangesContainer}>
                          {history.changes.map((change, index) => (
                            <Text key={index} style={styles.advancedChangeText}>
                              {change.field}: {JSON.stringify(change.oldValue)} →{' '}
                              {JSON.stringify(change.newValue)}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Clock size={48} color="#9CA3AF" />
                  <Text style={styles.advancedEmptyText}>هیچ مێژوویەک نییە</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  debtCard: {
    marginBottom: 12,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  debtInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtDetails: {
    flex: 1,
    gap: 2,
  },
  debtActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  debtAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 8,
  },
  amountRow: {
    alignItems: 'center',
    gap: 4,
  },
  debtDescription: {
    marginBottom: 8,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#1E3A8A',
  },
  modalActions: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1E3A8A',
  },
  advancedContainer: {
    flex: 1,
  },
  advancedListContent: {
    padding: 16,
  },
  advancedDebtCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  advancedCustomerName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  advancedReceiptNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  advancedCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  advancedStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  advancedActiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  advancedPaidBadge: {
    backgroundColor: '#D1FAE5',
  },
  advancedStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  advancedDebtDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  advancedDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advancedDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  advancedDetailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  advancedActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  advancedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  advancedUpdateBtn: {
    backgroundColor: '#3B82F6',
  },
  advancedDeleteBtn: {
    backgroundColor: '#EF4444',
  },
  advancedSplitBtn: {
    backgroundColor: '#F59E0B',
  },
  advancedTransferBtn: {
    backgroundColor: '#8B5CF6',
  },
  advancedHistoryBtn: {
    backgroundColor: '#6B7280',
  },
  advancedActionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  advancedEmptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  advancedModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  advancedModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  advancedModalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  advancedModalBody: {
    padding: 20,
  },
  advancedFormGroup: {
    marginBottom: 16,
  },
  advancedLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  advancedInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  advancedTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  advancedSubmitButton: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  advancedSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  advancedWarningText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  advancedButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  advancedButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  advancedCancelButton: {
    backgroundColor: '#E5E7EB',
  },
  advancedCancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  advancedDeleteButton: {
    backgroundColor: '#EF4444',
  },
  advancedDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  advancedInfoText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'center',
  },
  advancedSplitSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  advancedSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  advancedHistoryItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  advancedHistoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  advancedHistoryContent: {
    flex: 1,
  },
  advancedHistoryAction: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  advancedHistoryPerformer: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  advancedHistoryDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  advancedHistoryNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 4,
  },
  advancedChangesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  advancedChangeText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
});