import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,

  Switch,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  Settings, 
  Users, 
  Bell,
  X,
  Check,

  AlertCircle
} from 'lucide-react-native';
import { KurdishText } from './KurdishText';
import type { NotificationChannel } from '@/types/notification';

interface NotificationManagerProps {
  onClose?: () => void;
}

interface NotificationForm {
  type: 'sms' | 'email' | 'whatsapp' | 'viber' | 'bulk';
  recipients: string[];
  subject?: string;
  message: string;
  template?: string;
  channels: NotificationChannel[];
}

const NOTIFICATION_TEMPLATES = [
  {
    id: 'debt_reminder',
    name: 'یادەوەری قەرز',
    type: 'debt_reminder' as const,
    titleTemplate: 'یادەوەری قەرز',
    messageTemplate: 'بەڕێز {{customerName}}، قەرزتان {{amount}} دینارە. تکایە پارەدان بکەن.',
    channels: ['sms', 'whatsapp'] as NotificationChannel[],
    isActive: true,
    variables: ['customerName', 'amount']
  },
  {
    id: 'payment_confirmation',
    name: 'پشتڕاستکردنەوەی پارەدان',
    type: 'payment_received' as const,
    titleTemplate: 'پارەدان وەرگیرا',
    messageTemplate: 'بەڕێز {{customerName}}، پارەدانی {{amount}} دینار وەرگیرا. سوپاس.',
    channels: ['sms', 'email', 'whatsapp'] as NotificationChannel[],
    isActive: true,
    variables: ['customerName', 'amount']
  },
  {
    id: 'receipt_notification',
    name: 'ناردنی وەسڵ',
    type: 'receipt' as const,
    titleTemplate: 'وەسڵی {{type}}',
    messageTemplate: 'وەسڵی {{type}} بۆ بڕی {{amount}} دینار. ژمارەی وەسڵ: {{receiptId}}',
    channels: ['sms', 'email', 'whatsapp'] as NotificationChannel[],
    isActive: true,
    variables: ['type', 'amount', 'receiptId']
  }
];

