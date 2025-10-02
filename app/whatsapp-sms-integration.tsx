import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KurdishText } from '@/components/KurdishText';
import { WhatsAppContext, useWhatsApp } from '@/hooks/whatsapp-context';
import {
  MessageCircle,
  Send,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react-native';

function WhatsAppSMSContent() {
  const {
    config,
    smsConfig,
    messages,
    smsMessages,
    stats,
    isLoading,
    updateConfig,
    updateSmsConfig,
    addTemplate,
  } = useWhatsApp();

  const [showTemplateForm, setShowTemplateForm] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateContent, setTemplateContent] = useState<string>('');

  const handleToggleWhatsApp = async (enabled: boolean) => {
    try {
      await updateConfig({ enabled });
      Alert.alert('سەرکەوتوو', enabled ? 'WhatsApp چالاککرا' : 'WhatsApp ناچالاککرا');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە نوێکردنەوەی ڕێکخستنەکان');
    }
  };

  const handleToggleSMS = async (enabled: boolean) => {
    try {
      await updateSmsConfig({ enabled });
      Alert.alert('سەرکەوتوو', enabled ? 'SMS چالاککرا' : 'SMS ناچالاککرا');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە نوێکردنەوەی ڕێکخستنەکان');
    }
  };

  const handleAddTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    try {
      await addTemplate({
        name: templateName,
        type: 'custom',
        content: templateContent,
        variables: [],
        enabled: true,
      });

      setTemplateName('');
      setTemplateContent('');
      setShowTemplateForm(false);
      Alert.alert('سەرکەوتوو', 'قاڵب زیادکرا');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە زیادکردنی قاڵب');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#25D366" />
        <KurdishText style={styles.loadingText}>چاوەڕوان بە...</KurdishText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Send size={24} color="#25D366" />
          <KurdishText style={styles.statValue}>{stats.totalSent}</KurdishText>
          <KurdishText style={styles.statLabel}>نێردراو</KurdishText>
        </View>

        <View style={styles.statCard}>
          <CheckCircle size={24} color="#10B981" />
          <KurdishText style={styles.statValue}>{stats.totalDelivered}</KurdishText>
          <KurdishText style={styles.statLabel}>گەیشتووە</KurdishText>
        </View>

        <View style={styles.statCard}>
          <XCircle size={24} color="#EF4444" />
          <KurdishText style={styles.statValue}>{stats.totalFailed}</KurdishText>
          <KurdishText style={styles.statLabel}>شکستخواردوو</KurdishText>
        </View>

        <View style={styles.statCard}>
          <BarChart3 size={24} color="#6366f1" />
          <KurdishText style={styles.statValue}>{stats.deliveryRate.toFixed(1)}%</KurdishText>
          <KurdishText style={styles.statLabel}>ڕێژەی گەیشتن</KurdishText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={24} color="#25D366" />
          <KurdishText style={styles.sectionTitle}>ڕێکخستنەکان</KurdishText>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MessageCircle size={20} color="#25D366" />
            <KurdishText style={styles.settingLabel}>WhatsApp</KurdishText>
          </View>
          <Switch
            value={config?.enabled || false}
            onValueChange={handleToggleWhatsApp}
            trackColor={{ false: '#D1D5DB', true: '#25D366' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MessageCircle size={20} color="#6366f1" />
            <KurdishText style={styles.settingLabel}>SMS</KurdishText>
          </View>
          <Switch
            value={smsConfig?.enabled || false}
            onValueChange={handleToggleSMS}
            trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={24} color="#25D366" />
          <KurdishText style={styles.sectionTitle}>قاڵبەکان</KurdishText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowTemplateForm(!showTemplateForm)}
          >
            <KurdishText style={styles.addButtonText}>
              {showTemplateForm ? 'داخستن' : '+ زیادکردن'}
            </KurdishText>
          </TouchableOpacity>
        </View>

        {showTemplateForm && (
          <View style={styles.templateForm}>
            <TextInput
              style={styles.input}
              placeholder="ناوی قاڵب"
              placeholderTextColor="#9CA3AF"
              value={templateName}
              onChangeText={setTemplateName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="ناوەڕۆکی پەیام"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={templateContent}
              onChangeText={setTemplateContent}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleAddTemplate}>
              <Send size={20} color="#FFFFFF" />
              <KurdishText style={styles.submitButtonText}>زیادکردن</KurdishText>
            </TouchableOpacity>
          </View>
        )}

        {config?.templates.map((template) => (
          <View key={template.id} style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <KurdishText style={styles.templateName}>{template.name}</KurdishText>
              <View
                style={[
                  styles.templateBadge,
                  template.enabled ? styles.templateEnabled : styles.templateDisabled,
                ]}
              >
                <KurdishText style={styles.templateBadgeText}>
                  {template.enabled ? 'چالاک' : 'ناچالاک'}
                </KurdishText>
              </View>
            </View>
            <KurdishText style={styles.templateContent}>{template.content}</KurdishText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={24} color="#25D366" />
          <KurdishText style={styles.sectionTitle}>پەیامە دواییەکان</KurdishText>
        </View>

        {[...messages, ...smsMessages]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((message) => (
            <View key={message.id} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <KurdishText style={styles.messageName}>{message.customerName}</KurdishText>
                <View
                  style={[
                    styles.statusBadge,
                    message.status === 'sent' && styles.statusSent,
                    message.status === 'delivered' && styles.statusDelivered,
                    message.status === 'failed' && styles.statusFailed,
                    message.status === 'pending' && styles.statusPending,
                  ]}
                >
                  <KurdishText style={styles.statusText}>
                    {message.status === 'sent' && 'نێردراوە'}
                    {message.status === 'delivered' && 'گەیشتووە'}
                    {message.status === 'failed' && 'شکستخواردوو'}
                    {message.status === 'pending' && 'چاوەڕوانە'}
                  </KurdishText>
                </View>
              </View>
              <KurdishText style={styles.messageContent} numberOfLines={2}>
                {message.message}
              </KurdishText>
              <KurdishText style={styles.messageDate}>
                {new Date(message.createdAt).toLocaleDateString('ku')}
              </KurdishText>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

export default function WhatsAppSMSScreen() {
  return (
    <WhatsAppContext>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'WhatsApp و SMS',
            headerStyle: { backgroundColor: '#25D366' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontFamily: 'Rabar_029' },
          }}
        />
        <WhatsAppSMSContent />
      </SafeAreaView>
    </WhatsAppContext>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600' as const,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  templateForm: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  templateCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  templateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  templateEnabled: {
    backgroundColor: '#D1FAE5',
  },
  templateDisabled: {
    backgroundColor: '#FEE2E2',
  },
  templateBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  templateContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  messageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusSent: {
    backgroundColor: '#DBEAFE',
  },
  statusDelivered: {
    backgroundColor: '#D1FAE5',
  },
  statusFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  messageContent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
