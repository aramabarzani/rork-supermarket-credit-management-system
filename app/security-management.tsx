import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Activity,
  Settings,
} from 'lucide-react-native';
import { useSecurity } from '@/hooks/security-context';
import { useAuth } from '@/hooks/auth-context';
import { GradientCard } from '@/components/GradientCard';

export default function SecurityManagementScreen() {
  const { user, hasPermission } = useAuth();
  const { 
    securitySettings, 
    updateSecuritySettings, 
    loginAttempts, 
    userSessions,
    getActivityLogs,
  } = useSecurity();
  
  const [editMode, setEditMode] = useState(false);
  const [tempSettings, setTempSettings] = useState(securitySettings);
  const [activeTab, setActiveTab] = useState<'settings' | 'attempts' | 'sessions' | 'logs'>('settings');

  if (!user || !hasPermission('SECURITY_MANAGEMENT')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noPermissionContainer}>
          <Shield size={60} color="#EF4444" />
          <Text style={styles.noPermissionText}>
            دەسەڵاتت نییە بۆ بینینی ئەم بەشە
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveSettings = () => {
    if (tempSettings.maxFailedAttempts < 1 || tempSettings.maxFailedAttempts > 10) {
      console.warn('Invalid max failed attempts value');
      return;
    }
    
    if (tempSettings.lockoutDuration < 1 || tempSettings.lockoutDuration > 1440) {
      console.warn('Invalid lockout duration value');
      return;
    }

    updateSecuritySettings(tempSettings);
    setEditMode(false);
    console.log('Security settings updated successfully');
  };

  const recentLoginAttempts = loginAttempts.slice(0, 20);
  const recentActivityLogs = getActivityLogs(undefined, 50);
  const activeSessions = userSessions.filter(s => s.isActive);

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <GradientCard colors={['#3B82F6', '#1E40AF']} intensity="strong">
        <View style={styles.cardHeader}>
          <Settings size={24} color="white" />
          <Text style={styles.cardTitle}>ڕێکخستنی پاراستن</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>زۆرترین ژمارەی هەوڵی سەرنەکەوتوو</Text>
          <TextInput
            style={[styles.settingInput, !editMode && styles.disabledInput]}
            value={tempSettings.maxFailedAttempts.toString()}
            onChangeText={(text) => setTempSettings({
              ...tempSettings,
              maxFailedAttempts: parseInt(text) || 5
            })}
            keyboardType="numeric"
            editable={editMode}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>کاتی قەدەغەکردن (خولەک)</Text>
          <TextInput
            style={[styles.settingInput, !editMode && styles.disabledInput]}
            value={tempSettings.lockoutDuration.toString()}
            onChangeText={(text) => setTempSettings({
              ...tempSettings,
              lockoutDuration: parseInt(text) || 30
            })}
            keyboardType="numeric"
            editable={editMode}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>کاتی کۆتایی سێشن (خولەک)</Text>
          <TextInput
            style={[styles.settingInput, !editMode && styles.disabledInput]}
            value={tempSettings.sessionTimeout.toString()}
            onChangeText={(text) => setTempSettings({
              ...tempSettings,
              sessionTimeout: parseInt(text) || 600
            })}
            keyboardType="numeric"
            editable={editMode}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>زۆرترین ژمارەی ئامێر</Text>
          <TextInput
            style={[styles.settingInput, !editMode && styles.disabledInput]}
            value={tempSettings.maxDevicesPerUser.toString()}
            onChangeText={(text) => setTempSettings({
              ...tempSettings,
              maxDevicesPerUser: parseInt(text) || 3
            })}
            keyboardType="numeric"
            editable={editMode}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>کەمترین درێژی وشەی نهێنی</Text>
          <TextInput
            style={[styles.settingInput, !editMode && styles.disabledInput]}
            value={tempSettings.passwordMinLength.toString()}
            onChangeText={(text) => setTempSettings({
              ...tempSettings,
              passwordMinLength: parseInt(text) || 6
            })}
            keyboardType="numeric"
            editable={editMode}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>پێویستی بە دوو هەنگاو</Text>
          <Switch
            value={tempSettings.twoFactorRequired}
            onValueChange={(value) => setTempSettings({
              ...tempSettings,
              twoFactorRequired: value
            })}
            disabled={!editMode}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>پێویستی بە گۆڕینی وشەی نهێنی</Text>
          <Switch
            value={tempSettings.requirePasswordChange}
            onValueChange={(value) => setTempSettings({
              ...tempSettings,
              requirePasswordChange: value
            })}
            disabled={!editMode}
          />
        </View>

        {tempSettings.requirePasswordChange && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>ماوەی گۆڕینی وشەی نهێنی (ڕۆژ)</Text>
            <TextInput
              style={[styles.settingInput, !editMode && styles.disabledInput]}
              value={tempSettings.passwordChangeInterval.toString()}
              onChangeText={(text) => setTempSettings({
                ...tempSettings,
                passwordChangeInterval: parseInt(text) || 90
              })}
              keyboardType="numeric"
              editable={editMode}
            />
          </View>
        )}

        <View style={styles.buttonRow}>
          {!editMode ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.editButtonText}>دەستکاریکردن</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveSettings}
              >
                <Text style={styles.saveButtonText}>پاشکەوتکردن</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setTempSettings(securitySettings);
                  setEditMode(false);
                }}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </GradientCard>
    </ScrollView>
  );

  const renderAttemptsTab = () => (
    <ScrollView style={styles.tabContent}>
      <GradientCard colors={['#EF4444', '#DC2626']} intensity="strong">
        <View style={styles.cardHeader}>
          <AlertTriangle size={24} color="white" />
          <Text style={styles.cardTitle}>هەوڵەکانی چوونەژوورەوە ({recentLoginAttempts.length})</Text>
        </View>
        {recentLoginAttempts.length === 0 ? (
          <Text style={styles.emptyText}>هیچ هەوڵێک تۆمار نەکراوە</Text>
        ) : (
          recentLoginAttempts.map((attempt) => (
            <View key={attempt.id} style={styles.attemptItem}>
              <View style={styles.attemptHeader}>
                <Text style={styles.attemptPhone}>{attempt.phone}</Text>
                <View style={[
                  styles.attemptStatus,
                  attempt.success ? styles.successStatus : styles.failureStatus
                ]}>
                  <Text style={styles.attemptStatusText}>
                    {attempt.success ? 'سەرکەوتوو' : 'سەرنەکەوتوو'}
                  </Text>
                </View>
              </View>
              <Text style={styles.attemptTime}>
                {new Date(attempt.attemptAt).toLocaleString('ku')}
              </Text>
              <Text style={styles.attemptIP}>IP: {attempt.ipAddress}</Text>
              {attempt.failureReason && (
                <Text style={styles.attemptReason}>هۆکار: {attempt.failureReason}</Text>
              )}
            </View>
          ))
        )}
      </GradientCard>
    </ScrollView>
  );

  const renderSessionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <GradientCard colors={['#10B981', '#059669']} intensity="strong">
        <View style={styles.cardHeader}>
          <Users size={24} color="white" />
          <Text style={styles.cardTitle}>سێشنە چالاکەکان ({activeSessions.length})</Text>
        </View>
        {activeSessions.length === 0 ? (
          <Text style={styles.emptyText}>هیچ سێشنێکی چالاک نییە</Text>
        ) : (
          activeSessions.map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionUser}>بەکارهێنەر: {session.userId}</Text>
                <Text style={styles.sessionDevice}>ئامێر: {session.deviceId.slice(-8)}</Text>
              </View>
              <Text style={styles.sessionTime}>
                چوونەژوورەوە: {new Date(session.loginAt).toLocaleString('ku')}
              </Text>
              <Text style={styles.sessionActivity}>
                کۆتا چالاکی: {new Date(session.lastActivityAt).toLocaleString('ku')}
              </Text>
              <Text style={styles.sessionIP}>IP: {session.ipAddress}</Text>
            </View>
          ))
        )}
      </GradientCard>
    </ScrollView>
  );

  const renderLogsTab = () => (
    <ScrollView style={styles.tabContent}>
      <GradientCard colors={['#8B5CF6', '#7C3AED']} intensity="strong">
        <View style={styles.cardHeader}>
          <Activity size={24} color="white" />
          <Text style={styles.cardTitle}>تۆماری چالاکی ({recentActivityLogs.length})</Text>
        </View>
        {recentActivityLogs.length === 0 ? (
          <Text style={styles.emptyText}>هیچ چالاکیەک تۆمار نەکراوە</Text>
        ) : (
          recentActivityLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logAction}>{log.action}</Text>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleString('ku')}
                </Text>
              </View>
              <Text style={styles.logDetails}>{log.details}</Text>
              <Text style={styles.logUser}>بەکارهێنەر: {log.userId}</Text>
              <Text style={styles.logIP}>IP: {log.ipAddress}</Text>
            </View>
          ))
        )}
      </GradientCard>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Shield size={28} color="#1E40AF" />
        <Text style={styles.headerTitle}>بەڕێوەبردنی پاراستن</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings size={20} color={activeTab === 'settings' ? '#1E40AF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            ڕێکخستن
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'attempts' && styles.activeTab]}
          onPress={() => setActiveTab('attempts')}
        >
          <AlertTriangle size={20} color={activeTab === 'attempts' ? '#1E40AF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'attempts' && styles.activeTabText]}>
            هەوڵەکان
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
          onPress={() => setActiveTab('sessions')}
        >
          <Users size={20} color={activeTab === 'sessions' ? '#1E40AF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
            سێشنەکان
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Activity size={20} color={activeTab === 'logs' ? '#1E40AF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            تۆمارەکان
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'settings' && renderSettingsTab()}
      {activeTab === 'attempts' && renderAttemptsTab()}
      {activeTab === 'sessions' && renderSessionsTab()}
      {activeTab === 'logs' && renderLogsTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPermissionText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  tabBar: {
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
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E40AF',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingLabel: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  settingInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    color: 'white',
    textAlign: 'center',
    minWidth: 80,
  },
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonRow: {
    marginTop: 20,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    padding: 20,
  },
  attemptItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attemptPhone: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  attemptStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  successStatus: {
    backgroundColor: '#10B981',
  },
  failureStatus: {
    backgroundColor: '#EF4444',
  },
  attemptStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  attemptTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  attemptIP: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  attemptReason: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  sessionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionUser: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDevice: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  sessionTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  sessionActivity: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  sessionIP: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  logItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logAction: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  logDetails: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  logUser: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 2,
  },
  logIP: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
});