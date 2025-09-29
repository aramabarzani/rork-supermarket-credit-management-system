import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Bell,
  Send,
  MessageSquare,
  Settings,
  Phone,
  Mail,
  Users,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { NotificationManager } from '@/components/NotificationManager';
import { GradientCard } from '@/components/GradientCard';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

interface NotificationStats {
  totalSent: number;
  deliveryRate: number;
  todaySent: number;
  thisWeekSent: number;
  channels: {
    sms: number;
    email: number;
    whatsapp: number;
    viber: number;
  };
}

export default function NotificationManagementPage() {
  const [showNotificationManager, setShowNotificationManager] = useState(false);
  const [showQuickSend, setShowQuickSend] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [quickMessage, setQuickMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  // Mock data - in real app, fetch from API
  const stats: NotificationStats = {
    totalSent: 4290,
    deliveryRate: 94.2,
    todaySent: 156,
    thisWeekSent: 892,
    channels: {
      sms: 1250,
      email: 890,
      whatsapp: 2150,
      viber: 890
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'send_sms',
      title: 'ناردنی SMS',
      description: 'ناردنی پەیامی خێرا بە SMS',
      icon: Phone,
      color: '#4CAF50',
      action: () => {
        setSelectedChannel('sms');
        setShowQuickSend(true);
      }
    },
    {
      id: 'send_email',
      title: 'ناردنی ئیمەیڵ',
      description: 'ناردنی ئیمەیڵی خێرا',
      icon: Mail,
      color: '#2196F3',
      action: () => {
        setSelectedChannel('email');
        setShowQuickSend(true);
      }
    },
    {
      id: 'send_whatsapp',
      title: 'ناردنی واتساپ',
      description: 'ناردنی پەیامی واتساپ',
      icon: MessageSquare,
      color: '#FF9800',
      action: () => {
        setSelectedChannel('whatsapp');
        setShowQuickSend(true);
      }
    },
    {
      id: 'bulk_notification',
      title: 'ئاگاداری گشتی',
      description: 'ناردنی پەیام بۆ چەندین کەس',
      icon: Users,
      color: '#9C27B0',
      action: () => setShowNotificationManager(true)
    },
    {
      id: 'view_stats',
      title: 'ئامارەکان',
      description: 'بینینی ئامارەکانی ئاگاداری',
      icon: TrendingUp,
      color: '#FF5722',
      action: () => setShowNotificationManager(true)
    },
    {
      id: 'schedule',
      title: 'ئاگاداری کاتی',
      description: 'دانانی ئاگاداری بۆ کاتی دیاریکراو',
      icon: Calendar,
      color: '#607D8B',
      action: () => setShowNotificationManager(true)
    }
  ];

  const recentNotifications = [
    {
      id: '1',
      type: 'debt_reminder',
      recipient: 'ئەحمەد محەمەد',
      channel: 'SMS',
      status: 'delivered',
      timestamp: '10:30 ص',
      message: 'یادەوەری قەرز - 150,000 دینار'
    },
    {
      id: '2',
      type: 'payment_confirmation',
      recipient: 'فاتمە ئەحمەد',
      channel: 'WhatsApp',
      status: 'delivered',
      timestamp: '09:45 ص',
      message: 'پشتڕاستکردنەوەی پارەدان - 75,000 دینار'
    },
    {
      id: '3',
      type: 'receipt',
      recipient: 'عەلی حەسەن',
      channel: 'Email',
      status: 'sent',
      timestamp: '09:15 ص',
      message: 'وەسڵی پارەدان - #R001234'
    },
    {
      id: '4',
      type: 'high_debt_warning',
      recipient: 'سارا محەمەد',
      channel: 'SMS',
      status: 'failed',
      timestamp: '08:30 ص',
      message: 'ئاگاداری قەرزی زۆر - 500,000 دینار'
    }
  ];

  const handleQuickSend = () => {
    if (!quickMessage.trim() || !recipient.trim()) {
      return;
    }

    console.log('Quick send:', {
      channel: selectedChannel,
      recipient,
      message: quickMessage
    });

    // Reset form
    setQuickMessage('');
    setRecipient('');
    setShowQuickSend(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'sent': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'گەیشتووە';
      case 'sent': return 'نێردراوە';
      case 'failed': return 'شکستخواردووە';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'بەڕێوەبردنی ئاگاداری',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <GradientCard
            colors={['#4CAF50', '#45A049']}
            style={styles.statCard}
          >
            <View style={styles.statContent}>
              <Bell size={32} color="#fff" />
              <View style={styles.statText}>
                <Text style={styles.statNumber}>{stats.totalSent.toLocaleString()}</Text>
                <KurdishText style={styles.statLabel}>کۆی ئاگاداری</KurdishText>
              </View>
            </View>
          </GradientCard>

          <GradientCard
            colors={['#2196F3', '#1976D2']}
            style={styles.statCard}
          >
            <View style={styles.statContent}>
              <TrendingUp size={32} color="#fff" />
              <View style={styles.statText}>
                <Text style={styles.statNumber}>{stats.deliveryRate}%</Text>
                <KurdishText style={styles.statLabel}>ڕێژەی سەرکەوتن</KurdishText>
              </View>
            </View>
          </GradientCard>
        </View>

        <View style={styles.statsContainer}>
          <GradientCard
            colors={['#FF9800', '#F57C00']}
            style={styles.statCard}
          >
            <View style={styles.statContent}>
              <Calendar size={32} color="#fff" />
              <View style={styles.statText}>
                <Text style={styles.statNumber}>{stats.todaySent}</Text>
                <KurdishText style={styles.statLabel}>ئەمڕۆ</KurdishText>
              </View>
            </View>
          </GradientCard>

          <GradientCard
            colors={['#9C27B0', '#7B1FA2']}
            style={styles.statCard}
          >
            <View style={styles.statContent}>
              <Filter size={32} color="#fff" />
              <View style={styles.statText}>
                <Text style={styles.statNumber}>{stats.thisWeekSent}</Text>
                <KurdishText style={styles.statLabel}>ئەم هەفتەیە</KurdishText>
              </View>
            </View>
          </GradientCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>کردارە خێراکان</KurdishText>
          <View style={styles.quickActions}>
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionCard}
                  onPress={action.action}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                    <IconComponent size={24} color="#fff" />
                  </View>
                  <KurdishText style={styles.quickActionTitle}>{action.title}</KurdishText>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Channel Stats */}
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>ئامارەکانی کەناڵەکان</KurdishText>
          <View style={styles.channelStats}>
            <View style={styles.channelStat}>
              <View style={styles.channelIcon}>
                <Phone size={20} color="#4CAF50" />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>SMS</Text>
                <Text style={styles.channelCount}>{stats.channels.sms.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.channelStat}>
              <View style={styles.channelIcon}>
                <Mail size={20} color="#2196F3" />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>Email</Text>
                <Text style={styles.channelCount}>{stats.channels.email.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.channelStat}>
              <View style={styles.channelIcon}>
                <MessageSquare size={20} color="#FF9800" />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>WhatsApp</Text>
                <Text style={styles.channelCount}>{stats.channels.whatsapp.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.channelStat}>
              <View style={styles.channelIcon}>
                <MessageSquare size={20} color="#9C27B0" />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>Viber</Text>
                <Text style={styles.channelCount}>{stats.channels.viber.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText style={styles.sectionTitle}>ئاگاداری نوێکان</KurdishText>
            <TouchableOpacity onPress={() => setShowNotificationManager(true)}>
              <Text style={styles.viewAllText}>بینینی هەموو</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.notificationsList}>
            {recentNotifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <KurdishText style={styles.notificationRecipient}>
                      {notification.recipient}
                    </KurdishText>
                    <Text style={styles.notificationTime}>{notification.timestamp}</Text>
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <View style={styles.notificationFooter}>
                    <Text style={styles.notificationChannel}>{notification.channel}</Text>
                    <Text style={[styles.notificationStatus, { color: getStatusColor(notification.status) }]}>
                      {getStatusText(notification.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Advanced Features Button */}
        <TouchableOpacity
          style={styles.advancedButton}
          onPress={() => setShowNotificationManager(true)}
        >
          <Settings size={24} color="#fff" />
          <KurdishText style={styles.advancedButtonText}>تایبەتمەندی پێشکەوتوو</KurdishText>
        </TouchableOpacity>
      </ScrollView>

      {/* Quick Send Modal */}
      <Modal
        visible={showQuickSend}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuickSend(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <KurdishText style={styles.modalTitle}>
              ناردنی {selectedChannel === 'sms' ? 'SMS' : selectedChannel === 'email' ? 'ئیمەیڵ' : 'واتساپ'}
            </KurdishText>
            <TouchableOpacity onPress={() => setShowQuickSend(false)}>
              <Text style={styles.cancelButton}>پاشگەزبوونەوە</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <KurdishText style={styles.inputLabel}>وەرگر</KurdishText>
              <TextInput
                style={styles.input}
                placeholder={selectedChannel === 'email' ? 'ئیمەیڵ' : 'ژمارەی تەلەفۆن'}
                value={recipient}
                onChangeText={setRecipient}
                keyboardType={selectedChannel === 'email' ? 'email-address' : 'phone-pad'}
              />
            </View>

            <View style={styles.inputGroup}>
              <KurdishText style={styles.inputLabel}>پەیام</KurdishText>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="پەیامەکەت لێرە بنووسە..."
                value={quickMessage}
                onChangeText={setQuickMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton, (!quickMessage.trim() || !recipient.trim()) && styles.sendButtonDisabled]}
              onPress={handleQuickSend}
              disabled={!quickMessage.trim() || !recipient.trim()}
            >
              <Send size={20} color="#fff" />
              <KurdishText style={styles.sendButtonText}>ناردن</KurdishText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Notification Manager Modal */}
      <Modal
        visible={showNotificationManager}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowNotificationManager(false)}
      >
        <NotificationManager onClose={() => setShowNotificationManager(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1,
    padding: 16
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  statText: {
    flex: 1
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF'
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center'
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16
  },
  channelStats: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  channelStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  channelInfo: {
    flex: 1
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  channelCount: {
    fontSize: 14,
    color: '#666'
  },
  notificationsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  notificationContent: {
    padding: 16
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  notificationRecipient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  notificationTime: {
    fontSize: 12,
    color: '#666'
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notificationChannel: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  notificationStatus: {
    fontSize: 12,
    fontWeight: '600'
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 32
  },
  advancedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top'
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    gap: 8,
    marginTop: 20
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc'
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  }
});