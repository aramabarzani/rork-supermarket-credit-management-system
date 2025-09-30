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
  Check,
  X,
  Settings,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS, PERMISSION_LABELS } from '@/constants/permissions';

export default function RoleManagementScreen() {
  const router = useRouter();
  const { customRoles, createCustomRole, deleteCustomRole, updateCustomRole } = useUsers();
  const { hasPermission } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const permissionCategories = [
    {
      title: 'بەڕێوەبردنی کڕیارەکان',
      permissions: [
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.ADD_CUSTOMER,
        PERMISSIONS.EDIT_CUSTOMER,
        PERMISSIONS.DELETE_CUSTOMER,
      ],
      color: '#3B82F6',
    },
    {
      title: 'بەڕێوەبردنی قەرزەکان',
      permissions: [
        PERMISSIONS.VIEW_DEBTS,
        PERMISSIONS.ADD_DEBT,
        PERMISSIONS.EDIT_DEBT,
        PERMISSIONS.DELETE_DEBT,
      ],
      color: '#10B981',
    },
    {
      title: 'بەڕێوەبردنی پارەدانەکان',
      permissions: [
        PERMISSIONS.VIEW_PAYMENTS,
        PERMISSIONS.ADD_PAYMENT,
        PERMISSIONS.EDIT_PAYMENT,
        PERMISSIONS.DELETE_PAYMENT,
      ],
      color: '#F59E0B',
    },
    {
      title: 'بەڕێوەبردنی کارمەندان',
      permissions: [
        PERMISSIONS.VIEW_EMPLOYEES,
        PERMISSIONS.ADD_EMPLOYEE,
        PERMISSIONS.EDIT_EMPLOYEE,
        PERMISSIONS.DELETE_EMPLOYEE,
        PERMISSIONS.MANAGE_PERMISSIONS,
      ],
      color: '#8B5CF6',
    },
    {
      title: 'ڕاپۆرتەکان',
      permissions: [
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
      ],
      color: '#EF4444',
    },
  ];

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      Alert.alert('تێبینی', 'تکایە ناوی ڕۆڵ بنووسە');
      return;
    }

    if (selectedPermissions.length === 0) {
      Alert.alert('تێبینی', 'تکایە لانیکەم یەک دەسەڵات هەڵبژێرە');
      return;
    }

    try {
      await createCustomRole({
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
        isSystem: false,
      });

      Alert.alert('سەرکەوتوو', 'ڕۆڵی نوێ بە سەرکەوتوویی دروستکرا');
      setShowCreateModal(false);
      setRoleName('');
      setRoleDescription('');
      setSelectedPermissions([]);
    } catch (error) {
      Alert.alert('هەڵە', 'هەڵەیەک ڕوویدا لە دروستکردنی ڕۆڵ');
    }
  };

  const handleUpdateRole = async (roleId: string) => {
    if (!roleName.trim()) {
      Alert.alert('تێبینی', 'تکایە ناوی ڕۆڵ بنووسە');
      return;
    }

    try {
      await updateCustomRole(roleId, {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
      });

      Alert.alert('سەرکەوتوو', 'ڕۆڵ بە سەرکەوتوویی نوێکرایەوە');
      setEditingRole(null);
      setRoleName('');
      setRoleDescription('');
      setSelectedPermissions([]);
    } catch (error) {
      Alert.alert('هەڵە', 'هەڵەیەک ڕوویدا لە نوێکردنەوەی ڕۆڵ');
    }
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    Alert.alert(
      'سڕینەوەی ڕۆڵ',
      `ئایا دڵنیایت لە سڕینەوەی ڕۆڵی "${roleName}"؟`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomRole(roleId);
              Alert.alert('سەرکەوتوو', 'ڕۆڵ بە سەرکەوتوویی سڕایەوە');
            } catch (error: any) {
              Alert.alert('هەڵە', error.message || 'هەڵەیەک ڕوویدا');
            }
          },
        },
      ]
    );
  };

  const startEditRole = (role: any) => {
    setEditingRole(role.id);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions);
    setShowCreateModal(true);
  };

  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const cancelEdit = () => {
    setShowCreateModal(false);
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
  };

  if (!hasPermission(PERMISSIONS.MANAGE_PERMISSIONS)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.noPermissionContainer}>
          <Shield size={64} color="#EF4444" />
          <KurdishText variant="title" color="#EF4444" style={styles.noPermissionTitle}>
            دەسەڵات نییە
          </KurdishText>
          <KurdishText variant="body" color="#6B7280" style={styles.noPermissionText}>
            تۆ دەسەڵاتی بەڕێوەبردنی ڕۆڵەکانت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <KurdishText variant="title" color="#1F2937">
          بەڕێوەبردنی ڕۆڵەکان
        </KurdishText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {showCreateModal && (
          <GradientCard style={styles.createModal}>
            <View style={styles.modalHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                {editingRole ? 'دەستکاری ڕۆڵ' : 'دروستکردنی ڕۆڵی نوێ'}
              </KurdishText>
              <TouchableOpacity onPress={cancelEdit}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <KurdishText variant="body" color="#1F2937">
                ناوی ڕۆڵ
              </KurdishText>
              <TextInput
                style={styles.input}
                placeholder="ناوی ڕۆڵ بنووسە"
                placeholderTextColor="#9CA3AF"
                value={roleName}
                onChangeText={setRoleName}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <KurdishText variant="body" color="#1F2937">
                وەسف
              </KurdishText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="وەسفی ڕۆڵ بنووسە"
                placeholderTextColor="#9CA3AF"
                value={roleDescription}
                onChangeText={setRoleDescription}
                textAlign="right"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <KurdishText variant="body" color="#1F2937">
                دەسەڵاتەکان
              </KurdishText>
              
              {permissionCategories.map((category) => (
                <View key={category.title} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <Settings size={16} color={category.color} />
                    </View>
                    <KurdishText variant="caption" color="#1F2937">
                      {category.title}
                    </KurdishText>
                  </View>

                  <View style={styles.permissionsList}>
                    {category.permissions.map((permission) => (
                      <TouchableOpacity
                        key={permission}
                        style={styles.permissionItem}
                        onPress={() => togglePermission(permission)}
                      >
                        <KurdishText variant="caption" color="#1F2937">
                          {PERMISSION_LABELS[permission]}
                        </KurdishText>
                        <View style={[
                          styles.checkbox,
                          selectedPermissions.includes(permission) && styles.checkboxActive
                        ]}>
                          {selectedPermissions.includes(permission) && (
                            <Check size={14} color="white" />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={() => editingRole ? handleUpdateRole(editingRole) : handleCreateRole()}
              >
                <KurdishText variant="body" color="white">
                  {editingRole ? 'نوێکردنەوە' : 'دروستکردن'}
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelEdit}
              >
                <KurdishText variant="body" color="#6B7280">
                  پاشگەزبوونەوە
                </KurdishText>
              </TouchableOpacity>
            </View>
          </GradientCard>
        )}

        {customRoles.length === 0 ? (
          <GradientCard style={styles.emptyState}>
            <Shield size={48} color="#9CA3AF" />
            <KurdishText variant="subtitle" color="#6B7280" style={styles.emptyTitle}>
              هیچ ڕۆڵێک نییە
            </KurdishText>
            <KurdishText variant="caption" color="#9CA3AF">
              سەرەتا ڕۆڵی نوێ دروست بکە
            </KurdishText>
          </GradientCard>
        ) : (
          customRoles.map((role) => (
            <GradientCard key={role.id} style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <View style={styles.roleInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {role.name}
                  </KurdishText>
                  {role.description && (
                    <KurdishText variant="caption" color="#6B7280" style={styles.roleDescription}>
                      {role.description}
                    </KurdishText>
                  )}
                  <View style={styles.roleStats}>
                    <View style={styles.statBadge}>
                      <Shield size={14} color="#3B82F6" />
                      <KurdishText variant="caption" color="#3B82F6">
                        {role.permissions.length} دەسەڵات
                      </KurdishText>
                    </View>
                    {role.isSystem && (
                      <View style={[styles.statBadge, styles.systemBadge]}>
                        <KurdishText variant="caption" color="#10B981">
                          سیستەم
                        </KurdishText>
                      </View>
                    )}
                  </View>
                </View>

                {!role.isSystem && (
                  <View style={styles.roleActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => startEditRole(role)}
                    >
                      <Edit3 size={16} color="#3B82F6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteRole(role.id, role.name)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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
  createModal: {
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginTop: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySection: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionsList: {
    gap: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  roleCard: {
    marginBottom: 16,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleInfo: {
    flex: 1,
  },
  roleDescription: {
    marginTop: 4,
  },
  roleStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#3B82F6' + '20',
    borderRadius: 12,
  },
  systemBadge: {
    backgroundColor: '#10B981' + '20',
  },
  roleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3B82F6' + '20',
  },
  deleteButton: {
    backgroundColor: '#EF4444' + '20',
  },
});
