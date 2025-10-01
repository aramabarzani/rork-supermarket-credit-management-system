import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Notification, 
  NotificationSettings, 
  NotificationChannel,
  NotificationTemplate,
  ScheduledNotification,
  NotificationLog,
  ManagerNotificationRule
} from '@/types/notification';

const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const NOTIFICATION_TEMPLATES_KEY = 'notification_templates';
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';
const NOTIFICATION_LOGS_KEY = 'notification_logs';
const MANAGER_RULES_KEY = 'manager_notification_rules';

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
  const [managerRules, setManagerRules] = useState<ManagerNotificationRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadNotifications();
    loadSettings();
    loadTemplates();
    loadScheduledNotifications();
    loadNotificationLogs();
    loadManagerRules();
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

  const loadManagerRules = async () => {
    try {
      const stored = await AsyncStorage.getItem(MANAGER_RULES_KEY);
      if (stored) {
        setManagerRules(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load manager rules:', error);
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

  const saveManagerRules = async (rules: ManagerNotificationRule[]) => {
    try {
      await AsyncStorage.setItem(MANAGER_RULES_KEY, JSON.stringify(rules));
      setManagerRules(rules);
    } catch (error) {
      console.error('Failed to save manager rules:', error);
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

  const sendManagerAlert = useCallback(async (
    type: Notification['type'],
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high',
    relatedId?: string,
    metadata?: Record<string, any>
  ) => {
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type,
      title,
      message,
      userId: 'manager',
      isRead: false,
      priority,
      relatedId,
      channels: ['in_app', 'email'],
      metadata,
    };

    await sendNotification(notification, ['in_app', 'email']);
  }, [sendNotification]);

  const sendCustomerAlert = useCallback(async (
    customerId: string,
    customerName: string,
    type: 'debt_50_days' | 'debt_100_days' | 'debt_reminder',
    debtAmount: number,
    daysOverdue: number,
    phoneNumber?: string,
    email?: string,
    whatsappNumber?: string
  ) => {
    let title = '';
    let message = '';
    let priority: 'low' | 'medium' | 'high' = 'medium';

    if (type === 'debt_50_days') {
      title = 'ئاگاداری: قەرز ٥٠ ڕۆژە سەردەشتی';
      message = `بەڕێز ${customerName}، قەرزتان بە بڕی ${debtAmount.toLocaleString()} دینار ${daysOverdue} ڕۆژە سەردەشتی. تکایە پارەدان بکەن.`;
      priority = 'high';
    } else if (type === 'debt_100_days') {
      title = 'ئاگاداری گرنگ: قەرز ١٠٠ ڕۆژە سەردەشتی';
      message = `بەڕێز ${customerName}، قەرزتان بە بڕی ${debtAmount.toLocaleString()} دینار ${daysOverdue} ڕۆژە سەردەشتی. تکایە بە پەلە پارەدان بکەن.`;
      priority = 'high';
    } else {
      title = 'بیرخستنەوەی قەرز';
      message = `بەڕێز ${customerName}، قەرزتان بە بڕی ${debtAmount.toLocaleString()} دینار هەیە. تکایە پارەدان بکەن.`;
    }

    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type,
      title,
      message,
      userId: customerId,
      customerId,
      isRead: false,
      priority,
      channels: ['sms', 'whatsapp', 'in_app'],
      metadata: { debtAmount, daysOverdue, customerName },
    };

    const channels: NotificationChannel[] = [];
    if (settings.smsEnabled && phoneNumber) channels.push('sms');
    if (settings.whatsappEnabled && whatsappNumber) channels.push('whatsapp');
    if (settings.inAppEnabled) channels.push('in_app');

    await sendNotification(notification, channels);
  }, [settings, sendNotification]);

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

  const addManagerRule = useCallback(async (rule: Omit<ManagerNotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: ManagerNotificationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveManagerRules([...managerRules, newRule]);
  }, [managerRules]);

  const updateManagerRule = useCallback(async (id: string, updates: Partial<ManagerNotificationRule>) => {
    const updated = managerRules.map(rule =>
      rule.id === id ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule
    );
    await saveManagerRules(updated);
  }, [managerRules]);

  const deleteManagerRule = useCallback(async (id: string) => {
    const updated = managerRules.filter(rule => rule.id !== id);
    await saveManagerRules(updated);
  }, [managerRules]);

  const checkManagerRules = useCallback(async (event: { type: string; data: any }) => {
    const activeRules = managerRules.filter(rule => rule.enabled);

    for (const rule of activeRules) {
      let shouldNotify = false;
      let title = '';
      let message = '';

      switch (rule.condition.type) {
        case 'high_debt':
          if (event.type === 'debt_added' && event.data.amount >= rule.condition.threshold) {
            shouldNotify = true;
            title = 'ئاگاداری قەرزی گەورە';
            message = `قەرزێکی گەورە بە بڕی ${event.data.amount.toLocaleString()} دینار بۆ ${event.data.customerName} زیادکرا.`;
          }
          break;

        case 'overdue_debt':
          if (event.type === 'debt_overdue' && event.data.daysOverdue >= rule.condition.days) {
            shouldNotify = true;
            title = 'ئاگاداری قەرزی سەردەشتی';
            message = `قەرزێک بە بڕی ${event.data.amount.toLocaleString()} دینار ${event.data.daysOverdue} ڕۆژە سەردەشتی بۆ ${event.data.customerName}.`;
          }
          break;

        case 'large_payment':
          if (event.type === 'payment_received' && event.data.amount >= rule.condition.threshold) {
            shouldNotify = true;
            title = 'پارەدانی گەورە';
            message = `پارەدانێکی گەورە بە بڕی ${event.data.amount.toLocaleString()} دینار لە ${event.data.customerName} وەرگیرا.`;
          }
          break;

        case 'customer_inactive':
          if (event.type === 'customer_inactive' && event.data.inactiveDays >= rule.condition.days) {
            shouldNotify = true;
            title = 'کڕیاری ناچالاک';
            message = `کڕیار ${event.data.customerName} ${event.data.inactiveDays} ڕۆژە چالاکی نییە.`;
          }
          break;

        case 'staff_activity':
          if (event.type === 'staff_activity' && event.data.action === rule.condition.action) {
            shouldNotify = true;
            title = 'چالاکی کارمەند';
            message = `کارمەند ${event.data.staffName} ${event.data.action} ئەنجامدا.`;
          }
          break;

        case 'system_error':
          if (event.type === 'system_error' && event.data.severity === rule.condition.severity) {
            shouldNotify = true;
            title = 'هەڵەی سیستەم';
            message = `هەڵەیەک لە سیستەمدا ڕوویدا: ${event.data.message}`;
          }
          break;

        case 'backup_failed':
          if (event.type === 'backup_failed') {
            shouldNotify = true;
            title = 'شکستی پاشەکەوتکردن';
            message = 'پاشەکەوتکردنی خۆکار سەرکەوتوو نەبوو. تکایە بە دەستی پاشەکەوت بکە.';
          }
          break;

        case 'subscription_expiring':
          if (event.type === 'subscription_expiring' && event.data.daysUntilExpiry <= rule.condition.days) {
            shouldNotify = true;
            title = 'ئاگاداری بەسەرچوونی ئابوونە';
            message = `ئابوونەکە ${event.data.daysUntilExpiry} ڕۆژی ماوە بۆ بەسەرچوون.`;
          }
          break;
      }

      if (shouldNotify) {
        for (const recipientId of rule.recipients) {
          const notification: Omit<Notification, 'id' | 'createdAt'> = {
            type: event.type as any,
            title,
            message,
            userId: recipientId,
            recipientId,
            recipientType: 'admin',
            isRead: false,
            priority: rule.priority,
            channels: rule.channels,
            metadata: event.data,
          };

          await sendNotification(notification, rule.channels);
        }
      }
    }
  }, [managerRules, sendNotification]);

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
    managerRules,
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
    sendManagerAlert,
    sendCustomerAlert,
    addManagerRule,
    updateManagerRule,
    deleteManagerRule,
    checkManagerRules,
  }), [
    notifications,
    isLoading,
    unreadCount,
    settings,
    templates,
    notificationLogs,
    managerRules,
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
    sendManagerAlert,
    sendCustomerAlert,
    addManagerRule,
    updateManagerRule,
    deleteManagerRule,
    checkManagerRules,
  ]);
});