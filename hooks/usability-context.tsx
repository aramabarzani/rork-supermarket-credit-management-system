import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { safeStorage } from '@/utils/storage';
import {
  UserPreferences,
  CustomTheme,
  DashboardWidget,
  KeyboardShortcut,
  BiometricSettings,
  QRCodeSettings,
  NFCSettings,
  TwoFactorSettings,
  VoiceCommandSettings,
  AccessibilitySettings,
  UsageStatistics,
  SystemPerformance,
  PerformanceAlert,
  DatabaseOptimization,
  OptimizationSettings,
} from '@/types/usability';

const DEFAULT_THEME: CustomTheme = {
  id: 'default',
  name: 'ڕووکاری بنەڕەتی',
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  fontSize: 'medium',
  darkMode: false,
};

const DARK_THEME: CustomTheme = {
  id: 'dark',
  name: 'ڕووکاری تاریک',
  colors: {
    primary: '#60A5FA',
    secondary: '#A78BFA',
    accent: '#F472B6',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
  fontSize: 'medium',
  darkMode: true,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'kurdish',
  theme: DEFAULT_THEME,
  dashboardWidgets: [],
  shortcuts: [],
  biometric: {
    touchIdEnabled: false,
    faceIdEnabled: false,
  },
  qrCode: {
    enableLogin: true,
    enablePayment: true,
    enableDebt: false,
    expiryMinutes: 5,
  },
  nfc: {
    enablePayment: false,
    enableVerification: false,
  },
  twoFactor: {
    enabled: false,
    method: 'sms',
  },
  voiceCommands: {
    enabled: false,
    language: 'kurdish',
    commands: [],
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    voiceCommands: false,
    hapticFeedback: true,
  },
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
  },
};

const DEFAULT_OPTIMIZATION_SETTINGS: OptimizationSettings = {
  autoOptimize: true,
  optimizeSchedule: 'weekly',
  optimizeTime: '02:00',
  cleanupOldData: true,
  dataRetentionDays: 365,
  compressBackups: true,
};

