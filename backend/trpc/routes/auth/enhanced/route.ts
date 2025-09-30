import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import type {
  User,
  LoginResponse,
  OTPVerifyResponse,
  WhoAmIResponse,
  UserRole,
  OTPCode,
  Session,
  LoginAttempt,
  IPWhitelist,
  AuditLog,
  License,
} from '@/types/auth-enhanced';
import { DEFAULT_AUTH_CONFIG } from '@/types/auth-enhanced';
import crypto from 'crypto';

const MOCK_USERS: User[] = [
  {
    id: 'owner-1',
    full_name: 'خاوەندار سیستەم',
    username: 'owner',
    email: 'owner@system.com',
    phone: '+9647501234567',
    password_hash: crypto.createHash('sha256').update('owner123').digest('hex'),
    role: 'owner',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'admin-1',
    full_name: 'بەڕێوەبەری سیستەم',
    username: 'admin',
    email: 'admin@system.com',
    phone: '+9647501234568',
    password_hash: crypto.createHash('sha256').update('admin123').digest('hex'),
    role: 'admin',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'employee-1',
    full_name: 'کارمەندی سیستەم',
    username: 'employee',
    email: 'employee@system.com',
    phone: '+9647501234569',
    password_hash: crypto.createHash('sha256').update('employee123').digest('hex'),
    role: 'employee',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'customer-1',
    full_name: 'کڕیاری سیستەم',
    username: 'customer',
    email: 'customer@system.com',
    phone: '+9647501234570',
    password_hash: crypto.createHash('sha256').update('customer123').digest('hex'),
    role: 'customer',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const MOCK_LICENSES: License[] = [
  {
    id: 'license-1',
    owner_user_id: 'owner-1',
    license_key: 'LIC-2025-XXXX-XXXX-XXXX',
    plan: 'Enterprise',
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    status: 'valid',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const MOCK_IP_WHITELIST: IPWhitelist[] = [
  {
    id: 'ip-1',
    user_id: 'owner-1',
    ip_cidr: '127.0.0.1',
    note: 'Localhost',
    active: true,
    created_at: new Date(),
  },
  {
    id: 'ip-2',
    user_id: 'owner-1',
    ip_cidr: '192.168.1.0/24',
    note: 'Local network',
    active: true,
    created_at: new Date(),
  },
];

const MOCK_OTP_CODES: Map<string, OTPCode> = new Map();
const MOCK_SESSIONS: Map<string, Session> = new Map();
const MOCK_LOGIN_ATTEMPTS: LoginAttempt[] = [];
const MOCK_AUDIT_LOGS: AuditLog[] = [];

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function isIPInWhitelist(ip: string, userId: string): boolean {
  const whitelist = MOCK_IP_WHITELIST.filter(
    (w) => w.user_id === userId && w.active
  );

  for (const entry of whitelist) {
    if (entry.ip_cidr.includes('/')) {
      const [network, bits] = entry.ip_cidr.split('/');
      const mask = -1 << (32 - parseInt(bits));
      const ipNum = ipToNumber(ip);
      const networkNum = ipToNumber(network);
      if ((ipNum & mask) === (networkNum & mask)) {
        return true;
      }
    } else {
      if (ip === entry.ip_cidr) {
        return true;
      }
    }
  }

  return false;
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function getRecentFailedAttempts(identifier: string, ip: string): number {
  const windowStart = Date.now() - DEFAULT_AUTH_CONFIG.LOCKOUT_WINDOW;
  return MOCK_LOGIN_ATTEMPTS.filter(
    (attempt) =>
      !attempt.success &&
      (attempt.username_or_phone === identifier || attempt.ip === ip) &&
      new Date(attempt.created_at).getTime() > windowStart
  ).length;
}

function isLockedOut(identifier: string, ip: string): boolean {
  const failedAttempts = getRecentFailedAttempts(identifier, ip);
  return failedAttempts >= DEFAULT_AUTH_CONFIG.LOCKOUT_THRESHOLD;
}

function logLoginAttempt(
  identifier: string,
  ip: string,
  userAgent: string,
  success: boolean,
  reason?: string
): void {
  MOCK_LOGIN_ATTEMPTS.push({
    id: crypto.randomUUID(),
    username_or_phone: identifier,
    ip,
    user_agent: userAgent,
    success,
    reason,
    created_at: new Date(),
  });
}

function logAudit(
  userId: string,
  action: string,
  target?: string,
  metadata?: Record<string, any>
): void {
  MOCK_AUDIT_LOGS.push({
    id: crypto.randomUUID(),
    user_id: userId,
    action,
    target,
    metadata,
    created_at: new Date(),
  });
}

function getSessionTTL(role: UserRole): number {
  switch (role) {
    case 'owner':
      return DEFAULT_AUTH_CONFIG.SESSION_TTL_OWNER;
    case 'admin':
      return DEFAULT_AUTH_CONFIG.SESSION_TTL_ADMIN;
    case 'employee':
      return DEFAULT_AUTH_CONFIG.SESSION_TTL_EMPLOYEE;
    case 'customer':
      return DEFAULT_AUTH_CONFIG.SESSION_TTL_CUSTOMER;
  }
}

function getActiveSessions(userId: string): Session[] {
  return Array.from(MOCK_SESSIONS.values()).filter(
    (s) => s.user_id === userId && new Date(s.expires_at) > new Date()
  );
}

function createSession(
  userId: string,
  role: UserRole,
  ip: string,
  deviceFingerprint?: string
): Session {
  const token = generateToken();
  const ttl = getSessionTTL(role);
  const session: Session = {
    id: crypto.randomUUID(),
    user_id: userId,
    token,
    issued_at: new Date(),
    expires_at: new Date(Date.now() + ttl),
    device_fingerprint: deviceFingerprint,
    ip,
  };

  if (role === 'owner') {
    Array.from(MOCK_SESSIONS.entries()).forEach(([key, s]) => {
      if (s.user_id === userId) {
        MOCK_SESSIONS.delete(key);
      }
    });
  }

  MOCK_SESSIONS.set(token, session);
  return session;
}

export const loginProcedure = publicProcedure
  .input(
    z.object({
      role: z.enum(['owner', 'admin', 'employee', 'customer']),
      identifier: z.string(),
      password: z.string(),
      captcha: z.string().optional(),
      ip: z.string(),
      user_agent: z.string(),
      device_fingerprint: z.string().optional(),
    })
  )
  .mutation(async ({ input }): Promise<LoginResponse> => {
    const { role, identifier, password, ip, user_agent } = input;

    if (isLockedOut(identifier, ip)) {
      logLoginAttempt(identifier, ip, user_agent, false, 'LOCKED_OUT');
      return {
        success: false,
        error: 'auth.locked_try_later',
        error_code: 'LOCKED_OUT',
      };
    }

    const user = MOCK_USERS.find(
      (u) =>
        u.role === role &&
        (u.username === identifier ||
          u.email === identifier ||
          u.phone === identifier) &&
        u.status === 'active'
    );

    if (!user) {
      logLoginAttempt(identifier, ip, user_agent, false, 'USER_NOT_FOUND');
      return {
        success: false,
        error: 'auth.invalid_credentials',
        error_code: 'INVALID_CREDENTIALS',
      };
    }

    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      logLoginAttempt(identifier, ip, user_agent, false, 'INVALID_PASSWORD');
      return {
        success: false,
        error: 'auth.invalid_credentials',
        error_code: 'INVALID_CREDENTIALS',
      };
    }

    if (role === 'owner') {
      if (!isIPInWhitelist(ip, user.id)) {
        logLoginAttempt(identifier, ip, user_agent, false, 'IP_NOT_ALLOWED');
        logAudit(user.id, 'LOGIN_FAILED', 'IP_NOT_ALLOWED', { ip });
        return {
          success: false,
          error: 'auth.ip_not_allowed',
          error_code: 'IP_NOT_ALLOWED',
        };
      }

      const otpCode = generateOTP();
      const otp: OTPCode = {
        id: crypto.randomUUID(),
        user_id: user.id,
        code: otpCode,
        channel: DEFAULT_AUTH_CONFIG.AUTH_OTP_CHANNEL,
        expires_at: new Date(
          Date.now() + DEFAULT_AUTH_CONFIG.OTP_EXPIRE_MINUTES * 60 * 1000
        ),
        attempts: 0,
        used: false,
        created_at: new Date(),
      };

      MOCK_OTP_CODES.set(user.id, otp);

      console.log(`[OTP] کۆدی دڵنیاکردنەوە بۆ ${user.full_name}: ${otpCode}`);

      logAudit(user.id, 'OTP_SENT', 'LOGIN', {
        channel: otp.channel,
        ip,
      });

      return {
        success: true,
        require_otp: true,
        user_id: user.id,
      };
    }

    if (
      role === 'admin' &&
      DEFAULT_AUTH_CONFIG.CAPTCHA_ENABLED_FOR_ADMIN &&
      getRecentFailedAttempts(identifier, ip) >= 3
    ) {
      if (!input.captcha) {
        return {
          success: false,
          error: 'auth.captcha_required',
          error_code: 'CAPTCHA_REQUIRED',
        };
      }
    }

    const session = createSession(
      user.id,
      role,
      ip,
      input.device_fingerprint
    );

    logLoginAttempt(identifier, ip, user_agent, true);
    logAudit(user.id, 'LOGIN_SUCCESS', 'SESSION', { session_id: session.id });

    user.last_login_at = new Date();
    user.last_login_ip = ip;

    return {
      success: true,
      require_otp: false,
      token: session.token,
      expires_at: session.expires_at,
    };
  });

export const verifyOTPProcedure = publicProcedure
  .input(
    z.object({
      user_id: z.string(),
      code: z.string(),
      ip: z.string(),
      user_agent: z.string(),
      device_fingerprint: z.string().optional(),
    })
  )
  .mutation(async ({ input }): Promise<OTPVerifyResponse> => {
    const otp = MOCK_OTP_CODES.get(input.user_id);

    if (!otp || otp.used) {
      return {
        success: false,
        error: 'auth.otp_invalid',
        error_code: 'OTP_INVALID',
      };
    }

    if (new Date() > new Date(otp.expires_at)) {
      return {
        success: false,
        error: 'auth.otp_expired',
        error_code: 'OTP_EXPIRED',
      };
    }

    if (otp.attempts >= DEFAULT_AUTH_CONFIG.OTP_MAX_ATTEMPTS) {
      MOCK_OTP_CODES.delete(input.user_id);
      return {
        success: false,
        error: 'auth.otp_max_attempts',
        error_code: 'OTP_MAX_ATTEMPTS',
      };
    }

    otp.attempts += 1;

    if (otp.code !== input.code) {
      logAudit(input.user_id, 'OTP_VERIFY_FAILED', 'LOGIN', {
        attempts: otp.attempts,
      });
      return {
        success: false,
        error: 'auth.otp_invalid',
        error_code: 'OTP_INVALID',
      };
    }

    otp.used = true;
    MOCK_OTP_CODES.delete(input.user_id);

    const user = MOCK_USERS.find((u) => u.id === input.user_id);
    if (!user) {
      return {
        success: false,
        error: 'auth.user_not_found',
        error_code: 'USER_NOT_FOUND',
      };
    }

    const session = createSession(
      user.id,
      user.role,
      input.ip,
      input.device_fingerprint
    );

    logAudit(user.id, 'OTP_VERIFY_SUCCESS', 'SESSION', {
      session_id: session.id,
    });
    logAudit(user.id, 'LOGIN_SUCCESS', 'SESSION', { session_id: session.id });

    user.last_login_at = new Date();
    user.last_login_ip = input.ip;

    return {
      success: true,
      token: session.token,
      expires_at: session.expires_at,
    };
  });

export const resendOTPProcedure = publicProcedure
  .input(
    z.object({
      user_id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const existingOTP = MOCK_OTP_CODES.get(input.user_id);

    if (existingOTP) {
      const timeSinceCreated =
        Date.now() - new Date(existingOTP.created_at).getTime();
      if (timeSinceCreated < DEFAULT_AUTH_CONFIG.OTP_RESEND_COOLDOWN) {
        return {
          success: false,
          error: 'auth.otp_resend_cooldown',
          error_code: 'OTP_RESEND_COOLDOWN',
        };
      }
    }

    const otpCode = generateOTP();
    const otp: OTPCode = {
      id: crypto.randomUUID(),
      user_id: input.user_id,
      code: otpCode,
      channel: DEFAULT_AUTH_CONFIG.AUTH_OTP_CHANNEL,
      expires_at: new Date(
        Date.now() + DEFAULT_AUTH_CONFIG.OTP_EXPIRE_MINUTES * 60 * 1000
      ),
      attempts: 0,
      used: false,
      created_at: new Date(),
    };

    MOCK_OTP_CODES.set(input.user_id, otp);

    console.log(`[OTP RESEND] کۆدی نوێ: ${otpCode}`);

    logAudit(input.user_id, 'OTP_RESENT', 'LOGIN', {
      channel: otp.channel,
    });

    return {
      success: true,
      message: 'auth.otp_sent',
    };
  });

export const logoutProcedure = protectedProcedure.mutation(async ({ ctx }) => {
  if (ctx.token) {
    MOCK_SESSIONS.delete(ctx.token);
    if (ctx.user) {
      logAudit(ctx.user.id, 'LOGOUT', 'SESSION', { token: ctx.token });
    }
  }

  return { success: true };
});

export const whoamiProcedure = protectedProcedure.query(
  async ({ ctx }): Promise<WhoAmIResponse> => {
    if (!ctx.user) {
      throw new Error('UNAUTHORIZED');
    }
    const user = ctx.user;

    let license_status = undefined;
    let license_expires_at = undefined;

    if (user.role === 'owner') {
      const license = MOCK_LICENSES.find((l) => l.owner_user_id === user.id);
      if (license) {
        license_status = license.status;
        license_expires_at = license.expires_at;
      }
    }

    return {
      user,
      role: user.role,
      license_status,
      license_expires_at,
    };
  }
);

export const getSessionsProcedure = protectedProcedure.query(async ({ ctx }) => {
  if (!ctx.user) {
    throw new Error('UNAUTHORIZED');
  }
  const sessions = getActiveSessions(ctx.user.id);
  return sessions.map((s) => ({
    id: s.id,
    ip: s.ip,
    device_fingerprint: s.device_fingerprint,
    issued_at: s.issued_at,
    expires_at: s.expires_at,
  }));
});
