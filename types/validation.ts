export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
  validatedBy: string;
}

export interface ValidationError {
  id: string;
  type: 'debt' | 'payment' | 'customer' | 'employee' | 'auth' | 'report' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details: string;
  resourceId?: string;
  timestamp: string;
}

export interface ValidationWarning {
  id: string;
  type: string;
  message: string;
  details: string;
  resourceId?: string;
  timestamp: string;
}

export interface SystemValidationReport {
  id: string;
  reportDate: string;
  overallStatus: 'healthy' | 'warning' | 'critical';
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  categories: ValidationCategory[];
  generatedBy: string;
  generatedAt: string;
}

export interface ValidationCategory {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: string;
  timestamp: string;
}

export interface DebtValidation {
  totalDebts: number;
  validDebts: number;
  invalidDebts: number;
  duplicateDebts: number;
  inconsistentAmounts: number;
  missingData: number;
  errors: ValidationError[];
}

export interface PaymentValidation {
  totalPayments: number;
  validPayments: number;
  invalidPayments: number;
  duplicatePayments: number;
  inconsistentAmounts: number;
  orphanedPayments: number;
  errors: ValidationError[];
}

export interface CustomerValidation {
  totalCustomers: number;
  validCustomers: number;
  invalidCustomers: number;
  duplicateCustomers: number;
  missingRequiredData: number;
  inconsistentData: number;
  errors: ValidationError[];
}

export interface EmployeeValidation {
  totalEmployees: number;
  validEmployees: number;
  invalidEmployees: number;
  duplicateEmployees: number;
  missingPermissions: number;
  inactiveAccounts: number;
  errors: ValidationError[];
}

export interface AuthValidation {
  totalUsers: number;
  validUsers: number;
  weakPasswords: number;
  expiredSessions: number;
  suspiciousLogins: number;
  lockedAccounts: number;
  errors: ValidationError[];
}

export interface DataBackupValidation {
  lastBackupDate: string;
  backupSize: number;
  backupStatus: 'success' | 'failed' | 'partial';
  backupLocation: string;
  isValid: boolean;
  errors: ValidationError[];
}

export interface SettingsValidation {
  totalSettings: number;
  validSettings: number;
  invalidSettings: number;
  missingSettings: number;
  conflictingSettings: number;
  errors: ValidationError[];
}

export interface ReportValidation {
  totalReports: number;
  validReports: number;
  invalidReports: number;
  dataInconsistencies: number;
  calculationErrors: number;
  errors: ValidationError[];
}

export interface ValidationStats {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  lastValidationDate: string;
  averageValidationTime: number;
  criticalErrorsFound: number;
  warningsFound: number;
}

export interface AutoValidationSettings {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  notifyOnError: boolean;
  notifyOnWarning: boolean;
  autoFixEnabled: boolean;
  categories: string[];
}
