import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  Shield,
  Check,
  X,
  Users,
  Settings,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS, PERMISSION_LABELS } from '@/constants/permissions';

export default function PermissionsScreen() {
  const { getEmployees, updatePermissions } = useUsers();
  const { hasPermission } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  const employees = getEmployees();
  const currentEmployee = employees.find(emp => emp.id === selectedEmployee);

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
      title: 'ڕاپۆرتەکان',
      permissions: [
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
      ],
      color: '#8B5CF6',
    },
  ];

  const hasEmployeePermission = (permission: string): boolean => {
    if (!currentEmployee) return false;
    return currentEmployee.permissions?.some(p => p.code === permission) || false;
  };

  const togglePermission = async (permission: string) => {
    if (!currentEmployee || !hasPermission(PERMISSIONS.MANAGE_PERMISSIONS)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی بەڕێوەبردنی دەسەڵاتەکانت نییە');
      return;
    }

    const currentPermissions = currentEmployee.permissions?.map(p => p.code) || [];
    const newPermissions = hasEmployeePermission(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];

    await updatePermissions(currentEmployee.id, newPermissions);
    Alert.alert('سەرکەوتوو', 'دەسەڵاتەکان بە سەرکەوتوویی نوێکرانەوە');
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
            تۆ دەسەڵاتی بەڕێوەبردنی دەسەڵاتەکانت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <KurdishText variant="title" color="#1F2937">
          بەڕێوەبردنی دەسەڵاتەکان
        </KurdishText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Employee Selection */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            هەڵبژاردنی کارمەند
          </KurdishText>
          
          {employees.length === 0 ? (
            <GradientCard style={styles.emptyState}>
              <Users size={48} color="#9CA3AF" />
              <KurdishText variant="subtitle" color="#6B7280">
                هیچ کارمەندێک نییە
              </KurdishText>
              <KurdishText variant="caption" color="#9CA3AF">
                سەرەتا کارمەند زیاد بکە
              </KurdishText>
            </GradientCard>
          ) : (
            <View style={styles.employeeGrid}>
              {employees.map((employee) => (
                <TouchableOpacity
                  key={employee.id}
                  style={[
                    styles.employeeCard,
                    selectedEmployee === employee.id && styles.employeeCardSelected,
                  ]}
                  onPress={() => setSelectedEmployee(employee.id)}
                >
                  <GradientCard 
                    colors={selectedEmployee === employee.id ? ['#1E3A8A', '#3B82F6'] : undefined}
                  >
                    <View style={styles.employeeCardContent}>
                      <KurdishText 
                        variant="body" 
                        color={selectedEmployee === employee.id ? 'white' : '#1F2937'}
                      >
                        {employee.name}
                      </KurdishText>
                      <KurdishText 
                        variant="caption" 
                        color={selectedEmployee === employee.id ? 'rgba(255,255,255,0.8)' : '#6B7280'}
                      >
                        {employee.permissions?.length || 0} دەسەڵات
                      </KurdishText>
                    </View>
                  </GradientCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Permissions Management */}
        {currentEmployee && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              دەسەڵاتەکانی {currentEmployee.name}
            </KurdishText>

            {permissionCategories.map((category) => (
              <GradientCard key={category.title} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Settings size={20} color={category.color} />
                  </View>
                  <KurdishText variant="body" color="#1F2937">
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
                      <View style={styles.permissionInfo}>
                        <KurdishText variant="body" color="#1F2937">
                          {PERMISSION_LABELS[permission]}
                        </KurdishText>
                      </View>
                      
                      <View style={[
                        styles.permissionToggle,
                        hasEmployeePermission(permission) 
                          ? styles.permissionToggleActive 
                          : styles.permissionToggleInactive
                      ]}>
                        {hasEmployeePermission(permission) ? (
                          <Check size={16} color="white" />
                        ) : (
                          <X size={16} color="#9CA3AF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </GradientCard>
            ))}
          </View>
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  employeeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  employeeCard: {
    width: '48%',
  },
  employeeCardSelected: {
    // Additional styling handled by GradientCard colors
  },
  employeeCardContent: {
    alignItems: 'center',
    gap: 4,
  },
  categoryCard: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionsList: {
    gap: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionToggleActive: {
    backgroundColor: '#10B981',
  },
  permissionToggleInactive: {
    backgroundColor: '#E5E7EB',
  },
});