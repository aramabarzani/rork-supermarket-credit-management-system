import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Shield, Save, X, Check } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS, PERMISSION_LABELS } from '@/constants/permissions';
import { Permission } from '@/types/auth';

export default function EmployeePermissionsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { users, setEmployeePermissions } = useUsers();
  const { hasPermission } = useAuth();
  
  const employee = users.find(u => u.id === id && u.role === 'employee');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (employee?.permissions) {
      setSelectedPermissions(employee.permissions.map(p => p.code));
    }
  }, [employee]);

  if (!employee) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientCard style={styles.errorCard}>
          <KurdishText variant="title" color="#EF4444">
            {'کارمەند نەدۆزرایەوە'}
          </KurdishText>
        </GradientCard>
      </SafeAreaView>
    );
  }

  if (!hasPermission(PERMISSIONS.MANAGE_PERMISSIONS)) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientCard style={styles.errorCard}>
          <Shield size={48} color="#EF4444" />
          <KurdishText variant="title" color="#EF4444" style={styles.errorTitle}>
            {'دەسەڵات نییە'}
          </KurdishText>
          <KurdishText variant="body" color="#6B7280" style={styles.errorSubtitle}>
            {'تۆ دەسەڵاتی بەڕێوەبردنی دەسەڵاتەکانت نییە'}
          </KurdishText>
        </GradientCard>
      </SafeAreaView>
    );
  }

  const togglePermission = (permissionCode: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionCode)) {
        return prev.filter(p => p !== permissionCode);
      } else {
        return [...prev, permissionCode];
      }
    });
  };

  const handleSave = async () => {
    const permissions: Permission[] = selectedPermissions.map(code => ({
      id: code,
      name: PERMISSION_LABELS[code] || code,
      code,
      description: '',
    }));

    await setEmployeePermissions(employee.id, permissions);
    Alert.alert('سەرکەوتوو', 'دەسەڵاتەکانی کارمەند بە سەرکەوتوویی نوێکرانەوە');
    router.back();
  };

  const permissionGroups = [
    {
      title: 'بەڕێوەبردنی کڕیارەکان',
      permissions: [
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.ADD_CUSTOMER,
        PERMISSIONS.EDIT_CUSTOMER,
        PERMISSIONS.DELETE_CUSTOMER,
      ],
    },
    {
      title: 'بەڕێوەبردنی قەرزەکان',
      permissions: [
        PERMISSIONS.VIEW_DEBTS,
        PERMISSIONS.ADD_DEBT,
        PERMISSIONS.EDIT_DEBT,
        PERMISSIONS.DELETE_DEBT,
      ],
    },
    {
      title: 'بەڕێوەبردنی پارەدانەکان',
      permissions: [
        PERMISSIONS.VIEW_PAYMENTS,
        PERMISSIONS.ADD_PAYMENT,
        PERMISSIONS.EDIT_PAYMENT,
        PERMISSIONS.DELETE_PAYMENT,
      ],
    },
    {
      title: 'بەڕێوەبردنی کارمەندەکان',
      permissions: [
        PERMISSIONS.VIEW_EMPLOYEES,
        PERMISSIONS.ADD_EMPLOYEE,
        PERMISSIONS.EDIT_EMPLOYEE,
        PERMISSIONS.DELETE_EMPLOYEE,
      ],
    },
    {
      title: 'ڕاپۆرتەکان',
      permissions: [
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
      ],
    },
    {
      title: 'سیستەم',
      permissions: [
        PERMISSIONS.VIEW_SETTINGS,
        PERMISSIONS.EDIT_SETTINGS,
        PERMISSIONS.VIEW_ACTIVITY_LOGS,
        PERMISSIONS.MANAGE_SESSIONS,
      ],
    },
    {
      title: 'QR Code',
      permissions: [
        PERMISSIONS.GENERATE_CUSTOMER_QR,
        PERMISSIONS.USE_CUSTOMER_QR,
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <KurdishText variant="title" color="#1F2937">
          {'دەسەڵاتەکانی کارمەند'}
        </KurdishText>
        <KurdishText variant="body" color="#6B7280">
          {employee.name}
        </KurdishText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {permissionGroups.map((group, groupIndex) => (
          <GradientCard key={groupIndex} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                {group.title}
              </KurdishText>
              <View style={styles.groupStats}>
                <KurdishText variant="caption" color="#6B7280">
                  {group.permissions.filter(p => selectedPermissions.includes(p)).length}/{group.permissions.length}
                </KurdishText>
              </View>
            </View>

            {group.permissions.map((permission, permIndex) => (
              <View key={`${groupIndex}-${permission}-${permIndex}`} style={styles.permissionRow}>
                <View style={styles.permissionInfo}>
                  <KurdishText variant="body" color="#1F2937">
                    {PERMISSION_LABELS[permission] || permission}
                  </KurdishText>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.permissionToggle,
                    selectedPermissions.includes(permission) && styles.permissionToggleActive
                  ]}
                  onPress={() => togglePermission(permission)}
                >
                  {selectedPermissions.includes(permission) && (
                    <Check size={16} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </GradientCard>
        ))}

        {/* Quick Actions */}
        <GradientCard style={styles.quickActions}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.quickActionsTitle}>
            {'کردارە خێراکان'}
          </KurdishText>
          
          <View style={styles.quickActionButtons}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.selectAllButton]}
              onPress={() => {
                const allPermissions = Object.values(PERMISSIONS);
                setSelectedPermissions(allPermissions);
              }}
            >
              <KurdishText variant="body" color="white">
                {'هەموو هەڵبژاردن'}
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.clearAllButton]}
              onPress={() => setSelectedPermissions([])}
            >
              <KurdishText variant="body" color="white">
                {'هەموو لابردن'}
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.defaultButton]}
              onPress={() => {
                const defaultPermissions = [
                  PERMISSIONS.VIEW_CUSTOMERS,
                  PERMISSIONS.ADD_CUSTOMER,
                  PERMISSIONS.VIEW_DEBTS,
                  PERMISSIONS.ADD_DEBT,
                  PERMISSIONS.VIEW_PAYMENTS,
                  PERMISSIONS.ADD_PAYMENT,
                ];
                setSelectedPermissions(defaultPermissions);
              }}
            >
              <KurdishText variant="body" color="white">
                {'بنەڕەتی'}
              </KurdishText>
            </TouchableOpacity>
          </View>
        </GradientCard>

        {/* Summary */}
        <GradientCard style={styles.summary}>
          <View style={styles.summaryHeader}>
            <Shield size={24} color="#1E3A8A" />
            <KurdishText variant="subtitle" color="#1F2937">
              {'کورتەی دەسەڵاتەکان'}
            </KurdishText>
          </View>
          
          <KurdishText variant="body" color="#6B7280">
            {'کۆی دەسەڵاتە هەڵبژێردراوەکان: '}{selectedPermissions.length}
          </KurdishText>
          
          <View style={styles.selectedPermissions}>
            {selectedPermissions.slice(0, 5).map((permission, index) => (
              <View key={`permission-${permission}-${index}`} style={styles.permissionTag}>
                <KurdishText variant="caption" color="#1E3A8A">
                  {PERMISSION_LABELS[permission] || permission}
                </KurdishText>
              </View>
            ))}
            {selectedPermissions.length > 5 && (
              <View key="more-permissions" style={styles.permissionTag}>
                <KurdishText variant="caption" color="#6B7280">
                  {'+' + (selectedPermissions.length - 5) + ' زیاتر'}
                </KurdishText>
              </View>
            )}
          </View>
        </GradientCard>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Save size={20} color="white" />
          <KurdishText variant="subtitle" color="white">
            {'پاشکەوتکردن'}
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <X size={20} color="#6B7280" />
          <KurdishText variant="subtitle" color="#6B7280">
            {'پاشگەزبوونەوە'}
          </KurdishText>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: 40,
    margin: 16,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    textAlign: 'center',
  },
  groupCard: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  groupStats: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionToggleActive: {
    backgroundColor: '#10B981',
  },
  quickActions: {
    marginBottom: 16,
  },
  quickActionsTitle: {
    marginBottom: 16,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectAllButton: {
    backgroundColor: '#10B981',
  },
  clearAllButton: {
    backgroundColor: '#EF4444',
  },
  defaultButton: {
    backgroundColor: '#3B82F6',
  },
  summary: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  selectedPermissions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  permissionTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});