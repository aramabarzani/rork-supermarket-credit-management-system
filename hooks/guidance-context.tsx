import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import type { GuidanceSettings, OnboardingStep, UserGuidance } from '@/types/guidance';

const GUIDANCE_STORAGE_KEY = 'guidance_settings';
const USER_GUIDANCE_KEY = 'user_guidance';

const defaultSettings: GuidanceSettings = {
  showOnboarding: true,
  showHelpMessages: true,
  autoPlayTutorials: false,
  newsletterEnabled: true,
  emailNotifications: true,
  whatsappNotifications: false,
  telegramNotifications: false,
};

const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Welcome',
    titleKu: 'بەخێربێیت',
    description: 'Welcome to the Credit Management System',
    descriptionKu: 'بەخێربێیت بۆ سیستەمی بەڕێوەبردنی قەرز',
    screen: 'dashboard',
    order: 1,
    completed: false,
  },
  {
    id: '2',
    title: 'Add Customer',
    titleKu: 'زیادکردنی کڕیار',
    description: 'Learn how to add new customers',
    descriptionKu: 'فێربە چۆن کڕیاری نوێ زیاد بکەیت',
    screen: 'customers',
    order: 2,
    completed: false,
  },
  {
    id: '3',
    title: 'Record Debt',
    titleKu: 'تۆمارکردنی قەرز',
    description: 'Learn how to record customer debts',
    descriptionKu: 'فێربە چۆن قەرزی کڕیار تۆمار بکەیت',
    screen: 'add-debt',
    order: 3,
    completed: false,
  },
  {
    id: '4',
    title: 'Record Payment',
    titleKu: 'تۆمارکردنی پارەدان',
    description: 'Learn how to record payments',
    descriptionKu: 'فێربە چۆن پارەدان تۆمار بکەیت',
    screen: 'add-payment',
    order: 4,
    completed: false,
  },
  {
    id: '5',
    title: 'View Reports',
    titleKu: 'بینینی ڕاپۆرتەکان',
    description: 'Learn how to generate and view reports',
    descriptionKu: 'فێربە چۆن ڕاپۆرت دروست بکەیت و ببینیت',
    screen: 'reports',
    order: 5,
    completed: false,
  },
];

export const [GuidanceContext, useGuidance] = createContextHook(() => {
  const [settings, setSettings] = useState<GuidanceSettings>(defaultSettings);
  const [userGuidance, setUserGuidance] = useState<UserGuidance>({
    userId: 'current-user',
    onboardingCompleted: false,
    tutorialsViewed: [],
    preferredLanguage: 'ku',
  });
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(defaultOnboardingSteps);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
    loadUserGuidance();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(GUIDANCE_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load guidance settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserGuidance = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_GUIDANCE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserGuidance(parsed);
        if (parsed.onboardingCompleted) {
          setOnboardingSteps((prev) =>
            prev.map((step) => ({ ...step, completed: true }))
          );
        }
      }
    } catch (error) {
      console.error('Failed to load user guidance:', error);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<GuidanceSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(GUIDANCE_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update guidance settings:', error);
    }
  }, [settings]);

  const completeOnboardingStep = useCallback(async (stepId: string) => {
    try {
      const updatedSteps = onboardingSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      );
      setOnboardingSteps(updatedSteps);

      const allCompleted = updatedSteps.every((step) => step.completed);
      if (allCompleted) {
        const updated = { ...userGuidance, onboardingCompleted: true };
        setUserGuidance(updated);
        await AsyncStorage.setItem(USER_GUIDANCE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to complete onboarding step:', error);
    }
  }, [onboardingSteps, userGuidance]);

  const markTutorialViewed = useCallback(async (tutorialId: string) => {
    try {
      const updated = {
        ...userGuidance,
        tutorialsViewed: [...userGuidance.tutorialsViewed, tutorialId],
      };
      setUserGuidance(updated);
      await AsyncStorage.setItem(USER_GUIDANCE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark tutorial as viewed:', error);
    }
  }, [userGuidance]);

  const resetOnboarding = useCallback(async () => {
    try {
      const resetSteps = defaultOnboardingSteps.map((step) => ({
        ...step,
        completed: false,
      }));
      setOnboardingSteps(resetSteps);
      const updated = { ...userGuidance, onboardingCompleted: false };
      setUserGuidance(updated);
      await AsyncStorage.setItem(USER_GUIDANCE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  }, [userGuidance]);

  const setPreferredLanguage = useCallback(async (language: 'en' | 'ku') => {
    try {
      const updated = { ...userGuidance, preferredLanguage: language };
      setUserGuidance(updated);
      await AsyncStorage.setItem(USER_GUIDANCE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to set preferred language:', error);
    }
  }, [userGuidance]);

  return useMemo(() => ({
    settings,
    userGuidance,
    onboardingSteps,
    isLoading,
    updateSettings,
    completeOnboardingStep,
    markTutorialViewed,
    resetOnboarding,
    setPreferredLanguage,
  }), [settings, userGuidance, onboardingSteps, isLoading, updateSettings, completeOnboardingStep, markTutorialViewed, resetOnboarding, setPreferredLanguage]);
});
