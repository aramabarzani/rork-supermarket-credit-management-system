export interface ActiveUser {
  id: string;
  name: string;
  role: 'admin' | 'employee' | 'customer';
  loginAt: string;
  lastActivityAt: string;
  currentPage?: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  action: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface LoginRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  loginAt: string;
  logoutAt?: string;
  duration?: number;
  deviceInfo?: string;
  ipAddress?: string;
  success: boolean;
}

export interface LoginStatistics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  byRole: {
    admin: number;
    employee: number;
    customer: number;
  };
  byDate: {
    date: string;
    count: number;
  }[];
}

export interface BackupRecord {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'manual';
  createdAt: string;
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  location?: string;
  error?: string;
}

export interface BackupSettings {
  enableDaily: boolean;
  enableWeekly: boolean;
  enableMonthly: boolean;
  enableYearly: boolean;
  dailyTime: string;
  weeklyDay: number;
  monthlyDay: number;
  yearlyMonth: number;
  yearlyDay: number;
  retentionDays: number;
  autoCleanup: boolean;
}

export interface InactivityAlert {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  lastActivityAt: string;
  inactiveDays: number;
  alertSentAt?: string;
  status: 'pending' | 'sent' | 'resolved';
}

export interface InactivitySettings {
  enableAlerts: boolean;
  inactivityThresholdDays: number;
  alertAdmins: boolean;
  alertUser: boolean;
  autoDisableAfterDays?: number;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'admin' | 'employee' | 'customer';
  createdAt: string;
  createdBy: string;
  filters?: Record<string, any>;
  data?: any;
}

export interface RealtimeStats {
  activeUsers: number;
  todayLogins: number;
  todayActivities: number;
  systemHealth: 'good' | 'warning' | 'critical';
  lastBackup?: string;
  pendingAlerts: number;
}

export interface ImpactAnalysis {
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  totalActions: number;
  debtActions: number;
  paymentActions: number;
  customerActions: number;
  employeeActions: number;
  otherActions: number;
  totalAmount?: number;
  averageAmount?: number;
  period: {
    startDate: string;
    endDate: string;
  };
  performance: 'excellent' | 'good' | 'average' | 'poor';
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ImpactStatistics {
  byRole: {
    admin: ImpactAnalysis[];
    employee: ImpactAnalysis[];
    customer: ImpactAnalysis[];
  };
  topPerformers: ImpactAnalysis[];
  lowPerformers: ImpactAnalysis[];
  totalActions: number;
  totalAmount: number;
  averageActionsPerUser: number;
}

export interface ImpactChart {
  userId: string;
  userName: string;
  data: {
    date: string;
    actions: number;
    amount?: number;
  }[];
}

export interface ImpactFilter {
  startDate?: string;
  endDate?: string;
  city?: string;
  location?: string;
  role?: 'admin' | 'employee' | 'customer';
  minActions?: number;
  maxActions?: number;
}

export interface ImpactReport {
  id: string;
  title: string;
  description: string;
  period: {
    startDate: string;
    endDate: string;
  };
  statistics: ImpactStatistics;
  charts: ImpactChart[];
  generatedAt: string;
  generatedBy: string;
}
