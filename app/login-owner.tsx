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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Phone, Lock, KeyRound, X } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { safeStorage } from '@/utils/storage';
import { User } from '@/types/auth';

export default function OwnerLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ phone, password, expectedRole: 'owner' });
      
      if (result.success && result.user) {
        if (result.user.role !== 'owner') {
          Alert.alert('هەڵە', 'ئەم حسابە حسابی خاوەندار نییە');
          return;
        }
        router.replace('/owner-dashboard');
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

  const handleResetPassword = async () => {
    if (!resetPhone || !newPassword || !confirmPassword) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('هەڵە', 'وشەی نهێنی یەکسان نین');
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert('هەڵە', 'وشەی نهێنی دەبێت لانیکەم ٤ پیت بێت');
      return;
    }

    setIsResetting(true);
    try {
      const users = await safeStorage.getGlobalItem<User[]>('users', []);
      
      if (!users || !Array.isArray(users)) {
        Alert.alert('هەڵە', 'هەڵەیەک ڕوویدا لە خوێندنەوەی زانیاریەکان');
        return;
      }

      const ownerIndex = users.findIndex(
        u => u.phone === resetPhone && u.role === 'owner'
      );

      if (ownerIndex === -1) {
        Alert.alert('هەڵە', 'هیچ حسابێکی خاوەندار بەم ژمارەیە نەدۆزرایەوە');
        return;
      }

      users[ownerIndex] = {
        ...users[ownerIndex],
        password: newPassword,
      };

      await safeStorage.setGlobalItem('users', users);
      
      Alert.alert(
        'سەرکەوتوو بوو',
        'وشەی نهێنی گەڕایەوە. ئێستا دەتوانیت بچیتە ژوورەوە',
        [
          {
            text: 'باشە',
            onPress: () => {
              setShowForgotPassword(false);
              setResetPhone('');
              setNewPassword('');
              setConfirmPassword('');
              setPhone(resetPhone);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('هەڵە', 'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#A78BFA']}
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
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>← گەڕانەوە</Text>
              </TouchableOpacity>

              <View style={styles.header}>
                <Crown size={64} color="#FFFFFF" strokeWidth={1.5} />
                <Text style={styles.title}>
                  چوونەژوورەوە وەک خاوەندار
                </Text>
                <Text style={styles.subtitle}>
                  دەسەڵاتی تەواو
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
                  style={styles.forgotPasswordLink}
                  onPress={() => setShowForgotPassword(true)}
                >
                  <KeyRound size={16} color="#7C3AED" />
                  <Text style={styles.forgotPasswordLinkText}>
                    وشەی نهێنیت بیرچووەتەوە؟
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
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
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          visible={showForgotPassword}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowForgotPassword(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>گەڕانەوەی وشەی نهێنی</Text>
                  <TouchableOpacity
                    onPress={() => setShowForgotPassword(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalDescription}>
                    ژمارەی مۆبایلی حسابی خاوەندار بنووسە و وشەی نهێنی نوێ دابنێ
                  </Text>

                  <View style={styles.modalInputContainer}>
                    <Phone size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ژمارەی مۆبایل"
                      placeholderTextColor="#9CA3AF"
                      value={resetPhone}
                      onChangeText={setResetPhone}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      textAlign="right"
                    />
                  </View>

                  <View style={styles.modalInputContainer}>
                    <Lock size={20} color="#6B7280" style={styles.inputIcon} />
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

                  <View style={styles.modalInputContainer}>
                    <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="دووبارەکردنەوەی وشەی نهێنی"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      textAlign="right"
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.resetButton, isResetting && styles.resetButtonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.resetButtonText}>
                        گەڕانەوەی وشەی نهێنی
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
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
    backgroundColor: '#7C3AED',
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
  forgotPasswordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotPasswordLinkText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
  },
  forgotPasswordText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalDescription: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'right',
    lineHeight: 22,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
