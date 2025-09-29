import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications] = useState<any[]>([]);
  const [isLoading] = useState(false);
  const [unreadCount] = useState(0);

  const addNotification = useCallback(async () => {
    console.log('NotificationProvider: addNotification called');
  }, []);

  const markAsRead = useCallback(async () => {
    console.log('NotificationProvider: markAsRead called');
  }, []);

  return useMemo(() => ({
    notifications,
    isLoading,
    unreadCount,
    addNotification,
    markAsRead,
  }), [notifications, isLoading, unreadCount, addNotification, markAsRead]);
});