import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Smartphone, Mail, Key, Copy } from 'lucide-react-native';
import { useSecurity } from '@/hooks/security-context';
import { useAuth } from '@/hooks/auth-context';
import { KurdishText } from '@/components/KurdishText';

export default function TwoFactorSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { twoFactorAuth, enable2FA, disable2FA } = useSecurity();

  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email'>('sms');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'select' | 'verify' | 'backup'>('select');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable2FA = () => {
    if (!user) return;

    const auth = enable2FA(user.id, selectedMethod);
    setBackupCodes(auth.backupCodes || []);
    setStep('verify');
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setStep('backup');
    } else {
      Alert.alert('هەڵە', 'تکایە کۆدی ٦ ژمارەیی داخڵ بکە');
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'سەرکەوتوو',
      'تایبەتمەندی دوو هەنگاو بە سەرکەوتوویی چالاک کرا',
      [
        {
          text: 'باشە',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleDisable = () => {
    if (!user) return;

    Alert.alert(
      'ناچالاککردن',
      'دڵنیایت لە ناچالاککردنی تایبەتمەندی دوو هەنگاو؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'ناچالاک بکە',
          style: 'destructive',
          onPress: () => {
            disable2FA(user.id);
            router.back();
          },
        },
      ]
    );
  };

  if (twoFactorAuth?.enabled && step === 'select') {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'چوونەژوورەوە بە دوو هەنگاو',
            headerStyle: { backgroundColor: '#1e40af' },
            headerTintColor: '#fff',
          }}
        />

        <ScrollView style={styles.scrollView}>
          <View style={styles.enabledCard}>
            <View style={styles.enabledIcon}>
              <Key size={48} color="#22c55e" />
            </View>
            <KurdishText style={styles.enabledTitle}>
              تایبەتمەندی دوو هەنگاو چالاکە
            </KurdishText>
            <KurdishText style={styles.enabledSubtitle}>
              ڕێگای پشتڕاستکردنەوە: {twoFactorAuth.method === 'sms' ? 'SMS' : 'ئیمەیڵ'}
            </KurdishText>

            <TouchableOpacity
              style={styles.disableButton}
              onPress={handleDisable}
            >
              <KurdishText style={styles.disableButtonText}>
                ناچالاککردنی دوو هەنگاو
              </KurdishText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'چوونەژوورەوە بە دوو هەنگاو',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView}>
        {step === 'select' && (
          <>
            <View style={styles.header}>
              <KurdishText style={styles.headerTitle}>
                هەڵبژاردنی ڕێگای پشتڕاستکردنەوە
              </KurdishText>
              <KurdishText style={styles.headerSubtitle}>
                ڕێگایەک هەڵبژێرە بۆ وەرگرتنی کۆدی پشتڕاستکردنەوە
              </KurdishText>
            </View>

            <View style={styles.methodsContainer}>
              <TouchableOpacity
                style={[
                  styles.methodCard,
                  selectedMethod === 'sms' && styles.methodCardSelected,
                ]}
                onPress={() => setSelectedMethod('sms')}
              >
                <Smartphone size={32} color={selectedMethod === 'sms' ? '#1e40af' : '#6b7280'} />
                <KurdishText style={[
                  styles.methodTitle,
                  selectedMethod === 'sms' && styles.methodTitleSelected,
                ]}>
                  SMS
                </KurdishText>
                <KurdishText style={styles.methodSubtitle}>
                  کۆد بە SMS بنێرە
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodCard,
                  selectedMethod === 'email' && styles.methodCardSelected,
                ]}
                onPress={() => setSelectedMethod('email')}
              >
                <Mail size={32} color={selectedMethod === 'email' ? '#1e40af' : '#6b7280'} />
                <KurdishText style={[
                  styles.methodTitle,
                  selectedMethod === 'email' && styles.methodTitleSelected,
                ]}>
                  ئیمەیڵ
                </KurdishText>
                <KurdishText style={styles.methodSubtitle}>
                  کۆد بە ئیمەیڵ بنێرە
                </KurdishText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleEnable2FA}
            >
              <KurdishText style={styles.continueButtonText}>
                بەردەوامبوون
              </KurdishText>
            </TouchableOpacity>
          </>
        )}

        {step === 'verify' && (
          <>
            <View style={styles.header}>
              <KurdishText style={styles.headerTitle}>
                پشتڕاستکردنەوەی کۆد
              </KurdishText>
              <KurdishText style={styles.headerSubtitle}>
                کۆدی ٦ ژمارەیی داخڵ بکە کە بۆ {selectedMethod === 'sms' ? 'مۆبایلەکەت' : 'ئیمەیڵەکەت'} نێردرا
              </KurdishText>
            </View>

            <View style={styles.verifyContainer}>
              <TextInput
                style={styles.codeInput}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="000000"
                placeholderTextColor="#9ca3af"
              />

              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerify}
              >
                <KurdishText style={styles.verifyButtonText}>
                  پشتڕاستکردنەوە
                </KurdishText>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'backup' && (
          <>
            <View style={styles.header}>
              <KurdishText style={styles.headerTitle}>
                کۆدەکانی پاشەکەوت
              </KurdishText>
              <KurdishText style={styles.headerSubtitle}>
                ئەم کۆدانە لە شوێنێکی پارێزراو هەڵبگرە
              </KurdishText>
            </View>

            <View style={styles.backupContainer}>
              {backupCodes.map((code, index) => (
                <View key={index} style={styles.backupCodeRow}>
                  <Text style={styles.backupCode}>{code}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('کۆپی کرا', 'کۆدەکە کۆپی کرا');
                    }}
                  >
                    <Copy size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <KurdishText style={styles.completeButtonText}>
                تەواوکردن
              </KurdishText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  methodCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  methodCardSelected: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6b7280',
    marginTop: 12,
  },
  methodTitleSelected: {
    color: '#1e40af',
  },
  methodSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  verifyContainer: {
    alignItems: 'center',
  },
  codeInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold' as const,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
    width: '100%',
    fontFamily: 'monospace',
  },
  verifyButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  backupContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  backupCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backupCode: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'monospace',
    color: '#111827',
  },
  completeButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  enabledCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  enabledIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  enabledTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 8,
  },
  enabledSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
  },
  disableButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  disableButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
