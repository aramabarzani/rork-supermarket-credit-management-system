import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, LoginCredentials, LoginResult } from '@/types/auth';
import { safeStorage } from '@/utils/storage';
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
        const storedUser = await safeStorage.getItem<User>('user');
        if (storedUser && storedUser.id && storedUser.name) {
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
      let allUsers: User[] = [...DEMO_USERS];
      try {
        const storedUsers = await safeStorage.getItem<User[]>('users', null);
        if (storedUsers && Array.isArray(storedUsers) && storedUsers.length > 0) {
          const mergedUsers = [...DEMO_USERS];
          storedUsers.forEach(storedUser => {
            const existingIndex = mergedUsers.findIndex(u => u.id === storedUser.id);
            if (existingIndex >= 0) {
              mergedUsers[existingIndex] = storedUser;
            } else {
              mergedUsers.push(storedUser);
            }
          });
          allUsers = mergedUsers;
        } else {
          await safeStorage.setItem('users', allUsers);
        }
      } catch (error) {
        await safeStorage.setItem('users', allUsers);
      }
      
      const foundUser = allUsers.find(
        u => u.phone === credentials.phone && u.password === credentials.password
      );
      
      if (foundUser) {
        if (!foundUser.isActive) {
          return { success: false, error: 'حسابەکەت ناچالاککراوە. پەیوەندی بە بەڕێوەبەر بکە' };
        }
        
        if (foundUser.lockedUntil && new Date(foundUser.lockedUntil) > new Date()) {
          return { success: false, error: 'حسابەکەت قەدەغەکراوە. دواتر هەوڵ بدەرەوە' };
        }
        
        const updatedUser = {
          ...foundUser,
          lastLoginAt: new Date().toISOString(),
          failedLoginAttempts: 0,
        };
        setUser(updatedUser);
        
        await safeStorage.setItem('user', updatedUser);
        
        const updatedUsers = allUsers.map(u => 
          u.id === foundUser.id ? updatedUser : u
        );
        await safeStorage.setItem('users', updatedUsers);
        
        if (updatedUser.tenantId) {
          const currentTenant = await safeStorage.getItem<any>('currentTenant', null);
          if (!currentTenant || currentTenant?.id !== updatedUser.tenantId) {
            const tenants = await safeStorage.getItem<any[]>('tenants', []);
            if (tenants && Array.isArray(tenants)) {
              const userTenant = tenants.find((t: any) => t.id === updatedUser.tenantId);
              if (userTenant) {
                await safeStorage.setItem('currentTenant', userTenant);
              }
            }
          }
        }
        
        return { success: true, user: updatedUser };
      }
      
      return { success: false, error: 'ژمارەی مۆبایل یان وشەی نهێنی هەڵەیە' };
    } catch (error) {
      return { success: false, error: 'هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
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
    // Don't await storage operations to prevent blocking UI
    safeStorage.setItem('user', updatedUser);
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