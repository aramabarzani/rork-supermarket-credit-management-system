import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Shield,
  Smartphone,
  Key,
  CheckCircle,
  Copy,
  QrCode,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useAuth } from '@/hooks/auth-context';

export default function TwoFactorSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'backup' | 'complete'>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SupermarketCredit:' + user?.phone + '?secret=JBSWY3DPEHPK3PXP&issuer=SupermarketCredit';

  const secretKey = 'JBSWY3DPEHPK3PXP';

  const handleCopySecret = () => {
    Alert.alert('کۆپی کرا', 'کلیلی نهێنی کۆپی کرا');
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      Alert.alert('هەڵە', 'تکایە کۆدی 6 ژمارەیی داخڵ بکە');
      return;
    }

    const codes = [
      'A1B2C3D4',
      'E5F6G7H8',
      'I9J0K1L2',
      'M3N4O5P6',
      'Q7R8S9T0',
      'U1V2W3X4',
      'Y5Z6A7B8',
      'C9D0E1F2',
    ];
    setBackupCodes(codes);
    setStep('backup');
  };

  const handleComplete = () => {
    setTwoFactorEnabled(true);
    setStep('complete');
    setTimeout(() => {
      Alert.alert('سەرکەوتوو', 'دوو فاکتەر بە سەرکەوتوویی چالاک کرا', [
        { text: 'باشە', onPress: () => router.back() }
      ]);
    }, 1000);
  };

  const handleCopyBackupCode = (code: string) => {
    Alert.alert('کۆپی کرا', `کۆدی پاشەکەوت کۆپی کرا: ${code}`);
  };

  const renderIntro = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Shield size={64} color="#1E3A8A" />
      </View>
      
      <KurdishText variant="title" color="#1F2937" style={styles.title}>
        پاراستنی دوو فاکتەر
      </KurdishText>
      
      <KurdishText variant="body" color="#6B7280" style={styles.description}>
        زیادکردنی قاتێکی تری پاراستن بۆ هەژمارەکەت بە بەکارهێنانی ئەپێکی Authenticator
      </KurdishText>

      <GradientCard style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Smartphone size={24} color="#3B82F6" />
          <View style={styles.infoContent}>
            <KurdishText variant="body" color="#1F2937">
              پێویستە ئەپێکی Authenticator دابەزێنیت
            </KurdishText>
            <KurdishText variant="caption" color="#6B7280">
              وەک Google Authenticator یان Microsoft Authenticator
            </KurdishText>
          </View>
        </View>
      </GradientCard>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep('qr')}
      >
        <KurdishText variant="body" color="white">
          دەستپێکردن
        </KurdishText>
      </TouchableOpacity>
    </View>
  );

  const renderQRStep = () => (
    <View style={styles.stepContainer}>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.stepTitle}>
        هەنگاو 1: سکان کردنی QR Code
      </KurdishText>
      
      <KurdishText variant="body" color="#6B7280" style={styles.stepDescription}>
        ئەپی Authenticator بکەرەوە و QR Code ـەکە سکان بکە
      </KurdishText>

      <GradientCard style={styles.qrCard}>
        <Image
          source={{ uri: qrCodeUrl }}
          style={styles.qrCode}
          resizeMode="contain"
        />
      </GradientCard>

      <KurdishText variant="caption" color="#6B7280" style={styles.orText}>
        یان کلیلی نهێنی بە دەست زیاد بکە
      </KurdishText>

      <GradientCard style={styles.secretCard}>
        <View style={styles.secretRow}>
          <KurdishText variant="body" color="#1F2937" style={styles.secretText}>
            {secretKey}
          </KurdishText>
          <TouchableOpacity onPress={handleCopySecret}>
            <Copy size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </GradientCard>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep('verify')}
      >
        <KurdishText variant="body" color="white">
          دواتر
        </KurdishText>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.stepContainer}>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.stepTitle}>
        هەنگاو 2: پشتڕاستکردنەوە
      </KurdishText>
      
      <KurdishText variant="body" color="#6B7280" style={styles.stepDescription}>
        کۆدی 6 ژمارەیی لە ئەپی Authenticator داخڵ بکە
      </KurdishText>

      <View style={styles.codeInputContainer}>
        <Key size={24} color="#6B7280" />
        <TextInput
          style={styles.codeInput}
          placeholder="123456"
          placeholderTextColor="#9CA3AF"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, verificationCode.length !== 6 && styles.disabledButton]}
        onPress={handleVerify}
        disabled={verificationCode.length !== 6}
      >
        <KurdishText variant="body" color="white">
          پشتڕاستکردنەوە
        </KurdishText>
      </TouchableOpacity>
    </View>
  );

  const renderBackupStep = () => (
    <View style={styles.stepContainer}>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.stepTitle}>
        هەنگاو 3: کۆدەکانی پاشەکەوت
      </KurdishText>
      
      <KurdishText variant="body" color="#6B7280" style={styles.stepDescription}>
        ئەم کۆدانە لە شوێنێکی پارێزراو هەڵبگرە. دەتوانیت بەکاریان بهێنیت ئەگەر دەسگەیەکەت ون بوو
      </KurdishText>

      <ScrollView style={styles.backupCodesContainer} showsVerticalScrollIndicator={false}>
        {backupCodes.map((code, index) => (
          <GradientCard key={index} style={styles.backupCodeCard}>
            <View style={styles.backupCodeRow}>
              <KurdishText variant="body" color="#1F2937" style={styles.backupCodeText}>
                {code}
              </KurdishText>
              <TouchableOpacity onPress={() => handleCopyBackupCode(code)}>
                <Copy size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </GradientCard>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleComplete}
      >
        <KurdishText variant="body" color="white">
          تەواوکردن
        </KurdishText>
      </TouchableOpacity>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIconContainer}>
        <CheckCircle size={80} color="#10B981" />
      </View>
      
      <KurdishText variant="title" color="#1F2937" style={styles.title}>
        سەرکەوتوو بوو!
      </KurdishText>
      
      <KurdishText variant="body" color="#6B7280" style={styles.description}>
        دوو فاکتەر بە سەرکەوتوویی چالاک کرا. هەژمارەکەت ئێستا پارێزراوترە
      </KurdishText>

      <GradientCard style={styles.successCard} colors={['#10B981', '#059669']}>
        <View style={styles.successRow}>
          <Shield size={24} color="white" />
          <KurdishText variant="body" color="white">
            پاراستنی پێشکەوتوو چالاکە
          </KurdishText>
        </View>
      </GradientCard>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ڕێکخستنی دوو فاکتەر',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'intro' && renderIntro()}
        {step === 'qr' && renderQRStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'backup' && renderBackupStep()}
        {step === 'complete' && renderComplete()}
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
  stepContainer: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  stepTitle: {
    marginBottom: 12,
  },
  stepDescription: {
    marginBottom: 24,
    lineHeight: 22,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  qrCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  orText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  secretCard: {
    marginBottom: 24,
  },
  secretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secretText: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  codeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    paddingVertical: 16,
    marginLeft: 12,
    letterSpacing: 8,
  },
  backupCodesContainer: {
    maxHeight: 300,
    marginBottom: 24,
  },
  backupCodeCard: {
    marginBottom: 12,
  },
  backupCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backupCodeText: {
    fontFamily: 'monospace',
    letterSpacing: 2,
    fontSize: 16,
  },
  successCard: {
    marginTop: 24,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});
