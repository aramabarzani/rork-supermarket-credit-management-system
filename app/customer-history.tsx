import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  History,
  FileText,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  ShieldOff,
  Star,
  Link,
  Upload,
  Download,
  Plus,
  Minus,
  Calendar,
  User,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useDebts } from '@/hooks/debt-context';
import type { CustomerHistory } from '@/types/customer';

export default function CustomerHistoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  const usersContext = useUsers();
  const debtsContext = useDebts();

  if (!usersContext || !debtsContext) {
    return null;
  }

  const { getCustomers } = usersContext;
  const { getCustomerDebts, getPaymentsByCustomer, debtHistory } = debtsContext;

  const customer = getCustomers().find((c) => c.id === id);
  const customerDebts = customer ? getCustomerDebts(customer.id) : [];
  const customerPayments = customer ? getPaymentsByCustomer(customer.id) : [];

  const customerHistory: CustomerHistory[] = useMemo(() => {
    if (!customer) return [];


    const history: CustomerHistory[] = [];

    customerDebts.forEach((debt) => {
      history.push({
        id: `debt-${debt.id}`,
        customerId: customer.id,
        action: 'created',
        performedBy: debt.createdBy,
        performedByName: debt.createdByName,
        performedAt: debt.createdAt,
        notes: `قەرزی نوێ زیادکرا بە بڕی ${debt.amount} دینار`,
        metadata: { debtId: debt.id, amount: debt.amount },
      });
    });

    customerPayments.forEach((payment) => {
      history.push({
        id: `payment-${payment.id}`,
        customerId: customer.id,
        action: 'updated',
        performedBy: payment.receivedBy,
        performedByName: payment.receivedByName,
        performedAt: payment.paymentDate,
        notes: `پارەدان کرا بە بڕی ${payment.amount} دینار`,
        metadata: { paymentId: payment.id, amount: payment.amount },
      });
    });

    debtHistory
      .filter((h) => {
        const debt = customerDebts.find((d) => d.id === h.debtId);
        return debt !== undefined;
      })
      .forEach((h) => {
        history.push({
          id: h.id,
          customerId: customer.id,
          action: h.action as any,
          performedBy: h.performedBy,
          performedByName: h.performedByName,
          performedAt: h.performedAt,
          notes: h.notes,
          changes: h.changes,
          metadata: h.metadata,
        });
      });

    return history.sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }, [customer, customerDebts, customerPayments, debtHistory]);

  const filteredHistory = useMemo(() => {
    let filtered = customerHistory;

    if (filterType !== 'all') {
      filtered = filtered.filter((h) => h.action === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.notes?.toLowerCase().includes(query) ||
          h.performedByName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [customerHistory, filterType, searchQuery]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <UserPlus size={20} color="#10B981" />;
      case 'updated':
        return <Edit size={20} color="#3B82F6" />;
      case 'deleted':
        return <Trash2 size={20} color="#EF4444" />;
      case 'blocked':
        return <ShieldOff size={20} color="#EF4444" />;
      case 'unblocked':
        return <Shield size={20} color="#10B981" />;
      case 'document_added':
        return <Upload size={20} color="#10B981" />;
      case 'document_removed':
        return <Download size={20} color="#EF4444" />;
      case 'connection_added':
        return <Link size={20} color="#10B981" />;
      case 'connection_removed':
        return <Minus size={20} color="#EF4444" />;
      case 'feature_added':
        return <Plus size={20} color="#10B981" />;
      case 'feature_removed':
        return <Minus size={20} color="#EF4444" />;
      case 'rating_changed':
        return <Star size={20} color="#F59E0B" />;
      case 'payment_added':
        return <Plus size={20} color="#10B981" />;
      case 'payment_updated':
        return <Edit size={20} color="#3B82F6" />;
      case 'payment_deleted':
        return <Trash2 size={20} color="#EF4444" />;
      case 'payment_refunded':
        return <Minus size={20} color="#F59E0B" />;
      case 'split':
        return <FileText size={20} color="#3B82F6" />;
      case 'transferred':
        return <Link size={20} color="#3B82F6" />;
      default:
        return <FileText size={20} color="#6B7280" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
      case 'unblocked':
      case 'document_added':
      case 'connection_added':
      case 'feature_added':
      case 'payment_added':
        return '#10B981';
      case 'updated':
      case 'payment_updated':
      case 'split':
      case 'transferred':
        return '#3B82F6';
      case 'deleted':
      case 'blocked':
      case 'document_removed':
      case 'connection_removed':
      case 'feature_removed':
      case 'payment_deleted':
        return '#EF4444';
      case 'rating_changed':
      case 'payment_refunded':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'created':
        return 'درووستکرا';
      case 'updated':
        return 'دەستکاریکرا';
      case 'deleted':
        return 'سڕایەوە';
      case 'blocked':
        return 'بلۆککرا';
      case 'unblocked':
        return 'بلۆک لابرا';
      case 'document_added':
        return 'دۆکیومێنت زیادکرا';
      case 'document_removed':
        return 'دۆکیومێنت سڕایەوە';
      case 'connection_added':
        return 'پەیوەندی زیادکرا';
      case 'connection_removed':
        return 'پەیوەندی سڕایەوە';
      case 'feature_added':
        return 'تایبەتمەندی زیادکرا';
      case 'feature_removed':
        return 'تایبەتمەندی سڕایەوە';
      case 'rating_changed':
        return 'پلەبەندی گۆڕا';
      case 'payment_added':
        return 'پارەدان زیادکرا';
      case 'payment_updated':
        return 'پارەدان دەستکاریکرا';
      case 'payment_deleted':
        return 'پارەدان سڕایەوە';
      case 'payment_refunded':
        return 'پارەدان گەڕایەوە';
      case 'split':
        return 'پشکنین کرا';
      case 'transferred':
        return 'گواستراوە';
      default:
        return action;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ckb-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryItem = ({ item }: { item: CustomerHistory }) => (
    <GradientCard style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <View style={styles.historyIcon}>{getActionIcon(item.action)}</View>
        <View style={styles.historyContent}>
          <View style={styles.historyTitleRow}>
            <KurdishText variant="body" color={getActionColor(item.action)}>
              {getActionText(item.action)}
            </KurdishText>
            <KurdishText variant="caption" color="#6B7280">
              {formatDate(item.performedAt)}
            </KurdishText>
          </View>
          <View style={styles.historyMeta}>
            <User size={14} color="#6B7280" />
            <KurdishText variant="caption" color="#6B7280">
              {item.performedByName}
            </KurdishText>
          </View>
          {item.notes && (
            <KurdishText variant="body" color="#4B5563" style={styles.historyNotes}>
              {item.notes}
            </KurdishText>
          )}
          {item.changes && item.changes.length > 0 && (
            <View style={styles.changesContainer}>
              {item.changes.map((change, index) => (
                <View key={index} style={styles.changeItem}>
                  <KurdishText variant="caption" color="#6B7280">
                    {change.field} {String(change.oldValue)} {String(change.newValue)}
                  </KurdishText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </GradientCard>
  );

  const filterOptions = [
    { value: 'all', label: 'هەموو' },
    { value: 'created', label: 'درووستکرا' },
    { value: 'updated', label: 'دەستکاریکرا' },
    { value: 'payment_added', label: 'پارەدان' },
    { value: 'blocked', label: 'بلۆککرا' },
  ];

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            کڕیار نەدۆزرایەوە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <KurdishText variant="title" color="#1F2937">
            میژووی کڕیار
          </KurdishText>
          <KurdishText variant="body" color="#6B7280">
            {customer.name}
          </KurdishText>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="گەڕان لە میژوو..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              filterType === option.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(option.value)}
          >
            <KurdishText
              variant="body"
              color={filterType === option.value ? 'white' : '#6B7280'}
            >
              {option.label}
            </KurdishText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsRow}>
        <GradientCard style={styles.statCard}>
          <History size={20} color="#3B82F6" />
          <KurdishText variant="body" color="#1F2937">
            {filteredHistory.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">چالاکی</KurdishText>
        </GradientCard>
        <GradientCard style={styles.statCard}>
          <Calendar size={20} color="#10B981" />
          <KurdishText variant="body" color="#1F2937">
            {customerDebts.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">قەرز</KurdishText>
        </GradientCard>
        <GradientCard style={styles.statCard}>
          <FileText size={20} color="#F59E0B" />
          <KurdishText variant="body" color="#1F2937">
            {customerPayments.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">پارەدان</KurdishText>
        </GradientCard>
      </View>

      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <History size={48} color="#9CA3AF" />
          <KurdishText variant="body" color="#6B7280">هیچ میژوویەک نییە</KurdishText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyNotes: {
    marginTop: 8,
  },
  changesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 4,
  },
  changeItem: {
    paddingVertical: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
});
