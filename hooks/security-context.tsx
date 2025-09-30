import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { 
  LoginAttempt, 
  ActivityLog, 
  UserSession, 
  SecuritySettings,
  TwoFactorAuth,
  SecurityAlert,
  DigitalSignature,
  PasswordPolicy,
  IpWhitelist
} from '@/types/auth';
import { safeStorage } from '@/utils/storage';
import { useAuth } from './auth-context';

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  maxFailedAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 600,
  twoFactorRequired: false,
  maxDevicesPerUser: 3,
  passwordMinLength: 8,
  requirePasswordChange: true,
  passwordChangeInterval: 90,
  autoLockOnInactivity: true,
  inactivityLockTimeout: 10,
  requireStrongPassword: true,
  allowUnknownIpLogin: false,
  enableDigitalSignature: true,
};

export const [SecurityProvider, useSecurity] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user || null;
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');
  const [twoFactorAuth, setTwoFactorAuth] = useState<TwoFactorAuth | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [digitalSignatures, setDigitalSignatures] = useState<DigitalSignature[]>([]);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 5,
  });
  const [ipWhitelist, setIpWhitelist] = useState<IpWhitelist[]>([]);

  // Handle web hydration
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Ensure we're in browser environment before accessing localStorage
      if (typeof window !== 'undefined') {
        setIsHydrated(true);
      }
    }
  }, []);

  // Load stored data
  useEffect(() => {
    // Don't load data until hydration is complete on web
    if (Platform.OS === 'web' && !isHydrated) {
      return;
    }

    const loadStoredData = async () => {
      try {
        const storedSettings = await safeStorage.getItem<SecuritySettings>('securitySettings');
        if (storedSettings) {
          setSecuritySettings(storedSettings);
        }

        const storedAttempts = await safeStorage.getItem<LoginAttempt[]>('loginAttempts', []);
        if (storedAttempts) {
          setLoginAttempts(storedAttempts);
        }

        const storedLogs = await safeStorage.getItem<ActivityLog[]>('activityLogs', []);
        if (storedLogs) {
          setActivityLogs(storedLogs);
        }

        const storedSessions = await safeStorage.getItem<UserSession[]>('userSessions', []);
        if (storedSessions) {
          setUserSessions(storedSessions);
        }
      } catch (error) {
        console.error('Security: Error loading stored data:', error);
      }
    };

    const timer = setTimeout(loadStoredData, Platform.OS === 'web' ? 10 : 0);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  // Get device info (simplified for demo)
  const getDeviceInfo = useCallback(() => {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      deviceId,
      userAgent: Platform.OS === 'web' ? (typeof navigator !== 'undefined' ? navigator.userAgent : 'Web App') : `${Platform.OS} App`,
      ipAddress: '127.0.0.1', // In real app, get from server
    };
  }, []);

  // Record login attempt
  const recordLoginAttempt = useCallback((phone: string, success: boolean, failureReason?: string) => {
    const deviceInfo = getDeviceInfo();
    const attempt: LoginAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phone,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      success,
      attemptAt: new Date().toISOString(),
      failureReason,
    };

    const updatedAttempts = [attempt, ...loginAttempts].slice(0, 1000); // Keep last 1000
    setLoginAttempts(updatedAttempts);
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('loginAttempts', updatedAttempts);

    console.log('Security: Login attempt recorded:', { phone, success, failureReason });
  }, [loginAttempts, getDeviceInfo]);



  // Create user session
  const createUserSession = useCallback((userId: string) => {
    const deviceInfo = getDeviceInfo();
    const session: UserSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      deviceId: deviceInfo.deviceId,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      loginAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      isActive: true,
    };

    // Remove old sessions for this user if exceeding max devices
    const userActiveSessions = userSessions.filter(s => s.userId === userId && s.isActive);
    let updatedSessions = [...userSessions];
    
    if (userActiveSessions.length >= securitySettings.maxDevicesPerUser) {
      // Deactivate oldest session
      const oldestSession = userActiveSessions.sort((a, b) => 
        new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime()
      )[0];
      
      updatedSessions = updatedSessions.map(s => 
        s.id === oldestSession.id ? { ...s, isActive: false } : s
      );
    }

    updatedSessions = [session, ...updatedSessions];
    setUserSessions(updatedSessions);
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('userSessions', updatedSessions);

    console.log('Security: User session created:', session.id);
    return session;
  }, [userSessions, securitySettings, getDeviceInfo]);

  // Update session activity
  const updateSessionActivity = useCallback(() => {
    if (!user) return;

    const deviceInfo = getDeviceInfo();
    const currentTime = new Date().toISOString();
    
    const updatedSessions = userSessions.map(session => {
      if (session.userId === user.id && session.deviceId === deviceInfo.deviceId && session.isActive) {
        return { ...session, lastActivityAt: currentTime };
      }
      return session;
    });

    setUserSessions(updatedSessions);
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('userSessions', updatedSessions);
    setLastActivity(new Date());
  }, [user, userSessions, getDeviceInfo]);

  // End user session
  const endUserSession = useCallback((sessionId?: string) => {
    if (!user) return;

    const deviceInfo = getDeviceInfo();
    const updatedSessions = userSessions.map(session => {
      if (sessionId) {
        return session.id === sessionId ? { ...session, isActive: false } : session;
      } else {
        // End current device session
        return (session.userId === user.id && session.deviceId === deviceInfo.deviceId) 
          ? { ...session, isActive: false } 
          : session;
      }
    });

    setUserSessions(updatedSessions);
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('userSessions', updatedSessions);

    console.log('Security: User session ended:', sessionId || 'current');
  }, [user, userSessions, getDeviceInfo]);

  // Log user activity
  const logActivity = useCallback((action: string, details: string, resourceType?: string, resourceId?: string) => {
    if (!user) return;

    const deviceInfo = getDeviceInfo();
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      action,
      details,
      ipAddress: deviceInfo.ipAddress,
      timestamp: new Date().toISOString(),
      resourceType,
      resourceId,
    };

    const updatedLogs = [log, ...activityLogs].slice(0, 5000); // Keep last 5000
    setActivityLogs(updatedLogs);
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('activityLogs', updatedLogs);

    console.log('Security: Activity logged:', { action, details });
  }, [user, activityLogs, getDeviceInfo]);

  // Update security settings
  const updateSecuritySettings = useCallback((newSettings: Partial<SecuritySettings>) => {
    if (!newSettings || Object.keys(newSettings).length === 0) {
      console.warn('Security: No settings provided for update');
      return;
    }
    
    const updated = { ...securitySettings, ...newSettings };
    setSecuritySettings(updated);
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('securitySettings', updated);
    
    logActivity('SECURITY_SETTINGS_UPDATED', `Updated: ${Object.keys(newSettings).join(', ')}`);
  }, [securitySettings, logActivity]);

  // Get user sessions for admin
  const getUserSessions = useCallback((userId?: string) => {
    if (userId) {
      return userSessions.filter(s => s.userId === userId);
    }
    return userSessions;
  }, [userSessions]);

  // Get activity logs for admin
  const getActivityLogs = useCallback((userId?: string, limit: number = 100) => {
    let logs = activityLogs;
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    return logs.slice(0, limit);
  }, [activityLogs]);

  // Check session timeout
  useEffect(() => {
    if (!user || (Platform.OS === 'web' && !isHydrated)) return;

    const checkTimeout = () => {
      const timeSinceLastActivity = Date.now() - lastActivity.getTime();
      const timeoutMs = securitySettings.sessionTimeout * 60 * 1000;
      
      if (timeSinceLastActivity > timeoutMs) {
        console.log('Security: Session timeout, logging out');
        endUserSession();
        // The auth context should handle the actual logout
        return;
      }

      // Show warning at 80% of timeout
      if (timeSinceLastActivity > timeoutMs * 0.8 && !sessionWarningShown) {
        setSessionWarningShown(true);
        console.log('Security: Session timeout warning');
      }
    };

    const interval = setInterval(checkTimeout, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user, lastActivity, securitySettings, sessionWarningShown, endUserSession, isHydrated]);

  // Reset session warning when activity is detected
  useEffect(() => {
    if (sessionWarningShown) {
      setSessionWarningShown(false);
    }
  }, [lastActivity, sessionWarningShown]);

  const enable2FA = useCallback((userId: string, method: 'sms' | 'email') => {
    const newAuth: TwoFactorAuth = {
      userId,
      enabled: true,
      method,
      secret: Math.random().toString(36).substring(2, 15),
      backupCodes: Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      ),
      verifiedAt: new Date().toISOString(),
    };
    setTwoFactorAuth(newAuth);
    logActivity('2FA_ENABLED', `تایبەتمەندی دوو هەنگاو چالاک کرا بە ${method}`);
    return newAuth;
  }, [logActivity]);

  const disable2FA = useCallback((userId: string) => {
    setTwoFactorAuth(null);
    logActivity('2FA_DISABLED', 'تایبەتمەندی دوو هەنگاو ناچالاک کرا');
  }, [logActivity]);

  const addSecurityAlert = useCallback((alert: Omit<SecurityAlert, 'id'>) => {
    const newAlert: SecurityAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setSecurityAlerts(prev => [newAlert, ...prev]);
    return newAlert;
  }, []);

  const resolveSecurityAlert = useCallback((alertId: string, resolvedBy: string) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy }
        : alert
    ));
  }, []);

  const addDigitalSignature = useCallback((signature: Omit<DigitalSignature, 'id'>) => {
    const newSignature: DigitalSignature = {
      ...signature,
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setDigitalSignatures(prev => [newSignature, ...prev]);
    return newSignature;
  }, []);

  const updatePasswordPolicy = useCallback((policy: Partial<PasswordPolicy>) => {
    setPasswordPolicy(prev => ({ ...prev, ...policy }));
    logActivity('PASSWORD_POLICY_UPDATED', 'سیاسەتی وشەی تێپەڕ نوێ کرایەوە');
  }, [logActivity]);

  const addIpToWhitelist = useCallback((ip: Omit<IpWhitelist, 'id'>) => {
    const newEntry: IpWhitelist = {
      ...ip,
      id: `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setIpWhitelist(prev => [newEntry, ...prev]);
    logActivity('IP_WHITELISTED', `IP زیادکرا بۆ لیستی سپی: ${ip.ipAddress}`);
    return newEntry;
  }, [logActivity]);

  const removeIpFromWhitelist = useCallback((ipId: string) => {
    setIpWhitelist(prev => prev.filter(ip => ip.id !== ipId));
    logActivity('IP_REMOVED', 'IP لابرا لە لیستی سپی');
  }, [logActivity]);

  return useMemo(() => ({
    securitySettings,
    loginAttempts,
    activityLogs,
    userSessions,
    lastActivity,
    sessionWarningShown,
    twoFactorAuth,
    securityAlerts,
    digitalSignatures,
    passwordPolicy,
    ipWhitelist,
    recordLoginAttempt,
    createUserSession,
    updateSessionActivity,
    endUserSession,
    logActivity,
    updateSecuritySettings,
    getUserSessions,
    getActivityLogs,
    enable2FA,
    disable2FA,
    addSecurityAlert,
    resolveSecurityAlert,
    addDigitalSignature,
    updatePasswordPolicy,
    addIpToWhitelist,
    removeIpFromWhitelist,
  }), [
    securitySettings,
    loginAttempts,
    activityLogs,
    userSessions,
    lastActivity,
    sessionWarningShown,
    twoFactorAuth,
    securityAlerts,
    digitalSignatures,
    passwordPolicy,
    ipWhitelist,
    recordLoginAttempt,
    createUserSession,
    updateSessionActivity,
    endUserSession,
    logActivity,
    updateSecuritySettings,
    getUserSessions,
    getActivityLogs,
    enable2FA,
    disable2FA,
    addSecurityAlert,
    resolveSecurityAlert,
    addDigitalSignature,
    updatePasswordPolicy,
    addIpToWhitelist,
    removeIpFromWhitelist,
  ]);
});