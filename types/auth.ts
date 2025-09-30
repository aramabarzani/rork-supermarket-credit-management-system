export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'owner' | 'admin' | 'employee' | 'customer';
  createdAt: string;
  permissions?: Permission[];
  isActive: boolean;
  password?: string;
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  twoFactorEnabled?: boolean;
  allowedDevices?: number;
  currentSessions?: UserSession[];
  isStarEmployee?: boolean;
  tenantId?: string;
  address?: string;
  nationalId?: string;
  email?: string;
  customerGroup?: string;
  customerRating?: string;
  onTimePayments?: number;
  latePayments?: number;
  lastPaymentDate?: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  createdBy: string;
  isSystem: boolean;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
  otpCode?: string;
  deviceId?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  loginAt: string;
  lastActivityAt: string;
  isActive: boolean;
}

export interface LoginAttempt {
  id: string;
  phone: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  attemptAt: string;
  failureReason?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  resourceType?: string;
  resourceId?: string;
}

export interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  twoFactorRequired: boolean;
  maxDevicesPerUser: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  passwordChangeInterval: number;
  autoLockOnInactivity: boolean;
  inactivityLockTimeout: number;
  requireStrongPassword: boolean;
  allowUnknownIpLogin: boolean;
  enableDigitalSignature: boolean;
}

export interface TwoFactorAuth {
  userId: string;
  enabled: boolean;
  method: 'sms' | 'email';
  secret?: string;
  backupCodes?: string[];
  verifiedAt?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'unknown_ip' | 'multiple_failed_attempts' | 'password_change' | 'security_breach';
  userId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  deviceInfo: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DigitalSignature {
  id: string;
  userId: string;
  documentType: string;
  documentId: string;
  signature: string;
  timestamp: string;
  ipAddress: string;
  verified: boolean;
}

export interface SecurityReport {
  id: string;
  type: 'monthly' | 'annual' | 'custom';
  startDate: string;
  endDate: string;
  totalLogins: number;
  failedLogins: number;
  suspiciousActivities: number;
  securityAlerts: number;
  activeUsers: number;
  generatedAt: string;
  generatedBy: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
  preventReuse: number;
}