export const NotificationManager: React.FC<NotificationManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'settings' | 'stats'>('send');

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NotificationForm>({
    type: 'sms',
    recipients: [],
    message: '',
    channels: ['sms']
  });

  const [recipientInput, setRecipientInput] = useState('');
  const [templates] = useState(NOTIFICATION_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleSendNotification = async () => {
    if (!form.message.trim()) {
      console.log('Error: Message is required');
      return;
    }

    if (form.recipients.length === 0) {
      console.log('Error: At least one recipient is required');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Success: Message sent successfully');
      setForm({
        type: 'sms',
        recipients: [],
        message: '',
        channels: ['sms']
      });
      setRecipientInput('');
    } catch {
      console.log('Error: Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    if (recipientInput.trim() && !form.recipients.includes(recipientInput.trim())) {
      setForm(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipientInput.trim()]
      }));
      setRecipientInput('');
    }
  };

  const removeRecipient = (recipient: string) => {
    setForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== recipient)
    }));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setForm(prev => ({
        ...prev,
        message: template.messageTemplate,
        subject: template.titleTemplate,
        channels: template.channels
      }));
      setSelectedTemplate(templateId);
    }
  };

  const renderSendTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>{'جۆری پەیام'}</KurdishText>
        <View style={styles.typeSelector}>
          {[
            { key: 'sms', label: 'SMS', icon: Phone },
            { key: 'email', label: 'ئیمەیڵ', icon: Mail },
            { key: 'whatsapp', label: 'واتساپ', icon: MessageSquare },
            { key: 'bulk', label: 'گشتی', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.typeButton,
                form.type === key && styles.typeButtonActive
              ]}
              onPress={() => setForm(prev => ({ ...prev, type: key as any }))}
            >
              <Icon size={20} color={form.type === key ? '#fff' : '#666'} />
              <Text style={[
                styles.typeButtonText,
                form.type === key && styles.typeButtonTextActive
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>{'قاڵب'}</KurdishText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.templateSelector}>
            {templates.map(template => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate === template.id && styles.templateCardActive
                ]}
                onPress={() => applyTemplate(template.id)}
              >
                <KurdishText style={styles.templateName}>{template.name}</KurdishText>
                <Text style={styles.templateChannelsText}>
                  {template.channels.join(', ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>{'وەرگران'}</KurdishText>
        <View style={styles.recipientInput}>
          <TextInput
            style={styles.input}
            placeholder={form.type === 'email' ? 'ئیمەیڵ' : 'ژمارەی تەلەفۆن'}
            value={recipientInput}
            onChangeText={setRecipientInput}
            keyboardType={form.type === 'email' ? 'email-address' : 'phone-pad'}
          />
          <TouchableOpacity style={styles.addButton} onPress={addRecipient}>
            <Text style={styles.addButtonText}>زیادکردن</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recipientList}>
          {form.recipients.map((recipient, index) => (
            <View key={`recipient-${recipient}-${index}`} style={styles.recipientChip}>
              <Text style={styles.recipientText}>{recipient}</Text>
              <TouchableOpacity onPress={() => removeRecipient(recipient)} testID={`remove-recipient-${index}`}>
                <X size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {form.type === 'email' && (
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>{'بابەت'}</KurdishText>
          <TextInput
            style={styles.input}
            placeholder="بابەتی ئیمەیڵ"
            value={form.subject || ''}
            onChangeText={(text) => setForm(prev => ({ ...prev, subject: text }))}
          />
        </View>
      )}

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>{'پەیام'}</KurdishText>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="پەیامەکەت لێرە بنووسە..."
          value={form.message}
          onChangeText={(text) => setForm(prev => ({ ...prev, message: text }))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
        onPress={handleSendNotification}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Send size={20} color="#fff" />
            <KurdishText style={styles.sendButtonText}>{'ناردن'}</KurdishText>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Phone size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>1,250</Text>
          <KurdishText style={styles.statLabel}>{'SMS نێردراو'}</KurdishText>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Mail size={24} color="#2196F3" />
          </View>
          <Text style={styles.statNumber}>890</Text>
          <KurdishText style={styles.statLabel}>{'ئیمەیڵ نێردراو'}</KurdishText>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <MessageSquare size={24} color="#FF9800" />
          </View>
          <Text style={styles.statNumber}>2,150</Text>
          <KurdishText style={styles.statLabel}>{'واتساپ نێردراو'}</KurdishText>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Check size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>94.2%</Text>
          <KurdishText style={styles.statLabel}>{'ڕێژەی سەرکەوتن'}</KurdishText>
        </View>
      </View>

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>{'ئامارەکانی ئەم هەفتەیە'}</KurdishText>
        <View style={styles.weeklyStats}>
          {[
            { day: 'شەممە', sms: 45, email: 32, whatsapp: 78 },
            { day: 'یەکشەممە', sms: 52, email: 28, whatsapp: 85 },
            { day: 'دووشەممە', sms: 38, email: 41, whatsapp: 92 },
            { day: 'سێشەممە', sms: 61, email: 35, whatsapp: 88 },
            { day: 'چوارشەممە', sms: 47, email: 39, whatsapp: 95 },
            { day: 'پێنجشەممە', sms: 55, email: 44, whatsapp: 102 },
            { day: 'هەینی', sms: 42, email: 31, whatsapp: 76 }
          ].map((stat) => (
            <View key={stat.day} style={styles.dailyStat}>
              <KurdishText style={styles.dayLabel}>{stat.day}</KurdishText>
              <View style={styles.dailyNumbers}>
                <Text style={styles.dailyNumber}>{stat.sms}</Text>
                <Text style={styles.dailyNumber}>{stat.email}</Text>
                <Text style={styles.dailyNumber}>{stat.whatsapp}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <KurdishText style={styles.title}>{'بەڕێوەبردنی ئاگاداری'}</KurdishText>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'send', label: 'ناردن', icon: Send },
          { key: 'templates', label: 'قاڵب', icon: Bell },
          { key: 'settings', label: 'ڕێکخستن', icon: Settings },
          { key: 'stats', label: 'ئامار', icon: AlertCircle }
        ].map(({ key, label, icon: Icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key as any)}
          >
            <Icon size={20} color={activeTab === key ? '#007AFF' : '#666'} />
            <KurdishText style={[
              styles.tabText,
              activeTab === key && styles.tabTextActive
            ]}>
              {label}
            </KurdishText>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'send' && renderSendTab()}
      {activeTab === 'stats' && renderStatsTab()}
      {activeTab === 'templates' && (
        <ScrollView style={styles.tabContent}>
          <KurdishText style={styles.sectionTitle}>{'قاڵبەکانی ئاگاداری'}</KurdishText>
          {templates.map(template => (
            <View key={template.id} style={styles.templateItem}>
              <View style={styles.templateHeader}>
                <KurdishText style={styles.templateTitle}>{template.name}</KurdishText>
                <Switch value={template.isActive} />
              </View>
              <Text style={styles.templateMessage}>{template.messageTemplate}</Text>
              <View style={styles.templateChannelsContainer}>
                {template.channels.map(channel => (
                  <View key={channel} style={styles.channelTag}>
                    <Text style={styles.channelTagText}>{channel}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {activeTab === 'settings' && (
        <ScrollView style={styles.tabContent}>
          <KurdishText style={styles.sectionTitle}>{'ڕێکخستنەکانی ئاگاداری'}</KurdishText>
          <View style={styles.settingItem}>
            <KurdishText style={styles.settingLabel}>{'ئاگاداری خۆکار بۆ قەرز'}</KurdishText>
            <Switch value={true} />
          </View>
          <View style={styles.settingItem}>
            <KurdishText style={styles.settingLabel}>{'ئاگاداری خۆکار بۆ پارەدان'}</KurdishText>
            <Switch value={true} />
          </View>
          <View style={styles.settingItem}>
            <KurdishText style={styles.settingLabel}>{'یادەوەری ڕۆژانە'}</KurdishText>
            <Switch value={false} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 8
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600'
  },
  tabContent: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 8
  },
  typeButtonActive: {
    backgroundColor: '#007AFF'
  },
  typeButtonText: {
    color: '#666',
    fontSize: 14
  },
  typeButtonTextActive: {
    color: '#fff'
  },
  templateSelector: {
    flexDirection: 'row',
    gap: 12
  },
  templateCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 120
  },
  templateCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff'
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },

  recipientInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top'
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  recipientList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8
  },
  recipientText: {
    fontSize: 14,
    color: '#1976d2'
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 16
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc'
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  weeklyStats: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16
  },
  dailyStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dayLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1
  },
  dailyNumbers: {
    flexDirection: 'row',
    gap: 16
  },
  dailyNumber: {
    fontSize: 14,
    color: '#666',
    minWidth: 30,
    textAlign: 'center'
  },
  templateItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  templateMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  templateChannelsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  templateChannelsText: {
    fontSize: 12,
    color: '#666'
  },
  channelTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  channelTagText: {
    fontSize: 12,
    color: '#1976d2'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8
  },
  settingLabel: {
    fontSize: 16,
    color: '#333'
  }
});