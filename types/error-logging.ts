export type ErrorSeverity = 'minor' | 'medium' | 'critical';

export type ErrorCategory = 
  | 'authentication'
  | 'payment'
  | 'debt'
  | 'customer'
  | 'employee'
  | 'report'
  | 'notification'
  | 'system'
  | 'network'
  | 'validation'
  | 'permission'
  | 'database';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  details?: string;
  stackTrace?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  deviceInfo?: {
    platform: string;
    version: string;
    model?: string;
  };
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
  occurrenceCount: number;
  lastOccurrence: Date;
}

export interface ErrorStats {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  resolved: number;
  unresolved: number;
  mostFrequent: ErrorLog[];
  recentErrors: ErrorLog[];
}

export interface ErrorFilter {
  startDate?: Date;
  endDate?: Date;
  severity?: ErrorSeverity[];
  category?: ErrorCategory[];
  resolved?: boolean;
  userId?: string;
  searchQuery?: string;
}

export interface ErrorReport {
  id: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  stats: ErrorStats;
  errors: ErrorLog[];
  recommendations: string[];
}

export interface AutoResolveRule {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  pattern: string;
  action: 'retry' | 'ignore' | 'notify' | 'custom';
  enabled: boolean;
}
