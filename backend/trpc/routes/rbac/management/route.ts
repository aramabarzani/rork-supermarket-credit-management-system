import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { Role, Permission, RoleAssignment } from '@/types/rbac';

const mockRoles: Role[] = [
  {
    id: 'role_owner',
    name: 'owner',
    displayName: 'System Owner',
    displayNameKu: 'خاوەنی سیستەم',
    permissions: ['*'],
    isCustom: false,
  },
  {
    id: 'role_super_admin',
    name: 'super_admin',
    displayName: 'Super Admin',
    displayNameKu: 'سوپەر ئەدمین',
    permissions: ['manage_licenses', 'manage_subscriptions', 'manage_tenants', 'view_all_data'],
    isCustom: false,
  },
  {
    id: 'role_admin',
    name: 'admin',
    displayName: 'Admin',
    displayNameKu: 'بەڕێوەبەر',
    permissions: ['manage_customers', 'manage_debts', 'manage_payments', 'manage_employees', 'view_reports'],
    isCustom: false,
  },
  {
    id: 'role_employee',
    name: 'employee',
    displayName: 'Employee',
    displayNameKu: 'کارمەند',
    permissions: ['view_customers', 'add_debt', 'add_payment', 'view_basic_reports'],
    isCustom: false,
  },
  {
    id: 'role_customer',
    name: 'customer',
    displayName: 'Customer',
    displayNameKu: 'کڕیار',
    permissions: ['view_own_data', 'view_own_debts', 'view_own_payments'],
    isCustom: false,
  },
];

const mockPermissions: Permission[] = [
  { id: 'manage_licenses', name: 'Manage Licenses', nameKu: 'بەڕێوەبردنی لایسەنس', description: 'Create, update, and manage licenses', descriptionKu: 'دروستکردن، نوێکردنەوە و بەڕێوەبردنی لایسەنس', category: 'System', categoryKu: 'سیستەم' },
  { id: 'manage_subscriptions', name: 'Manage Subscriptions', nameKu: 'بەڕێوەبردنی بەشداری', description: 'Create and manage subscriptions', descriptionKu: 'دروستکردن و بەڕێوەبردنی بەشداری', category: 'System', categoryKu: 'سیستەم' },
  { id: 'manage_tenants', name: 'Manage Tenants', nameKu: 'بەڕێوەبردنی کڕیارەکان', description: 'Manage tenant accounts', descriptionKu: 'بەڕێوەبردنی هەژمارەکانی کڕیار', category: 'System', categoryKu: 'سیستەم' },
  { id: 'view_all_data', name: 'View All Data', nameKu: 'بینینی هەموو داتا', description: 'Access all system data', descriptionKu: 'دەستگەیشتن بە هەموو داتای سیستەم', category: 'System', categoryKu: 'سیستەم' },
  { id: 'manage_customers', name: 'Manage Customers', nameKu: 'بەڕێوەبردنی کڕیاران', description: 'Add, edit, delete customers', descriptionKu: 'زیادکردن، دەستکاریکردن، سڕینەوەی کڕیاران', category: 'Customers', categoryKu: 'کڕیاران' },
  { id: 'view_customers', name: 'View Customers', nameKu: 'بینینی کڕیاران', description: 'View customer list and details', descriptionKu: 'بینینی لیستی کڕیاران و وردەکاری', category: 'Customers', categoryKu: 'کڕیاران' },
  { id: 'manage_debts', name: 'Manage Debts', nameKu: 'بەڕێوەبردنی قەرزەکان', description: 'Add, edit, delete debts', descriptionKu: 'زیادکردن، دەستکاریکردن، سڕینەوەی قەرزەکان', category: 'Financial', categoryKu: 'دارایی' },
  { id: 'add_debt', name: 'Add Debt', nameKu: 'زیادکردنی قەرز', description: 'Add new debts', descriptionKu: 'زیادکردنی قەرزی نوێ', category: 'Financial', categoryKu: 'دارایی' },
  { id: 'manage_payments', name: 'Manage Payments', nameKu: 'بەڕێوەبردنی پارەدانەکان', description: 'Add, edit, delete payments', descriptionKu: 'زیادکردن، دەستکاریکردن، سڕینەوەی پارەدانەکان', category: 'Financial', categoryKu: 'دارایی' },
  { id: 'add_payment', name: 'Add Payment', nameKu: 'زیادکردنی پارەدان', description: 'Add new payments', descriptionKu: 'زیادکردنی پارەدانی نوێ', category: 'Financial', categoryKu: 'دارایی' },
  { id: 'manage_employees', name: 'Manage Employees', nameKu: 'بەڕێوەبردنی کارمەندان', description: 'Add, edit, delete employees', descriptionKu: 'زیادکردن، دەستکاریکردن، سڕینەوەی کارمەندان', category: 'Users', categoryKu: 'بەکارهێنەران' },
  { id: 'view_reports', name: 'View Reports', nameKu: 'بینینی ڕاپۆرتەکان', description: 'Access all reports', descriptionKu: 'دەستگەیشتن بە هەموو ڕاپۆرتەکان', category: 'Reports', categoryKu: 'ڕاپۆرتەکان' },
  { id: 'view_basic_reports', name: 'View Basic Reports', nameKu: 'بینینی ڕاپۆرتە بنچینەییەکان', description: 'Access basic reports', descriptionKu: 'دەستگەیشتن بە ڕاپۆرتە بنچینەییەکان', category: 'Reports', categoryKu: 'ڕاپۆرتەکان' },
  { id: 'view_own_data', name: 'View Own Data', nameKu: 'بینینی داتای خۆی', description: 'View own account data', descriptionKu: 'بینینی داتای هەژماری خۆی', category: 'Personal', categoryKu: 'کەسی' },
  { id: 'view_own_debts', name: 'View Own Debts', nameKu: 'بینینی قەرزەکانی خۆی', description: 'View own debts', descriptionKu: 'بینینی قەرزەکانی خۆی', category: 'Personal', categoryKu: 'کەسی' },
  { id: 'view_own_payments', name: 'View Own Payments', nameKu: 'بینینی پارەدانەکانی خۆی', description: 'View own payments', descriptionKu: 'بینینی پارەدانەکانی خۆی', category: 'Personal', categoryKu: 'کەسی' },
];

