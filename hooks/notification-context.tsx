import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Notification, 
  NotificationSettings, 
  NotificationChannel,
  NotificationTemplate,
  ScheduledNotification,
  NotificationLog
} from '@/types/notification';

const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const NOTIFICATION_TEMPLATES_KEY = 'notification_templates';
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';
const NOTIFICATION_LOGS_KEY = 'notification_logs';

const defaultSettings: NotificationSettings = {
  userId: '',
  enableDebtNotifications: true,
  enablePaymentNotifications: true,
  enableOverdueReminders: true,
  enableHighDebtWarnings: true,
  reminderDaysBefore: 3,
  highDebtThreshold: 1000000,
  smsEnabled: true,
  emailEnabled: true,
  whatsappEnabled: true,
  viberEnabled: false,
  pushEnabled: true,
  inAppEnabled: true,
  autoNotifyOnDebt: true,
  autoNotifyOnPayment: true,
  reminderFrequency: 'weekly',
};

const defaultTemplates: NotificationTemplate[] = [
  {
    id: 'debt_added',
    name: 'ئاگاداری قەرزی نوێ',
    type: 'debt_added',
    titleTemplate: 'قەرزی نوێ زیادکرا',
    messageTemplate: 'قەرزێکی نوێ بە بڕی {{amount}} دینار بۆ {{customerName}} زیادکرا.',
    channels: ['sms', 'whatsapp', 'in_app'],
    isActive: true,
    variables: ['amount', 'customerName', 'date'],
  },
  {
    id: 'payment_received',
    name: 'ئاگاداری پارەدان',
    type: 'payment_received',
    titleTemplate: 'پارەدان وەرگیرا',
    messageTemplate: 'پارەدانێک بە بڕی {{amount}} دینار لە {{customerName}} وەرگیرا.',
    channels: ['sms', 'whatsapp', 'in_app'],
    isActive: true,
    variables: ['amount', 'customerName', 'date'],
  },
  {
    id: 'high_debt_warning',
    name: 'ئاگاداری قەرزی گەورە',
    type: 'high_debt_warning',
    titleTemplate: 'ئاگاداری: قەرزی گەورە',
    messageTemplate: 'قەرزێکی گەورە بە بڕی {{amount}} دینار بۆ {{customerName}} تۆمارکرا.',
    channels: ['sms', 'email', 'whatsapp', 'in_app'],
    isActive: true,
    variables: ['amount', 'customerName', 'threshold'],
  },
  {
    id: 'receipt_generated',
    name: 'ئاگاداری وەسڵ',
    type: 'receipt',
    titleTemplate: 'وەسڵی نوێ',
    messageTemplate: 'وەسڵی ژمارە {{receiptNumber}} بۆ {{customerName}} دروستکرا.',
    channels: ['sms', 'email', 'whatsapp'],
    isActive: true,
    variables: ['receiptNumber', 'customerName', 'amount'],
  },
];

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(defaultTemplates);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadNotifications();
    loadSettings();
    loadTemplates();
    loadScheduledNotifications();
    loadNotificationLogs();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_TEMPLATES_KEY);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification templates:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      if (stored) {
        setScheduledNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  };

  const loadNotificationLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_LOGS_KEY);
      if (stored) {
        setNotificationLogs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification logs:', error);
    }
  };

  const saveNotifications = async (notifs: Notification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const saveNotificationLogs = async (logs: NotificationLog[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_LOGS_KEY, JSON.stringify(logs));
      setNotificationLogs(logs);
    } catch (error) {
      console.error('Failed to save notification logs:', error);
    }
  };

  const sendSMS = async (to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    console.log(`[SMS] Sending to ${to}: ${message}`);
    return { success: true, messageId: `sms_${Date.now()}` };
  };

  const sendEmail = async (to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    console.log(`[Email] Sending to ${to}\nSubject: ${subject}\nBody: ${body}`);
    return { success: true, messageId: `email_${Date.now()}` };
  };

  const sendWhatsApp = async (to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    console.log(`[WhatsApp] Sending to ${to}: ${message}`);
    return { success: true, messageId: `whatsapp_${Date.now()}` };
  };

  const sendNotificationViaChannel = async (
    channel: NotificationChannel,
    notification: Notification
  ): Promise<NotificationLog> => {
    const log: NotificationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notificationId: notification.id,
      channel,
      status: 'sent',
      timestamp: new Date(),
    };

    try {
      let result: { success: boolean; messageId?: string; error?: string };

      switch (channel) {
        case 'sms':
          if (settings.smsEnabled && settings.phoneNumber) {
            result = await sendSMS(settings.phoneNumber, notification.message);
          } else {
            throw new Error('SMS not configured');
          }
          break;
        case 'email':
          if (settings.emailEnabled && settings.email) {
            result = await sendEmail(settings.email, notification.title, notification.message);
          } else {
            throw new Error('Email not configured');
          }
          break;
        case 'whatsapp':
          if (settings.whatsappEnabled && settings.whatsappNumber) {
            result = await sendWhatsApp(settings.whatsappNumber, notification.message);
          } else {
            throw new Error('WhatsApp not configured');
          }
          break;
        case 'in_app':
          result = { success: true };
          break;
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      if (result.success) {
        log.status = 'delivered';
        log.metadata = { messageId: result.messageId };
      } else {
        log.status = 'failed';
        log.errorMessage = result.error || 'Unknown error';
      }
    } catch (error) {
      log.status = 'failed';
      log.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    return log;
  };

  const addNotification = useCallback(async (notif: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...notifications];
    await saveNotifications(updatedNotifications);

    return newNotification;
  }, [notifications]);

  const sendNotification = useCallback(async (
    notif: Omit<Notification, 'id' | 'createdAt'>,
    channels: NotificationChannel[]
  ) => {
    const notification = await addNotification(notif);

    const logs: NotificationLog[] = [];
    for (const channel of channels) {
      const log = await sendNotificationViaChannel(channel, notification);
      logs.push(log);
    }

    const updatedLogs = [...notificationLogs, ...logs];
    await saveNotificationLogs(updatedLogs);
  }, [addNotification, notificationLogs, settings]);

  const sendDebtNotification = useCallback(async (
    customerId: string,
    customerName: string,
    amount: number,
    phoneNumber?: string,
    email?: string,
    whatsappNumber?: string
  ) => {
    if (!settings.autoNotifyOnDebt || !settings.enableDebtNotifications) {
      return;
    }

    const template = templates.find(t => t.type === 'debt_added' && t.isActive);
    if (!template) return;

    const message = template.messageTemplate
      .replace('{{amount}}', amount.toLocaleString())
      .replace('{{customerName}}', customerName)
      .replace('{{date}}', new Date().toLocaleDateString('ar-IQ'));

    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'debt_added',
      title: template.titleTemplate,
      message,
      userId: customerId,
      customerId,
      isRead: false,
      priority: 'medium',
      channels: template.channels,
      metadata: { amount, customerName },
    };

    const channels: NotificationChannel[] = [];
    if (settings.smsEnabled && phoneNumber) channels.push('sms');
    if (settings.emailEnabled && email) channels.push('email');
    if (settings.whatsappEnabled && whatsappNumber) channels.push('whatsapp');
    if (settings.inAppEnabled) channels.push('in_app');

    await sendNotification(notification, channels);
  }, [settings, templates, sendNotification]);

  const sendPaymentNotification = useCallback(async (
    customerId: string,
    customerName: string,
    amount: number,
    phoneNumber?: string,
    email?: string,
    whatsappNumber?: string
  ) => {
    if (!settings.autoNotifyOnPayment || !settings.enablePaymentNotifications) {
      return;
    }

    const template = templates.find(t => t.type === 'payment_received' && t.isActive);
    if (!template) return;

    const message = template.messageTemplate
      .replace('{{amount}}', amount.toLocaleString())
      .replace('{{customerName}}', customerName)
      .replace('{{date}}', new Date().toLocaleDateString('ar-IQ'));

    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'payment_received',
      title: template.titleTemplate,
      message,
      userId: customerId,
      customerId,
      isRead: false,
      priority: 'medium',
      channels: template.channels,
      metadata: { amount, customerName },
    };

    const channels: NotificationChannel[] = [];
    if (settings.smsEnabled && phoneNumber) channels.push('sms');
    if (settings.emailEnabled && email) channels.push('email');
    if (settings.whatsappEnabled && whatsappNumber) channels.push('whatsapp');
    if (settings.inAppEnabled) channels.push('in_app');

    await sendNotification(notification, channels);
  }, [settings, templates, sendNotification]);

  const sendHighDebtWarning = useCallback(async (
    customerId: string,
    customerName: string,
    amount: number,
    adminId: string
  ) => {
    if (!settings.enableHighDebtWarnings || amount < settings.highDebtThreshold) {
      return;
    }

    const template = templates.find(t => t.type === 'high_debt_warning' && t.isActive);
    if (!template) return;

    const message = template.messageTemplate
      .replace('{{amount}}', amount.toLocaleString())
      .replace('{{customerName}}', customerName)
      .replace('{{threshold}}', settings.highDebtThreshold.toLocaleString());

    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'high_debt_warning',
      title: template.titleTemplate,
      message,
      userId: adminId,
      customerId,
      isRead: false,
      priority: 'high',
      channels: template.channels,
      metadata: { amount, customerName, threshold: settings.highDebtThreshold },
    };

    await sendNotification(notification, template.channels);
  }, [settings, templates, sendNotification]);

  const sendReceiptNotification = useCallback(async (
    customerId: string,
    customerName: string,
    receiptNumber: string,
    amount: number,
    phoneNumber?: string,
    email?: string,
    whatsappNumber?: string
  ) => {
    const template = templates.find(t => t.type === 'receipt' && t.isActive);
    if (!template) return;

    const message = template.messageTemplate
      .replace('{{receiptNumber}}', receiptNumber)
      .replace('{{customerName}}', customerName)
      .replace('{{amount}}', amount.toLocaleString());

    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'receipt',
      title: template.titleTemplate,
      message,
      userId: customerId,
      customerId,
      isRead: false,
      priority: 'low',
      channels: template.channels,
      metadata: { receiptNumber, customerName, amount },
    };

    const channels: NotificationChannel[] = [];
    if (settings.smsEnabled && phoneNumber) channels.push('sms');
    if (settings.emailEnabled && email) channels.push('email');
    if (settings.whatsappEnabled && whatsappNumber) channels.push('whatsapp');

    await sendNotification(notification, channels);
  }, [settings, templates, sendNotification]);

  const markAsRead = useCallback(async (id: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const removeNotification = useCallback(async (id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    await saveNotifications(updatedNotifications);
  }, [notifications]);

  const clearAll = useCallback(async () => {
    await saveNotifications([]);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
  }, [settings]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  return useMemo(() => ({
    notifications,
    isLoading,
    unreadCount,
    settings,
    templates,
    notificationLogs,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    sendNotification,
    updateSettings,
    sendDebtNotification,
    sendPaymentNotification,
    sendHighDebtWarning,
    sendReceiptNotification,
  }), [
    notifications,
    isLoading,
    unreadCount,
    settings,
    templates,
    notificationLogs,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    sendNotification,
    updateSettings,
    sendDebtNotification,
    sendPaymentNotification,
    sendHighDebtWarning,
    sendReceiptNotification,
  ]);
});