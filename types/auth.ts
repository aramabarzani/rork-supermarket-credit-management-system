export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'employee' | 'customer';
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
  // Detailed customer information (Requirement 201)
  address?: string;
  nationalId?: string;
  // Customer email for notifications and receipts (Requirement 203)
  email?: string;
  // Customer group classification (Requirement 204)
  customerGroup?: string;
  // Customer rating/level (Requirement 205)
  customerRating?: string;
  // Additional customer metrics for rating calculation
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

export interface LoginCredentials {
  phone: string;
  password: string;
  otpCode?: string;
  deviceId?: string;
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
  lockoutDuration: number; // minutes
  sessionTimeout: number; // minutes
  twoFactorRequired: boolean;
  maxDevicesPerUser: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  passwordChangeInterval: number; // days
}

export interface License {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  expiryDate: string;
  isActive: boolean;
  features: string[];
  maxUsers: number;
  createdAt: string;
}