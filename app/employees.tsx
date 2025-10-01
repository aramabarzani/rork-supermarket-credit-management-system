import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Shield,
  Phone,
  Calendar,
  QrCode,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

export default function EmployeesScreen() {
  const router = useRouter();
  const { getEmployees, deleteUser } = useUsers();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const employees = getEmployees();
  
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.phone.includes(searchQuery)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  const handleDeleteEmployee = (employee: any) => {
    Alert.alert(
      'سڕینەوەی کارمەند',
      `ئایا دڵنیایت لە سڕینەوەی ${employee.name}؟`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: async () => {
            await deleteUser(employee.id);
            Alert.alert('سەرکەوتوو', 'کارمەند بە سەرکەوتوویی سڕایەوە');
          },
        },
      ]
    );
  };

  const handleEditEmployee = (employee: any) => {
    router.push(`/edit-employee?id=${employee.id}`);
  };

  const handleManagePermissions = (employee: any) => {
    router.push(`/employee-permissions?id=${employee.id}`);
  };

  const handleQRManagement = () => {
    router.push('/customer-qr-management');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <KurdishText variant="title" color="#1F2937">
            {'بەڕێوەبردنی کارمەندەکان'}
          </KurdishText>
          <View style={styles.headerButtons}>
            {(hasPermission(PERMISSIONS.GENERATE_CUSTOMER_QR) || hasPermission(PERMISSIONS.USE_CUSTOMER_QR)) && (
              <TouchableOpacity
                style={styles.qrButton}
                onPress={handleQRManagement}
              >
                <QrCode size={24} color="white" />
              </TouchableOpacity>
            )}
            {hasPermission(PERMISSIONS.ADD_EMPLOYEE) && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/add-user')}
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو یان ژمارەی مۆبایل"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredEmployees.length === 0 ? (
          <GradientCard style={styles.emptyState}>
            <Users size={48} color="#9CA3AF" />
            <KurdishText variant="subtitle" color="#6B7280" style={styles.emptyTitle}>
              {'هیچ کارمەندێک نەدۆزرایەوە'}
            </KurdishText>
            <KurdishText variant="caption" color="#9CA3AF" style={styles.emptySubtitle}>
              {searchQuery ? 'گەڕانەکەت هیچ ئەنجامێکی نەداوە' : 'هێشتا هیچ کارمەندێک زیاد نەکراوە'}
            </KurdishText>
          </GradientCard>
        ) : (
          filteredEmployees.map((employee) => (
            <GradientCard key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeHeader}>
                <View style={styles.employeeInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {employee.name}
                  </KurdishText>
                  <View style={styles.employeeDetails}>
                    <View style={styles.detailRow}>
                      <Phone size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280">
                        {employee.phone}
                      </KurdishText>
                    </View>
                    <View style={styles.detailRow}>
                      <Calendar size={14} color="#6B7280" />
                      <KurdishText variant="caption" color="#6B7280">
                        {formatDate(employee.createdAt)}
                      </KurdishText>
                    </View>
                  </View>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  employee.isActive ? styles.statusActive : styles.statusInactive
                ]}>
                  <KurdishText variant="caption" color="white">
                    {employee.isActive ? 'چالاک' : 'ناچالاک'}
                  </KurdishText>
                </View>
              </View>

              <View style={styles.permissionsInfo}>
                <KurdishText variant="caption" color="#6B7280">
                  {'دەسەڵاتەکان: '}{employee.permissions?.length || 0}
                </KurdishText>
              </View>

              <View style={styles.employeeActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.permissionsButton]}
                  onPress={() => handleManagePermissions(employee)}
                >
                  <Shield size={16} color="#10B981" />
                  <KurdishText variant="caption" color="#10B981">
                    {'دەسەڵاتەکان'}
                  </KurdishText>
                </TouchableOpacity>

                {hasPermission(PERMISSIONS.EDIT_EMPLOYEE) && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditEmployee(employee)}
                  >
                    <Edit3 size={16} color="#3B82F6" />
                    <KurdishText variant="caption" color="#3B82F6">
                      {'دەستکاری'}
                    </KurdishText>
                  </TouchableOpacity>
                )}

                {hasPermission(PERMISSIONS.DELETE_EMPLOYEE) && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteEmployee(employee)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <KurdishText variant="caption" color="#EF4444">
                      {'سڕینەوە'}
                    </KurdishText>
                  </TouchableOpacity>
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
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
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  employeeCard: {
    marginBottom: 16,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeDetails: {
    marginTop: 8,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  permissionsInfo: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  employeeActions: {
    flexDirection: 'row',
    gap: 8,
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
  permissionsButton: {
    backgroundColor: '#10B981' + '20',
  },
  editButton: {
    backgroundColor: '#3B82F6' + '20',
  },
  deleteButton: {
    backgroundColor: '#EF4444' + '20',
  },
});