const mockRoleAssignments: RoleAssignment[] = [];

export const getAllRolesProcedure = protectedProcedure
  .query(async (): Promise<Role[]> => {
    return mockRoles;
  });

export const getRoleByIdProcedure = protectedProcedure
  .input(z.object({ roleId: z.string() }))
  .query(async ({ input }): Promise<Role | null> => {
    return mockRoles.find(r => r.id === input.roleId) || null;
  });

export const createRoleProcedure = protectedProcedure
  .input(z.object({
    name: z.string(),
    displayName: z.string(),
    displayNameKu: z.string(),
    permissions: z.array(z.string()),
    clientId: z.string().optional(),
  }))
  .mutation(async ({ input }): Promise<Role> => {
    const role: Role = {
      id: `role_${Date.now()}`,
      name: input.name as any,
      displayName: input.displayName,
      displayNameKu: input.displayNameKu,
      permissions: input.permissions,
      isCustom: true,
      clientId: input.clientId,
    };

    mockRoles.push(role);
    return role;
  });

export const updateRoleProcedure = protectedProcedure
  .input(z.object({
    roleId: z.string(),
    displayName: z.string().optional(),
    displayNameKu: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input }): Promise<Role> => {
    const role = mockRoles.find(r => r.id === input.roleId);
    if (!role) {
      throw new Error('ڕۆڵ نەدۆزرایەوە');
    }

    if (!role.isCustom) {
      throw new Error('ناتوانی ڕۆڵی بنچینەیی دەستکاری بکەیت');
    }

    if (input.displayName) role.displayName = input.displayName;
    if (input.displayNameKu) role.displayNameKu = input.displayNameKu;
    if (input.permissions) role.permissions = input.permissions;

    return role;
  });

