import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { SubscriptionNotification } from '@/types/subscription';

const mockNotifications: SubscriptionNotification[] = [
  {
    id: 'notif-1',
    tenantId: 'tenant-2',
    adminId: 'admin-2',
    type: 'expiry_warning',
    title: 'ئاگاداری بەسەرچوونی ئابوونە',
    message: 'ئابوونەکەت لە ماوەی ١٠ ڕۆژدا بەسەردەچێت. تکایە نوێی بکەرەوە',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    daysUntilExpiry: 10,
  },
  {
    id: 'notif-2',
    tenantId: 'tenant-3',
    adminId: 'admin-3',
    type: 'expired',
    title: 'ئابوونە بەسەرچووە',
    message: 'ئابوونەکەت بەسەرچووە. سیستەمەکەت ناچالاککراوە. تکایە نوێی بکەرەوە',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

export const getNotificationsProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string().optional(),
    adminId: z.string().optional(),
    unreadOnly: z.boolean().optional(),
  }))
  .query(async ({ input }) => {
    let filtered = [...mockNotifications];

    if (input.tenantId) {
      filtered = filtered.filter(n => n.tenantId === input.tenantId);
    }

    if (input.adminId) {
      filtered = filtered.filter(n => n.adminId === input.adminId);
    }

    if (input.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    return {
      notifications: filtered,
      unreadCount: filtered.filter(n => !n.read).length,
    };
  });

export const markAsReadProcedure = publicProcedure
  .input(z.object({
    notificationId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const notification = mockNotifications.find(n => n.id === input.notificationId);
    
    if (!notification) {
      throw new Error('ئاگادارکردنەوە نەدۆزرایەوە');
    }

    notification.read = true;

    return {
      success: true,
      notification,
    };
  });

export const checkExpiryProcedure = publicProcedure.query(async () => {
  const tenantsToNotify: {
    tenantId: string;
    adminId: string;
    daysUntilExpiry: number;
    type: 'warning' | 'urgent' | 'expired';
  }[] = [];

  return {
    tenantsToNotify,
    notificationsSent: 0,
  };
});

export const sendExpiryWarningProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
    adminId: z.string(),
    daysUntilExpiry: z.number(),
  }))
  .mutation(async ({ input }) => {
    const newNotification: SubscriptionNotification = {
      id: `notif-${Date.now()}`,
      tenantId: input.tenantId,
      adminId: input.adminId,
      type: 'expiry_warning',
      title: 'ئاگاداری بەسەرچوونی ئابوونە',
      message: `ئابوونەکەت لە ماوەی ${input.daysUntilExpiry} ڕۆژدا بەسەردەچێت. تکایە نوێی بکەرەوە`,
      sentAt: new Date().toISOString(),
      read: false,
      daysUntilExpiry: input.daysUntilExpiry,
    };

    mockNotifications.push(newNotification);

    return {
      success: true,
      notification: newNotification,
    };
  });

export const sendExpiredNoticeProcedure = publicProcedure
  .input(z.object({
    tenantId: z.string(),
    adminId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const newNotification: SubscriptionNotification = {
      id: `notif-${Date.now()}`,
      tenantId: input.tenantId,
      adminId: input.adminId,
      type: 'expired',
      title: 'ئابوونە بەسەرچووە',
      message: 'ئابوونەکەت بەسەرچووە. سیستەمەکەت ناچالاککراوە. تکایە نوێی بکەرەوە',
      sentAt: new Date().toISOString(),
      read: false,
    };

    mockNotifications.push(newNotification);

    return {
      success: true,
      notification: newNotification,
    };
  });
