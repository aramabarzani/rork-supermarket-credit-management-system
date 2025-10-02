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
import { Store, MapPin, Phone, Mail, User, Lock, CreditCard, CheckCircle2, Building2, Globe } from 'lucide-react-native';
import { useStoreRequests } from '@/hooks/store-request-context';
import { useNotifications } from '@/hooks/notification-context';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/types/subscription';


export default function StoreRegistrationScreen() {
  const { createRequest } = useStoreRequests();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [formData, setFormData] = useState({
    storeName: '',
    storeNameKurdish: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    address: '',
    city: '',
    password: '',
    confirmPassword: '',
    plan: 'basic' as SubscriptionPlan,
  });

  const totalSteps = 3;

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
    if (!formData.storeName.trim()) {
      Alert.alert('هەڵە', 'تکایە ناوی فرۆشگا بنووسە');
      return false;
    }
    if (!formData.storeNameKurdish.trim()) {
      Alert.alert('هەڵە', 'تکایە ناوی فرۆشگا بە کوردی بنووسە');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('هەڵە', 'تکایە ناونیشان بنووسە');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('هەڵە', 'تکایە شار بنووسە');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.ownerName.trim()) {
      Alert.alert('هەڵە', 'تکایە ناوی خاوەن بنووسە');
      return false;
    }
    if (!formData.ownerPhone.trim()) {
      Alert.alert('هەڵە', 'تکایە ژمارەی مۆبایل بنووسە');
      return false;
    }
    if (formData.ownerPhone.length < 11) {
      Alert.alert('هەڵە', 'ژمارەی مۆبایل نادروستە');
      return false;
    }
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
    if (currentStep === 2 && !validateStep2()) return;
    
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
      const newRequest = await createRequest({
        storeName: formData.storeName,
        storeNameKurdish: formData.storeNameKurdish,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        ownerEmail: formData.ownerEmail,
        ownerPassword: formData.password,
        address: formData.address,
        city: formData.city,
        plan: formData.plan,
      });

      await addNotification({
        title: 'داواکاریەکی نوێ بۆ تۆمارکردنی فرۆشگا',
        titleKurdish: 'داواکاریەکی نوێ بۆ تۆمارکردنی فرۆشگا',
        message: `${formData.storeNameKurdish} (${formData.storeName}) داواکاری کردووە. خاوەن: ${formData.ownerName} - ${formData.ownerPhone}`,
        messageKurdish: `${formData.storeNameKurdish} (${formData.storeName}) داواکاری کردووە. خاوەن: ${formData.ownerName} - ${formData.ownerPhone}`,
        type: 'new_store_registration',
        priority: 'high',
        recipientId: 'admin',
        recipientType: 'admin',
        isRead: false,
        channels: ['in_app'],
        metadata: {
          requestId: newRequest.id,
          storeName: formData.storeName,
          ownerName: formData.ownerName,
          ownerPhone: formData.ownerPhone,
          plan: formData.plan,
        },
      });

      Alert.alert(
        'سەرکەوتوو بوو!',
        'داواکاریەکەت بە سەرکەوتوویی نێردرا. دوای پێداچوونەوە لە لایەن ئادمینەوە، ئاگادارت دەکەینەوە.',
        [
          {
            text: 'باشە',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
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
        <View style={styles.stepIconContainer}>
          <Building2 size={32} color="#3b82f6" />
        </View>
        <Text style={styles.stepTitle}>زانیاری فرۆشگا</Text>
        <Text style={styles.stepSubtitle}>زانیاری سەرەکی فرۆشگاکەت بنووسە</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <Globe size={20} color="#3b82f6" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ناوی فرۆشگا (English)"
          placeholderTextColor="#9ca3af"
          value={formData.storeName}
          onChangeText={(text) => updateField('storeName', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <Store size={20} color="#3b82f6" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ناوی فرۆشگا (کوردی)"
          placeholderTextColor="#9ca3af"
          value={formData.storeNameKurdish}
          onChangeText={(text) => updateField('storeNameKurdish', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <MapPin size={20} color="#3b82f6" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ناونیشان"
          placeholderTextColor="#9ca3af"
          value={formData.address}
          onChangeText={(text) => updateField('address', text)}
          textAlign="right"
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputIconContainer}>
          <MapPin size={20} color="#3b82f6" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="شار"
          placeholderTextColor="#9ca3af"
          value={formData.city}
          onChangeText={(text) => updateField('city', text)}
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
        <View style={[styles.stepIconContainer, { backgroundColor: '#d1fae5' }]}>
          <User size={32} color="#10b981" />
        </View>
        <Text style={styles.stepTitle}>زانیاری خاوەن</Text>
        <Text style={styles.stepSubtitle}>زانیاری کەسی و ئەژمێری خاوەن</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <View style={[styles.inputIconContainer, { backgroundColor: '#d1fae5' }]}>
          <User size={20} color="#10b981" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ناوی خاوەن"
          placeholderTextColor="#9ca3af"
          value={formData.ownerName}
          onChangeText={(text) => updateField('ownerName', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={[styles.inputIconContainer, { backgroundColor: '#d1fae5' }]}>
          <Phone size={20} color="#10b981" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ژمارەی مۆبایل"
          placeholderTextColor="#9ca3af"
          value={formData.ownerPhone}
          onChangeText={(text) => updateField('ownerPhone', text)}
          keyboardType="phone-pad"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={[styles.inputIconContainer, { backgroundColor: '#d1fae5' }]}>
          <Mail size={20} color="#10b981" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ئیمەیڵ (ئیختیاری)"
          placeholderTextColor="#9ca3af"
          value={formData.ownerEmail}
          onChangeText={(text) => updateField('ownerEmail', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={[styles.inputIconContainer, { backgroundColor: '#d1fae5' }]}>
          <Lock size={20} color="#10b981" />
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
        <View style={[styles.inputIconContainer, { backgroundColor: '#d1fae5' }]}>
          <Lock size={20} color="#10b981" />
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
    </Animated.View>
  );

  const renderStep3 = () => (
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
        <View style={[styles.stepIconContainer, { backgroundColor: '#fef3c7' }]}>
          <CreditCard size={32} color="#f59e0b" />
        </View>
        <Text style={styles.stepTitle}>هەڵبژاردنی پلان</Text>
        <Text style={styles.stepSubtitle}>پلانی گونجاو بۆ فرۆشگاکەت هەڵبژێرە</Text>
      </View>
      
      <View style={styles.plansContainer}>
        {Object.values(SUBSCRIPTION_PLANS).map((plan, index) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              formData.plan === plan.id && styles.planCardActive,
            ]}
            onPress={() => updateField('plan', plan.id)}
            activeOpacity={0.7}
          >
            {formData.plan === plan.id && (
              <View style={styles.planBadge}>
                <CheckCircle2 size={16} color="#fff" />
                <Text style={styles.planBadgeText}>هەڵبژێردراوە</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <View style={[
                styles.planIconContainer,
                formData.plan === plan.id && styles.planIconContainerActive,
              ]}>
                <CreditCard
                  size={28}
                  color={formData.plan === plan.id ? '#3b82f6' : '#6b7280'}
                />
              </View>
              <View style={styles.planTitleContainer}>
                <Text style={[
                  styles.planName,
                  formData.plan === plan.id && styles.planNameActive,
                ]}>
                  {plan.nameKurdish}
                </Text>
                <Text style={styles.planPrice}>
                  {plan.price.toLocaleString()}
                  <Text style={styles.planCurrency}> IQD</Text>
                </Text>
              </View>
            </View>
            
            <View style={styles.planDivider} />
            
            <View style={styles.planFeatures}>
              {plan.featuresKurdish.map((feature, idx) => (
                <View key={idx} style={styles.planFeatureItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <Text style={styles.planFeature}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'تۆمارکردنی فرۆشگا',
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
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

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
                  {isSubmitting ? 'چاوەڕوان بە...' : 'تەواوکردن'}
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
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  stepCircleCurrent: {
    shadowColor: '#3b82f6',
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
    backgroundColor: '#3b82f6',
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0f9ff',
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
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: '#e5e7eb',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  planBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  planIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planIconContainerActive: {
    backgroundColor: '#dbeafe',
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  planNameActive: {
    color: '#3b82f6',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10b981',
  },
  planCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  planDivider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  planFeatures: {
    gap: 12,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planFeature: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
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
    backgroundColor: '#3b82f6',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#10b981',
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
