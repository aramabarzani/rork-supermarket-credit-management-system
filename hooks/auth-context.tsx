import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, LoginCredentials, LoginResult } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('[Auth] User loaded from storage:', parsedUser.role);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      console.log('[Auth] Login attempt for role:', credentials.expectedRole || 'any');
      
      let result;
      
      if (credentials.expectedRole === 'owner') {
        result = await trpcClient.owner.login.mutate({
          email: credentials.phone,
          password: credentials.password,
        });
      } else if (credentials.expectedRole === 'admin') {
        result = await trpcClient.admin.login.mutate({
          email: credentials.phone,
          password: credentials.password,
        });
      } else if (credentials.expectedRole === 'employee') {
        result = await trpcClient.staff.login.mutate({
          email: credentials.phone,
          password: credentials.password,
        });
      } else {
        return { 
          success: false, 
          error: 'تکایە جۆری حساب دیاری بکە' 
        };
      }

      if (result.success && result.token) {
        await AsyncStorage.setItem('authToken', result.token);
        
        let userData: User;
        
        if (credentials.expectedRole === 'owner' && 'owner' in result) {
          userData = {
            id: result.owner.id,
            name: result.owner.name,
            phone: result.owner.phone,
            email: result.owner.email,
            role: 'owner',
            isActive: true,
            permissions: [],
            createdAt: new Date().toISOString(),
          };
        } else if (credentials.expectedRole === 'admin' && 'admin' in result) {
          userData = {
            id: result.admin.id,
            name: result.admin.name,
            phone: result.admin.phone,
            email: result.admin.email,
            role: 'admin',
            isActive: true,
            permissions: result.admin.permissions || [],
            createdAt: new Date().toISOString(),
          };
        } else if (credentials.expectedRole === 'employee' && 'staff' in result) {
          userData = {
            id: result.staff.id,
            name: result.staff.name,
            phone: result.staff.phone,
            email: result.staff.email,
            role: 'employee',
            isActive: true,
            permissions: result.staff.permissions || [],
            createdAt: new Date().toISOString(),
          };
        } else {
          return { success: false, error: 'هەڵەیەک ڕوویدا لە وەرگرتنی زانیاری بەکارهێنەر' };
        }
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        console.log('[Auth] Login successful');
        return { success: true, user: userData };
      }

      return { success: false, error: 'زمارەی مۆبایل یان وشەی نهێنی هەڵەیە' };
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      
      if (error?.data?.code === 'UNAUTHORIZED') {
        return { success: false, error: 'زمارەی مۆبایل یان وشەی نهێنی هەڵەیە' };
      }
      
      if (error?.message?.includes('License expired')) {
        return { success: false, error: 'مۆڵەتەکەت بەسەرچووە. تکایە نوێی بکەرەوە' };
      }
      
      return { success: false, error: 'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!isInitialized || !user) return false;
    if (user.role === 'owner' || user.role === 'admin') return true;
    return user.permissions?.some(p => p.code === permission) || false;
  }, [user, isInitialized]);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isInitialized,
    login,
    logout,
    hasPermission,
    updateUser,
  }), [user, isLoading, isInitialized, login, logout, hasPermission, updateUser]);
});