export const deleteRoleProcedure = protectedProcedure
  .input(z.object({ roleId: z.string() }))
  .mutation(async ({ input }): Promise<{ success: boolean }> => {
    const index = mockRoles.findIndex(r => r.id === input.roleId);
    if (index === -1) {
      throw new Error('ڕۆڵ نەدۆزرایەوە');
    }

    const role = mockRoles[index];
    if (!role.isCustom) {
      throw new Error('ناتوانی ڕۆڵی بنچینەیی بسڕیتەوە');
    }

    mockRoles.splice(index, 1);
    return { success: true };
  });

export const assignRoleProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    roleId: z.string(),
  }))
  .mutation(async ({ input }): Promise<RoleAssignment> => {
    const role = mockRoles.find(r => r.id === input.roleId);
    if (!role) {
      throw new Error('ڕۆڵ نەدۆزرایەوە');
    }

    const existing = mockRoleAssignments.find(
      ra => ra.userId === input.userId && ra.roleId === input.roleId
    );

    if (existing) {
      throw new Error('ئەم ڕۆڵە پێشتر دیاریکراوە');
    }

    const assignment: RoleAssignment = {
      userId: input.userId,
      roleId: input.roleId,
      assignedAt: new Date().toISOString(),
      assignedBy: 'current_user',
    };

    mockRoleAssignments.push(assignment);
    return assignment;
  });

export const revokeRoleProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    roleId: z.string(),
  }))
  .mutation(async ({ input }): Promise<{ success: boolean }> => {
    const index = mockRoleAssignments.findIndex(
      ra => ra.userId === input.userId && ra.roleId === input.roleId
    );

    if (index === -1) {
      throw new Error('دیاریکردنی ڕۆڵ نەدۆزرایەوە');
    }

    mockRoleAssignments.splice(index, 1);
    return { success: true };
  });

export const getUserRolesProcedure = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }): Promise<Role[]> => {
    const userAssignments = mockRoleAssignments.filter(ra => ra.userId === input.userId);
    const roleIds = userAssignments.map(ra => ra.roleId);
    return mockRoles.filter(r => roleIds.includes(r.id));
  });

export const getUserPermissionsProcedure = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }): Promise<string[]> => {
    const userAssignments = mockRoleAssignments.filter(ra => ra.userId === input.userId);
    const roleIds = userAssignments.map(ra => ra.roleId);
    const userRoles = mockRoles.filter(r => roleIds.includes(r.id));
    const permissions = new Set<string>();

    for (const role of userRoles) {
      if (role.permissions.includes('*')) {
        return ['*'];
      }
      role.permissions.forEach((p: string) => permissions.add(p));
    }

    return Array.from(permissions);
  });

export const checkPermissionProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    permission: z.string(),
  }))
  .query(async ({ input }): Promise<boolean> => {
    const userAssignments = mockRoleAssignments.filter(ra => ra.userId === input.userId);
    const roleIds = userAssignments.map(ra => ra.roleId);
    const userRoles = mockRoles.filter(r => roleIds.includes(r.id));
    const permissions = new Set<string>();

    for (const role of userRoles) {
      if (role.permissions.includes('*')) {
        return true;
      }
      role.permissions.forEach((p: string) => permissions.add(p));
    }

    const userPermissions = Array.from(permissions);

    if (userPermissions.includes('*')) {
      return true;
    }

    return userPermissions.includes(input.permission);
  });

export const getAllPermissionsProcedure = protectedProcedure
  .query(async (): Promise<Permission[]> => {
    return mockPermissions;
  });

export const getPermissionsByCategoryProcedure = protectedProcedure
  .input(z.object({ category: z.string() }))
  .query(async ({ input }): Promise<Permission[]> => {
    return mockPermissions.filter(p => p.category === input.category);
  });
