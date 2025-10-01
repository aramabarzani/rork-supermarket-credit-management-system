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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Store, MapPin, Phone, Mail, User, Lock, CreditCard } from 'lucide-react-native';
import { useTenant } from '@/hooks/tenant-context';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/types/subscription';

export default function StoreRegistrationScreen() {
  const { createTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);
    try {
      const plan = SUBSCRIPTION_PLANS[formData.plan];
      const duration = plan.duration === -1 ? 365 : plan.duration;
      
      await createTenant({
        storeName: formData.storeName,
        storeNameKurdish: formData.storeNameKurdish,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        ownerEmail: formData.ownerEmail,
        address: formData.address,
        city: formData.city,
        plan: formData.plan,
        status: 'trial',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      });

      Alert.alert(
        'سەرکەوتوو بوو!',
        'فرۆشگاکەت بە سەرکەوتوویی تۆمارکرا. ئێستا دەتوانیت بچیتە ژوورەوە.',
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
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}
            >
              {step}
            </Text>
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
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>زانیاری فرۆشگا</Text>
      
      <View style={styles.inputGroup}>
        <Store size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ناوی فرۆشگا (English)"
          value={formData.storeName}
          onChangeText={(text) => updateField('storeName', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Store size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ناوی فرۆشگا (کوردی)"
          value={formData.storeNameKurdish}
          onChangeText={(text) => updateField('storeNameKurdish', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ناونیشان"
          value={formData.address}
          onChangeText={(text) => updateField('address', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="شار"
          value={formData.city}
          onChangeText={(text) => updateField('city', text)}
          textAlign="right"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>زانیاری خاوەن</Text>
      
      <View style={styles.inputGroup}>
        <User size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ناوی خاوەن"
          value={formData.ownerName}
          onChangeText={(text) => updateField('ownerName', text)}
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Phone size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ژمارەی مۆبایل"
          value={formData.ownerPhone}
          onChangeText={(text) => updateField('ownerPhone', text)}
          keyboardType="phone-pad"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Mail size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ئیمەیڵ (ئیختیاری)"
          value={formData.ownerEmail}
          onChangeText={(text) => updateField('ownerEmail', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Lock size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="وشەی نهێنی"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Lock size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="دووبارەکردنەوەی وشەی نهێنی"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry
          textAlign="right"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>هەڵبژاردنی پلان</Text>
      
      <View style={styles.plansContainer}>
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              formData.plan === plan.id && styles.planCardActive,
            ]}
            onPress={() => updateField('plan', plan.id)}
          >
            <View style={styles.planHeader}>
              <CreditCard
                size={32}
                color={formData.plan === plan.id ? '#3b82f6' : '#6b7280'}
              />
              <Text style={[
                styles.planName,
                formData.plan === plan.id && styles.planNameActive,
              ]}>
                {plan.nameKurdish}
              </Text>
            </View>
            
            <Text style={styles.planPrice}>
              {plan.price.toLocaleString()} IQD
            </Text>
            
            <View style={styles.planFeatures}>
              {plan.featuresKurdish.map((feature, index) => (
                <Text key={index} style={styles.planFeature}>
                  ✓ {feature}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
    backgroundColor: '#f3f4f6',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#3b82f6',
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
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1f2937',
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  planCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  planNameActive: {
    color: '#3b82f6',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
    marginBottom: 16,
  },
  planFeatures: {
    gap: 8,
  },
  planFeature: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
