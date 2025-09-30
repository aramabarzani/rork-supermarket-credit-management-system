export const PERMISSIONS = {
  // Customer Management
  VIEW_CUSTOMERS: 'view_customers',
  ADD_CUSTOMER: 'add_customer',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',
  
  // Debt Management
  VIEW_DEBTS: 'view_debts',
  ADD_DEBT: 'add_debt',
  EDIT_DEBT: 'edit_debt',
  DELETE_DEBT: 'delete_debt',
  
  // Payment Management
  VIEW_PAYMENTS: 'view_payments',
  ADD_PAYMENT: 'add_payment',
  EDIT_PAYMENT: 'edit_payment',
  DELETE_PAYMENT: 'delete_payment',
  
  // Employee Management
  VIEW_EMPLOYEES: 'view_employees',
  ADD_EMPLOYEE: 'add_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',
  MANAGE_PERMISSIONS: 'manage_permissions',
  LOCK_EMPLOYEE: 'lock_employee',
  VIEW_EMPLOYEE_ACTIVITY: 'view_employee_activity',
  MANAGE_EMPLOYEE_SCHEDULE: 'manage_employee_schedule',
  SET_STAR_EMPLOYEE: 'set_star_employee',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // System
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',

  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  MANAGE_SESSIONS: 'manage_sessions',
  
  // Customer Advanced Features
  MANAGE_VIP_CUSTOMERS: 'manage_vip_customers',
  MANAGE_CUSTOMER_RATINGS: 'manage_customer_ratings',
  SEND_NOTIFICATIONS: 'send_notifications',
  
  // Admin Management (Section 32: 621-640)
  MANAGE_ADMINS: 'manage_admins',
  MANAGE_ROLES: 'manage_roles',
  VIEW_PERMISSIONS_REPORT: 'view_permissions_report',
  EXPORT_PERMISSIONS_REPORT: 'export_permissions_report',
  

} as const;

export const PERMISSION_LABELS: Record<string, string> = {
  [PERMISSIONS.VIEW_CUSTOMERS]: 'بینینی کڕیارەکان',
  [PERMISSIONS.ADD_CUSTOMER]: 'زیادکردنی کڕیار',
  [PERMISSIONS.EDIT_CUSTOMER]: 'دەستکاری کڕیار',
  [PERMISSIONS.DELETE_CUSTOMER]: 'سڕینەوەی کڕیار',
  
  [PERMISSIONS.VIEW_DEBTS]: 'بینینی قەرزەکان',
  [PERMISSIONS.ADD_DEBT]: 'زیادکردنی قەرز',
  [PERMISSIONS.EDIT_DEBT]: 'دەستکاری قەرز',
  [PERMISSIONS.DELETE_DEBT]: 'سڕینەوەی قەرز',
  
  [PERMISSIONS.VIEW_PAYMENTS]: 'بینینی پارەدانەکان',
  [PERMISSIONS.ADD_PAYMENT]: 'تۆمارکردنی پارەدان',
  [PERMISSIONS.EDIT_PAYMENT]: 'دەستکاری پارەدان',
  [PERMISSIONS.DELETE_PAYMENT]: 'سڕینەوەی پارەدان',
  
  [PERMISSIONS.VIEW_EMPLOYEES]: 'بینینی کارمەندەکان',
  [PERMISSIONS.ADD_EMPLOYEE]: 'زیادکردنی کارمەند',
  [PERMISSIONS.EDIT_EMPLOYEE]: 'دەستکاری کارمەند',
  [PERMISSIONS.DELETE_EMPLOYEE]: 'سڕینەوەی کارمەند',
  [PERMISSIONS.MANAGE_PERMISSIONS]: 'بەڕێوەبردنی دەسەڵاتەکان',
  [PERMISSIONS.LOCK_EMPLOYEE]: 'قوڵفکردنی کارمەند',
  [PERMISSIONS.VIEW_EMPLOYEE_ACTIVITY]: 'بینینی چالاکی کارمەند',
  [PERMISSIONS.MANAGE_EMPLOYEE_SCHEDULE]: 'بەڕێوەبردنی خولی کار',
  [PERMISSIONS.SET_STAR_EMPLOYEE]: 'دیاریکردنی کارمەندی نموونەیی',
  
  [PERMISSIONS.VIEW_REPORTS]: 'بینینی ڕاپۆرتەکان',
  [PERMISSIONS.EXPORT_REPORTS]: 'دەرهێنانی ڕاپۆرت',
  
  [PERMISSIONS.VIEW_SETTINGS]: 'بینینی ڕێکخستنەکان',
  [PERMISSIONS.EDIT_SETTINGS]: 'دەستکاری ڕێکخستنەکان',

  [PERMISSIONS.VIEW_ACTIVITY_LOGS]: 'بینینی تۆماری چالاکیەکان',
  [PERMISSIONS.MANAGE_SESSIONS]: 'بەڕێوەبردنی دانیشتنەکان',
  
  [PERMISSIONS.MANAGE_VIP_CUSTOMERS]: 'بەڕێوەبردنی کڕیارانی VIP',
  [PERMISSIONS.MANAGE_CUSTOMER_RATINGS]: 'بەڕێوەبردنی پلەی کڕیار',
  [PERMISSIONS.SEND_NOTIFICATIONS]: 'ناردنی ئاگاداری',
  
  [PERMISSIONS.MANAGE_ADMINS]: 'بەڕێوەبردنی بەڕێوەبەران',
  [PERMISSIONS.MANAGE_ROLES]: 'بەڕێوەبردنی ڕۆڵەکان',
  [PERMISSIONS.VIEW_PERMISSIONS_REPORT]: 'بینینی ڕاپۆرتی دەسەڵاتەکان',
  [PERMISSIONS.EXPORT_PERMISSIONS_REPORT]: 'دەرهێنانی ڕاپۆرتی دەسەڵاتەکان',
  

};

export const DEFAULT_EMPLOYEE_PERMISSIONS = [
  PERMISSIONS.VIEW_CUSTOMERS,
  PERMISSIONS.ADD_CUSTOMER,
  PERMISSIONS.VIEW_DEBTS,
  PERMISSIONS.ADD_DEBT,
  PERMISSIONS.VIEW_PAYMENTS,
  PERMISSIONS.ADD_PAYMENT,
];