import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useTenant } from '@/hooks/tenant-context';
import { SubscriptionNotification } from '@/types/subscription';

export default function SystemUpdatesScreen() {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {
    subscriptionNotifications,
    notificationSettings,
    updateNotificationSettings,
    checkExpiringSubscriptions,
    markNotificationAsRead,
    getUnreadNotifications,
  } = useTenant();

  const unreadCount = getUnreadNotifications().length;

  useEffect(() => {
    checkExpiringSubscriptions();
  }, [checkExpiringSubscriptions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkExpiringSubscriptions();
    setRefreshing(false);
  };

  const handleToggleSetting = async (
    key: keyof typeof notificationSettings,
    value: boolean
  ) => {
    await updateNotificationSettings({ [key]: value });
  };

  const handleNotificationPress = async (notification: SubscriptionNotification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    router.push({ pathname: '/subscription-details', params: { id: notification.tenantId } });
  };

  const getNotificationIcon = (type: SubscriptionNotification['type']) => {
    switch (type) {
      case 'expired':
        return XCircle;
      case 'expiry_warning':
        return AlertTriangle;
      case 'suspended':
        return AlertCircle;
      case 'renewed':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: SubscriptionNotification['type']) => {
    switch (type) {
      case 'expired':
        return '#ef4444';
      case 'expiry_warning':
        return '#f59e0b';
      case 'suspended':
        return '#f97316';
      case 'renewed':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const sortedNotifications = [...subscriptionNotifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'ئاگادارکردنەوەکانی ئابوونە',
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#FFF',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={styles.headerButton}>
              <Settings size={24} color="#FFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {unreadCount > 0 && (
            <View style={styles.unreadBanner}>
              <Bell size={24} color="#3b82f6" />
              <KurdishText style={styles.unreadBannerText}>
                {unreadCount} ئاگادارکردنەوەی نەخوێنراوە
              </KurdishText>
            </View>
          )}


          {showSettings && (
            <View style={styles.settingsCard}>
              <KurdishText style={styles.cardTitle}>
                ڕێکخستنەکانی ئاگادارکردنەوە
              </KurdishText>

              <View style={styles.settingRow}>
                <KurdishText style={styles.settingLabel}>
                  چالاککردنی ئاگادارکردنەوە
                </KurdishText>
                <Switch
                  value={notificationSettings.enabled}
                  onValueChange={(value) => handleToggleSetting('enabled', value)}
                />
              </View>

              <View style={styles.settingRow}>
                <KurdishText style={styles.settingLabel}>
                  ڕاگرتنی خۆکار لە کاتی بەسەرچوون
                </KurdishText>
                <Switch
                  value={notificationSettings.autoSuspendOnExpiry}
                  onValueChange={(value) =>
                    handleToggleSetting('autoSuspendOnExpiry', value)
                  }
                />
              </View>

              <View style={styles.warningDaysSection}>
                <KurdishText style={styles.settingLabel}>
                  ئاگادارکردنەوە پێش بەسەرچوون:
                </KurdishText>
                <View style={styles.warningDaysContainer}>
                  {notificationSettings.warningDays.map((days) => (
                    <View key={days} style={styles.warningDayChip}>
                      <KurdishText style={styles.warningDayText}>{days} ڕۆژ</KurdishText>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.channelsSection}>
                <KurdishText style={styles.settingLabel}>
                  کەناڵەکانی ئاگادارکردنەوە:
                </KurdishText>
                <View style={styles.channelsContainer}>
                  {notificationSettings.channels.map((channel) => (
                    <View key={channel} style={styles.channelChip}>
                      <KurdishText style={styles.channelText}>
                        {channel === 'sms' ? 'SMS' : channel === 'email' ? 'ئیمەیڵ' : 'ناو ئەپ'}
                      </KurdishText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={styles.notificationsSection}>
            <View style={styles.sectionHeader}>
              <KurdishText style={styles.sectionTitle}>
                ئاگادارکردنەوەکان
              </KurdishText>
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                <RefreshCw size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {sortedNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Bell size={64} color="#d1d5db" />
                <KurdishText style={styles.emptyText}>هیچ ئاگادارکردنەوەیەک نییە</KurdishText>
                <KurdishText style={styles.emptySubtext}>
                  کاتێک ئابوونەیەک نزیک دەبێتەوە لە بەسەرچوون، ئاگادارکردنەوە لێرە دەردەکەوێت
                </KurdishText>
              </View>
            ) : (
              sortedNotifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                const timeDiff = Date.now() - new Date(notification.sentAt).getTime();
                const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
                const daysAgo = Math.floor(hoursAgo / 24);
                const timeText = daysAgo > 0 
                  ? `${daysAgo} ڕۆژ لەمەوبەر` 
                  : hoursAgo > 0 
                  ? `${hoursAgo} کاتژمێر لەمەوبەر`
                  : 'ئێستا';

                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.read && styles.notificationCardUnread,
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={[styles.notificationIconContainer, { backgroundColor: `${iconColor}15` }]}>
                      <NotificationIcon size={24} color={iconColor} />
                    </View>

                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <KurdishText style={styles.notificationTitle}>
                          {notification.title}
                        </KurdishText>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>

                      <KurdishText style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                      </KurdishText>

                      <View style={styles.notificationFooter}>
                        <View style={styles.notificationMeta}>
                          <Clock size={14} color="#9ca3af" />
                          <KurdishText style={styles.notificationTime}>
                            {timeText}
                          </KurdishText>
                        </View>

                        {notification.daysUntilExpiry !== undefined && (
                          <View style={[
                            styles.daysChip,
                            notification.daysUntilExpiry <= 0 && styles.daysChipExpired,
                            notification.daysUntilExpiry > 0 && notification.daysUntilExpiry <= 7 && styles.daysChipWarning,
                          ]}>
                            <Calendar size={12} color="#fff" />
                            <KurdishText style={styles.daysChipText}>
                              {notification.daysUntilExpiry <= 0 
                                ? 'بەسەرچووە' 
                                : `${notification.daysUntilExpiry} ڕۆژ`}
                            </KurdishText>
                          </View>
                        )}
                      </View>

                      <View style={styles.notificationChannels}>
                        {notification.channels.map((channel) => (
                          <View key={channel} style={styles.channelBadge}>
                            <KurdishText style={styles.channelBadgeText}>
                              {channel === 'sms' ? 'SMS' : channel === 'email' ? 'Email' : 'App'}
                            </KurdishText>
                          </View>
                        ))}
                        {notification.status === 'sent' && (
                          <View style={styles.statusBadge}>
                            <CheckCircle size={12} color="#10b981" />
                            <KurdishText style={styles.statusBadgeText}>نێردراوە</KurdishText>
                          </View>
                        )}
                        {notification.status === 'failed' && (
                          <View style={[styles.statusBadge, styles.statusBadgeFailed]}>
                            <XCircle size={12} color="#ef4444" />
                            <KurdishText style={[styles.statusBadgeText, styles.statusBadgeTextFailed]}>شکستی هێناوە</KurdishText>
                          </View>
                        )}
                      </View>
                    </View>

                    <ChevronRight size={20} color="#d1d5db" />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerButton: {
    marginRight: 16,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  unreadBannerText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#3b82f6',
  },
  settingsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500' as const,
  },
  warningDaysSection: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  warningDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  warningDayChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  warningDayText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600' as const,
  },
  channelsSection: {
    paddingVertical: 14,
  },
  channelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  channelChip: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  channelText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600' as const,
  },
  notificationsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysChipWarning: {
    backgroundColor: '#f59e0b',
  },
  daysChipExpired: {
    backgroundColor: '#ef4444',
  },
  daysChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  notificationChannels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  channelBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  channelBadgeText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeFailed: {
    backgroundColor: '#fef2f2',
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500' as const,
  },
  statusBadgeTextFailed: {
    color: '#ef4444',
  },
});
