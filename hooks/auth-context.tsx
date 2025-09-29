import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { User, LoginCredentials } from '@/types/auth';
import { safeStorage } from '@/utils/storage';

const DEMO_ADMIN: User = {
  id: '1',
  name: 'بەڕێوەبەر',
  phone: '07501234567',
  role: 'admin',
  createdAt: new Date().toISOString(),
  isActive: true,
  permissions: [],
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');

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
          // Auto-login demo admin for testing
          console.log('AuthProvider: Auto-logging in demo admin');
          const demoUser = {
            ...DEMO_ADMIN,
            lastLoginAt: new Date().toISOString(),
            failedLoginAttempts: 0,
          };
          setUser(demoUser);
          // Don't await storage on web to prevent hydration issues
          if (Platform.OS !== 'web') {
            await safeStorage.setItem('user', demoUser);
          } else {
            safeStorage.setItem('user', demoUser); // Fire and forget on web
          }
        }
      } catch (error) {
        console.error('AuthProvider: Error loading stored user:', error);
        // On error, still set demo user to prevent app from being stuck
        const demoUser = {
          ...DEMO_ADMIN,
          lastLoginAt: new Date().toISOString(),
          failedLoginAttempts: 0,
        };
        setUser(demoUser);
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
      
      if (credentials.phone === '07501234567' && credentials.password === 'admin123') {
        console.log('AuthProvider: Demo admin login successful');
        const updatedUser = {
          ...DEMO_ADMIN,
          lastLoginAt: new Date().toISOString(),
          failedLoginAttempts: 0,
        };
        setUser(updatedUser);
        
        // Don't await storage operations to prevent blocking UI
        safeStorage.setItem('user', updatedUser);
        
        return { success: true };
      }
      
      console.log('AuthProvider: Invalid credentials');
      return { success: false, error: 'ژمارەی مۆبایل یان وشەی نهێنی هەڵەیە' };
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('AuthProvider: Logging out');
      setUser(null);
      
      // Don't await storage operations to prevent blocking UI
      safeStorage.removeItem('user');
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!isInitialized || !user) return false;
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