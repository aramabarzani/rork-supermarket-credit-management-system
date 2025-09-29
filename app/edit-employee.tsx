import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  User, 
  Phone, 
  Lock, 
  Shield, 
  Star,
  Clock,
  Activity,
  Save,
  X,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { User as UserType } from '@/types/auth';

export default function EditEmployeeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    users, 
    updateUser, 
    setStarEmployee, 
    toggleUserStatus,
    lockUserAccount,
    getEmployeeStats,
    getEmployeeSchedule,
    setEmployeeSchedule,
  } = useUsers();
  const { hasPermission } = useAuth();
  
  const employee = users.find(u => u.id === id && u.role === 'employee');
  const stats = getEmployeeStats(id || '');
  const schedule = getEmployeeSchedule(id || '');
  
  const [name, setName] = useState(employee?.name || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(employee?.isActive || false);
  const [isStarEmployee, setIsStarEmployee] = useState(employee?.isStarEmployee || false);
  const [canReceivePayments, setCanReceivePayments] = useState(schedule.canReceivePayments);
  const [canAddDebts, setCanAddDebts] = useState(schedule.canAddDebts);
  const [lockDuration, setLockDuration] = useState('60');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setPhone(employee.phone);
      setIsActive(employee.isActive);
      setIsStarEmployee(employee.isStarEmployee || false);
    }
  }, [employee]);

  if (!employee) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientCard style={styles.errorCard}>
          <KurdishText variant="title" color="#EF4444">
            کارمەند نەدۆزرایەوە
          </KurdishText>
        </GradientCard>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!hasPermission(PERMISSIONS.EDIT_EMPLOYEE)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی دەستکاری کارمەندت نییە');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      Alert.alert('تێبینی', 'تکایە ناو و ژمارەی مۆبایل پڕ بکەرەوە');
      return;
    }

    const updates: Partial<UserType> = {
      name: name.trim(),
      phone: phone.trim(),
      isActive,
      isStarEmployee,
    };

    if (password.trim()) {
      updates.password = password.trim();
    }

    await updateUser(employee.id, updates);
    await setStarEmployee(employee.id, isStarEmployee);
    await setEmployeeSchedule(employee.id, {
      canReceivePayments,
      canAddDebts,
    });

    Alert.alert('سەرکەوتوو', 'زانیاری کارمەند بە سەرکەوتوویی نوێکرایەوە');
    router.back();
  };

  const handleToggleStatus = async () => {
    if (!hasPermission(PERMISSIONS.EDIT_EMPLOYEE)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی دەستکاری کارمەندت نییە');
      return;
    }

    const newStatus = !isActive;
    setIsActive(newStatus);
    await toggleUserStatus(employee.id, newStatus);
    
    Alert.alert(
      'سەرکەوتوو', 
      newStatus ? 'هەژماری کارمەند چالاک کرا' : 'هەژماری کارمەند ناچالاک کرا'
    );
  };

  const handleLockAccount = async () => {
    if (!hasPermission(PERMISSIONS.EDIT_EMPLOYEE)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی دەستکاری کارمەندت نییە');
      return;
    }

    const duration = parseInt(lockDuration);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('تێبینی', 'تکایە ماوەیەکی دروست بنووسە');
      return;
    }

    Alert.alert(
      'قوڵفکردنی هەژمار',
      `ئایا دڵنیایت لە قوڵفکردنی هەژماری ${employee.name} بۆ ${duration} خولەک؟`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'قوڵفکردن',
          style: 'destructive',
          onPress: async () => {
            await lockUserAccount(employee.id, duration);
            Alert.alert('سەرکەوتوو', `هەژماری کارمەند بۆ ${duration} خولەک قوڵف کرا`);
          },
        },
      ]
    );
  };

  const handleManagePermissions = () => {
    router.push(`/employee-permissions?id=${employee.id}`);
  };

  const handleViewActivity = () => {
    router.push(`/employee-activity?id=${employee.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Employee Stats */}
          <GradientCard style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <KurdishText variant="subtitle" color="#1F2937">
                ئامارەکانی کارمەند
              </KurdishText>
              {isStarEmployee && (
                <View style={styles.starBadge}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <KurdishText variant="caption" color="#F59E0B">
                    کارمەندی نموونەیی
                  </KurdishText>
                </View>
              )}
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <KurdishText variant="caption" color="#6B7280">
                  کۆی قەرزەکان
                </KurdishText>
                <KurdishText variant="body" color="#1F2937">
                  {stats.totalDebts}
                </KurdishText>
              </View>
              <View style={styles.statItem}>
                <KurdishText variant="caption" color="#6B7280">
                  کۆی پارەدانەکان
                </KurdishText>
                <KurdishText variant="body" color="#1F2937">
                  {stats.totalPayments}
                </KurdishText>
              </View>
              <View style={styles.statItem}>
                <KurdishText variant="caption" color="#6B7280">
                  نرخەی کارکردن
                </KurdishText>
                <KurdishText variant="body" color="#1F2937">
                  {stats.rating}/5
                </KurdishText>
              </View>
            </View>
          </GradientCard>

          {/* Basic Information */}
          <GradientCard style={styles.form}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              زانیاری بنەڕەتی
            </KurdishText>

            {/* Name */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <User size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  ناوی تەواو
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

            {/* Phone */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Phone size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  ژمارەی مۆبایل
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Lock size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  وشەی نهێنی نوێ (بەتاڵ بهێڵەرەوە بۆ نەگۆڕین)
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="وشەی نهێنی نوێ"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign="right"
              />
            </View>
          </GradientCard>

          {/* Status & Settings */}
          <GradientCard style={styles.form}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              ڕێکخستنەکان
            </KurdishText>

            {/* Active Status */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Activity size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  هەژماری چالاک
                </KurdishText>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={isActive ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            {/* Star Employee */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Star size={20} color="#F59E0B" />
                <KurdishText variant="body" color="#1F2937">
                  کارمەندی نموونەیی
                </KurdishText>
              </View>
              <Switch
                value={isStarEmployee}
                onValueChange={setIsStarEmployee}
                trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                thumbColor={isStarEmployee ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            {/* Work Permissions */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Clock size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  دەسەڵاتی وەرگرتنی پارەدان
                </KurdishText>
              </View>
              <Switch
                value={canReceivePayments}
                onValueChange={setCanReceivePayments}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={canReceivePayments ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Clock size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  دەسەڵاتی زیادکردنی قەرز
                </KurdishText>
              </View>
              <Switch
                value={canAddDebts}
                onValueChange={setCanAddDebts}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={canAddDebts ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </GradientCard>

          {/* Lock Account */}
          <GradientCard style={styles.form}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              قوڵفکردنی هەژمار
            </KurdishText>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Lock size={20} color="#EF4444" />
                <KurdishText variant="body" color="#1F2937">
                  ماوەی قوڵفکردن (خولەک)
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="60"
                placeholderTextColor="#9CA3AF"
                value={lockDuration}
                onChangeText={setLockDuration}
                keyboardType="numeric"
                textAlign="right"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.lockButton]}
              onPress={handleLockAccount}
            >
              <Lock size={20} color="white" />
              <KurdishText variant="body" color="white">
                قوڵفکردنی هەژمار
              </KurdishText>
            </TouchableOpacity>
          </GradientCard>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.permissionsButton]}
              onPress={handleManagePermissions}
            >
              <Shield size={20} color="white" />
              <KurdishText variant="body" color="white">
                بەڕێوەبردنی دەسەڵاتەکان
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.activityButton]}
              onPress={handleViewActivity}
            >
              <Activity size={20} color="white" />
              <KurdishText variant="body" color="white">
                بینینی چالاکیەکان
              </KurdishText>
            </TouchableOpacity>
          </View>

          {/* Save/Cancel */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Save size={20} color="white" />
              <KurdishText variant="subtitle" color="white">
                پاشکەوتکردن
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <X size={20} color="#6B7280" />
              <KurdishText variant="subtitle" color="#6B7280">
                پاشگەزبوونەوە
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  form: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actions: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lockButton: {
    backgroundColor: '#EF4444',
    marginTop: 12,
  },
  permissionsButton: {
    backgroundColor: '#10B981',
    flex: 1,
  },
  activityButton: {
    backgroundColor: '#3B82F6',
    flex: 1,
  },
});