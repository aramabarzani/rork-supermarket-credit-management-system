export type SystemRole = 'owner' | 'super_admin' | 'admin' | 'employee' | 'customer';

export interface Permission {
  id: string;
  name: string;
  nameKu: string;
  description: string;
  descriptionKu: string;
  category: string;
  categoryKu: string;
}

export interface Role {
  id: string;
  name: SystemRole;
  displayName: string;
  displayNameKu: string;
  permissions: string[];
  isCustom: boolean;
  clientId?: string;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  displayNameKu: string;
  permissions: string[];
  clientId?: string;
}

export interface UpdateRolePermissionsInput {
  roleId: string;
  permissions: string[];
}