export const [UsabilityProvider, useUsability] = createContextHook(() => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>(DEFAULT_OPTIMIZATION_SETTINGS);
  const [usageStats, setUsageStats] = useState<UsageStatistics[]>([]);
  const [performanceData, setPerformanceData] = useState<SystemPerformance[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [optimizations, setOptimizations] = useState<DatabaseOptimization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const loadData = async () => {
      try {
        const [storedPrefs, storedOptSettings, storedStats, storedPerf, storedAlerts, storedOpts] = await Promise.all([
          safeStorage.getItem<UserPreferences>('userPreferences'),
          safeStorage.getItem<OptimizationSettings>('optimizationSettings'),
          safeStorage.getItem<UsageStatistics[]>('usageStatistics'),
          safeStorage.getItem<SystemPerformance[]>('performanceData'),
          safeStorage.getItem<PerformanceAlert[]>('performanceAlerts'),
          safeStorage.getItem<DatabaseOptimization[]>('optimizations'),
        ]);

        if (storedPrefs) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...storedPrefs });
        }
        if (storedOptSettings) {
          setOptimizationSettings({ ...DEFAULT_OPTIMIZATION_SETTINGS, ...storedOptSettings });
        }
        if (storedStats) {
          setUsageStats(storedStats);
        }
        if (storedPerf) {
          setPerformanceData(storedPerf);
        }
        if (storedAlerts) {
          setPerformanceAlerts(storedAlerts);
        }
        if (storedOpts) {
          setOptimizations(storedOpts);
        }
      } catch (error) {
        console.error('Error loading usability data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadData, Platform.OS === 'web' ? 10 : 0);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...updates };
    setPreferences(updated);
    safeStorage.setItem('userPreferences', updated);
  }, [preferences]);

  const changeLanguage = useCallback(async (language: 'kurdish' | 'english' | 'arabic') => {
    await updatePreferences({ language });
  }, [updatePreferences]);

  const changeTheme = useCallback(async (theme: CustomTheme) => {
    await updatePreferences({ theme });
  }, [updatePreferences]);

  const toggleDarkMode = useCallback(async () => {
    const newTheme = preferences.theme.darkMode ? DEFAULT_THEME : DARK_THEME;
    await changeTheme(newTheme);
  }, [preferences.theme.darkMode, changeTheme]);

  const changeFontSize = useCallback(async (fontSize: 'small' | 'medium' | 'large' | 'extra-large') => {
    const updatedTheme = { ...preferences.theme, fontSize };
    await changeTheme(updatedTheme);
  }, [preferences.theme, changeTheme]);

  const updateDashboardWidgets = useCallback(async (widgets: DashboardWidget[]) => {
    await updatePreferences({ dashboardWidgets: widgets });
  }, [updatePreferences]);

  const updateShortcuts = useCallback(async (shortcuts: KeyboardShortcut[]) => {
    await updatePreferences({ shortcuts });
  }, [updatePreferences]);

  const updateBiometric = useCallback(async (biometric: Partial<BiometricSettings>) => {
    const updated = { ...preferences.biometric, ...biometric };
    await updatePreferences({ biometric: updated });
  }, [preferences.biometric, updatePreferences]);

  const updateQRCode = useCallback(async (qrCode: Partial<QRCodeSettings>) => {
    const updated = { ...preferences.qrCode, ...qrCode };
    await updatePreferences({ qrCode: updated });
  }, [preferences.qrCode, updatePreferences]);

  const updateNFC = useCallback(async (nfc: Partial<NFCSettings>) => {
    const updated = { ...preferences.nfc, ...nfc };
    await updatePreferences({ nfc: updated });
  }, [preferences.nfc, updatePreferences]);

  const updateTwoFactor = useCallback(async (twoFactor: Partial<TwoFactorSettings>) => {
    const updated = { ...preferences.twoFactor, ...twoFactor };
    await updatePreferences({ twoFactor: updated });
  }, [preferences.twoFactor, updatePreferences]);

  const updateVoiceCommands = useCallback(async (voiceCommands: Partial<VoiceCommandSettings>) => {
    const updated = { ...preferences.voiceCommands, ...voiceCommands };
    await updatePreferences({ voiceCommands: updated });
  }, [preferences.voiceCommands, updatePreferences]);

  const updateAccessibility = useCallback(async (accessibility: Partial<AccessibilitySettings>) => {
    const updated = { ...preferences.accessibility, ...accessibility };
    await updatePreferences({ accessibility: updated });
  }, [preferences.accessibility, updatePreferences]);

  const trackUsage = useCallback(async (userId: string, userName: string, feature: string, duration: number) => {
    const existingStats = usageStats.find(s => s.userId === userId);
    
    if (existingStats) {
      const updatedStats = usageStats.map(s => {
        if (s.userId === userId) {
          const featureIndex = s.mostUsedFeatures.findIndex(f => f.feature === feature);
          const updatedFeatures = [...s.mostUsedFeatures];
          
          if (featureIndex >= 0) {
            updatedFeatures[featureIndex] = {
              ...updatedFeatures[featureIndex],
              count: updatedFeatures[featureIndex].count + 1,
              time: updatedFeatures[featureIndex].time + duration,
            };
          } else {
            updatedFeatures.push({ feature, count: 1, time: duration });
          }

          return {
            ...s,
            totalTime: s.totalTime + duration,
            activeTime: s.activeTime + duration,
            mostUsedFeatures: updatedFeatures.sort((a, b) => b.count - a.count).slice(0, 10),
          };
        }
        return s;
      });
      
      setUsageStats(updatedStats);
      safeStorage.setItem('usageStatistics', updatedStats);
    } else {
      const newStats: UsageStatistics = {
        userId,
        userName,
        totalTime: duration,
        activeTime: duration,
        idleTime: 0,
        sessionsCount: 1,
        averageSessionDuration: duration,
        mostUsedFeatures: [{ feature, count: 1, time: duration }],
        byDate: [{ date: new Date().toISOString().split('T')[0], time: duration, sessions: 1 }],
      };
      
      const updatedStats = [...usageStats, newStats];
      setUsageStats(updatedStats);
      safeStorage.setItem('usageStatistics', updatedStats);
    }
  }, [usageStats]);

  const recordPerformance = useCallback(async (performance: SystemPerformance) => {
    const updated = [...performanceData, performance].slice(-100);
    setPerformanceData(updated);
    safeStorage.setItem('performanceData', updated);

    if (performance.status === 'warning' || performance.status === 'critical') {
      const alert: PerformanceAlert = {
        id: Date.now().toString(),
        type: performance.responseTime > 1000 ? 'slow_response' : 'high_storage',
        severity: performance.status === 'critical' ? 'critical' : 'medium',
        message: `کێشەی کارایی: ${performance.status === 'critical' ? 'گرنگ' : 'ئاگاداری'}`,
        timestamp: performance.timestamp,
        resolved: false,
      };
      
      const updatedAlerts = [...performanceAlerts, alert];
      setPerformanceAlerts(updatedAlerts);
      safeStorage.setItem('performanceAlerts', updatedAlerts);
    }
  }, [performanceData, performanceAlerts]);

  const runOptimization = useCallback(async (type: DatabaseOptimization['type']) => {
    const optimization: DatabaseOptimization = {
      id: Date.now().toString(),
      type,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    const updated = [...optimizations, optimization];
    setOptimizations(updated);
    safeStorage.setItem('optimizations', updated);

    setTimeout(() => {
      const completed: DatabaseOptimization = {
        ...optimization,
        status: 'completed',
        completedAt: new Date().toISOString(),
        duration: Math.floor(Math.random() * 5000) + 1000,
        itemsProcessed: Math.floor(Math.random() * 1000) + 100,
        spaceFreed: Math.floor(Math.random() * 10000000) + 1000000,
      };

      const updatedOpts = optimizations.map(o => o.id === optimization.id ? completed : o);
      setOptimizations(updatedOpts);
      safeStorage.setItem('optimizations', updatedOpts);
    }, 3000);
  }, [optimizations]);

  const updateOptimizationSettings = useCallback(async (updates: Partial<OptimizationSettings>) => {
    const updated = { ...optimizationSettings, ...updates };
    setOptimizationSettings(updated);
    safeStorage.setItem('optimizationSettings', updated);
  }, [optimizationSettings]);

  const resolveAlert = useCallback(async (alertId: string) => {
    const updated = performanceAlerts.map(a => 
      a.id === alertId ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a
    );
    setPerformanceAlerts(updated);
    safeStorage.setItem('performanceAlerts', updated);
  }, [performanceAlerts]);

  return useMemo(() => ({
    preferences,
    optimizationSettings,
    usageStats,
    performanceData,
    performanceAlerts,
    optimizations,
    isLoading: isLoading || !isHydrated,
    updatePreferences,
    changeLanguage,
    changeTheme,
    toggleDarkMode,
    changeFontSize,
    updateDashboardWidgets,
    updateShortcuts,
    updateBiometric,
    updateQRCode,
    updateNFC,
    updateTwoFactor,
    updateVoiceCommands,
    updateAccessibility,
    trackUsage,
    recordPerformance,
    runOptimization,
    updateOptimizationSettings,
    resolveAlert,
  }), [
    preferences,
    optimizationSettings,
    usageStats,
    performanceData,
    performanceAlerts,
    optimizations,
    isLoading,
    isHydrated,
    updatePreferences,
    changeLanguage,
    changeTheme,
    toggleDarkMode,
    changeFontSize,
    updateDashboardWidgets,
    updateShortcuts,
    updateBiometric,
    updateQRCode,
    updateNFC,
    updateTwoFactor,
    updateVoiceCommands,
    updateAccessibility,
    trackUsage,
    recordPerformance,
    runOptimization,
    updateOptimizationSettings,
    resolveAlert,
  ]);
});
