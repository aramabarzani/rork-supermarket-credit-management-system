export interface Notification {
  id: string;
  type: 'debt_added' | 'payment_received' | 'debt_overdue' | 'high_debt_warning' | 'payment_incomplete' | 'system_error' | 'debt_reminder' | 'payment_reminder' | 'receipt' | 'direct_message' | 'report' | 'new_customer' | 'new_employee' | 'debt_50_days' | 'debt_100_days' | 'high_payment' | 'user_inactivity' | 'backup_issue' | 'data_overflow' | 'account_locked' | 'system_update' | 'new_store_registration' | 'store_request_approved' | 'store_request_rejected';
  title: string;
  titleKurdish?: string;
  message: string;
  messageKurdish?: string;
  userId?: string;
  recipientId?: string;
  recipientType?: 'admin' | 'employee' | 'customer' | 'owner';
  customerId?: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  actionRequired?: boolean;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

export type NotificationChannel = 'sms' | 'email' | 'whatsapp' | 'viber' | 'push' | 'in_app';

export interface NotificationSettings {
  userId: string;
  enableDebtNotifications: boolean;
  enablePaymentNotifications: boolean;
  enableOverdueReminders: boolean;
  enableHighDebtWarnings: boolean;
  reminderDaysBefore: number; // چەند ڕۆژ پێش بەرواری کۆتایی ئاگادار بکرێت
  highDebtThreshold: number; // سنووری قەرزی گەورە
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  viberEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  autoNotifyOnDebt: boolean;
  autoNotifyOnPayment: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  phoneNumber?: string;
  email?: string;
  whatsappNumber?: string;
  viberNumber?: string;
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

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  titleTemplate: string;
  messageTemplate: string;
  channels: NotificationChannel[];
  isActive: boolean;
  variables: string[];
}

export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage?: DirectMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  messageType: 'text' | 'receipt' | 'report';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'receipt' | 'report' | 'image';
  url: string;
  filename: string;
  size: number;
}

export interface ScheduledNotification {
  id: string;
  templateId: string;
  recipientId: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  variables: Record<string, any>;
  channels: NotificationChannel[];
  createdAt: Date;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: 'sent' | 'failed' | 'delivered' | 'read';
  timestamp: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface SMSProvider {
  sendSMS: (to: string, message: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface EmailProvider {
  sendEmail: (to: string, subject: string, body: string, attachments?: EmailAttachment[]) => Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface WhatsAppProvider {
  sendMessage: (to: string, message: string, attachments?: MessageAttachment[]) => Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  byChannel: Record<NotificationChannel, { sent: number; delivered: number; failed: number }>;
  byType: Record<Notification['type'], { sent: number; delivered: number; failed: number }>;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings | null;
  templates: NotificationTemplate[];
  messageThreads: MessageThread[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  sendNotification: (notification: Omit<Notification, 'id' | 'createdAt'>, channels: NotificationChannel[]) => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  sendDirectMessage: (receiverId: string, message: string, attachments?: MessageAttachment[]) => Promise<void>;
  scheduleNotification: (templateId: string, recipientId: string, scheduledFor: Date, variables: Record<string, any>) => Promise<void>;
  sendBulkNotification: (recipientIds: string[], templateId: string, variables: Record<string, any>) => Promise<void>;
}