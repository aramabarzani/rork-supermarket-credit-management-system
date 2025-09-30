import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { User, LoginCredentials } from '@/types/auth';
import { safeStorage } from '@/utils/storage';
import { PERMISSIONS, DEFAULT_EMPLOYEE_PERMISSIONS } from '@/constants/permissions';
import { useLocationTracking } from '@/hooks/location-tracking-context';

const DEMO_USERS: User[] = [
  {
    id: 'owner',
    name: 'خاوەندار',
    phone: '07501111111',
    role: 'owner',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: Object.values(PERMISSIONS).map(p => ({ id: p, name: p, code: p, description: '' })),
    password: 'owner123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 10,
    currentSessions: [],
  },
  {
    id: 'admin',
    name: 'بەڕێوەبەر',
    phone: '07501234567',
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.MANAGE_LICENSE).map(p => ({ id: p, name: p, code: p, description: '' })),
    password: 'admin123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 5,
    currentSessions: [],
  },
  {
    id: 'employee-1',
    name: 'کارمەند یەک',
    phone: '07509876543',
    role: 'employee',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: DEFAULT_EMPLOYEE_PERMISSIONS.map(p => ({ id: p, name: p, code: p, description: '' })),
    password: 'employee123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 3,
    currentSessions: [],
    isStarEmployee: true,
  },
  {
    id: 'customer-1',
    name: 'ئەحمەد محەمەد',
    phone: '07701234567',
    role: 'customer',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: [],
    password: 'customer123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 2,
    currentSessions: [],
    address: 'هەولێر، شەقامی ٦٠ مەتری، ژمارە ١٢٣',
    nationalId: '1234567890123',
    email: 'ahmad.mohammed@example.com',
    customerGroup: 'family',
    customerRating: 'good',
    onTimePayments: 8,
    latePayments: 2,
  },
];

export const [AuthProvider, useAuth] = createContextHook(() => {
  const locationTracking = useLocationTracking();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);

  // Handle web hydration - ensure this runs only on client side
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Ensure we're in browser environment before accessing localStorage
      if (typeof window !== 'undefined') {
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    // Don't load auth until hydration is complete
    if (!isHydrated) {
      return;
    }

    console.log('AuthProvider: Loading stored auth...');
    
    const loadAuth = async () => {
      try {
        const storedUser = await safeStorage.getItem<User>('user');
        if (storedUser && storedUser.id && storedUser.name) {
          console.log('AuthProvider: Found stored user:', storedUser.name);
          setUser(storedUser);
        } else {
          console.log('AuthProvider: No stored user, user must login');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthProvider: Error loading stored user:', error);
        setUser(null);
      } finally {
        console.log('AuthProvider: Setting isLoading to false');
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Immediate load on native, small delay on web
    const timer = setTimeout(loadAuth, Platform.OS === 'web' ? 10 : 0);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('AuthProvider: Login attempt for:', credentials.phone);
      
      let allUsers: User[] = [];
      try {
        const storedUsers = await safeStorage.getItem<User[]>('users', null);
        if (storedUsers && Array.isArray(storedUsers) && storedUsers.length > 0) {
          console.log('AuthProvider: Loaded users from storage:', storedUsers.length);
          allUsers = storedUsers;
        } else {
          console.log('AuthProvider: No stored users, initializing with demo users');
          allUsers = [...DEMO_USERS];
          await safeStorage.setItem('users', allUsers);
        }
      } catch (error) {
        console.error('AuthProvider: Error loading users:', error);
        console.log('AuthProvider: Using demo users');
        allUsers = [...DEMO_USERS];
        await safeStorage.setItem('users', allUsers);
      }
      
      const foundUser = allUsers.find(
        u => u.phone === credentials.phone && u.password === credentials.password
      );
      
      if (foundUser) {
        if (!foundUser.isActive) {
          console.log('AuthProvider: User account is inactive');
          return { success: false, error: 'حسابەکەت ناچالاککراوە. پەیوەندی بە بەڕێوەبەر بکە' };
        }
        
        if (foundUser.lockedUntil && new Date(foundUser.lockedUntil) > new Date()) {
          console.log('AuthProvider: User account is locked');
          return { success: false, error: 'حسابەکەت قەدەغەکراوە. دواتر هەوڵ بدەرەوە' };
        }
        
        console.log('AuthProvider: Login successful for:', foundUser.name);
        const updatedUser = {
          ...foundUser,
          lastLoginAt: new Date().toISOString(),
          failedLoginAttempts: 0,
        };
        setUser(updatedUser);
        
        if (locationTracking?.recordLoginActivity) {
          const activity = await locationTracking.recordLoginActivity(
            foundUser.id,
            foundUser.name,
            foundUser.role
          );
          if (activity) {
            setCurrentActivityId(activity.id);
          }
        }
        
        safeStorage.setItem('user', updatedUser);
        
        const updatedUsers = allUsers.map(u => 
          u.id === foundUser.id ? updatedUser : u
        );
        safeStorage.setItem('users', updatedUsers);
        
        return { success: true };
      }
      
      console.log('AuthProvider: Invalid credentials');
      return { success: false, error: 'ژمارەی مۆبایل یان وشەی نهێنی هەڵەیە' };
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە' };
    }
  }, [locationTracking]);

  const logout = useCallback(async () => {
    try {
      console.log('AuthProvider: Logging out');
      
      if (currentActivityId && locationTracking?.recordLogoutActivity) {
        await locationTracking.recordLogoutActivity(currentActivityId);
      }
      
      setUser(null);
      setCurrentActivityId(null);
      
      safeStorage.removeItem('user');
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
    }
  }, [currentActivityId, locationTracking]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!isInitialized || !user) return false;
    if (user.role === 'owner') return true;
    if (user.role === 'admin') return true;
    return user.permissions?.some(p => p.code === permission) || false;
  }, [user, isInitialized]);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('user', updatedUser);
  }, [user]);

  return useMemo(() => {
    const finalIsLoading = isLoading || !isHydrated;
    const finalIsInitialized = isInitialized && isHydrated;
    
    return {
      user,
      isLoading: finalIsLoading,
      isInitialized: finalIsInitialized,
      login,
      logout,
      hasPermission,
      updateUser,
    };
  }, [user, isLoading, isInitialized, isHydrated, login, logout, hasPermission, updateUser]);
});