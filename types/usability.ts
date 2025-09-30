export interface LanguageOption {
  code: 'kurdish' | 'english' | 'arabic';
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
}

export interface ThemeColor {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  darkMode: boolean;
  customFont?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stats' | 'list' | 'calendar' | 'quick-actions';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  config?: Record<string, any>;
}

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: string;
  enabled: boolean;
}

export interface BiometricSettings {
  touchIdEnabled: boolean;
  faceIdEnabled: boolean;
  biometricType?: 'touchId' | 'faceId' | 'fingerprint' | 'face';
  lastUsed?: string;
}

export interface QRCodeSettings {
  enableLogin: boolean;
  enablePayment: boolean;
  enableDebt: boolean;
  expiryMinutes: number;
}

export interface NFCSettings {
  enablePayment: boolean;
  enableVerification: boolean;
  maxAmount?: number;
}

export interface TwoFactorSettings {
  enabled: boolean;
  method: 'sms' | 'email' | 'google' | 'microsoft';
  phone?: string;
  email?: string;
  backupCodes?: string[];
  lastVerified?: string;
}

export interface VoiceCommandSettings {
  enabled: boolean;
  language: string;
  commands: {
    id: string;
    phrase: string;
    action: string;
    enabled: boolean;
  }[];
}

export interface UsageStatistics {
  userId: string;
  userName: string;
  totalTime: number;
  activeTime: number;
  idleTime: number;
  sessionsCount: number;
  averageSessionDuration: number;
  mostUsedFeatures: {
    feature: string;
    count: number;
    time: number;
  }[];
  byDate: {
    date: string;
    time: number;
    sessions: number;
  }[];
}

export interface EmployeeActivityStats {
  employeeId: string;
  employeeName: string;
  totalActions: number;
  debtActions: number;
  paymentActions: number;
  customerActions: number;
  activeTime: number;
  idleTime: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface SystemPerformance {
  timestamp: string;
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage: number;
  databaseSize: number;
  responseTime: number;
  activeConnections: number;
  errorRate: number;
  status: 'good' | 'warning' | 'critical';
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_response' | 'high_memory' | 'high_storage' | 'high_error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface DatabaseOptimization {
  id: string;
  type: 'cleanup' | 'index' | 'vacuum' | 'analyze';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  itemsProcessed?: number;
  spaceFreed?: number;
  error?: string;
}

export interface OptimizationSettings {
  autoOptimize: boolean;
  optimizeSchedule: 'daily' | 'weekly' | 'monthly';
  optimizeTime: string;
  cleanupOldData: boolean;
  dataRetentionDays: number;
  compressBackups: boolean;
}

export interface PerformanceReport {
  id: string;
  period: {
    startDate: string;
    endDate: string;
  };
  averageResponseTime: number;
  peakResponseTime: number;
  totalRequests: number;
  errorCount: number;
  errorRate: number;
  uptime: number;
  downtimeMinutes: number;
  optimizations: DatabaseOptimization[];
  alerts: PerformanceAlert[];
  recommendations: string[];
  generatedAt: string;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  voiceCommands: boolean;
  hapticFeedback: boolean;
}

export interface UserPreferences {
  language: 'kurdish' | 'english' | 'arabic';
  theme: CustomTheme;
  dashboardWidgets: DashboardWidget[];
  shortcuts: KeyboardShortcut[];
  biometric: BiometricSettings;
  qrCode: QRCodeSettings;
  nfc: NFCSettings;
  twoFactor: TwoFactorSettings;
  voiceCommands: VoiceCommandSettings;
  accessibility: AccessibilitySettings;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
  };
}
