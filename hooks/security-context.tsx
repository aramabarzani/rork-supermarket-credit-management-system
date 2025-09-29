import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { 
  LoginAttempt, 
  ActivityLog, 
  UserSession, 
  SecuritySettings 
} from '@/types/auth';
import { safeStorage } from '@/utils/storage';
import { useAuth } from './auth-context';

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  maxFailedAttempts: 5,
  lockoutDuration: 30, // 30 minutes
  sessionTimeout: 600, // 10 minutes
  twoFactorRequired: false,
  maxDevicesPerUser: 3,
  passwordMinLength: 6,
  requirePasswordChange: false,
  passwordChangeInterval: 90, // 90 days
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

  // Check if user is locked
  const isUserLocked = useCallback((phone: string): boolean => {
    const recentAttempts = loginAttempts.filter(
      attempt => 
        attempt.phone === phone && 
        !attempt.success &&
        new Date(attempt.attemptAt).getTime() > Date.now() - (securitySettings.lockoutDuration * 60 * 1000)
    );

    return recentAttempts.length >= securitySettings.maxFailedAttempts;
  }, [loginAttempts, securitySettings]);

  // Get failed attempts count
  const getFailedAttemptsCount = useCallback((phone: string): number => {
    const recentAttempts = loginAttempts.filter(
      attempt => 
        attempt.phone === phone && 
        !attempt.success &&
        new Date(attempt.attemptAt).getTime() > Date.now() - (securitySettings.lockoutDuration * 60 * 1000)
    );

    return recentAttempts.length;
  }, [loginAttempts, securitySettings]);

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

  return useMemo(() => ({
    securitySettings,
    loginAttempts,
    activityLogs,
    userSessions,
    lastActivity,
    sessionWarningShown,
    recordLoginAttempt,
    isUserLocked,
    getFailedAttemptsCount,
    createUserSession,
    updateSessionActivity,
    endUserSession,
    logActivity,
    updateSecuritySettings,
    getUserSessions,
    getActivityLogs,
  }), [
    securitySettings,
    loginAttempts,
    activityLogs,
    userSessions,
    lastActivity,
    sessionWarningShown,
    recordLoginAttempt,
    isUserLocked,
    getFailedAttemptsCount,
    createUserSession,
    updateSessionActivity,
    endUserSession,
    logActivity,
    updateSecuritySettings,
    getUserSessions,
    getActivityLogs,
  ]);
});