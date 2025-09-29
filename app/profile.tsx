import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User,
  Phone,
  Lock,
  Save,
  Shield,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useAuth } from '@/hooks/auth-context';
import { useUsers } from '@/hooks/users-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { updateUser } = useUsers();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    if (!name.trim() || !phone.trim()) {
      Alert.alert('تێبینی', 'تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    setIsLoading(true);
    try {
      await updateUser(user.id, {
        name: name.trim(),
        phone: phone.trim(),
      });
      
      Alert.alert('سەرکەوتوو', 'زانیاریەکانت بە سەرکەوتوویی نوێکرانەوە');
    } catch (error) {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە نوێکردنەوەی زانیاریەکان');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('تێبینی', 'تکایە هەموو خانەکانی وشەی نهێنی پڕ بکەرەوە');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('هەڵە', 'وشەی نهێنی نوێ و دووبارەکردنەوەکەی یەکسان نین');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('هەڵە', 'وشەی نهێنی نوێ دەبێت لانیکەم ٦ پیت بێت');
      return;
    }

    // For demo purposes, we'll assume current password is correct
    // In production, you'd verify the current password
    setIsLoading(true);
    try {
      await updateUser(user.id, {
        password: newPassword,
      });
      
      Alert.alert('سەرکەوتوو', 'وشەی نهێنی بە سەرکەوتوویی گۆڕدرا');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە گۆڕینی وشەی نهێنی');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'بەڕێوەبەر';
      case 'employee':
        return 'کارمەند';
      case 'customer':
        return 'کڕیار';
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <KurdishText variant="title" color="#EF4444">
            هەڵە
          </KurdishText>
          <KurdishText variant="body" color="#6B7280">
            زانیاری بەکارهێنەر نەدۆزرایەوە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* User Info */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            {'زانیاری هەژمار'}
          </KurdishText>
          
          <GradientCard style={styles.card}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <User size={32} color="#1E3A8A" />
              </View>
              <View style={styles.userInfo}>
                <KurdishText variant="title" color="#1F2937">
                  {user.name}
                </KurdishText>
                <View style={styles.roleContainer}>
                  <Shield size={16} color="#10B981" />
                  <KurdishText variant="caption" color="#10B981">
                    {getRoleLabel(user.role)}
                  </KurdishText>
                </View>
              </View>
            </View>
          </GradientCard>
        </View>

        {/* Profile Update */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            نوێکردنەوەی زانیاری
          </KurdishText>
          
          <GradientCard style={styles.card}>
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

            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              <Save size={20} color="white" />
              <KurdishText variant="body" color="white">
                نوێکردنەوەی زانیاری
              </KurdishText>
            </TouchableOpacity>
          </GradientCard>
        </View>

        {/* Password Change */}
        {user.role !== 'customer' && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              گۆڕینی وشەی نهێنی
            </KurdishText>
            
            <GradientCard style={styles.card}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Lock size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    وشەی نهێنی ئێستا
                  </KurdishText>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="وشەی نهێنی ئێستا"
                  placeholderTextColor="#9CA3AF"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Lock size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    وشەی نهێنی نوێ
                  </KurdishText>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="وشەی نهێنی نوێ"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Lock size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    دووبارەکردنەوەی وشەی نهێنی
                  </KurdishText>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="دووبارەکردنەوەی وشەی نهێنی نوێ"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.passwordButton]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <Lock size={20} color="white" />
                <KurdishText variant="body" color="white">
                  گۆڕینی وشەی نهێنی
                </KurdishText>
              </TouchableOpacity>
            </GradientCard>
          </View>
        )}

        {/* Account Info */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            {'زانیاری هەژمار'}
          </KurdishText>
          
          <GradientCard style={styles.card}>
            <View style={styles.infoRow}>
              <KurdishText variant="caption" color="#6B7280">
                بەرواری دروستکردن
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {new Date(user.createdAt).toLocaleDateString('ckb-IQ')}
              </KurdishText>
            </View>
            <View style={styles.infoRow}>
              <KurdishText variant="caption" color="#6B7280">
                دۆخی هەژمار
              </KurdishText>
              <View style={[
                styles.statusBadge,
                user.isActive ? styles.statusActive : styles.statusInactive
              ]}>
                <KurdishText variant="caption" color="white">
                  {user.isActive ? 'چالاک' : 'ناچالاک'}
                </KurdishText>
              </View>
            </View>
            {user.role === 'employee' && (
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <KurdishText variant="caption" color="#6B7280">
                  ژمارەی دەسەڵاتەکان
                </KurdishText>
                <KurdishText variant="body" color="#1F2937">
                  {user.permissions?.length || 0}
                </KurdishText>
              </View>
            )}
          </GradientCard>
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
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: '#10B981',
  },
  passwordButton: {
    backgroundColor: '#F59E0B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
});