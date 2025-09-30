import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Clock,
  Activity,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsability } from '@/hooks/usability-context';

export default function UsageStatisticsScreen() {
  const { usageStats } = useUsability();

  const totalUsers = usageStats.length;
  const totalTime = usageStats.reduce((sum, s) => sum + s.totalTime, 0);
  const totalSessions = usageStats.reduce((sum, s) => sum + s.sessionsCount, 0);
  const avgSessionDuration = totalSessions > 0 ? totalTime / totalSessions : 0;

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}س ${minutes}خ`;
    }
    return `${minutes}خ`;
  };

  const topUsers = [...usageStats]
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 10);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ئاماری بەکارهێنان',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#fff',
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            کورتەی گشتی
          </KurdishText>
          
          <View style={styles.statsGrid}>
            <GradientCard colors={['#3B82F6', '#3B82F6']} intensity="light">
              <View style={styles.statCard}>
                <Users size={32} color="#3B82F6" />
                <KurdishText variant="caption" color="#6B7280" style={styles.statLabel}>
                  بەکارهێنەران
                </KurdishText>
                <KurdishText variant="title" color="#1F2937">
                  {totalUsers}
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard colors={['#10B981', '#10B981']} intensity="light">
              <View style={styles.statCard}>
                <Clock size={32} color="#10B981" />
                <KurdishText variant="caption" color="#6B7280" style={styles.statLabel}>
                  کۆی کات
                </KurdishText>
                <KurdishText variant="title" color="#1F2937">
                  {formatTime(totalTime)}
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard colors={['#F59E0B', '#F59E0B']} intensity="light">
              <View style={styles.statCard}>
                <Activity size={32} color="#F59E0B" />
                <KurdishText variant="caption" color="#6B7280" style={styles.statLabel}>
                  دانیشتنەکان
                </KurdishText>
                <KurdishText variant="title" color="#1F2937">
                  {totalSessions}
                </KurdishText>
              </View>
            </GradientCard>

            <GradientCard colors={['#EC4899', '#EC4899']} intensity="light">
              <View style={styles.statCard}>
                <Zap size={32} color="#EC4899" />
                <KurdishText variant="caption" color="#6B7280" style={styles.statLabel}>
                  ناوەندی دانیشتن
                </KurdishText>
                <KurdishText variant="title" color="#1F2937">
                  {formatTime(avgSessionDuration)}
                </KurdishText>
              </View>
            </GradientCard>
          </View>
        </View>

        {topUsers.length > 0 && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              بەکارهێنەرە چالاکەکان
            </KurdishText>
            
            {topUsers.map((user, index) => (
              <View key={user.userId} style={styles.userItem}>
                <GradientCard>
                  <View style={styles.userContent}>
                    <View style={styles.userLeft}>
                      <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#CD7F32' : '#E5E7EB' }]}>
                        <KurdishText variant="body" color={index < 3 ? '#fff' : '#6B7280'}>
                          {index + 1}
                        </KurdishText>
                      </View>
                      <View style={styles.userInfo}>
                        <KurdishText variant="body" color="#1F2937">
                          {user.userName}
                        </KurdishText>
                        <KurdishText variant="caption" color="#6B7280">
                          {user.sessionsCount} دانیشتن
                        </KurdishText>
                      </View>
                    </View>
                    <View style={styles.userStats}>
                      <View style={styles.statRow}>
                        <Clock size={16} color="#6B7280" />
                        <KurdishText variant="caption" color="#6B7280">
                          {formatTime(user.totalTime)}
                        </KurdishText>
                      </View>
                      <View style={styles.statRow}>
                        <TrendingUp size={16} color="#10B981" />
                        <KurdishText variant="caption" color="#10B981">
                          {formatTime(user.averageSessionDuration)}
                        </KurdishText>
                      </View>
                    </View>
                  </View>

                  {user.mostUsedFeatures.length > 0 && (
                    <View style={styles.featuresSection}>
                      <KurdishText variant="caption" color="#6B7280" style={styles.featuresTitle}>
                        تایبەتمەندیە زۆر بەکارهاتووەکان:
                      </KurdishText>
                      <View style={styles.featuresList}>
                        {user.mostUsedFeatures.slice(0, 3).map((feature, idx) => (
                          <View key={idx} style={styles.featureTag}>
                            <KurdishText variant="caption" color="#3B82F6">
                              {feature.feature} ({feature.count})
                            </KurdishText>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </GradientCard>
              </View>
            ))}
          </View>
        )}

        {usageStats.length === 0 && (
          <View style={styles.emptyState}>
            <Activity size={64} color="#D1D5DB" />
            <KurdishText variant="subtitle" color="#6B7280" style={styles.emptyText}>
              هیچ ئاماریەک بەردەست نییە
            </KurdishText>
            <KurdishText variant="body" color="#9CA3AF" style={styles.emptySubtext}>
              ئاماری بەکارهێنان دوای چالاکی بەکارهێنەران نیشان دەدرێت
            </KurdishText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    alignItems: 'center',
    gap: 8,
    minWidth: 150,
  },
  statLabel: {
    marginTop: 4,
  },
  userItem: {
    marginBottom: 12,
  },
  userContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userStats: {
    gap: 4,
    alignItems: 'flex-end',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuresSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  featuresTitle: {
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
});
