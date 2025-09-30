import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
} from 'lucide-react-native';
import { useLocationTracking } from '@/hooks/location-tracking-context';
import { useAuth } from '@/hooks/auth-context';
import { trpc } from '@/lib/trpc';
import { KurdishText } from '@/components/KurdishText';
import type { LoginActivity, LocationAlert } from '@/types/location-tracking';

export default function LocationTrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const locationTracking = useLocationTracking();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'activities' | 'alerts' | 'settings'>('activities');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'employee' | 'customer'>('all');

  const activitiesQuery = trpc.location.tracking.getActivities.useQuery({
    userRole: filterRole === 'all' ? undefined : filterRole,
  });

  const alertsQuery = trpc.location.tracking.getAlerts.useQuery({
    resolved: false,
  });

  const settingsQuery = trpc.location.tracking.getSettings.useQuery();

  const activities = activitiesQuery.data || [];
  const alerts = alertsQuery.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      activitiesQuery.refetch(),
      alertsQuery.refetch(),
      settingsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ckb-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'چالاک';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}س ${minutes}خ`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#EF4444';
      case 'employee':
        return '#3B82F6';
      case 'customer':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'بەڕێوەبەر';
      case 'employee':
        return 'کارمەند';
      case 'customer':
        return 'کڕیار';
      default:
        return role;
    }
  };

  const renderActivityItem = (activity: LoginActivity) => (
    <View key={activity.id} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityUser}>
          <View style={[styles.roleIndicator, { backgroundColor: getRoleColor(activity.userRole) }]} />
          <View style={styles.activityUserInfo}>
            <KurdishText style={styles.activityUserName}>{activity.userName}</KurdishText>
            <Text style={styles.activityUserRole}>{getRoleLabel(activity.userRole)}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: activity.status === 'active' ? '#10B981' : '#6B7280' }
        ]}>
          <Text style={styles.statusText}>
            {activity.status === 'active' ? 'چالاک' : 'کۆتایی هاتووە'}
          </Text>
        </View>
      </View>

      <View style={styles.activityDetails}>
        <View style={styles.activityDetailRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.activityDetailText}>
            چوونەژوورەوە: {formatDate(activity.loginTime)}
          </Text>
        </View>

        {activity.logoutTime && (
          <View style={styles.activityDetailRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.activityDetailText}>
              دەرچوون: {formatDate(activity.logoutTime)}
            </Text>
          </View>
        )}

        <View style={styles.activityDetailRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.activityDetailText}>
            {activity.location.address || `${activity.location.latitude.toFixed(4)}, ${activity.location.longitude.toFixed(4)}`}
          </Text>
        </View>

        <View style={styles.activityDetailRow}>
          <User size={16} color="#6B7280" />
          <Text style={styles.activityDetailText}>
            {activity.deviceInfo.platform} - {activity.deviceInfo.deviceType}
          </Text>
        </View>

        {activity.sessionDuration && (
          <View style={styles.activityDetailRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.activityDetailText}>
              ماوە: {formatDuration(activity.sessionDuration)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderAlertItem = (alert: LocationAlert) => (
    <View key={alert.id} style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIcon}>
          <AlertTriangle size={20} color="#EF4444" />
        </View>
        <View style={styles.alertContent}>
          <KurdishText style={styles.alertTitle}>{alert.userName}</KurdishText>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <Text style={styles.alertTime}>{formatDate(alert.timestamp)}</Text>
        </View>
        <View style={[
          styles.severityBadge,
          {
            backgroundColor:
              alert.severity === 'high' ? '#FEE2E2' :
              alert.severity === 'medium' ? '#FEF3C7' : '#DBEAFE'
          }
        ]}>
          <Text style={[
            styles.severityText,
            {
              color:
                alert.severity === 'high' ? '#EF4444' :
                alert.severity === 'medium' ? '#F59E0B' : '#3B82F6'
            }
          ]}>
            {alert.severity === 'high' ? 'بەرز' :
             alert.severity === 'medium' ? 'مامناوەند' : 'نزم'}
          </Text>
        </View>
      </View>

      <View style={styles.alertLocation}>
        <MapPin size={14} color="#6B7280" />
        <Text style={styles.alertLocationText}>
          {alert.location.address || `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`}
        </Text>
      </View>
    </View>
  );

  const renderSettingsTab = () => {
    const currentSettings = settingsQuery.data || locationTracking?.settings;

    if (settingsQuery.isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      );
    }

    return (
      <View style={styles.settingsContainer}>
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <KurdishText style={styles.settingTitle}>
              چالاککردنی چاودێری شوێن
            </KurdishText>
            <Switch
              value={currentSettings?.enableLocationTracking}
              onValueChange={(value) => {
                locationTracking?.updateSettings({ enableLocationTracking: value });
                settingsQuery.refetch();
              }}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            چاودێری شوێنی جوگرافی بۆ هەموو بەکارهێنەران
          </Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <KurdishText style={styles.settingTitle}>
              چاودێری کارمەندان
            </KurdishText>
            <Switch
              value={currentSettings?.trackEmployeeLocation}
              onValueChange={(value) => {
                locationTracking?.updateSettings({ trackEmployeeLocation: value });
                settingsQuery.refetch();
              }}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            تۆمارکردنی شوێنی کارمەندان لە کاتی چوونەژوورەوە
          </Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <KurdishText style={styles.settingTitle}>
              چاودێری کڕیاران
            </KurdishText>
            <Switch
              value={currentSettings?.trackCustomerLocation}
              onValueChange={(value) => {
                locationTracking?.updateSettings({ trackCustomerLocation: value });
                settingsQuery.refetch();
              }}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            تۆمارکردنی شوێنی کڕیاران لە کاتی چوونەژوورەوە
          </Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <KurdishText style={styles.settingTitle}>
              پێویستی بە شوێن بۆ چوونەژوورەوە
            </KurdishText>
            <Switch
              value={currentSettings?.requireLocationForLogin}
              onValueChange={(value) => {
                locationTracking?.updateSettings({ requireLocationForLogin: value });
                settingsQuery.refetch();
              }}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            پێویستکردنی دەستەبەری شوێن بۆ چوونەژوورەوە
          </Text>
        </View>

        {locationTracking?.currentLocation && (
          <View style={styles.currentLocationCard}>
            <View style={styles.currentLocationHeader}>
              <MapPin size={20} color="#3B82F6" />
              <KurdishText style={styles.currentLocationTitle}>
                شوێنی ئێستا
              </KurdishText>
            </View>
            <Text style={styles.currentLocationText}>
              {locationTracking.currentLocation.latitude.toFixed(6)}, {locationTracking.currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.currentLocationAccuracy}>
              وردی: {locationTracking.currentLocation.accuracy.toFixed(0)} مەتر
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <KurdishText style={styles.errorText}>
            تەنها بەڕێوەبەر دەتوانێت ئەم بەشە ببینێت
          </KurdishText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>گەڕانەوە</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F3F4F6', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'activities' && styles.activeTab]}
                onPress={() => setSelectedTab('activities')}
              >
                <Clock size={20} color={selectedTab === 'activities' ? '#3B82F6' : '#6B7280'} />
                <Text style={[styles.tabText, selectedTab === 'activities' && styles.activeTabText]}>
                  چالاکیەکان
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, selectedTab === 'alerts' && styles.activeTab]}
                onPress={() => setSelectedTab('alerts')}
              >
                <AlertTriangle size={20} color={selectedTab === 'alerts' ? '#3B82F6' : '#6B7280'} />
                <Text style={[styles.tabText, selectedTab === 'alerts' && styles.activeTabText]}>
                  ئاگاداریەکان
                </Text>
                {alerts.length > 0 && (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{alerts.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, selectedTab === 'settings' && styles.activeTab]}
                onPress={() => setSelectedTab('settings')}
              >
                <Settings size={20} color={selectedTab === 'settings' ? '#3B82F6' : '#6B7280'} />
                <Text style={[styles.tabText, selectedTab === 'settings' && styles.activeTabText]}>
                  ڕێکخستن
                </Text>
              </TouchableOpacity>
            </View>

            {selectedTab === 'activities' && (
              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.filterButton, filterRole === 'all' && styles.activeFilter]}
                    onPress={() => setFilterRole('all')}
                  >
                    <Text style={[styles.filterText, filterRole === 'all' && styles.activeFilterText]}>
                      هەموو
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterButton, filterRole === 'admin' && styles.activeFilter]}
                    onPress={() => setFilterRole('admin')}
                  >
                    <Text style={[styles.filterText, filterRole === 'admin' && styles.activeFilterText]}>
                      بەڕێوەبەر
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterButton, filterRole === 'employee' && styles.activeFilter]}
                    onPress={() => setFilterRole('employee')}
                  >
                    <Text style={[styles.filterText, filterRole === 'employee' && styles.activeFilterText]}>
                      کارمەند
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterButton, filterRole === 'customer' && styles.activeFilter]}
                    onPress={() => setFilterRole('customer')}
                  >
                    <Text style={[styles.filterText, filterRole === 'customer' && styles.activeFilterText]}>
                      کڕیار
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
              />
            }
          >
            {selectedTab === 'activities' && (
              <View style={styles.activitiesContainer}>
                {activitiesQuery.isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
                  </View>
                ) : activities.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MapPin size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>هیچ چالاکییەک نییە</Text>
                  </View>
                ) : (
                  activities.map(renderActivityItem)
                )}
              </View>
            )}

            {selectedTab === 'alerts' && (
              <View style={styles.alertsContainer}>
                {alertsQuery.isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
                  </View>
                ) : alerts.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <CheckCircle size={48} color="#10B981" />
                    <Text style={styles.emptyText}>هیچ ئاگادارییەک نییە</Text>
                  </View>
                ) : (
                  alerts.map(renderAlertItem)
                )}
              </View>
            )}

            {selectedTab === 'settings' && renderSettingsTab()}
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  alertBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  activitiesContainer: {
    padding: 16,
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  activityUserInfo: {
    gap: 4,
  },
  activityUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityUserRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  activityDetails: {
    gap: 8,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityDetailText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  alertsContainer: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  alertLocationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  settingsContainer: {
    padding: 16,
    gap: 12,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentLocationCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  currentLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentLocationText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 4,
  },
  currentLocationAccuracy: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
