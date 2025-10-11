import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Users, Clock, AlertCircle, Database, TrendingUp } from 'lucide-react-native';

import { KurdishText } from '@/components/KurdishText';
import { useAuth } from '@/hooks/auth-context';

export default function RealtimeMonitoringScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - backend disabled
  const realtimeStats = null;
  const statsLoading = false;
  const refetchStats = async () => {};
  const activeUsers: any[] = [];
  const usersLoading = false;
  const refetchUsers = async () => {};
  const recentActivities: any[] = [];
  const activitiesLoading = false;
  const refetchActivities = async () => {};

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchUsers(), refetchActivities()]);
    setRefreshing(false);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'good': return 'باش';
      case 'warning': return 'ئاگاداری';
      case 'critical': return 'گرنگ';
      default: return 'نەزانراو';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ڕۆژ پێش ئێستا`;
    if (hours > 0) return `${hours} کاتژمێر پێش ئێستا`;
    if (minutes > 0) return `${minutes} خولەک پێش ئێستا`;
    return 'ئێستا';
  };

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'چاوەڕوانی بە کاتی ڕاستەوخۆ', headerBackTitle: 'گەڕانەوە' }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <KurdishText style={styles.errorText}>تەنها بەڕێوەبەر دەتوانێت ئەم بەشە ببینێت</KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'چاوەڕوانی بە کاتی ڕاستەوخۆ', headerBackTitle: 'گەڕانەوە' }} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {statsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : realtimeStats ? (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                <Users size={24} color="#fff" />
                <KurdishText style={styles.statValue}>{realtimeStats.activeUsers}</KurdishText>
                <KurdishText style={styles.statLabel}>بەکارهێنەری سەرهەڵدان</KurdishText>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
                <Activity size={24} color="#fff" />
                <KurdishText style={styles.statValue}>{realtimeStats.todayActivities}</KurdishText>
                <KurdishText style={styles.statLabel}>چالاکی ئەمڕۆ</KurdishText>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
                <Clock size={24} color="#fff" />
                <KurdishText style={styles.statValue}>{realtimeStats.todayLogins}</KurdishText>
                <KurdishText style={styles.statLabel}>چوونەژوورەوەی ئەمڕۆ</KurdishText>
              </View>

              <View style={[styles.statCard, { backgroundColor: getHealthColor(realtimeStats.systemHealth) }]}>
                <TrendingUp size={24} color="#fff" />
                <KurdishText style={styles.statValue}>{getHealthText(realtimeStats.systemHealth)}</KurdishText>
                <KurdishText style={styles.statLabel}>دۆخی سیستەم</KurdishText>
              </View>
            </View>

            {realtimeStats.lastBackup && (
              <View style={styles.backupCard}>
                <Database size={20} color="#6b7280" />
                <View style={styles.backupInfo}>
                  <KurdishText style={styles.backupLabel}>دواترین کاپی</KurdishText>
                  <KurdishText style={styles.backupTime}>{formatTime(realtimeStats.lastBackup)}</KurdishText>
                </View>
              </View>
            )}

            {realtimeStats.pendingAlerts > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => router.push('/inactive-users-report')}
              >
                <AlertCircle size={20} color="#f59e0b" />
                <View style={styles.alertInfo}>
                  <KurdishText style={styles.alertLabel}>ئاگاداری چاوەڕوان</KurdishText>
                  <KurdishText style={styles.alertCount}>{realtimeStats.pendingAlerts} ئاگاداری</KurdishText>
                </View>
              </TouchableOpacity>
            )}
          </>
        ) : null}

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>بەکارهێنەرانی سەرهەڵدان</KurdishText>
          {usersLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : activeUsers && activeUsers.length > 0 ? (
            activeUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <KurdishText style={styles.userName}>{user.name}</KurdishText>
                    <KurdishText style={styles.userRole}>
                      {user.role === 'admin' ? 'بەڕێوەبەر' : user.role === 'employee' ? 'کارمەند' : 'کڕیار'}
                    </KurdishText>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                </View>
                {user.currentPage && (
                  <KurdishText style={styles.userPage}>پەڕە: {user.currentPage}</KurdishText>
                )}
                <KurdishText style={styles.userActivity}>
                  دواترین چالاکی: {formatTime(user.lastActivityAt)}
                </KurdishText>
              </View>
            ))
          ) : (
            <KurdishText style={styles.emptyText}>هیچ بەکارهێنەرێکی سەرهەڵدان نییە</KurdishText>
          )}
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>دواترین چالاکیەکان</KurdishText>
          {activitiesLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <KurdishText style={styles.activityUser}>{activity.userName}</KurdishText>
                  <KurdishText style={styles.activityTime}>{formatTime(activity.timestamp)}</KurdishText>
                </View>
                <KurdishText style={styles.activityDescription}>{activity.description}</KurdishText>
              </View>
            ))
          ) : (
            <KurdishText style={styles.emptyText}>هیچ چالاکیەک نییە</KurdishText>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/employee-activity')}
          >
            <Clock size={20} color="#fff" />
            <KurdishText style={styles.actionButtonText}>ئاماری چوونەژوورەوە</KurdishText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/system-settings')}
          >
            <Database size={20} color="#fff" />
            <KurdishText style={styles.actionButtonText}>بەڕێوەبردنی کاپی</KurdishText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center' as const,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center' as const,
  },
  backupCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backupInfo: {
    marginLeft: 12,
    flex: 1,
  },
  backupLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  backupTime: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
  },
  alertCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fef3c7',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertInfo: {
    marginLeft: 12,
    flex: 1,
  },
  alertLabel: {
    fontSize: 14,
    color: '#92400e',
  },
  alertCount: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: 'bold' as const,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#111827',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userPage: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  userActivity: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#111827',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center' as const,
    padding: 20,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
});
