import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Bell, X, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react-native';
import { Notification } from '@/types/notification';
import { KurdishText } from '@/components/KurdishText';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onDismiss: () => void;
}

export function NotificationItem({ notification, onPress, onDismiss }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'debt_added':
      case 'debt_reminder':
        return <DollarSign size={20} color={getIconColor()} />;
      case 'payment_received':
        return <CheckCircle size={20} color={getIconColor()} />;
      case 'debt_overdue':
      case 'high_debt_warning':
        return <AlertCircle size={20} color={getIconColor()} />;
      case 'system_error':
        return <X size={20} color={getIconColor()} />;
      default:
        return <Bell size={20} color={getIconColor()} />;
    }
  };

  const getIconColor = () => {
    switch (notification.priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getBorderColor = () => {
    if (!notification.isRead) {
      switch (notification.priority) {
        case 'high':
          return '#FEE2E2';
        case 'medium':
          return '#FEF3C7';
        case 'low':
          return '#D1FAE5';
        default:
          return '#F3F4F6';
      }
    }
    return '#F9FAFB';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'ئێستا';
    } else if (diffInHours < 24) {
      return `${diffInHours} کاتژمێر پێش ئێستا`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ڕۆژ پێش ئێستا`;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBorderColor() },
        !notification.isRead && styles.unread,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <View style={styles.titleContainer}>
            <KurdishText style={[styles.title, !notification.isRead && styles.unreadText]}>
              {notification.title}
            </KurdishText>
            <Text style={styles.time}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        <KurdishText style={[styles.message, !notification.isRead && styles.unreadText]}>
          {notification.message}
        </KurdishText>
        
        {notification.actionRequired && (
          <View style={styles.actionBadge}>
            <Clock size={12} color="#F59E0B" />
            <Text style={styles.actionText}>کردارێک پێویستە</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  onNotificationPress: (notification: Notification) => void;
  onNotificationDismiss: (notificationId: string) => void;
  emptyMessage?: string;
}

export function NotificationList({
  notifications,
  onNotificationPress,
  onNotificationDismiss,
  emptyMessage = 'هیچ ئاگاداریەک نییە',
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Bell size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onPress={() => onNotificationPress(notification)}
          onDismiss={() => onNotificationDismiss(notification.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  dismissButton: {
    padding: 4,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  unreadText: {
    fontWeight: '600',
    color: '#111827',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  listContainer: {
    flex: 1,
  },
});