export type RoleType = 'super_admin' | 'admin' | 'manager' | 'employee' | 'customer' | 'custom';

export interface Permission {
  id: string;
  name: string;
  nameKu: string;
  description: string;
  descriptionKu: string;
  category: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  enabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  nameKu: string;
  type: RoleType;
  description: string;
  descriptionKu: string;
  permissions: string[];
  isSystem: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
}

export interface PermissionCategory {
  id: string;
  name: string;
  nameKu: string;
  description: string;
  descriptionKu: string;
  icon: string;
  permissions: Permission[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'customers',
    name: 'Customer Management',
    nameKu: 'بەڕێوەبردنی کڕیار',
    description: 'Manage customer data and operations',
    descriptionKu: 'بەڕێوەبردنی داتا و کارەکانی کڕیار',
    icon: 'users',
    permissions: [
      {
        id: 'customers.create',
        name: 'Create Customer',
        nameKu: 'دروستکردنی کڕیار',
        description: 'Create new customers',
        descriptionKu: 'دروستکردنی کڕیاری نوێ',
        category: 'customers',
        resource: 'customer',
        action: 'create',
        enabled: true,
      },
      {
        id: 'customers.read',
        name: 'View Customers',
        nameKu: 'بینینی کڕیاران',
        description: 'View customer information',
        descriptionKu: 'بینینی زانیاری کڕیار',
        category: 'customers',
        resource: 'customer',
        action: 'read',
        enabled: true,
      },
      {
        id: 'customers.update',
        name: 'Update Customer',
        nameKu: 'نوێکردنەوەی کڕیار',
        description: 'Update customer information',
        descriptionKu: 'نوێکردنەوەی زانیاری کڕیار',
        category: 'customers',
        resource: 'customer',
        action: 'update',
        enabled: true,
      },
      {
        id: 'customers.delete',
        name: 'Delete Customer',
        nameKu: 'سڕینەوەی کڕیار',
        description: 'Delete customers',
        descriptionKu: 'سڕینەوەی کڕیار',
        category: 'customers',
        resource: 'customer',
        action: 'delete',
        enabled: true,
      },
    ],
  },
  {
    id: 'debts',
    name: 'Debt Management',
    nameKu: 'بەڕێوەبردنی قەرز',
    description: 'Manage debt operations',
    descriptionKu: 'بەڕێوەبردنی کارەکانی قەرز',
    icon: 'credit-card',
    permissions: [
      {
        id: 'debts.create',
        name: 'Add Debt',
        nameKu: 'زیادکردنی قەرز',
        description: 'Add new debt records',
        descriptionKu: 'زیادکردنی تۆماری قەرزی نوێ',
        category: 'debts',
        resource: 'debt',
        action: 'create',
        enabled: true,
      },
      {
        id: 'debts.read',
        name: 'View Debts',
        nameKu: 'بینینی قەرزەکان',
        description: 'View debt information',
        descriptionKu: 'بینینی زانیاری قەرز',
        category: 'debts',
        resource: 'debt',
        action: 'read',
        enabled: true,
      },
      {
        id: 'debts.update',
        name: 'Update Debt',
        nameKu: 'نوێکردنەوەی قەرز',
        description: 'Update debt records',
        descriptionKu: 'نوێکردنەوەی تۆماری قەرز',
        category: 'debts',
        resource: 'debt',
        action: 'update',
        enabled: true,
      },
      {
        id: 'debts.delete',
        name: 'Delete Debt',
        nameKu: 'سڕینەوەی قەرز',
        description: 'Delete debt records',
        descriptionKu: 'سڕینەوەی تۆماری قەرز',
        category: 'debts',
        resource: 'debt',
        action: 'delete',
        enabled: true,
      },
    ],
  },
  {
    id: 'payments',
    name: 'Payment Management',
    nameKu: 'بەڕێوەبردنی پارەدان',
    description: 'Manage payment operations',
    descriptionKu: 'بەڕێوەبردنی کارەکانی پارەدان',
    icon: 'dollar-sign',
    permissions: [
      {
        id: 'payments.create',
        name: 'Add Payment',
        nameKu: 'زیادکردنی پارەدان',
        description: 'Add new payments',
        descriptionKu: 'زیادکردنی پارەدانی نوێ',
        category: 'payments',
        resource: 'payment',
        action: 'create',
        enabled: true,
      },
      {
        id: 'payments.read',
        name: 'View Payments',
        nameKu: 'بینینی پارەدانەکان',
        description: 'View payment information',
        descriptionKu: 'بینینی زانیاری پارەدان',
        category: 'payments',
        resource: 'payment',
        action: 'read',
        enabled: true,
      },
      {
        id: 'payments.update',
        name: 'Update Payment',
        nameKu: 'نوێکردنەوەی پارەدان',
        description: 'Update payment records',
        descriptionKu: 'نوێکردنەوەی تۆماری پارەدان',
        category: 'payments',
        resource: 'payment',
        action: 'update',
        enabled: true,
      },
      {
        id: 'payments.delete',
        name: 'Delete Payment',
        nameKu: 'سڕینەوەی پارەدان',
        description: 'Delete payment records',
        descriptionKu: 'سڕینەوەی تۆماری پارەدان',
        category: 'payments',
        resource: 'payment',
        action: 'delete',
        enabled: true,
      },
    ],
  },
  {
    id: 'reports',
    name: 'Reports',
    nameKu: 'ڕاپۆرتەکان',
    description: 'Access and generate reports',
    descriptionKu: 'دەستگەیشتن و دروستکردنی ڕاپۆرت',
    icon: 'file-text',
    permissions: [
      {
        id: 'reports.read',
        name: 'View Reports',
        nameKu: 'بینینی ڕاپۆرتەکان',
        description: 'View all reports',
        descriptionKu: 'بینینی هەموو ڕاپۆرتەکان',
        category: 'reports',
        resource: 'report',
        action: 'read',
        enabled: true,
      },
      {
        id: 'reports.create',
        name: 'Generate Reports',
        nameKu: 'دروستکردنی ڕاپۆرت',
        description: 'Generate custom reports',
        descriptionKu: 'دروستکردنی ڕاپۆرتی تایبەتی',
        category: 'reports',
        resource: 'report',
        action: 'create',
        enabled: true,
      },
      {
        id: 'reports.export',
        name: 'Export Reports',
        nameKu: 'هەناردەکردنی ڕاپۆرت',
        description: 'Export reports to PDF/Excel',
        descriptionKu: 'هەناردەکردنی ڕاپۆرت بۆ PDF/Excel',
        category: 'reports',
        resource: 'report',
        action: 'execute',
        enabled: true,
      },
    ],
  },
  {
    id: 'employees',
    name: 'Employee Management',
    nameKu: 'بەڕێوەبردنی کارمەند',
    description: 'Manage employees',
    descriptionKu: 'بەڕێوەبردنی کارمەندان',
    icon: 'user-check',
    permissions: [
      {
        id: 'employees.create',
        name: 'Add Employee',
        nameKu: 'زیادکردنی کارمەند',
        description: 'Add new employees',
        descriptionKu: 'زیادکردنی کارمەندی نوێ',
        category: 'employees',
        resource: 'employee',
        action: 'create',
        enabled: true,
      },
      {
        id: 'employees.read',
        name: 'View Employees',
        nameKu: 'بینینی کارمەندان',
        description: 'View employee information',
        descriptionKu: 'بینینی زانیاری کارمەند',
        category: 'employees',
        resource: 'employee',
        action: 'read',
        enabled: true,
      },
      {
        id: 'employees.update',
        name: 'Update Employee',
        nameKu: 'نوێکردنەوەی کارمەند',
        description: 'Update employee information',
        descriptionKu: 'نوێکردنەوەی زانیاری کارمەند',
        category: 'employees',
        resource: 'employee',
        action: 'update',
        enabled: true,
      },
      {
        id: 'employees.delete',
        name: 'Delete Employee',
        nameKu: 'سڕینەوەی کارمەند',
        description: 'Delete employees',
        descriptionKu: 'سڕینەوەی کارمەند',
        category: 'employees',
        resource: 'employee',
        action: 'delete',
        enabled: true,
      },
    ],
  },
  {
    id: 'settings',
    name: 'System Settings',
    nameKu: 'ڕێکخستنەکانی سیستەم',
    description: 'Manage system settings',
    descriptionKu: 'بەڕێوەبردنی ڕێکخستنەکانی سیستەم',
    icon: 'settings',
    permissions: [
      {
        id: 'settings.read',
        name: 'View Settings',
        nameKu: 'بینینی ڕێکخستنەکان',
        description: 'View system settings',
        descriptionKu: 'بینینی ڕێکخستنەکانی سیستەم',
        category: 'settings',
        resource: 'settings',
        action: 'read',
        enabled: true,
      },
      {
        id: 'settings.update',
        name: 'Update Settings',
        nameKu: 'نوێکردنەوەی ڕێکخستنەکان',
        description: 'Update system settings',
        descriptionKu: 'نوێکردنەوەی ڕێکخستنەکانی سیستەم',
        category: 'settings',
        resource: 'settings',
        action: 'update',
        enabled: true,
      },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    nameKu: 'ئاگاداریەکان',
    description: 'Manage notifications',
    descriptionKu: 'بەڕێوەبردنی ئاگاداریەکان',
    icon: 'bell',
    permissions: [
      {
        id: 'notifications.create',
        name: 'Send Notifications',
        nameKu: 'ناردنی ئاگاداری',
        description: 'Send notifications to users',
        descriptionKu: 'ناردنی ئاگاداری بۆ بەکارهێنەران',
        category: 'notifications',
        resource: 'notification',
        action: 'create',
        enabled: true,
      },
      {
        id: 'notifications.read',
        name: 'View Notifications',
        nameKu: 'بینینی ئاگاداریەکان',
        description: 'View notification history',
        descriptionKu: 'بینینی مێژووی ئاگاداری',
        category: 'notifications',
        resource: 'notification',
        action: 'read',
        enabled: true,
      },
    ],
  },
  {
    id: 'backup',
    name: 'Backup & Restore',
    nameKu: 'باکاپ و گەڕاندنەوە',
    description: 'Manage backups',
    descriptionKu: 'بەڕێوەبردنی باکاپەکان',
    icon: 'database',
    permissions: [
      {
        id: 'backup.create',
        name: 'Create Backup',
        nameKu: 'دروستکردنی باکاپ',
        description: 'Create system backups',
        descriptionKu: 'دروستکردنی باکاپی سیستەم',
        category: 'backup',
        resource: 'backup',
        action: 'create',
        enabled: true,
      },
      {
        id: 'backup.restore',
        name: 'Restore Backup',
        nameKu: 'گەڕاندنەوەی باکاپ',
        description: 'Restore from backups',
        descriptionKu: 'گەڕاندنەوە لە باکاپەکان',
        category: 'backup',
        resource: 'backup',
        action: 'execute',
        enabled: true,
      },
    ],
  },
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    nameKu: 'بەڕێوەبەری گشتی',
    type: 'super_admin',
    description: 'Full system access',
    descriptionKu: 'دەستگەیشتنی تەواو بۆ سیستەم',
    permissions: PERMISSION_CATEGORIES.flatMap((cat) => cat.permissions.map((p) => p.id)),
    isSystem: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'admin',
    name: 'Admin',
    nameKu: 'بەڕێوەبەر',
    type: 'admin',
    description: 'Administrative access',
    descriptionKu: 'دەستگەیشتنی بەڕێوەبەری',
    permissions: PERMISSION_CATEGORIES.flatMap((cat) =>
      cat.permissions.filter((p) => !p.id.includes('backup')).map((p) => p.id)
    ),
    isSystem: true,
    priority: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'manager',
    name: 'Manager',
    nameKu: 'بەڕێوەبەری لق',
    type: 'manager',
    description: 'Branch management access',
    descriptionKu: 'دەستگەیشتنی بەڕێوەبردنی لق',
    permissions: [
      'customers.create',
      'customers.read',
      'customers.update',
      'debts.create',
      'debts.read',
      'debts.update',
      'payments.create',
      'payments.read',
      'payments.update',
      'reports.read',
      'reports.create',
      'employees.read',
      'notifications.create',
      'notifications.read',
    ],
    isSystem: true,
    priority: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'employee',
    name: 'Employee',
    nameKu: 'کارمەند',
    type: 'employee',
    description: 'Basic employee access',
    descriptionKu: 'دەستگەیشتنی بنچینەیی کارمەند',
    permissions: [
      'customers.read',
      'debts.create',
      'debts.read',
      'payments.create',
      'payments.read',
      'reports.read',
    ],
    isSystem: true,
    priority: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'customer',
    name: 'Customer',
    nameKu: 'کڕیار',
    type: 'customer',
    description: 'Customer portal access',
    descriptionKu: 'دەستگەیشتن بۆ پۆرتاڵی کڕیار',
    permissions: ['debts.read', 'payments.read'],
    isSystem: true,
    priority: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
