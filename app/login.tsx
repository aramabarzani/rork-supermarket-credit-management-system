import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useSecurity } from '@/hooks/security-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { 
    recordLoginAttempt, 
    isUserLocked, 
    getFailedAttemptsCount, 
    createUserSession,
    securitySettings 
  } = useSecurity();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Check if user is locked on component mount
  useEffect(() => {
    if (phone && isUserLocked(phone)) {
      const failedCount = getFailedAttemptsCount(phone);
      setError(`حسابەکەت قەدەغەکراوە بۆ ${securitySettings.lockoutDuration} خولەک بەهۆی ${failedCount} هەوڵی سەرنەکەوتوو`);
      setLockoutTime(Date.now() + (securitySettings.lockoutDuration * 60 * 1000));
    }
  }, [phone, isUserLocked, getFailedAttemptsCount, securitySettings]);

  // Update lockout countdown
  useEffect(() => {
    if (!lockoutTime) return;

    const interval = setInterval(() => {
      const remaining = lockoutTime - Date.now();
      if (remaining <= 0) {
        setLockoutTime(null);
        setError('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleLogin = async () => {
    console.log('LoginScreen: Login attempt started');
    setError('');
    
    if (!phone || !password) {
      setError('تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    // Check if user is locked
    if (isUserLocked(phone)) {
      const failedCount = getFailedAttemptsCount(phone);
      const remainingTime = Math.ceil(securitySettings.lockoutDuration);
      setError(`حسابەکەت قەدەغەکراوە بۆ ${remainingTime} خولەک بەهۆی ${failedCount} هەوڵی سەرنەکەوتوو`);
      recordLoginAttempt(phone, false, 'Account locked');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login({ phone, password });
      
      if (result.success) {
        console.log('LoginScreen: Login successful, redirecting');
        recordLoginAttempt(phone, true);
        createUserSession('1'); // Demo user ID
        router.replace('/(tabs)/dashboard');
      } else {
        recordLoginAttempt(phone, false, result.error || 'Invalid credentials');
        const failedCount = getFailedAttemptsCount(phone) + 1;
        const remainingAttempts = securitySettings.maxFailedAttempts - failedCount;
        
        if (remainingAttempts > 0) {
          setError(`${result.error || 'ژمارەی مۆبایل یان وشەی نهێنی هەڵەیە'}. ${remainingAttempts} هەوڵی ماوە`);
        } else {
          setError(`حسابەکەت قەدەغەکراوە بۆ ${securitySettings.lockoutDuration} خولەک`);
          setLockoutTime(Date.now() + (securitySettings.lockoutDuration * 60 * 1000));
        }
      }
    } catch (err) {
      console.error('LoginScreen: Login error:', err);
      recordLoginAttempt(phone, false, 'System error');
      setError('هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە');
    }
    
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Shield size={60} color="white" />
          </View>
          <Text style={styles.title}>
            سیستەمی بەڕێوەبردنی قەرز
          </Text>
          <Text style={styles.subtitle}>
            بۆ سوپەرمارکێت و بازرگانیەکان
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="ژمارەی مۆبایل"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
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

          {error ? (
            <View style={[styles.errorContainer, lockoutTime && styles.lockoutContainer]}>
              {lockoutTime && (
                <AlertTriangle size={20} color="#EF4444" style={styles.errorIcon} />
              )}
              <Text style={[styles.errorText, lockoutTime && styles.lockoutText]}>
                {error}
              </Text>
              {lockoutTime && (
                <Text style={styles.countdownText}>
                  کاتی ماوە: {Math.ceil((lockoutTime - Date.now()) / 1000 / 60)} خولەک
                </Text>
              )}
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, (isLoading || lockoutTime) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading || !!lockoutTime}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>
                چوونەژوورەوە
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoInfo}>
            <Text style={styles.demoText}>
              بۆ تاقیکردنەوە:
            </Text>
            <Text style={styles.demoText}>
              بەڕێوەبەر: 07501234567 / admin123
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
  },
  loginButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoInfo: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
  },
  lockoutContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    flexDirection: 'column',
    alignItems: 'center',
  },
  lockoutText: {
    fontWeight: '600',
    marginTop: 4,
  },
  errorIcon: {
    marginBottom: 4,
  },
  countdownText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});