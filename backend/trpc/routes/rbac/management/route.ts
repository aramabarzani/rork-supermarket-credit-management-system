import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { Role, UserRole } from '../../../../../types/rbac';
import { DEFAULT_ROLES, PERMISSION_CATEGORIES } from '../../../../../types/rbac';

const mockRoles: Role[] = [...DEFAULT_ROLES];
const mockUserRoles: UserRole[] = [];

export const getAllRolesProcedure = publicProcedure.query(async () => {
  return {
    roles: mockRoles,
    total: mockRoles.length,
  };
});

export const getRoleByIdProcedure = publicProcedure
  .input(
    z.object({
      roleId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const role = mockRoles.find((r) => r.id === input.roleId);

    if (!role) {
      return {
        success: false,
        message: 'Role not found',
      };
    }

    return {
      success: true,
      role,
    };
  });

export const createRoleProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      nameKu: z.string(),
      description: z.string(),
      descriptionKu: z.string(),
      permissions: z.array(z.string()),
    })
  )
  .mutation(async ({ input }) => {
    const role: Role = {
      id: `role_${Date.now()}`,
      name: input.name,
      nameKu: input.nameKu,
      type: 'custom',
      description: input.description,
      descriptionKu: input.descriptionKu,
      permissions: input.permissions,
      isSystem: false,
      priority: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockRoles.push(role);

    console.log('Role created:', role);

    return {
      success: true,
      role,
      message: 'Role created successfully',
    };
  });

export const updateRoleProcedure = publicProcedure
  .input(
    z.object({
      roleId: z.string(),
      name: z.string().optional(),
      nameKu: z.string().optional(),
      description: z.string().optional(),
      descriptionKu: z.string().optional(),
      permissions: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const role = mockRoles.find((r) => r.id === input.roleId);

    if (!role) {
      return {
        success: false,
        message: 'Role not found',
      };
    }

    if (role.isSystem) {
      return {
        success: false,
        message: 'Cannot modify system roles',
      };
    }

    if (input.name !== undefined) role.name = input.name;
    if (input.nameKu !== undefined) role.nameKu = input.nameKu;
    if (input.description !== undefined) role.description = input.description;
    if (input.descriptionKu !== undefined) role.descriptionKu = input.descriptionKu;
    if (input.permissions !== undefined) role.permissions = input.permissions;

    role.updatedAt = new Date().toISOString();

    console.log('Role updated:', role);

    return {
      success: true,
      role,
      message: 'Role updated successfully',
    };
  });

export const deleteRoleProcedure = publicProcedure
  .input(
    z.object({
      roleId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const roleIndex = mockRoles.findIndex((r) => r.id === input.roleId);

    if (roleIndex === -1) {
      return {
        success: false,
        message: 'Role not found',
      };
    }

    const role = mockRoles[roleIndex];

    if (role.isSystem) {
      return {
        success: false,
        message: 'Cannot delete system roles',
      };
    }

    mockRoles.splice(roleIndex, 1);

    console.log('Role deleted:', role);

    return {
      success: true,
      message: 'Role deleted successfully',
    };
  });

export const assignRoleProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      roleId: z.string(),
      assignedBy: z.string(),
      expiresAt: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const role = mockRoles.find((r) => r.id === input.roleId);

    if (!role) {
      return {
        success: false,
        message: 'Role not found',
      };
    }

    const existingAssignment = mockUserRoles.find(
      (ur) => ur.userId === input.userId && ur.roleId === input.roleId
    );

    if (existingAssignment) {
      return {
        success: false,
        message: 'Role already assigned to user',
      };
    }

    const userRole: UserRole = {
      userId: input.userId,
      roleId: input.roleId,
      assignedAt: new Date().toISOString(),
      assignedBy: input.assignedBy,
      expiresAt: input.expiresAt,
    };

    mockUserRoles.push(userRole);

    console.log('Role assigned:', userRole);

    return {
      success: true,
      userRole,
      message: 'Role assigned successfully',
    };
  });

export const revokeRoleProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      roleId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const userRoleIndex = mockUserRoles.findIndex(
      (ur) => ur.userId === input.userId && ur.roleId === input.roleId
    );

    if (userRoleIndex === -1) {
      return {
        success: false,
        message: 'Role assignment not found',
      };
    }

    const userRole = mockUserRoles[userRoleIndex];
    mockUserRoles.splice(userRoleIndex, 1);

    console.log('Role revoked:', userRole);

    return {
      success: true,
      message: 'Role revoked successfully',
    };
  });

export const getUserRolesProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const userRoles = mockUserRoles.filter((ur) => ur.userId === input.userId);

    const rolesWithDetails = userRoles.map((ur) => {
      const role = mockRoles.find((r) => r.id === ur.roleId);
      return {
        ...ur,
        role,
      };
    });

    return {
      userRoles: rolesWithDetails,
      total: rolesWithDetails.length,
    };
  });

export const getUserPermissionsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const userRoles = mockUserRoles.filter((ur) => ur.userId === input.userId);

    const allPermissions = new Set<string>();

    userRoles.forEach((ur) => {
      const role = mockRoles.find((r) => r.id === ur.roleId);
      if (role) {
        role.permissions.forEach((p) => allPermissions.add(p));
      }
    });

    return {
      permissions: Array.from(allPermissions),
      total: allPermissions.size,
    };
  });

export const checkPermissionProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      permission: z.string(),
    })
  )
  .query(async ({ input }) => {
    const userRoles = mockUserRoles.filter((ur) => ur.userId === input.userId);

    for (const ur of userRoles) {
      const role = mockRoles.find((r) => r.id === ur.roleId);
      if (role && role.permissions.includes(input.permission)) {
        return {
          hasPermission: true,
          role: role.name,
        };
      }
    }

    return {
      hasPermission: false,
    };
  });

export const getAllPermissionsProcedure = publicProcedure.query(async () => {
  return {
    categories: PERMISSION_CATEGORIES,
    total: PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0),
  };
});

export const getPermissionsByCategoryProcedure = publicProcedure
  .input(
    z.object({
      category: z.string(),
    })
  )
  .query(async ({ input }) => {
    const category = PERMISSION_CATEGORIES.find((c) => c.id === input.category);

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
      };
    }

    return {
      success: true,
      category,
      permissions: category.permissions,
    };
  });
