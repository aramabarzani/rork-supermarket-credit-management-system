import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Crown, User, Phone, Mail, Lock, CheckCircle2, Shield, Store } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { trpcClient } from '@/lib/trpc';
import { useAuth } from '@/hooks/auth-context';

export default function OwnerRegistrationScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    storeAddress: '',
  });

  const totalSteps = 2;

  React.useEffect(() => {
    
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      Alert.alert('هەڵە', 'تکایە ناوی خۆت بنووسە');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('هەڵە', 'تکایە ژمارەی مۆبایل بنووسە');
      return false;
    }
    if (formData.phone.length < 10) {
      Alert.alert('هەڵە', 'ژمارەی مۆبایل نادروستە');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('هەڵە', 'تکایە ئیمەیڵ بنووسە');
      return false;
    }
    if (!formData.storeName.trim()) {
      Alert.alert('هەڵە', 'تکایە ناوی فرۆشگا بنووسە');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password.trim()) {
      Alert.alert('هەڵە', 'تکایە وشەی نهێنی بنووسە');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('هەڵە', 'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('هەڵە', 'وشەی نهێنی یەکسان نین');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    
    if (currentStep < totalSteps) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        slideAnim.setValue(-50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);
    try {
      console.log('[Owner Registration] Creating owner account:', {
        phone: formData.phone,
        name: formData.name,
        email: formData.email,
        storeName: formData.storeName,
      });

      const result = await trpcClient.owner.register.mutate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        storeName: formData.storeName,
        storeAddress: formData.storeAddress || undefined,
        plan: 'free',
      });

      console.log('[Owner Registration] Owner account created successfully:', result);

      Alert.alert(
        'سەرکەوتوو بوو!',
        'حسابی خاوەندار بە سەرکەوتوویی دروست کرا. ئێستا دەتوانیت بچیتە ژوورەوە.',
        [
          {
            text: 'چوونەژوورەوە',
            onPress: async () => {
              const loginResult = await login({
                phone: formData.phone,
                password: formData.password,
                expectedRole: 'owner',
              });
              
              if (loginResult.success) {
                router.replace('/owner-dashboard');
              } else {
                router.replace('/login');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[Owner Registration] Error:', error);
      
      let errorMessage = 'کێشەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە';
      
      if (error?.message?.includes('Email already registered')) {
        errorMessage = 'ئەم ئیمەیڵە پێشتر تۆمار کراوە';
      } else if (error?.data?.code === 'CONFLICT') {
        errorMessage = 'ئەم ئیمەیڵە پێشتر تۆمار کراوە';
      }
      
      Alert.alert('هەڵە', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
              currentStep === step && styles.stepCircleCurrent,
            ]}
          >
            {currentStep > step ? (
              <CheckCircle2 size={24} color="#fff" />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= step && styles.stepNumberActive,
                ]}
              >
                {step}
              </Text>
            )}
          </View>
          {step < totalSteps && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Animated.View 
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={styles.stepIconContainer}
        >
          <Crown size={40} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.stepTitle}>زانیاری کەسی</Text>
        <Text style={styles.stepSubtitle}>زانیاری سەرەکی خۆت بنووسە</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <User size={20} color="#7C3AED" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ناوی تەواو"
          placeholderTextColor="#9ca3af"
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <Phone size={20} color="#7C3AED" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ژمارەی مۆبایل"
          placeholderTextColor="#9ca3af"
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          keyboardType="phone-pad"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <Mail size={20} color="#7C3AED" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ئیمەیڵ"
          placeholderTextColor="#9ca3af"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <Crown size={20} color="#7C3AED" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ناوی فرۆشگا"
          placeholderTextColor="#9ca3af"
          value={formData.storeName}
          onChangeText={(text) => updateField('storeName', text)}
          textAlign="right"
        />
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View 
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={styles.stepIconContainer}
        >
          <Shield size={40} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.stepTitle}>پاراستنی حساب</Text>
        <Text style={styles.stepSubtitle}>وشەی نهێنی بۆ حسابەکەت دابنێ</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <Lock size={20} color="#7C3AED" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="وشەی نهێنی"
          placeholderTextColor="#9ca3af"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <Lock size={20} color="#7C3AED" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="دووبارەکردنەوەی وشەی نهێنی"
          placeholderTextColor="#9ca3af"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry
          textAlign="right"
        />
      </View>

      <View style={styles.securityNote}>
        <Shield size={20} color="#7C3AED" />
        <Text style={styles.securityNoteText}>
          وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت و پارێزراو بێت
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'دروستکردنی حسابی خاوەندار',
          headerBackTitle: 'گەڕانەوە',
        }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={['#7C3AED', '#A78BFA']}
            style={styles.headerGradient}
          >
            <Crown size={64} color="#FFFFFF" />
            <Text style={styles.headerTitle}>حسابی خاوەندار</Text>
            <Text style={styles.headerSubtitle}>
              دەسەڵاتی تەواو بۆ بەڕێوەبردنی سیستەم
            </Text>
          </LinearGradient>

          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <View style={styles.actions}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>گەڕانەوە</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < totalSteps ? (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>دواتر</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'چاوەڕوان بە...' : 'دروستکردنی حساب'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerGradient: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  stepCircleActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  stepCircleCurrent: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#7C3AED',
  },
  stepContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  input: {
    flex: 1,
    minHeight: 56,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    paddingVertical: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7C3AED',
    marginTop: 8,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  nextButton: {
    backgroundColor: '#7C3AED',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
