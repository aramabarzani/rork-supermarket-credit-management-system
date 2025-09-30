import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Shield,
  Download,
  Share2,
  FileText,
  Users,
  Check,
  X,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS, PERMISSION_LABELS } from '@/constants/permissions';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function PermissionsReportScreen() {
  const { users, customRoles } = useUsers();
  const { hasPermission } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'employee' | 'customer'>('all');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(u => u.role === selectedRole);

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const generateReportText = () => {
    let report = '═══════════════════════════════════\n';
    report += '   ڕاپۆرتی دەسەڵاتەکان\n';
    report += '═══════════════════════════════════\n\n';
    report += `بەروار: ${new Date().toLocaleDateString('ckb-IQ')}\n`;
    report += `کاتژمێر: ${new Date().toLocaleTimeString('ckb-IQ')}\n\n`;

    report += '───────────────────────────────────\n';
    report += '  کورتەی گشتی\n';
    report += '───────────────────────────────────\n';
    report += `کۆی بەکارهێنەران: ${users.length}\n`;
    report += `بەڕێوەبەران: ${users.filter(u => u.role === 'admin').length}\n`;
    report += `کارمەندان: ${users.filter(u => u.role === 'employee').length}\n`;
    report += `کڕیاران: ${users.filter(u => u.role === 'customer').length}\n`;
    report += `ڕۆڵە تایبەتیەکان: ${customRoles.length}\n\n`;

    filteredUsers.forEach((user, index) => {
      report += '═══════════════════════════════════\n';
      report += `${index + 1}. ${user.name}\n`;
      report += '───────────────────────────────────\n';
      report += `ژمارەی مۆبایل: ${user.phone}\n`;
      report += `ڕۆڵ: ${user.role === 'admin' ? 'بەڕێوەبەر' : user.role === 'employee' ? 'کارمەند' : 'کڕیار'}\n`;
      report += `دۆخ: ${user.isActive ? 'چالاک' : 'ناچالاک'}\n`;
      report += `ژمارەی دەسەڵات: ${user.permissions?.length || 0}\n\n`;

      if (user.permissions && user.permissions.length > 0) {
        report += 'دەسەڵاتەکان:\n';
        user.permissions.forEach((perm, i) => {
          report += `  ${i + 1}. ${PERMISSION_LABELS[perm.code] || perm.code}\n`;
        });
      } else {
        report += 'دەسەڵات: هیچ\n';
      }
      report += '\n';
    });

    if (customRoles.length > 0) {
      report += '═══════════════════════════════════\n';
      report += '  ڕۆڵە تایبەتیەکان\n';
      report += '═══════════════════════════════════\n\n';

      customRoles.forEach((role, index) => {
        report += `${index + 1}. ${role.name}\n`;
        report += `   وەسف: ${role.description || 'هیچ'}\n`;
        report += `   ژمارەی دەسەڵات: ${role.permissions.length}\n`;
        report += `   جۆر: ${role.isSystem ? 'سیستەم' : 'تایبەتی'}\n\n`;
      });
    }

    report += '═══════════════════════════════════\n';
    report += '  کۆتایی ڕاپۆرت\n';
    report += '═══════════════════════════════════\n';

    return report;
  };

  const handleExportPDF = async () => {
    try {
      const reportText = generateReportText();
      const fileName = `permissions-report-${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, reportText, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'ڕاپۆرتی دەسەڵاتەکان',
        });
      } else {
        Alert.alert('سەرکەوتوو', `ڕاپۆرت هەڵگیرا لە: ${fileUri}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('هەڵە', 'هەڵەیەک ڕوویدا لە دەرهێنانی ڕاپۆرت');
    }
  };

  const handleShare = async () => {
    try {
      const reportText = generateReportText();
      await Share.share({
        message: reportText,
        title: 'ڕاپۆرتی دەسەڵاتەکان',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (!hasPermission(PERMISSIONS.VIEW_PERMISSIONS_REPORT) && !hasPermission(PERMISSIONS.MANAGE_PERMISSIONS)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.noPermissionContainer}>
          <Shield size={64} color="#EF4444" />
          <KurdishText variant="title" color="#EF4444" style={styles.noPermissionTitle}>
            {'دەسەڵات نییە'}
          </KurdishText>
          <KurdishText variant="body" color="#6B7280" style={styles.noPermissionText}>
            {'تۆ دەسەڵاتی بینینی ڕاپۆرتی دەسەڵاتەکانت نییە'}
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <KurdishText variant="title" color="#1F2937">
          {'ڕاپۆرتی دەسەڵاتەکان'}
        </KurdishText>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Share2 size={20} color="#1E3A8A" />
          </TouchableOpacity>
          {hasPermission(PERMISSIONS.EXPORT_PERMISSIONS_REPORT) && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleExportPDF}
            >
              <Download size={20} color="#1E3A8A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <GradientCard colors={['#1E3A8A', '#3B82F6']} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <FileText size={32} color="white" />
            <KurdishText variant="subtitle" color="white">
              {'کورتەی گشتی'}
            </KurdishText>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <KurdishText variant="title" color="white">
                {users.length}
              </KurdishText>
              <KurdishText variant="caption" color="rgba(255,255,255,0.9)">
                {'کۆی بەکارهێنەران'}
              </KurdishText>
            </View>

            <View style={styles.summaryItem}>
              <KurdishText variant="title" color="white">
                {users.filter(u => u.role === 'admin').length}
              </KurdishText>
              <KurdishText variant="caption" color="rgba(255,255,255,0.9)">
                {'بەڕێوەبەران'}
              </KurdishText>
            </View>

            <View style={styles.summaryItem}>
              <KurdishText variant="title" color="white">
                {users.filter(u => u.role === 'employee').length}
              </KurdishText>
              <KurdishText variant="caption" color="rgba(255,255,255,0.9)">
                {'کارمەندان'}
              </KurdishText>
            </View>

            <View style={styles.summaryItem}>
              <KurdishText variant="title" color="white">
                {users.filter(u => u.role === 'customer').length}
              </KurdishText>
              <KurdishText variant="caption" color="rgba(255,255,255,0.9)">
                {'کڕیاران'}
              </KurdishText>
            </View>
          </View>
        </GradientCard>

        <View style={styles.filterSection}>
          <KurdishText variant="body" color="#1F2937" style={styles.filterLabel}>
            {'فلتەر بە ڕۆڵ'}
          </KurdishText>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, selectedRole === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedRole('all')}
            >
              <KurdishText 
                variant="caption" 
                color={selectedRole === 'all' ? 'white' : '#6B7280'}
              >
                {'هەموو'}
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedRole === 'admin' && styles.filterButtonActive]}
              onPress={() => setSelectedRole('admin')}
            >
              <KurdishText 
                variant="caption" 
                color={selectedRole === 'admin' ? 'white' : '#6B7280'}
              >
                {'بەڕێوەبەر'}
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedRole === 'employee' && styles.filterButtonActive]}
              onPress={() => setSelectedRole('employee')}
            >
              <KurdishText 
                variant="caption" 
                color={selectedRole === 'employee' ? 'white' : '#6B7280'}
              >
                {'کارمەند'}
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedRole === 'customer' && styles.filterButtonActive]}
              onPress={() => setSelectedRole('customer')}
            >
              <KurdishText 
                variant="caption" 
                color={selectedRole === 'customer' ? 'white' : '#6B7280'}
              >
                {'کڕیار'}
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>

        {filteredUsers.length === 0 ? (
          <GradientCard style={styles.emptyState}>
            <Users size={48} color="#9CA3AF" />
            <KurdishText variant="subtitle" color="#6B7280" style={styles.emptyTitle}>
              {'هیچ بەکارهێنەرێک نەدۆزرایەوە'}
            </KurdishText>
          </GradientCard>
        ) : (
          filteredUsers.map((user) => (
            <GradientCard key={user.id} style={styles.userCard}>
              <TouchableOpacity
                style={styles.userHeader}
                onPress={() => toggleUserExpanded(user.id)}
              >
                <View style={styles.userInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {user.name}
                  </KurdishText>
                  <View style={styles.userMeta}>
                    <View style={[styles.roleBadge, getRoleBadgeStyle(user.role)]}>
                      <KurdishText variant="caption" color="white">
                        {getRoleLabel(user.role)}
                      </KurdishText>
                    </View>
                    <View style={styles.permissionCount}>
                      <Shield size={14} color="#3B82F6" />
                      <KurdishText variant="caption" color="#3B82F6">
                        {user.permissions?.length || 0} {'دەسەڵات'}
                      </KurdishText>
                    </View>
                  </View>
                </View>

                <View style={[
                  styles.statusBadge,
                  user.isActive ? styles.statusActive : styles.statusInactive
                ]}>
                  <KurdishText variant="caption" color="white">
                    {user.isActive ? 'چالاک' : 'ناچالاک'}
                  </KurdishText>
                </View>
              </TouchableOpacity>

              {expandedUsers.has(user.id) && (
                <View style={styles.permissionsDetail}>
                  <View style={styles.detailHeader}>
                    <KurdishText variant="body" color="#1F2937">
                      {'دەسەڵاتەکان'}
                    </KurdishText>
                  </View>

                  {user.permissions && user.permissions.length > 0 ? (
                    <View style={styles.permissionsList}>
                      {user.permissions.map((perm) => (
                        <View key={perm.id} style={styles.permissionItem}>
                          <Check size={16} color="#10B981" />
                          <KurdishText variant="caption" color="#1F2937">
                            {PERMISSION_LABELS[perm.code] || perm.code}
                          </KurdishText>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noPermissions}>
                      <X size={16} color="#EF4444" />
                      <KurdishText variant="caption" color="#6B7280">
                        {'هیچ دەسەڵاتێک نییە'}
                      </KurdishText>
                    </View>
                  )}
                </View>
              )}
            </GradientCard>
          ))
        )}

        {customRoles.length > 0 && (
          <View style={styles.rolesSection}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              {'ڕۆڵە تایبەتیەکان'}
            </KurdishText>

            {customRoles.map((role) => (
              <GradientCard key={role.id} style={styles.roleCard}>
                <View style={styles.roleHeader}>
                  <View style={styles.roleInfo}>
                    <KurdishText variant="body" color="#1F2937">
                      {role.name}
                    </KurdishText>
                    {role.description && (
                      <KurdishText variant="caption" color="#6B7280">
                        {role.description}
                      </KurdishText>
                    )}
                  </View>
                  <View style={styles.roleStats}>
                    <Shield size={14} color="#8B5CF6" />
                    <KurdishText variant="caption" color="#8B5CF6">
                      {role.permissions.length} {'دەسەڵات'}
                    </KurdishText>
                  </View>
                </View>
              </GradientCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'بەڕێوەبەر';
    case 'employee': return 'کارمەند';
    case 'customer': return 'کڕیار';
    default: return role;
  }
}

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case 'admin': return { backgroundColor: '#8B5CF6' };
    case 'employee': return { backgroundColor: '#3B82F6' };
    case 'customer': return { backgroundColor: '#10B981' };
    default: return { backgroundColor: '#6B7280' };
  }
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
  },
  userCard: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  permissionCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#3B82F6' + '20',
    borderRadius: 8,
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
  permissionsDetail: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailHeader: {
    marginBottom: 12,
  },
  permissionsList: {
    gap: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  noPermissions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  rolesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  roleCard: {
    marginBottom: 12,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleInfo: {
    flex: 1,
  },
  roleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#8B5CF6' + '20',
    borderRadius: 8,
  },
});
