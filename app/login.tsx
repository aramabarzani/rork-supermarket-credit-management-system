import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, Store, Crown, Shield, Users, User as UserIcon } from 'lucide-react-native';
import { safeStorage } from '@/utils/storage';

export default function LoginScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));

  const [ownerExists, setOwnerExists] = useState(false);

  React.useEffect(() => {
    const checkOwner = async () => {
      try {
        const users = await safeStorage.getGlobalItem<any[]>('users', []);
        const hasOwner = users?.some(u => u.role === 'owner') || false;
        setOwnerExists(hasOwner);
      } catch (error) {
        console.error('[Login] Error checking owner:', error);
      }
    };
    
    checkOwner();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRoleSelect = (role: 'owner' | 'admin' | 'employee' | 'customer') => {
    switch (role) {
      case 'owner':
        router.push('/login-owner');
        break;
      case 'admin':
        router.push('/login-admin');
        break;
      case 'employee':
        router.push('/login-employee');
        break;
      case 'customer':
        router.push('/login-customer');
        break;
    }
  };

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
              بۆ سوپەرمارکێت و بازرگانیەکان
            </Text>
            <Text style={styles.description}>
              هەڵبژاردنی جۆری حساب بۆ چوونەژوورەوە
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

          {!ownerExists && (
            <TouchableOpacity
              style={styles.ownerRegistrationButton}
              onPress={() => router.push('/owner-registration')}
            >
              <Crown size={22} color="#FFFFFF" />
              <Text style={styles.ownerRegistrationButtonText}>
                دروستکردنی حسابی خاوەندار (یەک جار)
              </Text>
            </TouchableOpacity>
          )}
          
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
  description: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
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
  ownerRegistrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
    marginBottom: 16,
  },
  ownerRegistrationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
