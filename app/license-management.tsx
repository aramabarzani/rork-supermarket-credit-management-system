import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { KurdishText } from '@/components/KurdishText';
import { CheckCircle, XCircle, Clock, AlertTriangle, Plus, Search, RefreshCw } from 'lucide-react-native';
import type { License, LicenseType } from '@/types/license';

export default function LicenseManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);


  const licensesQuery = trpc.license.getAll.useQuery();
  const createLicenseMutation = trpc.license.create.useMutation();
  const updateStatusMutation = trpc.license.updateStatus.useMutation();
  const renewLicenseMutation = trpc.license.renew.useMutation();

  const [newLicense, setNewLicense] = useState({
    clientName: '',
    type: 'monthly' as LicenseType,
    maxUsers: 5,
    maxCustomers: 100,
    features: ['customer_management', 'debt_tracking', 'payment_tracking'],
    durationMonths: 1,
  });

  const handleCreateLicense = async () => {
    try {
      await createLicenseMutation.mutateAsync(newLicense);
      setShowCreateModal(false);
      setNewLicense({
        clientName: '',
        type: 'monthly',
        maxUsers: 5,
        maxCustomers: 100,
        features: ['customer_management', 'debt_tracking', 'payment_tracking'],
        durationMonths: 1,
      });
      licensesQuery.refetch();
      Alert.alert('سەرکەوتوو', 'لایسەنس دروستکرا');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە دروستکردنی لایسەنس');
    }
  };

  const handleUpdateStatus = async (licenseId: string, status: 'active' | 'suspended' | 'expired' | 'trial') => {
    try {
      await updateStatusMutation.mutateAsync({ licenseId, status });
      licensesQuery.refetch();
      Alert.alert('سەرکەوتوو', 'دۆخی لایسەنس نوێکرایەوە');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە نوێکردنەوەی دۆخ');
    }
  };

  const handleRenewLicense = async (licenseId: string, durationMonths: number) => {
    try {
      await renewLicenseMutation.mutateAsync({ licenseId, durationMonths });
      licensesQuery.refetch();
      Alert.alert('سەرکەوتوو', 'لایسەنس نوێکرایەوە');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە نوێکردنەوەی لایسەنس');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} color="#10b981" />;
      case 'expired':
        return <XCircle size={20} color="#ef4444" />;
      case 'suspended':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'trial':
        return <Clock size={20} color="#3b82f6" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'چالاک';
      case 'expired':
        return 'بەسەرچووە';
      case 'suspended':
        return 'ڕاگیراوە';
      case 'trial':
        return 'تاقیکردنەوە';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'trial':
        return 'تاقیکردنەوە';
      case 'monthly':
        return 'مانگانە';
      case 'yearly':
        return 'ساڵانە';
      case 'lifetime':
        return 'هەمیشەیی';
      default:
        return type;
    }
  };

  const filteredLicenses = licensesQuery.data?.filter(license =>
    license.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    license.key.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (licensesQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی لایسەنس',
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو یان کلیلی لایسەنس..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => licensesQuery.refetch()}
          >
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
            <KurdishText style={styles.addButtonText}>لایسەنسی نوێ</KurdishText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <KurdishText style={styles.statValue}>
              {licensesQuery.data?.length || 0}
            </KurdishText>
            <KurdishText style={styles.statLabel}>کۆی گشتی</KurdishText>
          </View>

          <View style={styles.statCard}>
            <KurdishText style={styles.statValue}>
              {licensesQuery.data?.filter(l => l.status === 'active').length || 0}
            </KurdishText>
            <KurdishText style={styles.statLabel}>چالاک</KurdishText>
          </View>

          <View style={styles.statCard}>
            <KurdishText style={styles.statValue}>
              {licensesQuery.data?.filter(l => l.status === 'trial').length || 0}
            </KurdishText>
            <KurdishText style={styles.statLabel}>تاقیکردنەوە</KurdishText>
          </View>

          <View style={styles.statCard}>
            <KurdishText style={styles.statValue}>
              {licensesQuery.data?.filter(l => l.status === 'expired').length || 0}
            </KurdishText>
            <KurdishText style={styles.statLabel}>بەسەرچووە</KurdishText>
          </View>
        </View>

        {filteredLicenses.map((license) => (
          <View key={license.id} style={styles.licenseCard}>
            <View style={styles.licenseHeader}>
              <View style={styles.licenseInfo}>
                <KurdishText style={styles.clientName}>{license.clientName}</KurdishText>
                <Text style={styles.licenseKey}>{license.key}</Text>
              </View>
              <View style={styles.statusBadge}>
                {getStatusIcon(license.status)}
                <KurdishText style={styles.statusText}>
                  {getStatusText(license.status)}
                </KurdishText>
              </View>
            </View>

            <View style={styles.licenseDetails}>
              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>جۆر:</KurdishText>
                <KurdishText style={styles.detailValue}>
                  {getTypeText(license.type)}
                </KurdishText>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>بەکارهێنەران:</KurdishText>
                <Text style={styles.detailValue}>{license.maxUsers}</Text>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>کڕیاران:</KurdishText>
                <Text style={styles.detailValue}>{license.maxCustomers}</Text>
              </View>

              {license.expiresAt && (
                <View style={styles.detailRow}>
                  <KurdishText style={styles.detailLabel}>بەسەردەچێت:</KurdishText>
                  <Text style={styles.detailValue}>
                    {new Date(license.expiresAt).toLocaleDateString('en-GB')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.licenseActions}>
              {license.status === 'active' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.suspendButton]}
                  onPress={() => handleUpdateStatus(license.id, 'suspended')}
                >
                  <KurdishText style={styles.actionButtonText}>ڕاگرتن</KurdishText>
                </TouchableOpacity>
              )}

              {license.status === 'suspended' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.activateButton]}
                  onPress={() => handleUpdateStatus(license.id, 'active')}
                >
                  <KurdishText style={styles.actionButtonText}>چالاککردن</KurdishText>
                </TouchableOpacity>
              )}

              {(license.status === 'active' || license.status === 'trial') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.renewButton]}
                  onPress={() => handleRenewLicense(license.id, 1)}
                >
                  <KurdishText style={styles.actionButtonText}>نوێکردنەوە</KurdishText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KurdishText style={styles.modalTitle}>دروستکردنی لایسەنسی نوێ</KurdishText>

            <View style={styles.inputGroup}>
              <KurdishText style={styles.inputLabel}>ناوی کڕیار</KurdishText>
              <TextInput
                style={styles.input}
                value={newLicense.clientName}
                onChangeText={(text) => setNewLicense({ ...newLicense, clientName: text })}
                placeholder="ناوی کڕیار بنووسە..."
              />
            </View>

            <View style={styles.inputGroup}>
              <KurdishText style={styles.inputLabel}>جۆری لایسەنس</KurdishText>
              <View style={styles.typeButtons}>
                {(['trial', 'monthly', 'yearly', 'lifetime'] as LicenseType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newLicense.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewLicense({ ...newLicense, type })}
                  >
                    <KurdishText
                      style={[
                        styles.typeButtonText,
                        newLicense.type === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {getTypeText(type)}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <KurdishText style={styles.inputLabel}>ژمارەی بەکارهێنەران</KurdishText>
              <TextInput
                style={styles.input}
                value={String(newLicense.maxUsers)}
                onChangeText={(text) =>
                  setNewLicense({ ...newLicense, maxUsers: parseInt(text) || 0 })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <KurdishText style={styles.inputLabel}>ژمارەی کڕیاران</KurdishText>
              <TextInput
                style={styles.input}
                value={String(newLicense.maxCustomers)}
                onChangeText={(text) =>
                  setNewLicense({ ...newLicense, maxCustomers: parseInt(text) || 0 })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <KurdishText style={styles.cancelButtonText}>پاشگەزبوونەوە</KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateLicense}
                disabled={createLicenseMutation.isPending}
              >
                {createLicenseMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <KurdishText style={styles.createButtonText}>دروستکردن</KurdishText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  licenseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  licenseInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  licenseKey: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  licenseDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  licenseActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  suspendButton: {
    backgroundColor: '#f59e0b',
  },
  activateButton: {
    backgroundColor: '#10b981',
  },
  renewButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#3b82f6',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
