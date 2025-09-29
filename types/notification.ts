export interface Notification {
  id: string;
  type: 'debt_added' | 'payment_received' | 'debt_overdue' | 'high_debt_warning' | 'payment_incomplete' | 'system_error' | 'debt_reminder' | 'payment_reminder';
  title: string;
  message: string;
  userId: string; // کێ دەبێت ئەم ئاگاداریە ببینێت
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string; // ID ی قەرز یان پارەدان
  actionRequired?: boolean;
}

export interface NotificationSettings {
  userId: string;
  enableDebtNotifications: boolean;
  enablePaymentNotifications: boolean;
  enableOverdueReminders: boolean;
  enableHighDebtWarnings: boolean;
  reminderDaysBefore: number; // چەند ڕۆژ پێش بەرواری کۆتایی ئاگادار بکرێت
  highDebtThreshold: number; // سنووری قەرزی گەورە
}

export interface NotificationRule {
  id: string;
  type: Notification['type'];
  condition: string;
  enabled: boolean;
  targetRoles: ('admin' | 'employee' | 'customer')[];
  message: string;
  priority: Notification['priority'];
}