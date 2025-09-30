import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, ArrowLeft } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { trpcClient } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function OTPVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const userRole = params.role as string;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== 6) {
      setError('تکایە هەموو ٦ ژمارەکە داخڵ بکە');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await trpcClient.auth.verifyOTP.mutate({
        user_id: userId,
        code: otpCode,
        ip: '127.0.0.1',
        user_agent: Platform.OS,
      });

      if (result.success && result.token) {
        await AsyncStorage.setItem('auth_token', result.token);
        await AsyncStorage.setItem('user_role', userRole);
        
        console.log('[OTP] دڵنیاکردنەوە سەرکەوتوو بوو');
        router.replace('/(tabs)/dashboard');
      } else {
        setError(result.error || 'کۆدی OTP هەڵەیە');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error('[OTP] هەڵە:', err);
      setError('هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await trpcClient.auth.resendOTP.mutate({
        user_id: userId,
      });

      if (result.success) {
        setResendCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || 'نەتوانرا کۆد بنێردرێتەوە');
      }
    } catch (err) {
      console.error('[OTP] هەڵە لە ناردنەوە:', err);
      setError('هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە');
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.content, isTablet && styles.tabletContent]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.logoContainer, isTablet && styles.tabletLogo]}>
              <Shield size={isTablet ? 80 : 60} color="white" />
            </View>
            <KurdishText style={[styles.title, isTablet && styles.tabletTitle]}>
              دڵنیاکردنەوەی OTP
            </KurdishText>
            <KurdishText style={[styles.subtitle, isTablet && styles.tabletSubtitle]}>
              کۆدی ٦ ژمارەیی داخڵ بکە کە نێردراوە
            </KurdishText>
          </View>

          <View style={[styles.formContainer, isTablet && styles.tabletForm]}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    isTablet && styles.tabletOtpInput,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                  editable={!isLoading}
                />
              ))}
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <KurdishText style={styles.errorText}>{error}</KurdishText>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.resendButton,
                !canResend && styles.resendButtonDisabled,
              ]}
              onPress={handleResend}
              disabled={!canResend || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1E3A8A" size="small" />
              ) : (
                <KurdishText
                  style={[
                    styles.resendButtonText,
                    !canResend && styles.resendButtonTextDisabled,
                  ]}
                >
                  {canResend
                    ? 'دووبارە ناردنی کۆد'
                    : `دووبارە ناردن لە ${resendCountdown} چرکە`}
                </KurdishText>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <KurdishText style={styles.infoText}>
                کۆدی OTP لە کۆنسۆڵ پیشان دەدرێت
              </KurdishText>
              <KurdishText style={styles.infoText}>
                (بۆ تاقیکردنەوە)
              </KurdishText>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  tabletContent: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
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
    fontWeight: 'bold' as const,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  otpInputFilled: {
    borderColor: '#1E3A8A',
    backgroundColor: '#DBEAFE',
  },
  tabletOtpInput: {
    height: 64,
    fontSize: 28,
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
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600' as const,
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
});
