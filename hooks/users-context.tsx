import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Permission, ActivityLog, UserSession, CustomRole, RoleAssignment } from '@/types/auth';
import { PERMISSIONS, DEFAULT_EMPLOYEE_PERMISSIONS } from '@/constants/permissions';

interface EmployeeStats {
  totalDebts: number;
  totalPayments: number;
  totalAmount: number;
  rating: number;
}

interface EmployeeWorkSchedule {
  canReceivePayments: boolean;
  canAddDebts: boolean;
  workingHours?: {
    start: string;
    end: string;
  };
}

// Sample users data for demonstration
const sampleUsers: User[] = [
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
  {
    id: 'customer-2',
    name: 'فاتیمە ئەحمەد',
    phone: '07701234568',
    role: 'customer',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: [],
    password: 'customer123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 2,
    currentSessions: [],
    address: 'سلێمانی، گەڕەکی سەرچنار، کۆلانی ٢',
    nationalId: '2345678901234',
    email: 'fatima.ahmad@example.com',
    customerGroup: 'vip',
    customerRating: 'excellent',
    onTimePayments: 15,
    latePayments: 0,
  },
  {
    id: 'customer-3',
    name: 'عەلی حەسەن',
    phone: '07701234569',
    role: 'customer',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: [],
    password: 'customer123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 2,
    currentSessions: [],
    address: 'دهۆک، شەقامی زاخۆ، بلۆکی ٥',
    nationalId: '3456789012345',
    email: 'ali.hassan@example.com',
    customerGroup: 'company',
    customerRating: 'average',
    onTimePayments: 5,
    latePayments: 3,
  },
  {
    id: 'customer-4',
    name: 'زەینەب مەحمود',
    phone: '07701234570',
    role: 'customer',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: [],
    password: 'customer123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 2,
    currentSessions: [],
    address: 'کەرکووک، گەڕەکی عەرەفە، ماڵی ٧٨',
    nationalId: '4567890123456',
    email: 'zainab.mahmoud@example.com',
    customerGroup: 'retail',
    customerRating: 'good',
    onTimePayments: 6,
    latePayments: 1,
  },
  {
    id: 'customer-5',
    name: 'یاسین ئیبراهیم',
    phone: '07701234571',
    role: 'customer',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    permissions: [],
    password: 'customer123',
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    allowedDevices: 2,
    currentSessions: [],
    address: 'زاخۆ، شەقامی گشتی، ژمارە ٤٥',
    nationalId: '5678901234567',
    email: 'yasin.ibrahim@example.com',
    customerGroup: 'wholesale',
    customerRating: 'new',
    onTimePayments: 0,
    latePayments: 0,
  },
];

