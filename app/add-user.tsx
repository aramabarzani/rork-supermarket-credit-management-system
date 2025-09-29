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
import { User, Phone, Lock, Shield, MapPin, CreditCard, Mail, Users } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { CUSTOMER_GROUPS, CustomerGroupId } from '@/constants/customer-groups';

export default function AddUserScreen() {
  const router = useRouter();
  const { addUser } = useUsers();
  const { hasPermission, user } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'employee'>('customer');
  const [address, setAddress] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [customerGroup, setCustomerGroup] = useState<CustomerGroupId>('regular');

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async () => {
    if (role === 'customer' && !hasPermission(PERMISSIONS.ADD_CUSTOMER)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی زیادکردنی کڕیارت نییە');
      return;
    }

    if (role === 'employee' && !hasPermission(PERMISSIONS.ADD_EMPLOYEE)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی زیادکردنی کارمەندت نییە');
      return;
    }

    if (!name || !phone || (role === 'employee' && !password)) {
      Alert.alert('تێبینی', 'تکایە هەموو خانە پێویستەکان پڕ بکەرەوە');
      return;
    }

    await addUser({
      name,
      phone,
      password: role === 'employee' ? password : undefined,
      role,
      isActive: true,
      address: role === 'customer' ? address : undefined,
      nationalId: role === 'customer' ? nationalId : undefined,
      email: role === 'customer' ? email : undefined,
      customerGroup: role === 'customer' ? customerGroup : undefined,
    });

    Alert.alert(
      'سەرکەوتوو', 
      role === 'customer' ? 'کڕیار بە سەرکەوتوویی زیادکرا' : 'کارمەند بە سەرکەوتوویی زیادکرا'
    );
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <GradientCard style={styles.form}>
            {/* Role Selection */}
            {isAdmin && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Shield size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    جۆری بەکارهێنەر
                  </KurdishText>
                </View>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'customer' && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole('customer')}
                  >
                    <KurdishText 
                      variant="body" 
                      color={role === 'customer' ? 'white' : '#6B7280'}
                    >
                      کڕیار
                    </KurdishText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'employee' && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole('employee')}
                  >
                    <KurdishText 
                      variant="body" 
                      color={role === 'employee' ? 'white' : '#6B7280'}
                    >
                      کارمەند
                    </KurdishText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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

            {/* Address (for customers only) */}
            {role === 'customer' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MapPin size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    ناونیشان
                  </KurdishText>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="ناونیشانی تەواو بنووسە"
                  placeholderTextColor="#9CA3AF"
                  value={address}
                  onChangeText={setAddress}
                  textAlign="right"
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}

            {/* National ID (for customers only) */}
            {role === 'customer' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <CreditCard size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    ژمارەی ناسنامە
                  </KurdishText>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="ژمارەی ناسنامە بنووسە"
                  placeholderTextColor="#9CA3AF"
                  value={nationalId}
                  onChangeText={setNationalId}
                  textAlign="right"
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Email (for customers only) */}
            {role === 'customer' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Mail size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    ئیمەیڵ
                  </KurdishText>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>
            )}

            {/* Customer Group (for customers only) */}
            {role === 'customer' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Users size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    گروپی کڕیار
                  </KurdishText>
                </View>
                <View style={styles.groupSelector}>
                  {CUSTOMER_GROUPS.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.groupButton,
                        customerGroup === group.id && {
                          backgroundColor: group.color,
                          borderColor: group.color,
                        },
                      ]}
                      onPress={() => setCustomerGroup(group.id)}
                    >
                      <KurdishText 
                        variant="caption" 
                        color={customerGroup === group.id ? 'white' : '#6B7280'}
                      >
                        {group.name}
                      </KurdishText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Password (for employees only) */}
            {role === 'employee' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Lock size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1F2937">
                    وشەی نهێنی
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
            )}
          </GradientCard>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <KurdishText variant="subtitle" color="white">
                زیادکردن
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
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
  form: {
    marginBottom: 20,
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
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  groupSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actions: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});