import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Database,
  HardDrive,
  Cloud,
  Download,
  Upload,
  CheckCircle,
  Clock,
  Settings,
  FileText,
  Trash2,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { BackupContext, useBackup } from '@/hooks/backup-context';
import type { BackupDestination, BackupRecord } from '@/types/backup';

const destinationIcons: Record<BackupDestination, typeof Cloud> = {
  'local': HardDrive,
  'google-drive': Cloud,
  'dropbox': Cloud,
  'onedrive': Cloud,
  'internal-server': Database,
  'usb': HardDrive,
};

const destinationLabels: Record<BackupDestination, string> = {
  'local': 'ناوخۆیی',
  'google-drive': 'گووگڵ درایڤ',
  'dropbox': 'درۆپبۆکس',
  'onedrive': 'وان‌درایڤ',
  'internal-server': 'سێرڤەری ناوخۆیی',
  'usb': 'یو‌ئێس‌بی',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 بایت';
  const k = 1024;
  const sizes = ['بایت', 'کێ‌بی', 'مێ‌بی', 'گێ‌بی'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ku', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BackupManagementContent() {
  const {
    config,
    stats,
    records,
    isLoadingConfig,
    isLoadingStats,
    isLoadingRecords,
    isCreatingBackup,
    createBackup,
    updateConfig,
    verifyBackup,
    deleteBackup,
    restoreBackup,
  } = useBackup();

  const [selectedDestination, setSelectedDestination] = useState<BackupDestination>('google-drive');
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<BackupRecord | null>(null);

  const handleCreateBackup = async () => {
    try {
      await createBackup(selectedDestination);
      Alert.alert('سەرکەوتوو', 'باکاپ بە سەرکەوتوویی دەستی پێکرد');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە دروستکردنی باکاپ');
    }
  };

  const handleVerifyBackup = async (backupId: string) => {
    try {
      await verifyBackup(backupId);
      Alert.alert('سەرکەوتوو', 'باکاپ پشکنینی سەرکەوتوو بوو');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە پشکنینی باکاپ');
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    Alert.alert(
      'دڵنیابوونەوە',
      'دڵنیایت لە سڕینەوەی ئەم باکاپە؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBackup(backupId);
              Alert.alert('سەرکەوتوو', 'باکاپ بە سەرکەوتوویی سڕایەوە');
            } catch {
              Alert.alert('هەڵە', 'کێشە لە سڕینەوەی باکاپ');
            }
          },
        },
      ]
    );
  };

  const handleRestoreBackup = (backup: BackupRecord) => {
    setSelectedBackupForRestore(backup);
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (!selectedBackupForRestore) return;

    try {
      await restoreBackup(selectedBackupForRestore.id, {
        restoreCustomers: true,
        restoreDebts: true,
        restorePayments: true,
        restoreReceipts: true,
        restoreSettings: true,
        overwriteExisting: true,
      });
      setShowRestoreModal(false);
      Alert.alert('سەرکەوتوو', 'باکاپ بە سەرکەوتوویی گەڕێندرایەوە');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە گەڕاندنەوەی باکاپ');
    }
  };

  const handleToggleAutoBackup = async (enabled: boolean) => {
    if (!config) return;
    try {
      await updateConfig({ enabled });
    } catch {
      Alert.alert('هەڵە', 'کێشە لە نوێکردنەوەی ڕێکخستنەکان');
    }
  };

  if (isLoadingConfig || isLoadingStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <KurdishText style={styles.loadingText}>چاوەڕوان بە...</KurdishText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Database size={24} color="#4F46E5" />
          <KurdishText style={styles.statValue}>{stats?.totalBackups || 0}</KurdishText>
          <KurdishText style={styles.statLabel}>کۆی باکاپەکان</KurdishText>
        </View>

        <View style={styles.statCard}>
          <CheckCircle size={24} color="#10B981" />
          <KurdishText style={styles.statValue}>{stats?.successfulBackups || 0}</KurdishText>
          <KurdishText style={styles.statLabel}>سەرکەوتوو</KurdishText>
        </View>

        <View style={styles.statCard}>
          <HardDrive size={24} color="#F59E0B" />
          <KurdishText style={styles.statValue}>{formatBytes(stats?.totalSize || 0)}</KurdishText>
          <KurdishText style={styles.statLabel}>قەبارە</KurdishText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color="#1F2937" />
          <KurdishText style={styles.sectionTitle}>ڕێکخستنەکان</KurdishText>
        </View>

        <View style={styles.settingRow}>
          <KurdishText style={styles.settingLabel}>باکاپی خۆکار</KurdishText>
          <Switch
            value={config?.enabled || false}
            onValueChange={handleToggleAutoBackup}
            trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {config?.enabled && (
          <View style={styles.infoBox}>
            <Clock size={16} color="#6B7280" />
            <KurdishText style={styles.infoText}>
              باکاپی داهاتوو: {config.scheduledTime || 'دیارینەکراوە'}
            </KurdishText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Upload size={20} color="#1F2937" />
          <KurdishText style={styles.sectionTitle}>دروستکردنی باکاپی نوێ</KurdishText>
        </View>

        <View style={styles.destinationGrid}>
          {(Object.keys(destinationLabels) as BackupDestination[]).map((dest) => {
            const Icon = destinationIcons[dest];
            const isSelected = selectedDestination === dest;
            return (
              <TouchableOpacity
                key={dest}
                style={[styles.destinationCard, isSelected && styles.destinationCardSelected]}
                onPress={() => setSelectedDestination(dest)}
              >
                <Icon size={24} color={isSelected ? '#4F46E5' : '#6B7280'} />
                <KurdishText
                  style={[styles.destinationLabel, isSelected && styles.destinationLabelSelected]}
                >
                  {destinationLabels[dest]}
                </KurdishText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.createButton, isCreatingBackup && styles.createButtonDisabled]}
          onPress={handleCreateBackup}
          disabled={isCreatingBackup}
        >
          {isCreatingBackup ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Upload size={20} color="#FFFFFF" />
              <KurdishText style={styles.createButtonText}>دروستکردنی باکاپ</KurdishText>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={20} color="#1F2937" />
          <KurdishText style={styles.sectionTitle}>باکاپە هەڵگیراوەکان</KurdishText>
        </View>

        {isLoadingRecords ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : records.length === 0 ? (
          <View style={styles.emptyState}>
            <Database size={48} color="#D1D5DB" />
            <KurdishText style={styles.emptyText}>هیچ باکاپێک نییە</KurdishText>
          </View>
        ) : (
          records.map((record) => (
            <View key={record.id} style={styles.backupCard}>
              <View style={styles.backupHeader}>
                <View style={styles.backupInfo}>
                  {React.createElement(destinationIcons[record.destination], {
                    size: 20,
                    color: '#4F46E5',
                  })}
                  <KurdishText style={styles.backupDestination}>
                    {destinationLabels[record.destination]}
                  </KurdishText>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    record.status === 'completed' && styles.statusCompleted,
                    record.status === 'failed' && styles.statusFailed,
                    record.status === 'in-progress' && styles.statusInProgress,
                  ]}
                >
                  <KurdishText style={styles.statusText}>
                    {record.status === 'completed' && 'تەواو'}
                    {record.status === 'failed' && 'شکستخواردوو'}
                    {record.status === 'in-progress' && 'بەردەوامە'}
                    {record.status === 'pending' && 'چاوەڕوانە'}
                  </KurdishText>
                </View>
              </View>

              <View style={styles.backupDetails}>
                <KurdishText style={styles.backupDetailText}>
                  قەبارە: {formatBytes(record.size)}
                </KurdishText>
                <KurdishText style={styles.backupDetailText}>
                  بەروار: {formatDate(record.startTime)}
                </KurdishText>
              </View>

              {record.status === 'completed' && (
                <View style={styles.backupActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRestoreBackup(record)}
                  >
                    <Download size={16} color="#4F46E5" />
                    <KurdishText style={styles.actionButtonText}>گەڕاندنەوە</KurdishText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleVerifyBackup(record.id)}
                  >
                    <CheckCircle size={16} color="#10B981" />
                    <KurdishText style={styles.actionButtonText}>پشکنین</KurdishText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteBackup(record.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <KurdishText style={styles.actionButtonText}>سڕینەوە</KurdishText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {showRestoreModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KurdishText style={styles.modalTitle}>گەڕاندنەوەی باکاپ</KurdishText>
            <KurdishText style={styles.modalText}>
              دڵنیایت لە گەڕاندنەوەی ئەم باکاپە؟ ئەمە هەموو داتاکانی ئێستا دەگۆڕێت.
            </KurdishText>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowRestoreModal(false)}
              >
                <KurdishText style={styles.modalButtonCancelText}>پاشگەزبوونەوە</KurdishText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={confirmRestore}>
                <KurdishText style={styles.modalButtonConfirmText}>گەڕاندنەوە</KurdishText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default function BackupManagementScreen() {
  return (
    <BackupContext>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'بەڕێوەبردنی باکاپ',
            headerStyle: { backgroundColor: '#4F46E5' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontFamily: 'Rabar_029' },
          }}
        />
        <BackupManagementContent />
      </SafeAreaView>
    </BackupContext>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  destinationCard: {
    width: '30%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  destinationCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  destinationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  destinationLabelSelected: {
    color: '#4F46E5',
    fontWeight: '600' as const,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  backupCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backupDestination: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusInProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  backupDetails: {
    marginBottom: 8,
  },
  backupDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1F2937',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
