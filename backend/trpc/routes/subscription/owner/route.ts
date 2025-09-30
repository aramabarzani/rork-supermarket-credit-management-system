import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { 
  TenantSubscription
} from '@/types/subscription';
import { safeStorage } from '@/utils/storage';
import type { User } from '@/types/auth';
import { PERMISSIONS } from '@/constants/permissions';

let mockTenants: TenantSubscription[] = [];

const loadTenants = async () => {
  try {
    const stored = await safeStorage.getItem<TenantSubscription[]>('tenants', null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      mockTenants = stored;
    } else {
      mockTenants = [
        {
          id: 'tenant-1',
          adminId: 'admin-1',
          adminName: 'مارکێتی یەکەم',
          adminPhone: '07501111111',
          plan: 'pro',
          status: 'active',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'owner',
          staffCount: 5,
          customerCount: 120,
          notificationsSent: 0,
        },
        {
          id: 'tenant-2',
          adminId: 'admin-2',
          adminName: 'مارکێتی دووەم',
          adminPhone: '07502222222',
          plan: 'basic',
          status: 'active',
          startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'owner',
          staffCount: 3,
          customerCount: 45,
          notificationsSent: 1,
          lastNotificationAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'tenant-3',
          adminId: 'admin-3',
          adminName: 'مارکێتی سێیەم',
          adminPhone: '07503333333',
          plan: 'basic',
          status: 'expired',
          startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'owner',
          staffCount: 2,
          customerCount: 30,
          notificationsSent: 3,
          lastNotificationAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      await saveTenants();
    }
  } catch (error) {
    console.error('Error loading tenants:', error);
    mockTenants = [];
  }
};

const saveTenants = async () => {
  try {
    await safeStorage.setItem('tenants', mockTenants);
  } catch (error) {
    console.error('Error saving tenants:', error);
  }
};

export const ownerProcedure = publicProcedure.query(async () => {
  await loadTenants();
  return {
    getAllTenants: mockTenants,
    getActiveTenants: mockTenants.filter(t => t.status === 'active'),
    getExpiredTenants: mockTenants.filter(t => t.status === 'expired'),
    getSuspendedTenants: mockTenants.filter(t => t.status === 'suspended'),
    getTotalRevenue: mockTenants.reduce((sum, t) => {
      const plan = t.plan;
      const planDetails = {
        basic: { price: 50000 },
        pro: { price: 500000 },
        enterprise: { price: 1000000 }
      }[plan];
      return sum + planDetails.price;
    }, 0),
  };
});

export const createAdminProcedure = publicProcedure
  .input(z.object({
    name: z.string(),
    phone: z.string(),
    password: z.string(),
    plan: z.enum(['basic', 'pro', 'enterprise']),
    duration: z.number(),
  }))
  .mutation(async ({ input }) => {
    await loadTenants();
    
    try {
      let existingUsers = await safeStorage.getItem<User[]>('users', null);
      if (!existingUsers || !Array.isArray(existingUsers)) {
        existingUsers = [];
      }
      
      const phoneExists = existingUsers.some(u => u.phone === input.phone);
      if (phoneExists) {
        throw new Error('ژمارەی مۆبایل پێشتر تۆمارکراوە');
      }
      
      const adminId = `admin-${Date.now()}`;
      const tenantId = `tenant-${Date.now()}`;
      
      const newAdmin: User = {
        id: adminId,
        name: input.name,
        phone: input.phone,
        password: input.password,
        role: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true,
        permissions: Object.values(PERMISSIONS).map(p => ({ id: p, name: p, code: p, description: '' })),
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        allowedDevices: 5,
        currentSessions: [],
        tenantId: tenantId,
      };
      
      const newTenant: TenantSubscription = {
        id: tenantId,
        adminId: adminId,
        adminName: input.name,
        adminPhone: input.phone,
        plan: input.plan,
        status: 'active',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + input.duration * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'owner',
        staffCount: 0,
        customerCount: 0,
        notificationsSent: 0,
      };

      mockTenants.push(newTenant);
      await saveTenants();
      
      existingUsers.push(newAdmin);
      await safeStorage.setItem('users', existingUsers);

      return {
        success: true,
        tenant: newTenant,
        admin: newAdmin,
        message: 'بەڕێوەبەر بە سەرکەوتوویی دروستکرا',
      };
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  });

export const updateSubscriptionProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
    plan: z.enum(['basic', 'pro', 'enterprise']).optional(),
    expiryDate: z.string().optional(),
    status: z.enum(['active', 'expired', 'suspended', 'trial']).optional(),
  }))
  .mutation(async ({ input }) => {
    await loadTenants();
    const tenantIndex = mockTenants.findIndex(t => t.id === input.tenantId);
    
    if (tenantIndex === -1) {
      throw new Error('بەڕێوەبەر نەدۆزرایەوە');
    }

    const updates: Partial<TenantSubscription> = {};
    
    if (input.plan) updates.plan = input.plan;
    if (input.expiryDate) updates.expiryDate = input.expiryDate;
    if (input.status) updates.status = input.status;

    mockTenants[tenantIndex] = {
      ...mockTenants[tenantIndex],
      ...updates,
    };
    await saveTenants();

    return {
      success: true,
      tenant: mockTenants[tenantIndex],
      message: 'ئابوونە بە سەرکەوتوویی نوێکرایەوە',
    };
  });

