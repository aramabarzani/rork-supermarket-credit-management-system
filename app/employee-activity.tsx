import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { 
  Activity, 
  Calendar, 
  Clock, 
  User, 
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Shield,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';

export default function EmployeeActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    users, 
    getEmployeeActivityLogs, 
    getEmployeeSessions,
    getEmployeeStats,
  } = useUsers();
  
  const employee = users.find(u => u.id === id && u.role === 'employee');
  const activityLogs = getEmployeeActivityLogs(id || '');
  const sessions = getEmployeeSessions(id || '');
  const stats = getEmployeeStats(id || '');
  
  const [activeTab, setActiveTab] = useState<'activity' | 'sessions' | 'stats'>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'login' | 'debt' | 'payment' | 'customer'>('all');

  if (!employee) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientCard style={styles.errorCard}>
          <KurdishText variant="title" color="#EF4444">
            {'کارمەند نەدۆزرایەوە'}
          </KurdishText>
        </GradientCard>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <LogIn size={16} color="#10B981" />;
      case 'logout':
        return <LogOut size={16} color="#EF4444" />;
      case 'add_debt':
        return <Plus size={16} color="#3B82F6" />;
      case 'add_payment':
        return <Plus size={16} color="#10B981" />;
      case 'edit_debt':
      case 'edit_payment':
      case 'edit_customer':
        return <Edit3 size={16} color="#F59E0B" />;
      case 'delete_debt':
      case 'delete_payment':
      case 'delete_customer':
        return <Trash2 size={16} color="#EF4444" />;
      case 'view_report':
        return <Eye size={16} color="#6B7280" />;
      case 'update_permissions':
        return <Shield size={16} color="#8B5CF6" />;
      default:
        return <Activity size={16} color="#6B7280" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'LOGIN': 'چوونەژوورەوە',
      'LOGOUT': 'چوونەدەرەوە',
      'ADD_DEBT': 'زیادکردنی قەرز',
      'ADD_PAYMENT': 'زیادکردنی پارەدان',
      'ADD_CUSTOMER': 'زیادکردنی کڕیار',
      'EDIT_DEBT': 'دەستکاری قەرز',
      'EDIT_PAYMENT': 'دەستکاری پارەدان',
      'EDIT_CUSTOMER': 'دەستکاری کڕیار',
      'DELETE_DEBT': 'سڕینەوەی قەرز',
      'DELETE_PAYMENT': 'سڕینەوەی پارەدان',
      'DELETE_CUSTOMER': 'سڕینەوەی کڕیار',
      'VIEW_REPORT': 'بینینی ڕاپۆرت',
      'UPDATE_PERMISSIONS': 'نوێکردنەوەی دەسەڵاتەکان',
    };
    return labels[action] || action;
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getActionLabel(log.action).includes(searchQuery);
    
    if (filterType === 'all') return matchesSearch;
    
    const actionType = log.action.toLowerCase();
    switch (filterType) {
      case 'login':
        return matchesSearch && (actionType.includes('login') || actionType.includes('logout'));
      case 'debt':
        return matchesSearch && actionType.includes('debt');
      case 'payment':
        return matchesSearch && actionType.includes('payment');
      case 'customer':
        return matchesSearch && actionType.includes('customer');
      default:
        return matchesSearch;
    }
  });

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="گەڕان لە چالاکیەکان"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'هەموو' },
          { key: 'login', label: 'چوونەژوورەوە' },
          { key: 'debt', label: 'قەرزەکان' },
          { key: 'payment', label: 'پارەدانەکان' },
          { key: 'customer', label: 'کڕیارەکان' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterType === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(filter.key as any)}
          >
            <KurdishText 
              variant="caption" 
              color={filterType === filter.key ? 'white' : '#6B7280'}
            >
              {filter.label}
            </KurdishText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activity List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.activityList}>
        {filteredLogs.length === 0 ? (
          <GradientCard style={styles.emptyState}>
            <Activity size={48} color="#9CA3AF" />
            <KurdishText variant="subtitle" color="#6B7280" style={styles.emptyTitle}>
              {'هیچ چالاکیەک نەدۆزرایەوە'}
            </KurdishText>
          </GradientCard>
        ) : (
          filteredLogs.map((log) => (
            <GradientCard key={log.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityIcon}>
                  {getActivityIcon(log.action)}
                </View>
                <View style={styles.activityInfo}>
                  <KurdishText variant="body" color="#1F2937">
                    {getActionLabel(log.action)}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    {log.details}
                  </KurdishText>
                </View>
                <View style={styles.activityTime}>
                  <Clock size={14} color="#6B7280" />
                  <KurdishText variant="caption" color="#6B7280">
                    {formatDate(log.timestamp)}
                  </KurdishText>
                </View>
              </View>
            </GradientCard>
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderSessionsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <GradientCard style={styles.emptyState}>
            <LogIn size={48} color="#9CA3AF" />
            <KurdishText variant="subtitle" color="#6B7280" style={styles.emptyTitle}>
              {'هیچ دانیشتنێک نەدۆزرایەوە'}
            </KurdishText>
          </GradientCard>
        ) : (
          sessions.map((session) => (
            <GradientCard key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={[
                  styles.sessionStatus,
                  session.isActive ? styles.sessionActive : styles.sessionInactive
                ]}>
                  <KurdishText variant="caption" color="white">
                    {session.isActive ? 'چالاک' : 'ناچالاک'}
                  </KurdishText>
                </View>
              </View>
              
              <View style={styles.sessionDetails}>
                <View style={styles.sessionRow}>
                  <Calendar size={16} color="#6B7280" />
                  <KurdishText variant="caption" color="#6B7280">
                    {'چوونەژوورەوە: '}{formatDate(session.loginAt)}
                  </KurdishText>
                </View>
                
                <View style={styles.sessionRow}>
                  <Activity size={16} color="#6B7280" />
                  <KurdishText variant="caption" color="#6B7280">
                    {'کۆتا چالاکی: '}{formatDate(session.lastActivityAt)}
                  </KurdishText>
                </View>
                
                <View style={styles.sessionRow}>
                  <User size={16} color="#6B7280" />
                  <KurdishText variant="caption" color="#6B7280">
                    {'ئامێری: '}{session.deviceId}
                  </KurdishText>
                </View>
              </View>
            </GradientCard>
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <GradientCard style={styles.statsCard}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.statsTitle}>
            {'ئامارەکانی کارکردن'}
          </KurdishText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Plus size={24} color="#3B82F6" />
              </View>
              <KurdishText variant="title" color="#1F2937">
                {stats.totalDebts}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                {'کۆی قەرزەکان'}
              </KurdishText>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Plus size={24} color="#10B981" />
              </View>
              <KurdishText variant="title" color="#1F2937">
                {stats.totalPayments}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                {'کۆی پارەدانەکان'}
              </KurdishText>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Activity size={24} color="#F59E0B" />
              </View>
              <KurdishText variant="title" color="#1F2937">
                {stats.rating}/5
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                {'نرخەی کارکردن'}
              </KurdishText>
            </View>
          </View>
        </GradientCard>

        <GradientCard style={styles.performanceCard}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.performanceTitle}>
            {'ئاستی کارکردن'}
          </KurdishText>
          
          <View style={styles.performanceBar}>
            <View style={[styles.performanceProgress, { width: `${(stats.rating / 5) * 100}%` }]} />
          </View>
          
          <KurdishText variant="body" color="#6B7280" style={styles.performanceText}>
            {'ئەم کارمەندە '}{stats.rating >= 4 ? 'زۆر باش' : stats.rating >= 3 ? 'باش' : 'ناوەند'}{' کاری کردووە'}
          </KurdishText>
        </GradientCard>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <KurdishText variant="title" color="#1F2937">
          {'چالاکیەکانی کارمەند'}
        </KurdishText>
        <KurdishText variant="body" color="#6B7280">
          {employee.name}
        </KurdishText>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'activity', label: 'چالاکیەکان', icon: Activity },
          { key: 'sessions', label: 'دانیشتنەکان', icon: LogIn },
          { key: 'stats', label: 'ئامارەکان', icon: User },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <tab.icon size={20} color={activeTab === tab.key ? '#1E3A8A' : '#6B7280'} />
            <KurdishText 
              variant="body" 
              color={activeTab === tab.key ? '#1E3A8A' : '#6B7280'}
            >
              {tab.label}
            </KurdishText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'activity' && renderActivityTab()}
      {activeTab === 'sessions' && renderSessionsTab()}
      {activeTab === 'stats' && renderStatsTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: 40,
    margin: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1E3A8A',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  activityList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionCard: {
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionActive: {
    backgroundColor: '#10B981',
  },
  sessionInactive: {
    backgroundColor: '#6B7280',
  },
  sessionDetails: {
    gap: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceCard: {
    marginBottom: 16,
  },
  performanceTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  performanceBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  performanceProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  performanceText: {
    textAlign: 'center',
  },
});