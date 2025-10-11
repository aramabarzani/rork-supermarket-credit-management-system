import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, LoginCredentials, LoginResult } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const foundUser = users.find((u: User) => 
        u.phone === credentials.phone && 
        u.role === credentials.expectedRole
      );
      
      if (!foundUser) {
        return { success: false, error: 'زمارەی مۆبایل یان وشەی نهێنی هەڵەیە' };
      }
      
      if (!foundUser.isActive) {
        return { success: false, error: 'ئەم هەژمارە ڕاگیراوە. پەیوەندی بە بەڕێوەبەر بکە' };
      }
      
      const token = `token_${foundUser.id}_${Date.now()}`;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(foundUser));
      setUser(foundUser);
      
      console.log('[Auth] Login successful');
      return { success: true, user: foundUser };
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
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