export const renewSubscriptionProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
    plan: z.enum(['basic', 'pro', 'enterprise']),
    duration: z.number(),
  }))
  .mutation(async ({ input }) => {
    await loadTenants();
    const tenantIndex = mockTenants.findIndex(t => t.id === input.tenantId);
    
    if (tenantIndex === -1) {
      throw new Error('بەڕێوەبەر نەدۆزرایەوە');
    }

    const currentExpiry = new Date(mockTenants[tenantIndex].expiryDate);
    const now = new Date();
    const startDate = currentExpiry > now ? currentExpiry : now;
    const newExpiryDate = new Date(startDate.getTime() + input.duration * 24 * 60 * 60 * 1000);

    mockTenants[tenantIndex] = {
      ...mockTenants[tenantIndex],
      plan: input.plan,
      status: 'active',
      expiryDate: newExpiryDate.toISOString(),
      lastRenewedAt: new Date().toISOString(),
    };
    await saveTenants();

    return {
      success: true,
      tenant: mockTenants[tenantIndex],
      message: 'ئابوونە بە سەرکەوتوویی نوێکرایەوە',
    };
  });

export const suspendTenantProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
    reason: z.string(),
  }))
  .mutation(async ({ input }) => {
    await loadTenants();
    const tenantIndex = mockTenants.findIndex(t => t.id === input.tenantId);
    
    if (tenantIndex === -1) {
      throw new Error('بەڕێوەبەر نەدۆزرایەوە');
    }

    mockTenants[tenantIndex] = {
      ...mockTenants[tenantIndex],
      status: 'suspended',
      suspendedAt: new Date().toISOString(),
      suspendedBy: 'owner',
      suspensionReason: input.reason,
    };
    await saveTenants();

    return {
      success: true,
      tenant: mockTenants[tenantIndex],
      message: 'بەڕێوەبەر بە سەرکەوتوویی ڕاگیرا',
    };
  });

export const activateTenantProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
  }))
  .mutation(async ({ input }) => {
    await loadTenants();
    const tenantIndex = mockTenants.findIndex(t => t.id === input.tenantId);
    
    if (tenantIndex === -1) {
      throw new Error('بەڕێوەبەر نەدۆزرایەوە');
    }

    const tenant = mockTenants[tenantIndex];
    const now = new Date();
    const expiryDate = new Date(tenant.expiryDate);

    if (expiryDate < now) {
      throw new Error('ناتوانرێت چالاک بکرێتەوە. ئابوونە بەسەرچووە. تکایە نوێی بکەرەوە');
    }

    mockTenants[tenantIndex] = {
      ...tenant,
      status: 'active',
      suspendedAt: undefined,
      suspendedBy: undefined,
      suspensionReason: undefined,
    };
    await saveTenants();

    return {
      success: true,
      tenant: mockTenants[tenantIndex],
      message: 'بەڕێوەبەر بە سەرکەوتوویی چالاککرایەوە',
    };
  });

export const deleteTenantProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
  }))
  .mutation(async ({ input }) => {
    await loadTenants();
    const tenantIndex = mockTenants.findIndex(t => t.id === input.tenantId);
    
    if (tenantIndex === -1) {
      throw new Error('بەڕێوەبەر نەدۆزرایەوە');
    }

    const deletedTenant = mockTenants[tenantIndex];
    mockTenants.splice(tenantIndex, 1);
    await saveTenants();

    return {
      success: true,
      tenant: deletedTenant,
      message: 'بەڕێوەبەر بە سەرکەوتوویی سڕایەوە',
    };
  });

export const getTenantDetailsProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
  }))
  .query(async ({ input }) => {
    await loadTenants();
    const tenant = mockTenants.find(t => t.id === input.tenantId);
    
    if (!tenant) {
      throw new Error('بەڕێوەبەر نەدۆزرایەوە');
    }

    const now = new Date();
    const expiryDate = new Date(tenant.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      tenant,
      daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry > 0,
      isExpired: daysUntilExpiry < 0,
    };
  });
