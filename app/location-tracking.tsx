import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Activity, AlertTriangle, Settings, Users, Clock } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { KurdishText } from '@/components/KurdishText';

export default function LocationTrackingScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'activities' | 'alerts' | 'settings'>('activities');

  const activitiesQuery = trpc.location.tracking.getActivities.useQuery({});
  const alertsQuery = trpc.location.tracking.getAlerts.useQuery({ resolved: false });
  const settingsQuery = trpc.location.tracking.getSettings.useQuery();
  const updateSettingsMutation = trpc.location.tracking.updateSettings.useMutation();
  const resolveAlertMutation = trpc.location.tracking.resolveAlert.useMutation();

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      await updateSettingsMutation.mutateAsync(newSettings);
      Alert.alert('سەرکەوتوو', 'ڕێکخستنەکان نوێکرانەوە');
      settingsQuery.refetch();
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە نوێکردنەوەی ڕێکخستنەکان');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlertMutation.mutateAsync({ alertId });
      Alert.alert('سەرکەوتوو', 'ئاگاداری چارەسەرکرا');
      alertsQuery.refetch();
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا');
    }
  };

  const renderActivities = () => {
    if (activitiesQuery.isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      );
    }

    const activities = activitiesQuery.data || [];

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Activity size={24} color="#10b981" />
            <Text style={styles.statValue}>{activities.filter(a => a.status === 'active').length}</Text>
            <KurdishText style={styles.statLabel}>چالاک</KurdishText>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#6366f1" />
            <Text style={styles.statValue}>{activities.length}</Text>
            <KurdishText style={styles.statLabel}>کۆی گشتی</KurdishText>
          </View>
        </View>

        <ScrollView style={styles.listContainer}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityInfo}>
                  <Users size={20} color="#6366f1" />
                  <KurdishText style={styles.activityName}>{activity.userName}</KurdishText>
                </View>
                <View style={[
                  styles.statusBadge,
                  activity.status === 'active' ? styles.statusActive : styles.statusEnded
                ]}>
                  <Text style={styles.statusText}>
                    {activity.status === 'active' ? 'چالاک' : 'کۆتایی هاتووە'}
                  </Text>
                </View>
              </View>

              <View style={styles.activityDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={16} color="#64748b" />
                  <KurdishText style={styles.detailText}>
                    {activity.location.address || `${activity.location.latitude.toFixed(4)}, ${activity.location.longitude.toFixed(4)}`}
                  </KurdishText>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#64748b" />
                  <Text style={styles.detailText}>
                    {new Date(activity.loginTime).toLocaleString('ku')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Activity size={16} color="#64748b" />
                  <Text style={styles.detailText}>
                    {activity.deviceInfo.platform} - {activity.deviceInfo.deviceType}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAlerts = () => {
    if (alertsQuery.isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      );
    }

    const alerts = alertsQuery.data || [];

    return (
      <View style={styles.tabContent}>
        <View style={styles.alertsHeader}>
          <AlertTriangle size={24} color="#ef4444" />
          <KurdishText style={styles.alertsTitle}>
            {alerts.length} ئاگاداری نوێ
          </KurdishText>
        </View>

        <ScrollView style={styles.listContainer}>
          {alerts.map((alert) => (
            <View key={alert.id} style={[
              styles.alertCard,
              alert.severity === 'high' ? styles.alertHigh : alert.severity === 'medium' ? styles.alertMedium : null,
            ]}>
              <View style={styles.alertHeader}>
                <KurdishText style={styles.alertUserName}>{alert.userName}</KurdishText>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                  <Text style={styles.severityText}>{getSeverityLabel(alert.severity)}</Text>
                </View>
              </View>

              <KurdishText style={styles.alertMessage}>{alert.message}</KurdishText>

              <View style={styles.alertDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.detailTextSmall}>
                    {alert.location.address || 'شوێنی نامۆ'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color="#64748b" />
                  <Text style={styles.detailTextSmall}>
                    {new Date(alert.timestamp).toLocaleString('ku')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => handleResolveAlert(alert.id)}
              >
                <KurdishText style={styles.resolveButtonText}>چارەسەرکردن</KurdishText>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSettings = () => {
    if (settingsQuery.isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>چاوەڕوان بە...</Text>
        </View>
      );
    }

    const settings = settingsQuery.data;
    if (!settings) return null;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.settingsSection}>
          <KurdishText style={styles.sectionTitle}>ڕێکخستنەکانی گشتی</KurdishText>

          <View style={styles.settingRow}>
            <KurdishText style={styles.settingLabel}>چالاککردنی شوێنپێکەوتن</KurdishText>
            <Switch
              value={settings.enableLocationTracking}
              onValueChange={(value) => handleUpdateSettings({ ...settings, enableLocationTracking: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <KurdishText style={styles.settingLabel}>شوێنپێکەوتنی کارمەندان</KurdishText>
            <Switch
              value={settings.trackEmployeeLocation}
              onValueChange={(value) => handleUpdateSettings({ ...settings, trackEmployeeLocation: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <KurdishText style={styles.settingLabel}>شوێنپێکەوتنی کڕیاران</KurdishText>
            <Switch
              value={settings.trackCustomerLocation}
              onValueChange={(value) => handleUpdateSettings({ ...settings, trackCustomerLocation: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <KurdishText style={styles.settingLabel}>پێویستی بە شوێن بۆ چوونەژوورەوە</KurdishText>
            <Switch
              value={settings.requireLocationForLogin}
              onValueChange={(value) => handleUpdateSettings({ ...settings, requireLocationForLogin: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <KurdishText style={styles.settingLabel}>سنووردارکردنی چوونەژوورەوە بە شوێن</KurdishText>
            <Switch
              value={settings.restrictLoginByLocation}
              onValueChange={(value) => handleUpdateSettings({ ...settings, restrictLoginByLocation: value })}
            />
          </View>
        </View>

        <View style={styles.settingsSection}>
          <KurdishText style={styles.sectionTitle}>ماوەی نوێکردنەوە (چرکە)</KurdishText>
          <TextInput
            style={styles.input}
            value={String(settings.locationUpdateInterval)}
            onChangeText={(text) => {
              const value = parseInt(text) || 300;
              handleUpdateSettings({ ...settings, locationUpdateInterval: value });
            }}
            keyboardType="numeric"
            placeholder="300"
          />
        </View>
      </ScrollView>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'بەرز';
      case 'medium': return 'مامناوەند';
      case 'low': return 'نزم';
      default: return severity;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'شوێنپێکەوتن',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'activities' && styles.tabActive]}
          onPress={() => setSelectedTab('activities')}
        >
          <Activity size={20} color={selectedTab === 'activities' ? '#6366f1' : '#64748b'} />
          <KurdishText style={[styles.tabText, selectedTab === 'activities' && styles.tabTextActive]}>
            چالاکی
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'alerts' && styles.tabActive]}
          onPress={() => setSelectedTab('alerts')}
        >
          <AlertTriangle size={20} color={selectedTab === 'alerts' ? '#6366f1' : '#64748b'} />
          <KurdishText style={[styles.tabText, selectedTab === 'alerts' && styles.tabTextActive]}>
            ئاگاداری
          </KurdishText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'settings' && styles.tabActive]}
          onPress={() => setSelectedTab('settings')}
        >
          <Settings size={20} color={selectedTab === 'settings' ? '#6366f1' : '#64748b'} />
          <KurdishText style={[styles.tabText, selectedTab === 'settings' && styles.tabTextActive]}>
            ڕێکخستن
          </KurdishText>
        </TouchableOpacity>
      </View>

      {selectedTab === 'activities' && renderActivities()}
      {selectedTab === 'alerts' && renderAlerts()}
      {selectedTab === 'settings' && renderSettings()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: '600' as const,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusEnded: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#1e293b',
  },
  activityDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  detailTextSmall: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  alertCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6b7280',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHigh: {
    borderLeftColor: '#ef4444',
  },
  alertMedium: {
    borderLeftColor: '#f59e0b',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertUserName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#fff',
  },
  alertMessage: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  alertDetails: {
    gap: 6,
    marginBottom: 12,
  },
  resolveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  settingsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: {
    fontSize: 14,
    color: '#475569',
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#1e293b',
  },
});