export const [UsersProvider, useUsers] = createContextHook(() => {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [employeeStats, setEmployeeStats] = useState<Record<string, EmployeeStats>>({});
  const [employeeSchedules, setEmployeeSchedules] = useState<Record<string, EmployeeWorkSchedule>>({});
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);

  useEffect(() => {
    const initializeUsers = async () => {
      setIsLoading(true);
      try {
        const stored = await AsyncStorage.getItem('users');
        if (stored && stored.trim()) {
          try {
            const trimmedData = stored.trim();
            
            if (!trimmedData.startsWith('[') && !trimmedData.startsWith('{')) {
              throw new Error('Invalid JSON format - data is corrupted');
            }
            
            if (trimmedData.length < 2) {
              throw new Error('Invalid JSON format - data is corrupted');
            }
            
            let parsedUsers;
            try {
              parsedUsers = JSON.parse(trimmedData);
            } catch (jsonError) {
              throw new Error('Invalid JSON format - data is corrupted');
            }
            
            if (!Array.isArray(parsedUsers)) {
              throw new Error('Invalid users data structure');
            }
            
            if (parsedUsers.length === 0) {
              throw new Error('Empty users array');
            }
            
            const validUsers = parsedUsers.every(u => 
              u && 
              typeof u === 'object' && 
              typeof u.id === 'string' && 
              typeof u.name === 'string' && 
              typeof u.role === 'string'
            );
            
            if (!validUsers) {
              throw new Error('Invalid users data structure');
            }
            
            setUsers(parsedUsers);
          } catch (parseError) {
            try {
              await AsyncStorage.multiRemove(['users', 'activityLogs', 'userSessions', 'employeeStats', 'employeeSchedules', 'customRoles', 'roleAssignments']);
              await AsyncStorage.setItem('users', JSON.stringify(sampleUsers));
            } catch (clearError) {
              
            }
            setUsers(sampleUsers);
          }
        } else {
          try {
            await AsyncStorage.setItem('users', JSON.stringify(sampleUsers));
          } catch (saveError) {
            // Silent error
          }
          setUsers(sampleUsers);
        }
      } catch (error) {
        try {
          await AsyncStorage.multiRemove(['users', 'activityLogs', 'userSessions', 'employeeStats', 'employeeSchedules', 'customRoles', 'roleAssignments']);
        } catch (clearError) {
          // Silent error
        }
        setUsers(sampleUsers);
      }
      
      await loadActivityLogs();
      await loadUserSessions();
      await loadEmployeeStats();
      await loadEmployeeSchedules();
      await loadCustomRoles();
      await loadRoleAssignments();
      setIsLoading(false);
    };
    
    initializeUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('users');
      if (stored && stored.trim()) {
        try {
          const parsedUsers = JSON.parse(stored);
          if (Array.isArray(parsedUsers)) {
            setUsers(parsedUsers);
          } else {
            throw new Error('Invalid data structure');
          }
        } catch (parseError) {
          try {
            await AsyncStorage.removeItem('users');
            await AsyncStorage.setItem('users', JSON.stringify(sampleUsers));
          } catch {
            
          }
          setUsers(sampleUsers);
        }
      }
    } catch {
      
    } finally {
      setIsLoading(false);
    }
  };

  const refetchUsers = useCallback(async () => {
    await loadUsers();
  }, []);

  const loadActivityLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem('activityLogs');
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setActivityLogs(parsed);
          }
        } catch (parseError) {
          await AsyncStorage.removeItem('activityLogs');
        }
      }
    } catch (error) {
      
    }
  };

  const loadUserSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('userSessions');
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setUserSessions(parsed);
          }
        } catch (parseError) {
          await AsyncStorage.removeItem('userSessions');
        }
      }
    } catch (error) {
      
    }
  };

  const loadEmployeeStats = async () => {
    try {
      const stored = await AsyncStorage.getItem('employeeStats');
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (typeof parsed === 'object' && parsed !== null) {
            setEmployeeStats(parsed);
          }
        } catch (parseError) {
          await AsyncStorage.removeItem('employeeStats');
        }
      }
    } catch (error) {
      
    }
  };

  const loadEmployeeSchedules = async () => {
    try {
      const stored = await AsyncStorage.getItem('employeeSchedules');
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (typeof parsed === 'object' && parsed !== null) {
            setEmployeeSchedules(parsed);
          }
        } catch (parseError) {
          await AsyncStorage.removeItem('employeeSchedules');
        }
      }
    } catch (error) {
      
    }
  };

  const loadCustomRoles = async () => {
    try {
      const stored = await AsyncStorage.getItem('customRoles');
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCustomRoles(parsed);
          }
        } catch (parseError) {
          await AsyncStorage.removeItem('customRoles');
        }
      }
    } catch (error) {
      
    }
  };

  const loadRoleAssignments = async () => {
    try {
      const stored = await AsyncStorage.getItem('roleAssignments');
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRoleAssignments(parsed);
          }
        } catch (parseError) {
          await AsyncStorage.removeItem('roleAssignments');
        }
      }
    } catch (error) {
      
    }
  };

  const saveUsers = async (updatedUsers: User[]) => {
    try {
      if (!Array.isArray(updatedUsers)) {
        throw new Error('Invalid users data: must be an array');
      }
      
      if (updatedUsers.length === 0) {
        throw new Error('Cannot save empty users array');
      }
      
      const validUsers = updatedUsers.every(u => 
        u && 
        typeof u === 'object' && 
        typeof u.id === 'string' && 
        typeof u.name === 'string' && 
        typeof u.role === 'string'
      );
      
      if (!validUsers) {
        throw new Error('Invalid users data structure');
      }
      
      let jsonString;
      try {
        jsonString = JSON.stringify(updatedUsers);
      } catch (stringifyError) {
        throw new Error('Failed to serialize users data');
      }
      
      if (!jsonString || jsonString === 'undefined' || jsonString === 'null' || jsonString.length < 2) {
        throw new Error('Invalid JSON serialization');
      }
      
      await AsyncStorage.setItem('users', jsonString);
      setUsers(updatedUsers);
    } catch (error) {
      throw error;
    }
  };

  const saveActivityLogs = async (logs: ActivityLog[]) => {
    try {
      await AsyncStorage.setItem('activityLogs', JSON.stringify(logs));
      setActivityLogs(logs);
    } catch (error) {
      
    }
  };

  const saveUserSessions = async (sessions: UserSession[]) => {
    try {
      await AsyncStorage.setItem('userSessions', JSON.stringify(sessions));
      setUserSessions(sessions);
    } catch (error) {
      
    }
  };

  const saveEmployeeStats = async (stats: Record<string, EmployeeStats>) => {
    try {
      await AsyncStorage.setItem('employeeStats', JSON.stringify(stats));
      setEmployeeStats(stats);
    } catch (error) {
      
    }
  };

  const saveEmployeeSchedules = async (schedules: Record<string, EmployeeWorkSchedule>) => {
    try {
      await AsyncStorage.setItem('employeeSchedules', JSON.stringify(schedules));
      setEmployeeSchedules(schedules);
    } catch (error) {
      
    }
  };

  const saveCustomRoles = async (roles: CustomRole[]) => {
    try {
      await AsyncStorage.setItem('customRoles', JSON.stringify(roles));
      setCustomRoles(roles);
    } catch (error) {
      
    }
  };

  const saveRoleAssignments = async (assignments: RoleAssignment[]) => {
    try {
      await AsyncStorage.setItem('roleAssignments', JSON.stringify(assignments));
      setRoleAssignments(assignments);
    } catch (error) {
      
    }
  };

  // 221. Add new employee
  const addUser = useCallback(async (userData: Partial<User>): Promise<User | null> => {
    console.log('[Users] Adding new user:', { phone: userData.phone, role: userData.role, tenantId: userData.tenantId });
    
    if (!userData.name || !userData.phone) {
      console.error('[Users] Missing required fields: name or phone');
      throw new Error('ناو و ژمارەی مۆبایل پێویستە');
    }

    if (userData.tenantId) {
      const existingUserInTenant = users.find(
        u => u.phone === userData.phone && u.tenantId === userData.tenantId
      );
      if (existingUserInTenant) {
        console.error('[Users] User with this phone already exists in this tenant');
        throw new Error(`ژمارەی مۆبایل ${userData.phone} پێشتر تۆمارکراوە لەم هەژمارەدا`);
      }

      if (userData.email && userData.email.trim()) {
        const existingEmailInTenant = users.find(
          u => u.email === userData.email && u.tenantId === userData.tenantId
        );
        if (existingEmailInTenant) {
          console.error('[Users] User with this email already exists in this tenant');
          throw new Error(`ئیمەیڵ ${userData.email} پێشتر تۆمارکراوە لەم هەژمارەدا`);
        }
      }
    } else {
      const existingUser = users.find(u => u.phone === userData.phone && !u.tenantId);
      if (existingUser) {
        console.error('[Users] User with this phone already exists (no tenant)');
        throw new Error(`ژمارەی مۆبایل ${userData.phone} پێشتر تۆمارکراوە`);
      }

      if (userData.email && userData.email.trim()) {
        const existingEmail = users.find(u => u.email === userData.email && !u.tenantId);
        if (existingEmail) {
          console.error('[Users] User with this email already exists (no tenant)');
          throw new Error(`ئیمەیڵ ${userData.email} پێشتر تۆمارکراوە`);
        }
      }
    }

    console.log('[Users] No duplicates found, creating user');
    
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      phone: userData.phone,
      role: userData.role || 'customer',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: userData.role === 'employee' ? DEFAULT_EMPLOYEE_PERMISSIONS.map(p => ({ id: p, name: p, code: p, description: '' })) : 
                   userData.role === 'admin' ? Object.values(PERMISSIONS).map(p => ({ id: p, name: p, code: p, description: '' })) : [],
      password: userData.password || userData.phone || 'default123',
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
      allowedDevices: userData.role === 'customer' ? 2 : userData.role === 'admin' ? 5 : 3,
      currentSessions: [],
      address: userData.address,
      nationalId: userData.nationalId,
      email: userData.email,
      customerGroup: userData.customerGroup,
      customerRating: userData.role === 'customer' ? 'new' : undefined,
      onTimePayments: userData.role === 'customer' ? 0 : undefined,
      latePayments: userData.role === 'customer' ? 0 : undefined,
      tenantId: userData.tenantId,
    };

    console.log('[Users] New user created:', { id: newUser.id, phone: newUser.phone, role: newUser.role, tenantId: newUser.tenantId });

    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
    
    console.log('[Users] User saved successfully');

    // Initialize employee stats and schedule if employee
    if (newUser.role === 'employee') {
      const newStats = {
        ...employeeStats,
        [newUser.id]: {
          totalDebts: 0,
          totalPayments: 0,
          totalAmount: 0,
          rating: 5,
        },
      };
      await saveEmployeeStats(newStats);

      const newSchedules = {
        ...employeeSchedules,
        [newUser.id]: {
          canReceivePayments: true,
          canAddDebts: true,
        },
      };
      await saveEmployeeSchedules(newSchedules);
    }

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'ADD_USER',
      details: `Added new ${newUser.role}: ${newUser.name}`,
      resourceType: 'user',
      resourceId: newUser.id,
    });
    
    console.log('[Users] User added successfully');
    return newUser;
  }, [users, employeeStats, employeeSchedules]);

  // 222. Edit employee information
  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    await saveUsers(updatedUsers);

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'UPDATE_USER',
      details: `Updated user: ${updates.name || userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 223. Delete employee
  const deleteUser = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const updatedUsers = users.filter(u => u.id !== userId);
    await saveUsers(updatedUsers);

    // Remove employee stats and schedules
    if (user?.role === 'employee') {
      const { [userId]: removedStats, ...remainingStats } = employeeStats;
      await saveEmployeeStats(remainingStats);

      const { [userId]: removedSchedule, ...remainingSchedules } = employeeSchedules;
      await saveEmployeeSchedules(remainingSchedules);
    }

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'DELETE_USER',
      details: `Deleted user: ${user?.name || userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users, employeeStats, employeeSchedules]);

  // 224. Get all employees
  const getEmployees = useCallback(() => {
    return users.filter(user => user.role === 'employee');
  }, [users]);

  // Get all customers
  const getCustomers = useCallback(() => {
    return users.filter(user => user.role === 'customer');
  }, [users]);

  // 225. Set employee permissions
  const setEmployeePermissions = useCallback(async (userId: string, permissions: Permission[]) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, permissions } : user
    );
    await saveUsers(updatedUsers);

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'UPDATE_PERMISSIONS',
      details: `Updated permissions for user: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 226. Mark employee as star employee
  const setStarEmployee = useCallback(async (userId: string, isStar: boolean) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isStarEmployee: isStar } : user
    );
    await saveUsers(updatedUsers);

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'SET_STAR_EMPLOYEE',
      details: `${isStar ? 'Set' : 'Removed'} star employee: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 232. Track employee login history
  const trackUserSession = useCallback(async (session: Omit<UserSession, 'id'>) => {
    const newSession: UserSession = {
      ...session,
      id: Date.now().toString(),
    };

    const updatedSessions = [...userSessions, newSession];
    await saveUserSessions(updatedSessions);
  }, [userSessions]);

  // 233. Lock employee account
  const lockUserAccount = useCallback(async (userId: string, lockDuration: number) => {
    const lockUntil = new Date(Date.now() + lockDuration * 60 * 1000).toISOString();
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, lockedUntil: lockUntil } : user
    );
    await saveUsers(updatedUsers);

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'LOCK_ACCOUNT',
      details: `Locked account for ${lockDuration} minutes: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 234. Activate/Deactivate employee account
  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isActive } : user
    );
    await saveUsers(updatedUsers);

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'TOGGLE_USER_STATUS',
      details: `${isActive ? 'Activated' : 'Deactivated'} user: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 235. Set employee work schedule
  const setEmployeeSchedule = useCallback(async (userId: string, schedule: EmployeeWorkSchedule) => {
    const updatedSchedules = {
      ...employeeSchedules,
      [userId]: schedule,
    };
    await saveEmployeeSchedules(updatedSchedules);

    // Log activity
    await logActivity({
      userId: 'admin',
      action: 'UPDATE_SCHEDULE',
      details: `Updated work schedule for: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [employeeSchedules]);

  // 237. Update employee performance stats
  const updateEmployeeStats = useCallback(async (userId: string, stats: Partial<EmployeeStats>) => {
    const updatedStats = {
      ...employeeStats,
      [userId]: {
        ...employeeStats[userId],
        ...stats,
      },
    };
    await saveEmployeeStats(updatedStats);
  }, [employeeStats]);

  // Log user activity
  const logActivity = useCallback(async (activity: Omit<ActivityLog, 'id' | 'timestamp' | 'ipAddress'>) => {
    const newLog: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In real app, get actual IP
    };

    const updatedLogs = [...activityLogs, newLog].slice(-1000); // Keep last 1000 logs
    await saveActivityLogs(updatedLogs);
  }, [activityLogs]);

  // Get employee activity logs
  const getEmployeeActivityLogs = useCallback((userId: string) => {
    return activityLogs.filter(log => log.userId === userId);
  }, [activityLogs]);

  // Get employee sessions
  const getEmployeeSessions = useCallback((userId: string) => {
    return userSessions.filter(session => session.userId === userId);
  }, [userSessions]);

  // Get employee stats
  const getEmployeeStats = useCallback((userId: string) => {
    return employeeStats[userId] || {
      totalDebts: 0,
      totalPayments: 0,
      totalAmount: 0,
      rating: 5,
    };
  }, [employeeStats]);

  // Get employee schedule
  const getEmployeeSchedule = useCallback((userId: string) => {
    return employeeSchedules[userId] || {
      canReceivePayments: true,
      canAddDebts: true,
    };
  }, [employeeSchedules]);

  // Get customers associated with employee
  const getEmployeeCustomers = useCallback((employeeId: string) => {
    // This would typically come from debt/payment records
    // For now, return empty array
    return [];
  }, []);

  // 621. Add new admin
  const addAdmin = useCallback(async (userData: Partial<User>) => {
    const newAdmin: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      phone: userData.phone || '',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: Object.values(PERMISSIONS).map(p => ({ id: p, name: p, code: p, description: '' })),
      password: userData.password || 'admin123',
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
      allowedDevices: 5,
      currentSessions: [],
    };

    const updatedUsers = [...users, newAdmin];
    await saveUsers(updatedUsers);

    await logActivity({
      userId: 'admin',
      action: 'ADD_ADMIN',
      details: `Added new admin: ${newAdmin.name}`,
      resourceType: 'user',
      resourceId: newAdmin.id,
    });
  }, [users]);

  // 622. Remove admin
  const removeAdmin = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.role !== 'admin') {
      throw new Error('User is not an admin');
    }

    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      throw new Error('Cannot remove the last admin');
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    await saveUsers(updatedUsers);

    await logActivity({
      userId: 'admin',
      action: 'REMOVE_ADMIN',
      details: `Removed admin: ${user.name}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 630. Set custom permissions for employee
  const setCustomPermissions = useCallback(async (userId: string, permissionCodes: string[]) => {
    const permissions = permissionCodes.map(code => ({
      id: code,
      name: code,
      code,
      description: '',
    }));

    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, permissions } : user
    );
    await saveUsers(updatedUsers);

    await logActivity({
      userId: 'admin',
      action: 'SET_CUSTOM_PERMISSIONS',
      details: `Set custom permissions for user: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 631. Set custom permissions for customer
  const setCustomerPermissions = useCallback(async (userId: string, permissionCodes: string[]) => {
    const permissions = permissionCodes.map(code => ({
      id: code,
      name: code,
      code,
      description: '',
    }));

    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, permissions } : user
    );
    await saveUsers(updatedUsers);

    await logActivity({
      userId: 'admin',
      action: 'SET_CUSTOMER_PERMISSIONS',
      details: `Set permissions for customer: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [users]);

  // 632. Create custom role
  const createCustomRole = useCallback(async (roleData: Omit<CustomRole, 'id' | 'createdAt' | 'createdBy'>) => {
    const newRole: CustomRole = {
      ...roleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    const updatedRoles = [...customRoles, newRole];
    await saveCustomRoles(updatedRoles);

    await logActivity({
      userId: 'admin',
      action: 'CREATE_ROLE',
      details: `Created custom role: ${newRole.name}`,
      resourceType: 'role',
      resourceId: newRole.id,
    });

    return newRole;
  }, [customRoles]);

  // 633. Delete custom role
  const deleteCustomRole = useCallback(async (roleId: string) => {
    const role = customRoles.find(r => r.id === roleId);
    if (role?.isSystem) {
      throw new Error('Cannot delete system role');
    }

    const updatedRoles = customRoles.filter(r => r.id !== roleId);
    await saveCustomRoles(updatedRoles);

    const updatedAssignments = roleAssignments.filter(a => a.roleId !== roleId);
    await saveRoleAssignments(updatedAssignments);

    await logActivity({
      userId: 'admin',
      action: 'DELETE_ROLE',
      details: `Deleted custom role: ${role?.name || roleId}`,
      resourceType: 'role',
      resourceId: roleId,
    });
  }, [customRoles, roleAssignments]);

  // 634. Update custom role
  const updateCustomRole = useCallback(async (roleId: string, updates: Partial<CustomRole>) => {
    const role = customRoles.find(r => r.id === roleId);
    if (role?.isSystem) {
      throw new Error('Cannot update system role');
    }

    const updatedRoles = customRoles.map(r => 
      r.id === roleId ? { ...r, ...updates } : r
    );
    await saveCustomRoles(updatedRoles);

    await logActivity({
      userId: 'admin',
      action: 'UPDATE_ROLE',
      details: `Updated custom role: ${role?.name || roleId}`,
      resourceType: 'role',
      resourceId: roleId,
    });
  }, [customRoles]);

  // 635. Assign role to user
  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    const role = customRoles.find(r => r.id === roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const existingAssignment = roleAssignments.find(
      a => a.userId === userId && a.roleId === roleId
    );

    if (!existingAssignment) {
      const newAssignment: RoleAssignment = {
        userId,
        roleId,
        assignedAt: new Date().toISOString(),
        assignedBy: 'admin',
      };

      const updatedAssignments = [...roleAssignments, newAssignment];
      await saveRoleAssignments(updatedAssignments);
    }

    const permissions = role.permissions.map(code => ({
      id: code,
      name: code,
      code,
      description: '',
    }));

    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, permissions } : user
    );
    await saveUsers(updatedUsers);

    await logActivity({
      userId: 'admin',
      action: 'ASSIGN_ROLE',
      details: `Assigned role ${role.name} to user: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });
  }, [customRoles, roleAssignments, users]);

  // 636. Get employee permissions
  const getEmployeePermissions = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.permissions || [];
  }, [users]);

  // 637. Get customer permissions
  const getCustomerPermissions = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.permissions || [];
  }, [users]);

  // Get all admins
  const getAdmins = useCallback(() => {
    return users.filter(user => user.role === 'admin');
  }, [users]);

  // Get user by ID
  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);

  // Update permissions (alias for backward compatibility)
  const updatePermissions = useCallback(async (userId: string, permissionCodes: string[]) => {
    await setCustomPermissions(userId, permissionCodes);
  }, [setCustomPermissions]);

  return useMemo(() => ({
    users,
    isLoading,
    activityLogs,
    userSessions,
    employeeStats,
    employeeSchedules,
    customRoles,
    roleAssignments,
    addUser,
    updateUser,
    deleteUser,
    getCustomers,
    getEmployees,
    getAdmins,
    getUserById,
    setEmployeePermissions,
    setStarEmployee,
    trackUserSession,
    lockUserAccount,
    toggleUserStatus,
    setEmployeeSchedule,
    updateEmployeeStats,
    logActivity,
    getEmployeeActivityLogs,
    getEmployeeSessions,
    getEmployeeStats,
    getEmployeeSchedule,
    getEmployeeCustomers,
    addAdmin,
    removeAdmin,
    setCustomPermissions,
    setCustomerPermissions,
    createCustomRole,
    deleteCustomRole,
    updateCustomRole,
    assignRoleToUser,
    getEmployeePermissions,
    getCustomerPermissions,
    updatePermissions,
    refetchUsers,
  }), [
    users,
    isLoading,
    activityLogs,
    userSessions,
    employeeStats,
    employeeSchedules,
    customRoles,
    roleAssignments,
    addUser,
    updateUser,
    deleteUser,
    getCustomers,
    getEmployees,
    getAdmins,
    getUserById,
    setEmployeePermissions,
    setStarEmployee,
    trackUserSession,
    lockUserAccount,
    toggleUserStatus,
    setEmployeeSchedule,
    updateEmployeeStats,
    logActivity,
    getEmployeeActivityLogs,
    getEmployeeSessions,
    getEmployeeStats,
    getEmployeeSchedule,
    getEmployeeCustomers,
    addAdmin,
    removeAdmin,
    setCustomPermissions,
    setCustomerPermissions,
    createCustomRole,
    deleteCustomRole,
    updateCustomRole,
    assignRoleToUser,
    getEmployeePermissions,
    getCustomerPermissions,
    updatePermissions,
    refetchUsers,
  ]);
});