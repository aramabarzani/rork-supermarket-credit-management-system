import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Edit,
  Trash2,
  Split,
  ArrowRightLeft,
  History,

  AlertTriangle,
  CheckCircle,
  X,
  Search,

  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { KurdishText } from '@/components/KurdishText';
import { Debt, DebtHistory } from '@/types/debt';

export default function AdvancedDebtManagementScreen() {
  useAuth();
  const {
    debts,

    updateDebt,
    deleteDebt,
    splitDebt,
    transferDebt,
    getDebtHistory,

  } = useDebts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!searchQuery) return debts;
    const query = searchQuery.toLowerCase();
    return debts.filter(
      (debt) =>
        debt.customerName.toLowerCase().includes(query) ||
        debt.description.toLowerCase().includes(query) ||
        debt.category.toLowerCase().includes(query) ||
        debt.receiptNumber?.toLowerCase().includes(query)
    );
  }, [debts, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const handleDeleteDebt = async () => {
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
        return <Edit size={16} color="#3B82F6" />;
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی پێشکەوتووی قەرز',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="گەڕان بە ناو، وەسڵ، پۆل..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <KurdishText style={styles.statLabel}>
              کۆی قەرزەکان
            </KurdishText>
            <Text style={styles.statValue}>{debts.length}</Text>
          </View>
          <View style={styles.statBox}>
            <KurdishText style={styles.statLabel}>
              قەرزی چالاک
            </KurdishText>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {debts.filter((d) => d.status === 'active').length}
            </Text>
          </View>
          <View style={styles.statBox}>
            <KurdishText style={styles.statLabel}>
              دراوەتەوە
            </KurdishText>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {debts.filter((d) => d.status === 'paid').length}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.debtsList} showsVerticalScrollIndicator={false}>
          {filteredDebts.map((debt) => (
            <View key={debt.id} style={styles.debtCard}>
              <View style={styles.debtHeader}>
                <View style={styles.debtInfo}>
                  <KurdishText style={styles.customerName}>
                    {debt.customerName}
                  </KurdishText>
                  <Text style={styles.receiptNumber}>
                    وەسڵ: {debt.receiptNumber}
                  </Text>
                  <Text style={styles.category}>پۆل: {debt.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    debt.status === 'paid' && styles.paidBadge,
                    debt.status === 'active' && styles.activeBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {debt.status === 'paid' ? 'دراوەتەوە' : 'چالاک'}
                  </Text>
                </View>
              </View>

              <View style={styles.debtDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>بڕی قەرز:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(debt.amount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ماوە:</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>
                    {formatCurrency(debt.remainingAmount)}
                  </Text>
                </View>
                {debt.dueDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>بەرواری کۆتایی:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(debt.dueDate)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.updateBtn]}
                  onPress={() => {
                    handleSelectDebt(debt);
                    setShowUpdateModal(true);
                  }}
                >
                  <Edit size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>دەستکاری</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => {
                    handleSelectDebt(debt);
                    setShowDeleteModal(true);
                  }}
                  disabled={debt.remainingAmount < debt.amount}
                >
                  <Trash2 size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>سڕینەوە</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.splitBtn]}
                  onPress={() => {
                    handleSelectDebt(debt);
                    setSplitForm({
                      split1Amount: (debt.remainingAmount / 2).toString(),
                      split1Description: `${debt.description} - بەشی ١`,
                      split2Amount: (debt.remainingAmount / 2).toString(),
                      split2Description: `${debt.description} - بەشی ٢`,
                    });
                    setShowSplitModal(true);
                  }}
                  disabled={debt.remainingAmount === 0}
                >
                  <Split size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>پشکنین</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.transferBtn]}
                  onPress={() => {
                    handleSelectDebt(debt);
                    setShowTransferModal(true);
                  }}
                >
                  <ArrowRightLeft size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>گواستنەوە</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.historyBtn]}
                  onPress={() => handleViewHistory(debt)}
                >
                  <History size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>مێژوو</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredDebts.length === 0 && (
            <View style={styles.emptyState}>
              <AlertTriangle size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>هیچ قەرزێک نەدۆزرایەوە</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={showUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>دەستکاریکردنی قەرز</KurdishText>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>بڕی قەرز</Text>
                <TextInput
                  style={styles.input}
                  value={updateForm.amount}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, amount: text })
                  }
                  keyboardType="numeric"
                  placeholder="بڕی قەرز"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>وەسف</Text>
                <TextInput
                  style={styles.input}
                  value={updateForm.description}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, description: text })
                  }
                  placeholder="وەسفی قەرز"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>پۆل</Text>
                <TextInput
                  style={styles.input}
                  value={updateForm.category}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, category: text })
                  }
                  placeholder="پۆلی قەرز"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>تێبینی</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={updateForm.notes}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, notes: text })
                  }
                  placeholder="تێبینی"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>بەرواری کۆتایی</Text>
                <TextInput
                  style={styles.input}
                  value={updateForm.dueDate}
                  onChangeText={(text) =>
                    setUpdateForm({ ...updateForm, dueDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateDebt}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>نوێکردنەوە</Text>
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
          <View style={[styles.modalContent, { maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>
                سڕینەوەی قەرز
              </KurdishText>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <AlertTriangle size={48} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.warningText}>
                دڵنیایت لە سڕینەوەی ئەم قەرزە؟ ئەم کردارە ناگەڕێتەوە!
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>هۆکاری سڕینەوە</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  placeholder="هۆکار بنووسە..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteDebt}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>سڕینەوە</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>
                پشکنینی قەرز
              </KurdishText>
              <TouchableOpacity onPress={() => setShowSplitModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.infoText}>
                بڕی ماوە: {selectedDebt && formatCurrency(selectedDebt.remainingAmount)}
              </Text>

              <View style={styles.splitSection}>
                <Text style={styles.sectionTitle}>بەشی یەکەم</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>بڕ</Text>
                  <TextInput
                    style={styles.input}
                    value={splitForm.split1Amount}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split1Amount: text })
                    }
                    keyboardType="numeric"
                    placeholder="بڕی بەشی یەکەم"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>وەسف</Text>
                  <TextInput
                    style={styles.input}
                    value={splitForm.split1Description}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split1Description: text })
                    }
                    placeholder="وەسفی بەشی یەکەم"
                  />
                </View>
              </View>

              <View style={styles.splitSection}>
                <Text style={styles.sectionTitle}>بەشی دووەم</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>بڕ</Text>
                  <TextInput
                    style={styles.input}
                    value={splitForm.split2Amount}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split2Amount: text })
                    }
                    keyboardType="numeric"
                    placeholder="بڕی بەشی دووەم"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>وەسف</Text>
                  <TextInput
                    style={styles.input}
                    value={splitForm.split2Description}
                    onChangeText={(text) =>
                      setSplitForm({ ...splitForm, split2Description: text })
                    }
                    placeholder="وەسفی بەشی دووەم"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSplitDebt}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>پشکنین</Text>
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
          <View style={[styles.modalContent, { maxHeight: 400 }]}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>گواستنەوەی قەرز</KurdishText>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>ناسنامەی کڕیاری نوێ</Text>
                <TextInput
                  style={styles.input}
                  value={transferForm.newCustomerId}
                  onChangeText={(text) =>
                    setTransferForm({ ...transferForm, newCustomerId: text })
                  }
                  placeholder="ناسنامەی کڕیار"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ناوی کڕیاری نوێ</Text>
                <TextInput
                  style={styles.input}
                  value={transferForm.newCustomerName}
                  onChangeText={(text) =>
                    setTransferForm({ ...transferForm, newCustomerName: text })
                  }
                  placeholder="ناوی کڕیار"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>هۆکاری گواستنەوە</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
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
                style={styles.submitButton}
                onPress={handleTransferDebt}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>گواستنەوە</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>مێژووی گۆڕانکاریەکان</KurdishText>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {debtHistoryData.length > 0 ? (
                debtHistoryData.map((history) => (
                  <View key={history.id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      {getActionIcon(history.action)}
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyAction}>
                        {getActionText(history.action)}
                      </Text>
                      <Text style={styles.historyPerformer}>
                        لەلایەن: {history.performedByName}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(history.performedAt)}
                      </Text>
                      {history.notes && (
                        <Text style={styles.historyNotes}>{history.notes}</Text>
                      )}
                      {history.changes && history.changes.length > 0 && (
                        <View style={styles.changesContainer}>
                          {history.changes.map((change, index) => (
                            <Text key={index} style={styles.changeText}>
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
                  <Text style={styles.emptyText}>هیچ مێژوویەک نییە</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  debtsList: {
    flex: 1,
    padding: 16,
  },
  debtCard: {
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
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  debtInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#FEE2E2',
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  debtDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  updateBtn: {
    backgroundColor: '#3B82F6',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  splitBtn: {
    backgroundColor: '#F59E0B',
  },
  transferBtn: {
    backgroundColor: '#8B5CF6',
  },
  historyBtn: {
    backgroundColor: '#6B7280',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
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
  modalContent: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  splitSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyPerformer: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 4,
  },
  changesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
});
