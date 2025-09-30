import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Shield,
  Plus,
  Edit3,
  Trash2,
  Phone,
  User,
  Lock,
  Calendar,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

export default function AdminManagementScreen() {
  const router = useRouter();
  const { getAdmins, addAdmin, removeAdmin, updateUser } = useUsers();
  const { hasPermission, user: currentUser } = useAuth();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const admins = getAdmins();

  const handleAddAdmin = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('تێبینی', 'تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    try {
      await addAdmin({
        name,
        phone,
        password,
      });

      Alert.alert('سەرکەوتوو', 'بەڕێوەبەری نوێ بە سەرکەوتوویی زیادکرا');
      setShowAddModal(false);
      setName('');
      setPhone('');
      setPassword('');
    } catch (error) {
      Alert.alert('هەڵە', 'هەڵەیەک ڕوویدا لە زیادکردنی بەڕێوەبەر');
    }
  };

  const handleRemoveAdmin = (adminId: string, adminName: string) => {
    if (adminId === currentUser?.id) {
      Alert.alert('تێبینی', 'ناتوانیت خۆت لاببەیت');
      return;
    }

    Alert.alert(
      'لابردنی بەڕێوەبەر',
      `ئایا دڵنیایت لە لابردنی "${adminName}"؟`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'لابردن',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAdmin(adminId);
              Alert.alert('سەرکەوتوو', 'بەڕێوەبەر بە سەرکەوتوویی لابرا');
            } catch (error: any) {
              Alert.alert('هەڵە', error.message || 'هەڵەیەک ڕوویدا');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  if (!hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) && currentUser?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.noPermissionContainer}>
          <Shield size={64} color="#EF4444" />
          <KurdishText variant="title" color="#EF4444" style={styles.noPermissionTitle}>
            {'دەسەڵات نییە'}
          </KurdishText>
          <KurdishText variant="body" color="#6B7280" style={styles.noPermissionText}>
            {'تۆ دەسەڵاتی بەڕێوەبردنی بەڕێوەبەرانت نییە'}
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <KurdishText variant="title" color="#1F2937">
          {'بەڕێوەبردنی بەڕێوەبەران'}
        </KurdishText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {showAddModal && (
          <GradientCard style={styles.addModal}>
            <View style={styles.modalHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                {'زیادکردنی بەڕێوەبەری نوێ'}
              </KurdishText>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <User size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  {'ناوی تەواو'}
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="ناو بنووسە"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Phone size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  {'ژمارەی مۆبایل'}
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="07501234567"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Lock size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  {'وشەی نهێنی'}
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="وشەی نهێنی بنووسە"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign="right"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleAddAdmin}
              >
                <KurdishText variant="body" color="white">
                  {'زیادکردن'}
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setName('');
                  setPhone('');
                  setPassword('');
                }}
              >
                <KurdishText variant="body" color="#6B7280">
                  {'پاشگەزبوونەوە'}
                </KurdishText>
              </TouchableOpacity>
            </View>
          </GradientCard>
        )}

        <View style={styles.statsCard}>
          <GradientCard colors={['#1E3A8A', '#3B82F6']}>
            <View style={styles.statsContent}>
              <Shield size={32} color="white" />
              <View style={styles.statsInfo}>
                <KurdishText variant="title" color="white">
                  {admins.length}
                </KurdishText>
                <KurdishText variant="body" color="rgba(255,255,255,0.9)">
                  {'کۆی بەڕێوەبەران'}
                </KurdishText>
              </View>
            </View>
          </GradientCard>
        </View>

        {admins.length === 0 ? (
          <GradientCard style={styles.emptyState}>
            <Shield size={48} color="#9CA3AF" />
            <KurdishText variant="subtitle" color="#6B7280" style={styles.emptyTitle}>
              {'هیچ بەڕێوەبەرێک نییە'}
            </KurdishText>
          </GradientCard>
        ) : (
          admins.map((admin) => (
            <GradientCard key={admin.id} style={styles.adminCard}>
              <View style={styles.adminHeader}>
                <View style={styles.adminInfo}>
                  <View style={styles.adminNameRow}>
                    <KurdishText variant="subtitle" color="#1F2937">
                      {admin.name}
                    </KurdishText>
                    {admin.id === currentUser?.id && (
                      <View style={styles.currentBadge}>
                        <KurdishText variant="caption" color="white">
                          {'تۆ'}
                        </KurdishText>
                      </View>
                    )}
                  </View>

                  <View style={styles.adminDetails}>
                    <View style={styles.detailRow}>
                      <Phone size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280">
                        {admin.phone}
                      </KurdishText>
                    </View>
                    <View style={styles.detailRow}>
                      <Calendar size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280">
                        {formatDate(admin.createdAt)}
                      </KurdishText>
                    </View>
                  </View>

                  <View style={styles.permissionsInfo}>
                    <Shield size={14} color="#10B981" />
                    <KurdishText variant="caption" color="#10B981">
                      {'هەموو دەسەڵاتەکان'}
                    </KurdishText>
                  </View>
                </View>

                <View style={[
                  styles.statusBadge,
                  admin.isActive ? styles.statusActive : styles.statusInactive
                ]}>
                  <KurdishText variant="caption" color="white">
                    {admin.isActive ? 'چالاک' : 'ناچالاک'}
                  </KurdishText>
                </View>
              </View>

              {admin.id !== currentUser?.id && (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => router.push(`/edit-employee?id=${admin.id}`)}
                  >
                    <Edit3 size={16} color="#3B82F6" />
                    <KurdishText variant="caption" color="#3B82F6">
                      {'دەستکاری'}
                    </KurdishText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleRemoveAdmin(admin.id, admin.name)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <KurdishText variant="caption" color="#EF4444">
                      {'لابردن'}
                    </KurdishText>
                  </TouchableOpacity>
                </View>
              )}
            </GradientCard>
          ))
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noPermissionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  noPermissionText: {
    textAlign: 'center',
  },
  addModal: {
    marginBottom: 16,
  },
  modalHeader: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsInfo: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
  },
  adminCard: {
    marginBottom: 16,
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adminInfo: {
    flex: 1,
  },
  adminNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminDetails: {
    gap: 4,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  permissionsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusInactive: {
    backgroundColor: '#EF4444',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  editButton: {
    backgroundColor: '#3B82F6' + '20',
  },
  deleteButton: {
    backgroundColor: '#EF4444' + '20',
  },
});
