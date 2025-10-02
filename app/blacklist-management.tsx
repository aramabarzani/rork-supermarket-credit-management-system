import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { AlertTriangle, UserX, CheckCircle, XCircle, Search, Plus, FileText } from 'lucide-react-native';
import { useBlacklist } from '@/hooks/blacklist-context';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { BlacklistEntry, BlacklistReason } from '@/types/blacklist';

const REASON_LABELS: Record<BlacklistReason, string> = {
  repeated_late_payment: 'دواکەوتنی دووبارە',
  fraud: 'ساختەکاری',
  excessive_debt: 'قەرزی زۆر',
  bounced_check: 'چێکی گەڕاوە',
  legal_issue: 'کێشەی یاسایی',
  other: 'هۆکاری تر',
};

export default function BlacklistManagement() {
  const { entries, alerts, addToBlacklist, removeFromBlacklist, updateBlacklistEntry, getStats, dismissAlert } = useBlacklist();
  const { debts } = useDebts();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BlacklistEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'removed'>('all');

  const stats = getStats();

  const [newEntry, setNewEntry] = useState({
    customerId: '',
    customerName: '',
    reason: 'repeated_late_payment' as BlacklistReason,
    reasonDetails: '',
    notes: '',
  });

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.customerId.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddToBlacklist = async () => {
    if (!newEntry.customerId || !newEntry.customerName) {
      Alert.alert('هەڵە', 'تکایە زانیاریەکان تەواو بکە');
      return;
    }

    const customerDebts = debts.filter(d => d.customerId === newEntry.customerId);
    const totalDebt = customerDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const overduePayments = customerDebts.filter(d => {
      if (!d.dueDate) return false;
      return new Date(d.dueDate) < new Date() && d.remainingAmount > 0;
    }).length;

    await addToBlacklist({
      ...newEntry,
      addedBy: user?.id || '',
      totalDebt,
      overduePayments,
    });

    setShowAddModal(false);
    setNewEntry({
      customerId: '',
      customerName: '',
      reason: 'repeated_late_payment',
      reasonDetails: '',
      notes: '',
    });

    Alert.alert('سەرکەوتوو', 'کڕیار زیادکرا بۆ لیستی ڕەوش');
  };

  const handleRemoveFromBlacklist = (entry: BlacklistEntry) => {
    Alert.alert(
      'لابردن لە لیستی ڕەوش',
      `دڵنیایت لە لابردنی ${entry.customerName}؟`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'لابردن',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'هۆکاری لابردن',
              'تکایە هۆکاری لابردن بنووسە',
              async (reason) => {
                if (reason) {
                  await removeFromBlacklist(entry.id, user?.id || '', reason);
                  Alert.alert('سەرکەوتوو', 'کڕیار لابرا لە لیستی ڕەوش');
                }
              }
            );
          },
        },
      ]
    );
  };

  const renderEntry = (entry: BlacklistEntry) => (
    <TouchableOpacity
      key={entry.id}
      style={[
        styles.entryCard,
        entry.status === 'removed' && styles.removedCard,
      ]}
      onPress={() => setSelectedEntry(entry)}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryInfo}>
          <UserX size={24} color={entry.status === 'active' ? '#DC2626' : '#6B7280'} />
          <View style={styles.entryDetails}>
            <Text style={styles.customerName}>{entry.customerName}</Text>
            <Text style={styles.customerId}>کۆد: {entry.customerId}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          entry.status === 'active' && styles.activeStatus,
          entry.status === 'removed' && styles.removedStatus,
        ]}>
          <Text style={styles.statusText}>
            {entry.status === 'active' ? 'چالاک' : 'لابراوە'}
          </Text>
        </View>
      </View>

      <View style={styles.entryBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>هۆکار:</Text>
          <Text style={styles.value}>{REASON_LABELS[entry.reason]}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>کۆی قەرز:</Text>
          <Text style={styles.debtAmount}>{entry.totalDebt.toLocaleString()} IQD</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>پارەدانی دواکەوتوو:</Text>
          <Text style={styles.overdueCount}>{entry.overduePayments}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>بەروار:</Text>
          <Text style={styles.value}>{new Date(entry.addedAt).toLocaleDateString('ku')}</Text>
        </View>
      </View>

      {entry.status === 'active' && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromBlacklist(entry)}
        >
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.removeButtonText}>لابردن لە لیست</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی لیستی ڕەوش',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#FFFFFF',
        }}
      />

      <ScrollView style={styles.content}>
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            {alerts.map(alert => (
              <View key={alert.id} style={styles.alertCard}>
                <AlertTriangle size={20} color="#DC2626" />
                <Text style={styles.alertText}>{alert.message}</Text>
                <TouchableOpacity onPress={() => dismissAlert(alert.id)}>
                  <XCircle size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeBlacklisted}</Text>
            <Text style={styles.statLabel}>چالاک</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalBlacklisted}</Text>
            <Text style={styles.statLabel}>کۆی گشتی</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.removedThisMonth}</Text>
            <Text style={styles.statLabel}>لابراوی ئەم مانگە</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{(stats.totalDebtFromBlacklisted / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>کۆی قەرز</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="گەڕان بە ناو یان کۆد..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
              onPress={() => setFilterStatus('all')}
            >
              <Text style={[styles.filterText, filterStatus === 'all' && styles.activeFilterText]}>
                هەموو
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'active' && styles.activeFilter]}
              onPress={() => setFilterStatus('active')}
            >
              <Text style={[styles.filterText, filterStatus === 'active' && styles.activeFilterText]}>
                چالاک
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'removed' && styles.activeFilter]}
              onPress={() => setFilterStatus('removed')}
            >
              <Text style={[styles.filterText, filterStatus === 'removed' && styles.activeFilterText]}>
                لابراوە
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.entriesList}>
          {filteredEntries.map(renderEntry)}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>زیادکردن بۆ لیستی ڕەوش</Text>

            <TextInput
              style={styles.input}
              placeholder="کۆدی کڕیار"
              value={newEntry.customerId}
              onChangeText={(text) => setNewEntry({ ...newEntry, customerId: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="ناوی کڕیار"
              value={newEntry.customerName}
              onChangeText={(text) => setNewEntry({ ...newEntry, customerName: text })}
            />

            <View style={styles.reasonPicker}>
              <Text style={styles.label}>هۆکار:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(Object.keys(REASON_LABELS) as BlacklistReason[]).map(reason => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      newEntry.reason === reason && styles.selectedReason,
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, reason })}
                  >
                    <Text style={[
                      styles.reasonText,
                      newEntry.reason === reason && styles.selectedReasonText,
                    ]}>
                      {REASON_LABELS[reason]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="وردەکاریەکانی هۆکار"
              value={newEntry.reasonDetails}
              onChangeText={(text) => setNewEntry({ ...newEntry, reasonDetails: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="تێبینی"
              value={newEntry.notes}
              onChangeText={(text) => setNewEntry({ ...newEntry, notes: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddToBlacklist}
              >
                <Text style={styles.saveButtonText}>زیادکردن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedEntry && (
        <Modal
          visible={!!selectedEntry}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedEntry(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>وردەکاریەکان</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ناوی کڕیار:</Text>
                <Text style={styles.detailValue}>{selectedEntry.customerName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>کۆد:</Text>
                <Text style={styles.detailValue}>{selectedEntry.customerId}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>هۆکار:</Text>
                <Text style={styles.detailValue}>{REASON_LABELS[selectedEntry.reason]}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>وردەکاری:</Text>
                <Text style={styles.detailValue}>{selectedEntry.reasonDetails}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>کۆی قەرز:</Text>
                <Text style={styles.detailValue}>{selectedEntry.totalDebt.toLocaleString()} IQD</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>پارەدانی دواکەوتوو:</Text>
                <Text style={styles.detailValue}>{selectedEntry.overduePayments}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>بەروار:</Text>
                <Text style={styles.detailValue}>{new Date(selectedEntry.addedAt).toLocaleDateString('ku')}</Text>
              </View>

              {selectedEntry.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تێبینی:</Text>
                  <Text style={styles.detailValue}>{selectedEntry.notes}</Text>
                </View>
              )}

              {selectedEntry.status === 'removed' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>هۆکاری لابردن:</Text>
                    <Text style={styles.detailValue}>{selectedEntry.removalReason}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>بەرواری لابردن:</Text>
                    <Text style={styles.detailValue}>
                      {selectedEntry.removedAt ? new Date(selectedEntry.removedAt).toLocaleDateString('ku') : '-'}
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setSelectedEntry(null)}
              >
                <Text style={styles.closeButtonText}>داخستن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  alertsSection: {
    padding: 16,
    gap: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchSection: {
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  entriesList: {
    padding: 16,
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  removedCard: {
    opacity: 0.6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryDetails: {
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  customerId: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#FEE2E2',
  },
  removedStatus: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  debtAmount: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  overdueCount: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  reasonPicker: {
    marginBottom: 12,
  },
  reasonOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedReason: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  reasonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedReasonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#DC2626',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#1E3A8A',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});
