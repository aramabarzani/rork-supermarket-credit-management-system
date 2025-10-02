import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, Phone, Lock, Store, Crown, Shield, Users, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';

type RoleType = 'owner' | 'admin' | 'employee' | 'customer' | null;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setPhone('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ phone, password });
      
      if (result.success && result.user) {
        console.log('Login successful, user role:', result.user.role);
        if (result.user.role === 'owner') {
          router.replace('/owner-dashboard');
        } else if (result.user.role === 'customer') {
          router.replace('/customer-dashboard');
        } else {
          router.replace('/(tabs)/dashboard');
        }
      } else {
        Alert.alert('هەڵە', result.error || 'چوونەژوورەوە سەرکەوتوو نەبوو');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('هەڵە', 'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleInfo = (role: RoleType) => {
    switch (role) {
      case 'owner':
        return {
          icon: Crown,
          title: 'خاوەندار',
          subtitle: 'دەسەڵاتی تەواو',
          color: '#7C3AED' as const,
          gradient: ['#7C3AED', '#A78BFA'] as const,
          demo: { phone: '07700000000', password: 'owner123' },
        };
      case 'admin':
        return {
          icon: Shield,
          title: 'بەڕێوەبەر',
          subtitle: 'بەڕێوەبردنی سیستەم',
          color: '#DC2626' as const,
          gradient: ['#DC2626', '#EF4444'] as const,
          demo: { phone: '07501234567', password: 'admin123' },
        };
      case 'employee':
        return {
          icon: Users,
          title: 'کارمەند',
          subtitle: 'کارکردن لە سیستەم',
          color: '#059669' as const,
          gradient: ['#059669', '#10B981'] as const,
          demo: { phone: '07509876543', password: 'employee123' },
        };
      case 'customer':
        return {
          icon: UserIcon,
          title: 'کڕیار',
          subtitle: 'بینینی قەرزەکان',
          color: '#2563EB' as const,
          gradient: ['#2563EB', '#3B82F6'] as const,
          demo: { phone: '07701234567', password: 'customer123' },
        };
      default:
        return null;
    }
  };

  const fillDemoCredentials = () => {
    const roleInfo = getRoleInfo(selectedRole);
    if (roleInfo?.demo) {
      setPhone(roleInfo.demo.phone);
      setPassword(roleInfo.demo.password);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedRole) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#334155']}
          style={styles.gradient}
        >
          <Animated.View style={[styles.roleSelectionContainer, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <LogIn size={72} color="#FFFFFF" strokeWidth={1.5} />
              <Text style={styles.title}>
                سیستەمی بەڕێوەبردنی قەرز
              </Text>
              <Text style={styles.subtitle}>
                بۆ سوپەرمارکێتەکان
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roleScrollContent}
              style={styles.roleScroll}
            >
              <TouchableOpacity
                style={styles.roleCardHorizontal}
                onPress={() => handleRoleSelect('owner')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7C3AED', '#A78BFA']}
                  style={styles.roleCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Crown size={48} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.roleTitle}>خاوەندار</Text>
                  <Text style={styles.roleSubtitle}>دەسەڵاتی تەواو</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleCardHorizontal}
                onPress={() => handleRoleSelect('admin')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#DC2626', '#EF4444']}
                  style={styles.roleCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Shield size={48} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.roleTitle}>بەڕێوەبەر</Text>
                  <Text style={styles.roleSubtitle}>بەڕێوەبردنی سیستەم</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleCardHorizontal}
                onPress={() => handleRoleSelect('employee')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#059669', '#10B981']}
                  style={styles.roleCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Users size={48} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.roleTitle}>کارمەند</Text>
                  <Text style={styles.roleSubtitle}>کارکردن لە سیستەم</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleCardHorizontal}
                onPress={() => handleRoleSelect('customer')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2563EB', '#3B82F6']}
                  style={styles.roleCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <UserIcon size={48} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.roleTitle}>کڕیار</Text>
                  <Text style={styles.roleSubtitle}>بینینی قەرزەکان</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.registerButtonMain}
              onPress={() => router.push('/store-registration')}
            >
              <Store size={22} color="#FFFFFF" />
              <Text style={styles.registerButtonMainText}>
                تۆمارکردنی فرۆشگای نوێ
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const roleInfo = getRoleInfo(selectedRole);
  if (!roleInfo) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={roleInfo.gradient}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedRole(null)}
              >
                <Text style={styles.backButtonText}>← گەڕانەوە</Text>
              </TouchableOpacity>

              <View style={styles.header}>
                <roleInfo.icon size={64} color="#FFFFFF" strokeWidth={1.5} />
                <Text style={styles.title}>
                  چوونەژوورەوە وەک {roleInfo.title}
                </Text>
                <Text style={styles.subtitle}>
                  {roleInfo.subtitle}
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Phone size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ژمارەی مۆبایل"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    textAlign="right"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="وشەی نهێنی"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: roleInfo.color }, isSubmitting && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>
                      چوونەژوورەوە
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={[styles.demoInfo, { borderLeftColor: roleInfo.color }]}>
                  <Text style={styles.demoTitle}>
                    حسابی نموونە:
                  </Text>
                  <Text style={styles.demoText}>
                    مۆبایل: {roleInfo.demo.phone}
                  </Text>
                  <Text style={styles.demoText}>
                    وشەی نهێنی: {roleInfo.demo.password}
                  </Text>
                  <TouchableOpacity
                    style={[styles.fillDemoButton, { backgroundColor: roleInfo.color }]}
                    onPress={fillDemoCredentials}
                  >
                    <Text style={styles.fillDemoButtonText}>
                      پڕکردنەوەی خۆکار
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  roleSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    marginTop: 8,
    textAlign: 'center',
  },
  roleScroll: {
    marginBottom: 32,
  },
  roleScrollContent: {
    paddingHorizontal: 4,
    gap: 16,
  },
  roleCardHorizontal: {
    width: 280,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 8,
  },
  roleCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  loginButton: {
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  demoInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'right',
  },
  demoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  fillDemoButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  fillDemoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  registerButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  registerButtonMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
