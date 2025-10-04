import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, LoginCredentials, LoginResult } from '@/types/auth';
import { safeStorage, setCurrentTenantId } from '@/utils/storage';
import { PERMISSIONS, DEFAULT_EMPLOYEE_PERMISSIONS } from '@/constants/permissions';


const DEMO_USERS: User[] = [
  {
    id: 'owner',
    name: 'خاوەندار',
    phone: '07700000000',
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
    permissions: Object.values(PERMISSIONS).map(p => ({ id: p, name: p, code: p, description: '' })),
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUser = await safeStorage.getGlobalItem<User>('user');
        if (storedUser && storedUser.id && storedUser.name) {
          if (storedUser.tenantId) {
            setCurrentTenantId(storedUser.tenantId);
            console.log('[Auth] Tenant context set:', storedUser.tenantId);
          }
          setUser(storedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
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
      console.log('[Auth] Login attempt:', { phone: credentials.phone });
      
      let allUsers: User[] = [];
      
      try {
        const globalUsers = await safeStorage.getGlobalItem<User[]>('users', []);
        if (globalUsers && Array.isArray(globalUsers)) {
          allUsers = [...globalUsers];
        }
      } catch (error) {
        console.error('[Auth] Error loading global users:', error);
      }
      
      allUsers = [...DEMO_USERS, ...allUsers];
      
      console.log('[Auth] Total users loaded:', allUsers.length);
      
      let foundUser = allUsers.find(
        u => u.phone === credentials.phone && u.password === credentials.password
      );

      if (foundUser && (foundUser.role === 'admin' || foundUser.role === 'employee' || foundUser.role === 'customer')) {
        if (!foundUser.tenantId) {
          console.error('[Auth] User has no tenantId');
          return { 
            success: false, 
            error: 'هەژماری فرۆشگا نەدۆزرایەوە. پەیوەندی بە بەڕێوەبەر بکە' 
          };
        }
        
        const tenants = await safeStorage.getGlobalItem<any[]>('tenants', []);
        const userTenant = tenants?.find((t: any) => t.id === foundUser!.tenantId);
        
        if (!userTenant) {
          console.error('[Auth] Tenant not found for user');
          return { 
            success: false, 
            error: 'هەژماری فرۆشگا نەدۆزرایەوە. پەیوەندی بە پشتیوانی بکە' 
          };
        }
        
        if (userTenant.status !== 'active') {
          console.log('[Auth] Tenant is not active:', userTenant.status);
          let errorMessage = 'هەژماری فرۆشگا ناچالاکە';
          if (userTenant.status === 'pending') {
            errorMessage = 'هەژماری فرۆشگا هێشتا پەسەند نەکراوە. چاوەڕوانی پەسەندکردن بە';
          } else if (userTenant.status === 'suspended') {
            errorMessage = 'هەژماری فرۆشگا ڕاگیراوە. پەیوەندی بە پشتیوانی بکە';
          } else if (userTenant.status === 'expired') {
            errorMessage = 'هەژماری فرۆشگا بەسەرچووە. تکایە نوێی بکەرەوە';
          }
          return { success: false, error: errorMessage };
        }
      }
      
      if (!foundUser) {
        console.log('[Auth] User not found or password incorrect');
        return { success: false, error: 'زمارەی مۆبایل یان وشەی نهێنی هەڵەیە' };
      }
      
      console.log('[Auth] User found:', { id: foundUser.id, role: foundUser.role, tenantId: foundUser.tenantId });
      
      if (!foundUser.isActive) {
        console.log('[Auth] User account is inactive');
        return { success: false, error: 'حسابەکەت ناچالاککراوە. پەیوەندی بە بەڕێوەبەر بکە' };
      }
      
      if (foundUser.lockedUntil && new Date(foundUser.lockedUntil) > new Date()) {
        console.log('[Auth] User account is locked');
        return { success: false, error: 'حسابەکەت قەدەغەکراوە. دواتر هەوڵ بدەرەوە' };
      }
      
      const updatedUser = {
        ...foundUser,
        lastLoginAt: new Date().toISOString(),
        failedLoginAttempts: 0,
      };
      
      if (updatedUser.tenantId) {
        setCurrentTenantId(updatedUser.tenantId);
        console.log('[Auth] Login - Tenant context set:', updatedUser.tenantId);
        
        const tenants = await safeStorage.getGlobalItem<any[]>('tenants', []);
        if (tenants && Array.isArray(tenants)) {
          const userTenant = tenants.find((t: any) => t.id === updatedUser.tenantId);
          if (userTenant) {
            console.log('[Auth] Tenant found and set:', userTenant.id);
            await safeStorage.setGlobalItem('currentTenant', userTenant);
          } else {
            console.warn('[Auth] Tenant not found for tenantId:', updatedUser.tenantId);
          }
        }
      } else {
        console.log('[Auth] User has no tenantId (owner or demo user)');
        setCurrentTenantId(null);
      }
      
      setUser(updatedUser);
      await safeStorage.setGlobalItem('user', updatedUser);
      
      const updatedUsers = allUsers.map(u => 
        u.id === foundUser.id ? updatedUser : u
      );
      await safeStorage.setGlobalItem('users', updatedUsers);
      
      console.log('[Auth] Login successful');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setCurrentTenantId(null);
      console.log('[Auth] Logout - Tenant context cleared');
      setUser(null);
      safeStorage.removeItem('user');
    } catch (error) {
      
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
    safeStorage.setGlobalItem('user', updatedUser);
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