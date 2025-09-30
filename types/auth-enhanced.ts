export type UserRole = 'owner' | 'admin' | 'employee' | 'customer';
export type UserStatus = 'active' | 'suspended';
export type LicenseStatus = 'valid' | 'expired' | 'revoked';
export type OTPChannel = 'sms' | 'email';

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  last_login_at?: Date;
  last_login_ip?: string;
  created_at: Date;
  updated_at: Date;
}

export interface License {
  id: string;
  owner_user_id: string;
  license_key: string;
  plan: string;
  expires_at: Date;
  status: LicenseStatus;
  created_at: Date;
  updated_at: Date;
}

export interface OTPCode {
  id: string;
  user_id: string;
  code: string;
  channel: OTPChannel;
  expires_at: Date;
  attempts: number;
  used: boolean;
  created_at: Date;
}

export interface LoginAttempt {
  id: string;
  username_or_phone: string;
  ip: string;
  user_agent: string;
  success: boolean;
  reason?: string;
  created_at: Date;
}

export interface IPWhitelist {
  id: string;
  user_id: string;
  ip_cidr: string;
  note?: string;
  active: boolean;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  issued_at: Date;
  expires_at: Date;
  device_fingerprint?: string;
  ip: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface LoginRequest {
  role: UserRole;
  identifier: string;
  password: string;
  captcha?: string;
  ip: string;
  user_agent: string;
  device_fingerprint?: string;
}

export interface LoginResponse {
  success: boolean;
  require_otp?: boolean;
  user_id?: string;
  token?: string;
  expires_at?: Date;
  error?: string;
  error_code?: string;
}

export interface OTPVerifyRequest {
  user_id: string;
  code: string;
  ip: string;
  user_agent: string;
  device_fingerprint?: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  token?: string;
  expires_at?: Date;
  error?: string;
  error_code?: string;
}

export interface AuthConfig {
  AUTH_OTP_CHANNEL: OTPChannel;
  OWNER_IP_WHITELIST: string[];
  SESSION_TTL_OWNER: number;
  SESSION_TTL_ADMIN: number;
  SESSION_TTL_EMPLOYEE: number;
  SESSION_TTL_CUSTOMER: number;
  LOCKOUT_THRESHOLD: number;
  LOCKOUT_WINDOW: number;
  LOCKOUT_DURATION: number;
  CAPTCHA_ENABLED_FOR_ADMIN: boolean;
  OTP_RESEND_COOLDOWN: number;
  OTP_MAX_RESEND: number;
  OTP_EXPIRE_MINUTES: number;
  OTP_MAX_ATTEMPTS: number;
  MAX_CONCURRENT_SESSIONS_OWNER: number;
  MAX_CONCURRENT_SESSIONS_OTHER: number;
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  AUTH_OTP_CHANNEL: 'sms',
  OWNER_IP_WHITELIST: [],
  SESSION_TTL_OWNER: 30 * 60 * 1000,
  SESSION_TTL_ADMIN: 30 * 60 * 1000,
  SESSION_TTL_EMPLOYEE: 20 * 60 * 1000,
  SESSION_TTL_CUSTOMER: 15 * 60 * 1000,
  LOCKOUT_THRESHOLD: 5,
  LOCKOUT_WINDOW: 15 * 60 * 1000,
  LOCKOUT_DURATION: 15 * 60 * 1000,
  CAPTCHA_ENABLED_FOR_ADMIN: true,
  OTP_RESEND_COOLDOWN: 60 * 1000,
  OTP_MAX_RESEND: 2,
  OTP_EXPIRE_MINUTES: 5,
  OTP_MAX_ATTEMPTS: 3,
  MAX_CONCURRENT_SESSIONS_OWNER: 1,
  MAX_CONCURRENT_SESSIONS_OTHER: 3,
};

export interface WhoAmIResponse {
  user: User;
  role: UserRole;
  license_status?: LicenseStatus;
  license_expires_at?: Date;
}
