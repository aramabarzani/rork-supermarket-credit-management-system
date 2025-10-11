import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Settings, BookOpen, Mail, HelpCircle, Video, FileText } from 'lucide-react-native';
import { useGuidance } from '@/hooks/guidance-context';

import { KurdishText } from '@/components/KurdishText';

export default function GuidanceManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, isLoading: contextLoading } = useGuidance();
  const [activeTab, setActiveTab] = useState<'settings' | 'tutorials' | 'help'>('settings');

  const tutorialsQuery = { isLoading: false, data: [] };
  const helpMessagesQuery = { isLoading: false, data: [] };

  const isLoading = contextLoading;

  const renderSettings = () => (
    <View style={styles.section}>
      <KurdishText style={styles.sectionTitle}>ڕێکخستنەکانی ڕێنمایی</KurdishText>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <KurdishText style={styles.settingLabel}>نیشاندانی ڕێنمایی دەستپێک</KurdishText>
          <KurdishText style={styles.settingDescription}>
            ڕێنمایی دەستپێک بۆ بەکارهێنەرانی نوێ نیشان بدە
          </KurdishText>
        </View>
        <Switch
          value={settings.showOnboarding}
          onValueChange={(value) => updateSettings({ showOnboarding: value })}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <KurdishText style={styles.settingLabel}>نیشاندانی پەیامەکانی یارمەتی</KurdishText>
          <KurdishText style={styles.settingDescription}>
            پەیامەکانی یارمەتی لە هەر شاشەیەک نیشان بدە
          </KurdishText>
        </View>
        <Switch
          value={settings.showHelpMessages}
          onValueChange={(value) => updateSettings({ showHelpMessages: value })}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <KurdishText style={styles.settingLabel}>لێدانی خۆکاری ڤیدیۆکان</KurdishText>
          <KurdishText style={styles.settingDescription}>
            ڤیدیۆکانی فێرکاری بە خۆکار لێبدە
          </KurdishText>
        </View>
        <Switch
          value={settings.autoPlayTutorials}
          onValueChange={(value) => updateSettings({ autoPlayTutorials: value })}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <KurdishText style={styles.settingLabel}>هەواڵنامە چالاک بکە</KurdishText>
          <KurdishText style={styles.settingDescription}>
            هەواڵنامەی مانگانە وەربگرە
          </KurdishText>
        </View>
        <Switch
          value={settings.newsletterEnabled}
          onValueChange={(value) => updateSettings({ newsletterEnabled: value })}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <KurdishText style={[styles.sectionTitle, styles.marginTop]}>
        کەناڵەکانی ئاگاداری
      </KurdishText>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <KurdishText style={styles.settingLabel}>ئاگاداری بە ئیمەیڵ</KurdishText>
        </View>
        <Switch
          value={settings.emailNotifications}
          onValueChange={(value) => updateSettings({ emailNotifications: value })}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <KurdishText style={styles.settingLabel}>ئاگاداری بە واتساپ</KurdishText>
        </View>
        <Switch
          value={settings.whatsappNotifications}
          onValueChange={(value) => updateSettings({ whatsappNotifications: value })}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <KurdishText style={styles.settingLabel}>ئاگاداری بە تلگرام</KurdishText>
        </View>
        <Switch
          value={settings.telegramNotifications}
          onValueChange={(value) => updateSettings({ telegramNotifications: value })}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );

  const renderTutorials = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <KurdishText style={styles.sectionTitle}>ڤیدیۆکانی فێرکاری</KurdishText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('زیادکردنی فێرکاری', 'ئەم تایبەتمەندییە بەم زووانە دێت')}
        >
          <Text style={styles.addButtonText}>+ زیادکردن</Text>
        </TouchableOpacity>
      </View>

      {tutorialsQuery.data?.map((tutorial) => (
        <TouchableOpacity
          key={tutorial.id}
          style={styles.tutorialCard}
          onPress={() => Alert.alert('فێرکاری', tutorial.titleKu)}
        >
          <View style={styles.tutorialIcon}>
            {tutorial.type === 'video' && <Video size={24} color="#3B82F6" />}
            {tutorial.type === 'document' && <FileText size={24} color="#10B981" />}
            {tutorial.type === 'interactive' && <BookOpen size={24} color="#F59E0B" />}
          </View>
          <View style={styles.tutorialInfo}>
            <KurdishText style={styles.tutorialTitle}>{tutorial.titleKu}</KurdishText>
            <KurdishText style={styles.tutorialDescription}>
              {tutorial.descriptionKu}
            </KurdishText>
            <View style={styles.tutorialMeta}>
              <Text style={styles.tutorialRole}>{tutorial.role}</Text>
              {tutorial.duration && (
                <Text style={styles.tutorialDuration}>
                  {Math.floor(tutorial.duration / 60)} دەقیقە
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHelpMessages = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <KurdishText style={styles.sectionTitle}>پەیامەکانی یارمەتی</KurdishText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('زیادکردنی پەیامی یارمەتی', 'ئەم تایبەتمەندییە بەم زووانە دێت')}
        >
          <Text style={styles.addButtonText}>+ زیادکردن</Text>
        </TouchableOpacity>
      </View>

      {helpMessagesQuery.data?.map((message) => (
        <View key={message.id} style={styles.helpCard}>
          <View style={[styles.helpIndicator, { backgroundColor: getTypeColor(message.type) }]} />
          <View style={styles.helpContent}>
            <Text style={styles.helpScreen}>{message.screen}</Text>
            <KurdishText style={styles.helpMessage}>{message.messageKu}</KurdishText>
            {message.role && (
              <Text style={styles.helpRole}>بۆ: {message.role}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return '#3B82F6';
      case 'warning':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'بەڕێوەبردنی ڕێنمایی' }} />
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی ڕێنمایی',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings size={20} color={activeTab === 'settings' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            ڕێکخستنەکان
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tutorials' && styles.activeTab]}
          onPress={() => setActiveTab('tutorials')}
        >
          <Video size={20} color={activeTab === 'tutorials' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'tutorials' && styles.activeTabText]}>
            فێرکاری
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'help' && styles.activeTab]}
          onPress={() => setActiveTab('help')}
        >
          <HelpCircle size={20} color={activeTab === 'help' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'help' && styles.activeTabText]}>
            یارمەتی
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'tutorials' && renderTutorials()}
        {activeTab === 'help' && renderHelpMessages()}
      </ScrollView>

      <TouchableOpacity
        style={styles.newsletterButton}
        onPress={() => router.push('/newsletter-management' as any)}
      >
        <Mail size={20} color="#FFFFFF" />
        <Text style={styles.newsletterButtonText}>بەڕێوەبردنی هەواڵنامە</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  marginTop: {
    marginTop: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tutorialCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tutorialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  tutorialMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  tutorialRole: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500' as const,
  },
  tutorialDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  helpIndicator: {
    width: 4,
  },
  helpContent: {
    flex: 1,
    padding: 16,
  },
  helpScreen: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  helpMessage: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  helpRole: {
    fontSize: 12,
    color: '#3B82F6',
  },
  newsletterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  newsletterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
