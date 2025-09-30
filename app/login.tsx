import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, AlertTriangle, Smartphone, MessageSquare } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useSecurity } from '@/hooks/security-context';
import { KurdishText } from '@/components/KurdishText';

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
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [smsCode, setSmsCode] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isTablet = screenWidth > 768;

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

  // SMS countdown effect
  useEffect(() => {
    if (smsCountdown > 0) {
      const timer = setTimeout(() => setSmsCountdown(smsCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsCountdown]);

  const handleSendSms = async () => {
    if (!phone) {
      setError('تکایە ژمارەی مۆبایل داخڵ بکە');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate SMS sending
      console.log('Sending SMS to:', phone);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSmsSent(true);
      setSmsCountdown(60);
      setError('');
    } catch (err) {
      setError('نەتوانرا SMS بنێررێت. دووبارە هەوڵ بدەرەوە');
    }
    
    setIsLoading(false);
  };

  const handleSmsLogin = async () => {
    if (!phone || !smsCode) {
      setError('تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate SMS verification
      if (smsCode === '1234') {
        console.log('SMS login successful');
        recordLoginAttempt(phone, true);
        createUserSession('1');
        router.replace('/(tabs)/dashboard');
      } else {
        setError('کۆدی SMS هەڵەیە');
        recordLoginAttempt(phone, false, 'Invalid SMS code');
      }
    } catch (err) {
      setError('هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە');
    }

    setIsLoading(false);
  };

  const handlePasswordLogin = async () => {
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

  const handleLogin = loginMethod === 'sms' ? handleSmsLogin : handlePasswordLogin;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, isTablet && styles.tabletContent]}>
            <View style={styles.header}>
              <View style={[styles.logoContainer, isTablet && styles.tabletLogo]}>
                <Shield size={isTablet ? 80 : 60} color="white" />
              </View>
              <KurdishText style={[styles.title, isTablet && styles.tabletTitle]}>
                سیستەمی بەڕێوەبردنی قەرز
              </KurdishText>
              <KurdishText style={[styles.subtitle, isTablet && styles.tabletSubtitle]}>
                بۆ سوپەرمارکێت و بازرگانیەکان
              </KurdishText>
            </View>

            <View style={[styles.formContainer, isTablet && styles.tabletForm]}>
              {/* Login Method Toggle */}
              <View style={styles.methodToggle}>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    loginMethod === 'password' && styles.methodButtonActive
                  ]}
                  onPress={() => {
                    setLoginMethod('password');
                    setIsSmsSent(false);
                    setSmsCode('');
                    setError('');
                  }}
                >
                  <Shield size={20} color={loginMethod === 'password' ? '#fff' : '#6B7280'} />
                  <KurdishText style={[
                    styles.methodButtonText,
                    loginMethod === 'password' && styles.methodButtonTextActive
                  ]}>
                    وشەی نهێنی
                  </KurdishText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    loginMethod === 'sms' && styles.methodButtonActive
                  ]}
                  onPress={() => {
                    setLoginMethod('sms');
                    setPassword('');
                    setError('');
                  }}
                >
                  <MessageSquare size={20} color={loginMethod === 'sms' ? '#fff' : '#6B7280'} />
                  <KurdishText style={[
                    styles.methodButtonText,
                    loginMethod === 'sms' && styles.methodButtonTextActive
                  ]}>
                    SMS کۆد
                  </KurdishText>
                </TouchableOpacity>
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <Smartphone size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ژمارەی مۆبایل (07501234567)"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textAlign="right"
                  maxLength={11}
                />
              </View>

              {/* Password or SMS Input */}
              {loginMethod === 'password' ? (
                <View style={styles.inputContainer}>
                  <Shield size={20} color="#6B7280" style={styles.inputIcon} />
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
              ) : (
                <>
                  {!isSmsSent ? (
                    <TouchableOpacity
                      style={[styles.smsButton, isLoading && styles.smsButtonDisabled]}
                      onPress={handleSendSms}
                      disabled={isLoading || !phone}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#1E3A8A" size="small" />
                      ) : (
                        <>
                          <MessageSquare size={20} color="#1E3A8A" />
                          <KurdishText style={styles.smsButtonText}>
                            ناردنی کۆدی SMS
                          </KurdishText>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <>
                      <View style={styles.inputContainer}>
                        <MessageSquare size={20} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="کۆدی SMS (1234)"
                          placeholderTextColor="#9CA3AF"
                          value={smsCode}
                          onChangeText={setSmsCode}
                          keyboardType="number-pad"
                          textAlign="center"
                          maxLength={4}
                        />
                      </View>
                      
                      <TouchableOpacity
                        style={[
                          styles.resendButton,
                          smsCountdown > 0 && styles.resendButtonDisabled
                        ]}
                        onPress={handleSendSms}
                        disabled={smsCountdown > 0}
                      >
                        <KurdishText style={[
                          styles.resendButtonText,
                          smsCountdown > 0 && styles.resendButtonTextDisabled
                        ]}>
                          {smsCountdown > 0 
                            ? `دووبارە ناردن لە ${smsCountdown} چرکە`
                            : 'دووبارە ناردنی کۆد'
                          }
                        </KurdishText>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}

              {error ? (
                <View style={[styles.errorContainer, lockoutTime && styles.lockoutContainer]}>
                  {lockoutTime && (
                    <AlertTriangle size={20} color="#EF4444" style={styles.errorIcon} />
                  )}
                  <KurdishText style={[styles.errorText, lockoutTime && styles.lockoutText]}>
                    {error}
                  </KurdishText>
                  {lockoutTime && (
                    <KurdishText style={styles.countdownText}>
                      کاتی ماوە: {Math.ceil((lockoutTime - Date.now()) / 1000 / 60)} خولەک
                    </KurdishText>
                  )}
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (isLoading || lockoutTime || (loginMethod === 'sms' && !isSmsSent)) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading || !!lockoutTime || (loginMethod === 'sms' && !isSmsSent)}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <KurdishText style={styles.loginButtonText}>
                    چوونەژوورەوە
                  </KurdishText>
                )}
              </TouchableOpacity>

              <View style={styles.demoInfo}>
                <KurdishText style={[styles.demoText, styles.demoTitle]}>
                  بۆ تاقیکردنەوە:
                </KurdishText>
                <View style={styles.demoSection}>
                  <View style={[styles.demoCard, { borderColor: '#7C3AED' }]}>
                    <KurdishText style={[styles.demoRole, { color: '#7C3AED' }]}>خاوەندار</KurdishText>
                    <Text style={styles.demoCredential}>📱 07500000000</Text>
                    <Text style={styles.demoCredential}>🔑 owner123</Text>
                  </View>
                  <View style={[styles.demoCard, { borderColor: '#1E3A8A' }]}>
                    <KurdishText style={[styles.demoRole, { color: '#1E3A8A' }]}>بەڕێوەبەر</KurdishText>
                    <Text style={styles.demoCredential}>📱 07501234567</Text>
                    <Text style={styles.demoCredential}>🔑 admin123</Text>
                  </View>
                  <View style={[styles.demoCard, { borderColor: '#059669' }]}>
                    <KurdishText style={[styles.demoRole, { color: '#059669' }]}>کارمەند</KurdishText>
                    <Text style={styles.demoCredential}>📱 07509876543</Text>
                    <Text style={styles.demoCredential}>🔑 employee123</Text>
                  </View>
                  <View style={[styles.demoCard, { borderColor: '#DC2626' }]}>
                    <KurdishText style={[styles.demoRole, { color: '#DC2626' }]}>کڕیار</KurdishText>
                    <Text style={styles.demoCredential}>📱 07701234567</Text>
                    <Text style={styles.demoCredential}>🔑 customer123</Text>
                  </View>
                </View>
                <Text style={[styles.demoText, { marginTop: 12, fontWeight: '600' }]}>
                  SMS کۆد: 1234
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: Dimensions.get('window').height,
  },
  tabletContent: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
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
  tabletLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  tabletTitle: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  tabletSubtitle: {
    fontSize: 18,
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
  tabletForm: {
    padding: 32,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  methodButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodButtonTextActive: {
    color: 'white',
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  smsButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  smsButtonDisabled: {
    opacity: 0.6,
  },
  smsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
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
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoSection: {
    gap: 8,
  },
  demoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  demoRole: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  demoCredential: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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