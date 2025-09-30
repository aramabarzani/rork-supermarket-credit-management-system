import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react-native';
import { useGuidance } from '@/hooks/guidance-context';
import { KurdishText } from '@/components/KurdishText';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { onboardingSteps, completeOnboardingStep } = useGuidance();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (currentStepData) {
      completeOnboardingStep(currentStepData.id);
    }

    if (isLastStep) {
      router.back();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: 'ڕێنمایی دەستپێک',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>پەڕاندن</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} / {onboardingSteps.length}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
          </View>

          <KurdishText style={styles.stepTitle}>
            {currentStepData?.titleKu || ''}
          </KurdishText>

          <KurdishText style={styles.stepDescription}>
            {currentStepData?.descriptionKu || ''}
          </KurdishText>

          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationText}>📱</Text>
          </View>

          <View style={styles.stepsIndicator}>
            {onboardingSteps.map((step, index) => (
              <View
                key={step.id}
                style={[
                  styles.stepDot,
                  index === currentStep && styles.stepDotActive,
                  step.completed && styles.stepDotCompleted,
                ]}
              >
                {step.completed && <Check size={12} color="#FFFFFF" />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, isFirstStep && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstStep}
        >
          <ChevronLeft size={24} color={isFirstStep ? '#D1D5DB' : '#3B82F6'} />
          <Text style={[styles.navButtonText, isFirstStep && styles.navButtonTextDisabled]}>
            پێشوو
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'تەواو' : 'دواتر'}
          </Text>
          {!isLastStep && <ChevronRight size={24} color="#FFFFFF" />}
          {isLastStep && <Check size={24} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepNumberText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 48,
  },
  illustrationPlaceholder: {
    width: width - 96,
    height: width - 96,
    maxWidth: 300,
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  illustrationText: {
    fontSize: 120,
  },
  stepsIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    width: 32,
    backgroundColor: '#3B82F6',
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
