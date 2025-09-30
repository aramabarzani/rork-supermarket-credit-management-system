import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Permission, ActivityLog, UserSession } from '@/types/auth';
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

  // Load data from storage (disabled for demo with sample data)
  useEffect(() => {
    // For demo purposes, we'll use sample data instead of loading from storage
    // loadUsers();
    // loadActivityLogs();
    // loadUserSessions();
    // loadEmployeeStats();
    // loadEmployeeSchedules();
    setIsLoading(false);
  }, []);

  const loadUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem('users');
      if (stored) {
        setUsers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem('activityLogs');
      if (stored) {
        setActivityLogs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const loadUserSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('userSessions');
      if (stored) {
        setUserSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user sessions:', error);
    }
  };

  const loadEmployeeStats = async () => {
    try {
      const stored = await AsyncStorage.getItem('employeeStats');
      if (stored) {
        setEmployeeStats(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading employee stats:', error);
    }
  };

  const loadEmployeeSchedules = async () => {
    try {
      const stored = await AsyncStorage.getItem('employeeSchedules');
      if (stored) {
        setEmployeeSchedules(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading employee schedules:', error);
    }
  };

  const saveUsers = async (updatedUsers: User[]) => {
    try {
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const saveActivityLogs = async (logs: ActivityLog[]) => {
    try {
      await AsyncStorage.setItem('activityLogs', JSON.stringify(logs));
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error saving activity logs:', error);
    }
  };

  const saveUserSessions = async (sessions: UserSession[]) => {
    try {
      await AsyncStorage.setItem('userSessions', JSON.stringify(sessions));
      setUserSessions(sessions);
    } catch (error) {
      console.error('Error saving user sessions:', error);
    }
  };

  const saveEmployeeStats = async (stats: Record<string, EmployeeStats>) => {
    try {
      await AsyncStorage.setItem('employeeStats', JSON.stringify(stats));
      setEmployeeStats(stats);
    } catch (error) {
      console.error('Error saving employee stats:', error);
    }
  };

  const saveEmployeeSchedules = async (schedules: Record<string, EmployeeWorkSchedule>) => {
    try {
      await AsyncStorage.setItem('employeeSchedules', JSON.stringify(schedules));
      setEmployeeSchedules(schedules);
    } catch (error) {
      console.error('Error saving employee schedules:', error);
    }
  };

  // 221. Add new employee
  const addUser = useCallback(async (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      phone: userData.phone || '',
      role: userData.role || 'customer',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: userData.role === 'employee' ? DEFAULT_EMPLOYEE_PERMISSIONS.map(p => ({ id: p, name: p, code: p, description: '' })) : [],
      password: userData.password || userData.phone || 'default123',
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
      allowedDevices: userData.role === 'customer' ? 2 : 3,
      currentSessions: [],
      address: userData.address,
      nationalId: userData.nationalId,
      email: userData.email,
      customerGroup: userData.customerGroup,
      customerRating: userData.role === 'customer' ? 'new' : undefined,
      onTimePayments: userData.role === 'customer' ? 0 : undefined,
      latePayments: userData.role === 'customer' ? 0 : undefined,
    };

    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);

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

    console.log('User added successfully:', newUser);
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

  return useMemo(() => ({
    users,
    isLoading,
    activityLogs,
    userSessions,
    employeeStats,
    employeeSchedules,
    addUser,
    updateUser,
    deleteUser,
    getCustomers,
    getEmployees,
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
  }), [
    users,
    isLoading,
    activityLogs,
    userSessions,
    employeeStats,
    employeeSchedules,
    addUser,
    updateUser,
    deleteUser,
    getCustomers,
    getEmployees,
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
  ]);
});