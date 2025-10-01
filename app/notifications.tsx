import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Settings, AlertTriangle, CheckCircle, X } from 'lucide-react-native';
import { useNotifications } from '@/hooks/notification-context';
import { useAuth } from '@/hooks/auth-context';
import { NotificationList } from '@/components/NotificationList';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    notifications,
    settings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');

  const handleNotificationPress = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleNotificationDismiss = async (notificationId: string) => {
    await removeNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const userNotifications = useMemo(() => {
    if (!user) return [];
    
    return notifications.filter(notification => {
      if (user.role === 'owner') {
        return notification.recipientType === 'owner' || 
               notification.recipientId === user.id ||
               notification.userId === user.id ||
               notification.type === 'new_store_registration' ||
               notification.type === 'store_request_approved' ||
               notification.type === 'store_request_rejected';
      }
      
      if (user.role === 'admin') {
        return notification.recipientType === 'admin' || 
               notification.recipientId === user.id ||
               notification.userId === user.id ||
               !notification.recipientType;
      }
      
      if (user.role === 'employee') {
        return notification.recipientType === 'employee' || 
               notification.recipientId === user.id ||
               notification.userId === user.id;
      }
      
      if (user.role === 'customer') {
        return notification.recipientType === 'customer' || 
               notification.recipientId === user.id ||
               notification.userId === user.id ||
               notification.customerId === user.id;
      }
      
      return false;
    });
  }, [notifications, user]);

  const userUnreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.isRead).length;
  }, [userNotifications]);

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return userNotifications.filter(n => !n.isRead);
      case 'all':
      default:
        return userNotifications;
    }
  };

  const renderSettings = () => {
    if (!settings) return null;

    return (
      <ScrollView style={styles.settingsContainer}>
        <GradientCard style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Settings size={24} color="#3B82F6" />
            <KurdishText style={styles.settingsTitle}>
              ڕێکخستنی ئاگاداریەکان
            </KurdishText>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <KurdishText style={styles.settingLabel}>
                ئاگاداری قەرزی نوێ
              </KurdishText>
              <Text style={styles.settingDescription}>
                ئاگادارکردنەوە لە کاتی زیادکردنی قەرزی نوێ
              </Text>
            </View>
            <Switch
              value={settings.enableDebtNotifications}
              onValueChange={(value) => {
                updateSettings({ enableDebtNotifications: value }).catch(console.error);
              }}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.enableDebtNotifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <KurdishText style={styles.settingLabel}>
                ئاگاداری پارەدان
              </KurdishText>
              <Text style={styles.settingDescription}>
                ئاگادارکردنەوە لە کاتی وەرگرتنی پارەدان
              </Text>
            </View>
            <Switch
              value={settings.enablePaymentNotifications}
              onValueChange={(value) => {
                updateSettings({ enablePaymentNotifications: value }).catch(console.error);
              }}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.enablePaymentNotifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <KurdishText style={styles.settingLabel}>
                بیرخستنەوەی بەرواری کۆتایی
              </KurdishText>
              <Text style={styles.settingDescription}>
                ئاگادارکردنەوە پێش بەرواری کۆتایی قەرز
              </Text>
            </View>
            <Switch
              value={settings.enableOverdueReminders}
              onValueChange={(value) => {
                updateSettings({ enableOverdueReminders: value }).catch(console.error);
              }}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.enableOverdueReminders ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <KurdishText style={styles.settingLabel}>
                ئاگاداری قەرزی گەورە
              </KurdishText>
              <Text style={styles.settingDescription}>
                ئاگادارکردنەوە لە کاتی قەرزی گەورە
              </Text>
            </View>
            <Switch
              value={settings.enableHighDebtWarnings}
              onValueChange={(value) => {
                updateSettings({ enableHighDebtWarnings: value }).catch(console.error);
              }}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.enableHighDebtWarnings ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <KurdishText style={styles.settingLabel}>
                سنووری قەرزی گەورە
              </KurdishText>
              <Text style={styles.settingDescription}>
                {settings.highDebtThreshold.toLocaleString()} دینار
              </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <KurdishText style={styles.settingLabel}>
                بیرخستنەوە پێش
              </KurdishText>
              <Text style={styles.settingDescription}>
                {settings.reminderDaysBefore} ڕۆژ پێش بەرواری کۆتایی
              </Text>
            </View>
          </View>
        </GradientCard>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearAll}
        >
          <X size={20} color="#EF4444" />
          <Text style={styles.clearButtonText}>
            سڕینەوەی هەموو ئاگاداریەکان
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderStats = () => {
    const overdueNotifications = userNotifications.filter(n => n.type === 'debt_overdue').length;
    const highDebtNotifications = userNotifications.filter(n => n.type === 'high_debt_warning').length;
    const paymentNotifications = userNotifications.filter(n => n.type === 'payment_received').length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <AlertTriangle size={20} color="#EF4444" />
          <Text style={styles.statNumber}>{overdueNotifications}</Text>
          <Text style={styles.statLabel}>قەرزی بەسەرچوو</Text>
        </View>
        
        <View style={styles.statCard}>
          <Bell size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>{highDebtNotifications}</Text>
          <Text style={styles.statLabel}>قەرزی گەورە</Text>
        </View>
        
        <View style={styles.statCard}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.statNumber}>{paymentNotifications}</Text>
          <Text style={styles.statLabel}>پارەدان</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Bell size={24} color="#3B82F6" />
          <KurdishText style={styles.headerTitle}>
            ئاگاداریەکان
          </KurdishText>
          {userUnreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{userUnreadCount}</Text>
            </View>
          )}
        </View>
        
        {userUnreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.markAllText}>نیشانکردنی هەموو وەک خوێندراوە</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderStats()}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            هەموو ({userNotifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
            نەخوێندراو ({userUnreadCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            ڕێکخستن
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'settings' ? (
          renderSettings()
        ) : (
          <NotificationList
            notifications={getFilteredNotifications()}
            onNotificationPress={handleNotificationPress}
            onNotificationDismiss={handleNotificationDismiss}
            emptyMessage={
              activeTab === 'unread' 
                ? 'هیچ ئاگاداریەکی نەخوێندراو نییە'
                : 'هیچ ئاگاداریەک نییە'
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  markAllText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingsCard: {
    marginBottom: 24,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});